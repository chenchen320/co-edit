import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from "../prisma/prisma.service";
export declare class DocumentService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDocumentDto: CreateDocumentDto, authorId: string): import("@prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(authorId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    } | null>;
    update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<{
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
