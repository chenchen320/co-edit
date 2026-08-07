import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { readSyncMessage } from 'y-protocols/sync';
import { decoding, encoding } from 'lib0';
import { Socket } from 'socket.io';
import * as Y from 'yjs';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CollaborationGateway implements OnGatewayDisconnect {
  private documents: Map<string, Y.Doc> = new Map();
  @WebSocketServer() server: Socket;

  handleDisconnect(client: Socket) {
    console.log(client.id);
  }

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
    const originalData = data instanceof Buffer ? new Uint8Array(data) : data;

    const documentId = client.data.documentId;
    const doc = this.documents.get(documentId);
    if (!documentId || !doc) return;

    const decoder = decoding.createDecoder(data);
    const messageType = decoding.readVarUint(decoder);

    if (messageType !== 0) {
      return;
    }

    const syncMessageType = decoding.readVarUint(decoder);

    const replyEncoder = encoding.createEncoder();
    const origin = client;

    readSyncMessage(decoder, replyEncoder, doc, origin);

    if (encoding.length(replyEncoder) > 0) {
      const replyMessage = encoding.toUint8Array(replyEncoder);
      client.emit('sync', Buffer.from(replyMessage));
    }

    if (syncMessageType === 2) {
      client.to(documentId).emit('sync', Buffer.from(originalData));
    }
  }
}
