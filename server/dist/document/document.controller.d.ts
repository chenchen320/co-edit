import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    create(createDocumentDto: CreateDocumentDto, user: any): import("@prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    uploadImage(file: Express.Multer.File): {
        url: string;
    };
    generateShare(id: string, body: {
        role: 'edit' | 'view';
    }, user: any): Promise<{
        shareUrl: string;
        role: "edit" | "view";
    }>;
    findAll(user: any): Promise<{
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
