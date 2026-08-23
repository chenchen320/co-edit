import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    create(createDocumentDto: CreateDocumentDto, user: any): import("@prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        authorId: string | null;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    uploadImage(file: Express.Multer.File): {
        url: string;
    };
    generateShare(id: string, body: {
        role: 'edit' | 'view';
    }, user: any): Promise<{
        shareUrl: string;
        role: "view" | "edit";
    }>;
    createVersion(id: string, body: {
        versionName: string;
    }, user: any): Promise<{
        documentId: string;
        id: string;
        createdAt: Date;
        versionName: string;
        snapshot: import("@prisma/client/runtime/library").Bytes;
    }>;
    getVersion(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        versionName: string;
    }[]>;
    getOneVersion(id: string, versionId: string, user: any): Promise<{
        documentId: string;
        id: string;
        createdAt: Date;
        versionName: string;
        snapshot: import("@prisma/client/runtime/library").Bytes;
    }>;
    findAll(user: any): Promise<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        authorId: string | null;
        updatedAt: Date;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        authorId: string | null;
        updatedAt: Date;
    }>;
    update(id: string, updateDocumentDto: UpdateDocumentDto, user: any): Promise<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        authorId: string | null;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        content: string | null;
        createdAt: Date;
        authorId: string | null;
        updatedAt: Date;
    }>;
}
