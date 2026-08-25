import { JwtService } from '@nestjs/jwt';
import { PrismaService } from "../prisma/prisma.service";
import { CollaborationGateway } from './../collaboration/collaboration.gateway';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentService {
    private prisma;
    private jwt;
    private readonly collaborationGateway;
    constructor(prisma: PrismaService, jwt: JwtService, collaborationGateway: CollaborationGateway);
    create(createDocumentDto: CreateDocumentDto, authorId: string): import("@prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    private checkDocumentPermission;
    createShareLink(documentId: string, role: 'edit' | 'view', userId: string): Promise<{
        shareUrl: string;
        role: "view" | "edit";
    }>;
    createVersion(documentId: string, versionName: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        documentId: string;
        versionName: string;
        snapshot: import("@prisma/client/runtime/library").Bytes;
    }>;
    findVersion(documentId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        versionName: string;
    }[]>;
    findOneVersion(documentId: string, versionId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        documentId: string;
        versionName: string;
        snapshot: import("@prisma/client/runtime/library").Bytes;
    }>;
    rollbackVersion(docId: string, userId: string, targetVerId: string): Promise<{
        id: string;
        createdAt: Date;
        documentId: string;
        versionName: string;
        snapshot: import("@prisma/client/runtime/library").Bytes;
    }>;
    findAll(authorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    }>;
    update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    }>;
}
