import { Document } from './../document/entities/document.entity';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { readUpdate, readSyncStep2, readSyncStep1 } from 'y-protocols/sync';
import { decoding, encoding } from 'lib0';
import { Socket, Server } from 'socket.io';
import * as Y from 'yjs';
import { PrismaService } from 'src/prisma/prisma.service';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CollaborationGateway implements OnGatewayDisconnect {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtservice: JwtService,
  ) {
    setInterval(() => {
      this.saveAllDirtyDocsToDatabase();
    }, 5000);
  }
  private documents: Map<string, Y.Doc> = new Map();
  private readonly dirtyDocs = new Set<string>();
  @WebSocketServer() server: Server;

  @SubscribeMessage('join-document')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { documentId: string; shareToken?: string },
  ) {
    const { documentId, shareToken } = payload;
    if (!documentId) return { status: 'error', message: '缺少文档ID' };

    try {
      const userToken = client.handshake.auth.token;
      if (!userToken) {
        client.data.mode = 'view';
        return { status: 'OK', resolvedMode: 'view' };
      }

      const user = this.jwtservice.verify(userToken);
      const userId = user.id;

      // 获取文档详情处，如果查找不到文档，不应该提示失败信息吗？为什么返回ok
      const doc = await this.prisma.document.findUnique({
        where: { id: documentId },
      });
      if (!doc) {
        client.data.mode = 'view';
        return { status: 'ok', resolvedMode: 'view' };
      }

      const isOwner = doc.authorId === userId;
      if (isOwner) {
        client.data.mode = 'edit';
      } else {
        const collab = await this.prisma.collaborator.findUnique({
          where: {
            documentId_userId: { documentId, userId },
          },
        });

        if (collab) {
          client.data.mode = collab.role === 'editor' ? 'edit' : 'view';
        } else if (shareToken) {
          try {
            const decodeShare = this.jwtservice.verify(shareToken);

            if (decodeShare.documentId === documentId) {
              const assignedRole = decodeShare.role;

              await this.prisma.collaborator.create({
                data: {
                  documentId,
                  userId,
                  role: assignedRole === 'edit' ? 'editor' : 'viewer',
                },
              });
              client.data.mode = assignedRole;
            } else {
              client.data.mode = 'view';
            }
          } catch {
            client.data.mode = 'view';
          }
        } else {
          client.data.mode = 'view';
        }
      }

      client.data.documentId = documentId;
      client.join(documentId);

      const roomDoc = this.documents.get(documentId);
      if (!roomDoc) {
        this.documents.set(documentId, new Y.Doc());
      }

      return { status: 'ok', resolvedMode: client.data.mode };
    } catch (err) {
      console.error('WebSocket 加入房间鉴权失败', err);
      client.data.mode = 'view';
      client.join(documentId);
      return { status: 'ok', resolvedMode: 'view' };
    }
  }

  @SubscribeMessage('document-update')
  handleDocumentEditor(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { documentId: string; content: any },
  ) {
    if (client.data.mode === 'view') {
      return;
    }

    if (payload.documentId) {
      client.to(payload.documentId).emit('document-updated', {
        userId: client.id,
        content: payload.content,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('sync')
  handleSync(@ConnectedSocket() client: Socket, @MessageBody() data: Buffer) {
    if (!data || data.length === 0) return;

    const originalData = data instanceof Buffer ? new Uint8Array(data) : data;
    const documentId = client.data.documentId;
    const doc = this.documents.get(documentId);
    if (!documentId || !doc) return;

    try {
      const decoder = decoding.createDecoder(data);
      const messageType = decoding.readVarUint(decoder);

      if (messageType !== 0) {
        return;
      }

      const syncMessageType = decoding.readVarUint(decoder);

      const replyEncoder = encoding.createEncoder();

      if (syncMessageType === 0) {
        encoding.writeVarUint(replyEncoder, 0);
        readSyncStep1(decoder, replyEncoder, doc);
        if (encoding.length(replyEncoder) > 0) {
          client.emit('sync', Buffer.from(encoding.toUint8Array(replyEncoder)));
        }
      } else if (syncMessageType === 1) {
        readSyncStep2(decoder, doc, client);
      } else if (syncMessageType === 2) {
        readUpdate(decoder, doc, client);

        this.dirtyDocs.add(documentId);
        client.to(documentId).emit('sync', Buffer.from(originalData));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async saveAllDirtyDocsToDatabase() {
    for (const item of this.dirtyDocs) {
      const ydoc = this.documents.get(item);
      if (!ydoc) {
        this.dirtyDocs.delete(item);
        continue;
      }
      const xmlFragment = ydoc.getXmlFragment('codewrite');

      if (xmlFragment && xmlFragment.length > 0) {
        const content = xmlFragment.toString();
        await this.prisma.document.update({
          where: { id: item },
          data: { content },
        });
      }
      this.dirtyDocs.delete(item);
    }
  }

  async handleDisconnect(client: Socket) {
    const id = client.data.documentId;
    if (!id) return;
    const size = this.server.sockets.adapter.rooms.get(id)?.size;
    if (size == 0 || !size) {
      await this.saveAllDirtyDocsToDatabase();
      this.documents.delete(id);
    }
  }

  getDocumentSnapshot(documentId: string): Buffer | null {
    const ydoc = this.documents.get(documentId);
    if (!ydoc) {
      return null;
    }

    const snapshotBytes = Y.encodeStateAsUpdate(ydoc);
    return Buffer.from(snapshotBytes);
  }
}
