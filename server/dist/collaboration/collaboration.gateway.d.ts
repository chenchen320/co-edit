import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PrismaService } from "../prisma/prisma.service";
export declare class CollaborationGateway implements OnGatewayDisconnect {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private documents;
    private readonly dirtyDocs;
    server: Server;
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
    saveAllDirtyDocsToDatabase(): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
}
