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
  constructor(private readonly prisma: PrismaService) {
    setInterval(() => {
      this.saveAllDirtyDocsToDatabase();
    }, 5000);
  }
  private documents: Map<string, Y.Doc> = new Map();
  private readonly dirtyDocs = new Set<string>();
  @WebSocketServer() server: Server;

  @SubscribeMessage('join-document')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { documentId: string },
  ) {
    const { documentId } = payload;
    const docs = this.documents.get(documentId);
    if (documentId) {
      if (!docs) {
        const doc = new Y.Doc();
        this.documents.set(documentId, doc);
      }
      client.join(documentId);
      client.data.documentId = documentId;
      return { status: 'ok' };
    } else {
      client.emit('error', { message: '...' });
    }
  }

  @SubscribeMessage('document-update')
  handleDocumentEditor(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { documentId: string; content: any },
  ) {
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
      const content = ydoc?.getText('codewrite').toString();
      await this.prisma.document.update({
        where: { id: item },
        data: { content },
      });
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
}
