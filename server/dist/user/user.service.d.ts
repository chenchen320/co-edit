import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from "../prisma/prisma.service";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): string;
    findOne(id: number): string;
    findOneByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string;
        username: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: number, updateUserDto: UpdateUserDto): string;
    remove(id: number): string;
}
