import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
export declare class CollaborationGateway implements OnGatewayDisconnect {
    private documents;
    server: Socket;
    handleDisconnect(client: Socket): void;
    handleJoin(client: Socket, payload: {
        documentId: string;
    }): {
        status: string;
    } | undefined;
    handleDocumentEditor(client: Socket, payload: {
        documentId: string;
        content: any;
    }): void;
    handleSync(client: Socket, data: Buffer): void;
}
