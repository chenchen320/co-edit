import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
export declare class CollaborationGateway implements OnGatewayDisconnect {
    server: Server;
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
}
