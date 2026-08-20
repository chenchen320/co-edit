import { JwtService } from '@nestjs/jwt';
import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PrismaService } from "../prisma/prisma.service";
export declare class CollaborationGateway implements OnGatewayDisconnect {
    private readonly prisma;
    private readonly jwtservice;
    constructor(prisma: PrismaService, jwtservice: JwtService);
    private documents;
    private readonly dirtyDocs;
    server: Server;
    handleJoin(client: Socket, payload: {
        documentId: string;
        shareToken?: string;
    }): Promise<{
        status: string;
        message: string;
        resolvedMode?: undefined;
    } | {
        status: string;
        resolvedMode: any;
        message?: undefined;
    }>;
    handleDocumentEditor(client: Socket, payload: {
        documentId: string;
        content: any;
    }): void;
    handleSync(client: Socket, data: Buffer): void;
    saveAllDirtyDocsToDatabase(): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
}
