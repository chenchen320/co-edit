import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    create(createDocumentDto: CreateDocumentDto): import("@prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): Promise<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string | null;
    } | null>;
    update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        updatedAt: Date;
        authorId: string | null;
    }>;
}
