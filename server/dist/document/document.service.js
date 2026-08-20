"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
let DocumentService = class DocumentService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    create(createDocumentDto, authorId) {
        return this.prisma.document.create({
            data: {
                title: createDocumentDto.title,
                content: createDocumentDto.content,
                authorId,
            },
        });
    }
    async createShareLink(documentId, role, userId) {
        const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!doc) {
            throw new common_1.ForbiddenException('未找到对应文档');
        }
        const isOwner = doc.authorId === userId;
        let userRole = 'none';
        if (isOwner) {
            userRole = 'owner';
        }
        else {
            const collab = await this.prisma.collaborator.findUnique({
                where: {
                    documentId_userId: { documentId, userId }
                }
            });
            if (collab) {
                userRole = collab.role;
            }
        }
        if (userRole === 'none') {
            throw new common_1.ForbiddenException('您没有分享此文档的权限');
        }
        if (userRole === 'viewer' && role === 'edit') {
            throw new common_1.ForbiddenException('您作为只读查看者，无法生成编辑链接');
        }
        const shareToken = this.jwt.sign({ documentId, role }, { expiresIn: '7d' });
        const shareUrl = `http://localhost:5173/document/${documentId}?shareToken=${shareToken}`;
        return { shareUrl, role };
    }
    async findAll(authorId) {
        return await this.prisma.document.findMany({
            where: { authorId },
        });
    }
    async findOne(id) {
        return await this.prisma.document.findUnique({
            where: { id },
        });
    }
    async update(id, updateDocumentDto) {
        return await this.prisma.document.update({
            where: { id },
            data: updateDocumentDto,
        });
    }
    async remove(id) {
        return await this.prisma.document.delete({
            where: { id },
        });
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], DocumentService);
//# sourceMappingURL=document.service.js.map