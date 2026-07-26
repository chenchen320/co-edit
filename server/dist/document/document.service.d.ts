import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from "../prisma/prisma.service";
export declare class DocumentService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDocumentDto: CreateDocumentDto): string;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string | null;
        authorId: string;
    }[]>;
    findOne(id: number): string;
    update(id: number, updateDocumentDto: UpdateDocumentDto): string;
    remove(id: number): string;
}
