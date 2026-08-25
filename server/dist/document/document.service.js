"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const Y = __importStar(require("yjs"));
const collaboration_gateway_1 = require("./../collaboration/collaboration.gateway");
let DocumentService = class DocumentService {
    prisma;
    jwt;
    collaborationGateway;
    constructor(prisma, jwt, collaborationGateway) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.collaborationGateway = collaborationGateway;
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
    async checkDocumentPermission(documentId, userId, action = 'read') {
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc) {
            throw new common_1.NotFoundException('未找到对应文档');
        }
        const isOwner = Boolean(doc.authorId && doc.authorId.trim() === userId.trim());
        let userRole = 'none';
        if (isOwner) {
            userRole = 'owner';
        }
        else {
            const collab = await this.prisma.collaborator.findUnique({
                where: {
                    documentId_userId: { documentId, userId },
                },
            });
            if (collab) {
                userRole = collab.role;
            }
        }
        if (userRole === 'none') {
            throw new common_1.ForbiddenException('您没有访问此文档的权限');
        }
        if (action === 'edit' && userRole === 'viewer') {
            throw new common_1.ForbiddenException('您作为只读查看者，无权修改文档内容');
        }
        if (action === 'delete' && userRole !== 'owner') {
            throw new common_1.ForbiddenException('只有文档所有者才能删除该文档');
        }
        return doc;
    }
    async createShareLink(documentId, role, userId) {
        const doc = await this.checkDocumentPermission(documentId, userId, 'read');
        const isOwner = doc.authorId === userId;
        let userRole = 'viewer';
        if (isOwner) {
            userRole = 'owner';
        }
        else {
            const collab = await this.prisma.collaborator.findUnique({
                where: { documentId_userId: { documentId, userId } },
            });
            if (collab && collab.role === 'editor') {
                userRole = 'editor';
            }
        }
        if (userRole === 'viewer' && role === 'edit') {
            throw new common_1.ForbiddenException('您作为只读查看者，无法生成编辑链接');
        }
        const shareToken = this.jwt.sign({ documentId, role }, { expiresIn: '7d' });
        const shareUrl = `http://localhost:5173/document/${documentId}?shareToken=${shareToken}`;
        return { shareUrl, role };
    }
    async createVersion(documentId, versionName, userId) {
        const doc = await this.checkDocumentPermission(documentId, userId, 'edit');
        let snapshotBuffer = this.collaborationGateway.getDocumentSnapshot(documentId);
        if (!snapshotBuffer) {
            const tempDoc = new Y.Doc();
            const text = tempDoc.getText('codewrite');
            text.insert(0, doc.content || '');
            snapshotBuffer = Buffer.from(Y.encodeStateAsUpdate(tempDoc));
        }
        return this.prisma.documentVersion.create({
            data: {
                documentId,
                versionName: versionName || `保存于${new Date().toLocaleString()}`,
                snapshot: Buffer.from(snapshotBuffer),
            },
        });
    }
    async findVersion(documentId, userId) {
        await this.checkDocumentPermission(documentId, userId, 'read');
        return this.prisma.documentVersion.findMany({
            where: { documentId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                versionName: true,
                createdAt: true,
            },
        });
    }
    async findOneVersion(documentId, versionId, userId) {
        await this.checkDocumentPermission(documentId, userId, 'read');
        const version = await this.prisma.documentVersion.findUnique({
            where: { id: versionId },
        });
        if (!version || version.documentId !== documentId) {
            throw new common_1.NotFoundException('未找到对应版本快照');
        }
        return version;
    }
    async rollbackVersion(docId, userId, targetVerId) {
        await this.checkDocumentPermission(docId, userId, 'edit');
        const targetVersion = await this.prisma.documentVersion.findFirst({
            where: { documentId: docId, id: targetVerId },
        });
        if (!targetVersion) {
            throw new common_1.NotFoundException('未查找到相关历史版本的内容');
        }
        const newDoc = new Y.Doc();
        const historyUpdate = targetVersion.snapshot;
        Y.applyUpdate(newDoc, historyUpdate);
        const xmlFragment = newDoc.getXmlFragment('codewrite');
        const targetContent = xmlFragment.toString();
        const [updatedDoc, newVersion] = await this.prisma.$transaction([
            this.prisma.document.update({
                where: { id: docId },
                data: {
                    content: targetContent,
                },
            }),
            this.prisma.documentVersion.create({
                data: {
                    documentId: docId,
                    snapshot: Buffer.from(historyUpdate),
                    versionName: `恢复到${targetContent.slice(0, 20)}...`,
                },
            }),
        ]);
        await this.collaborationGateway.applyRollback(docId, targetContent, historyUpdate);
        return newVersion;
    }
    async findAll(authorId) {
        return await this.prisma.document.findMany({
            where: { authorId },
        });
    }
    async findOne(id, userId) {
        return await this.checkDocumentPermission(id, userId, 'read');
    }
    async update(id, updateDocumentDto, userId) {
        await this.checkDocumentPermission(id, userId, 'edit');
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
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => collaboration_gateway_1.CollaborationGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        collaboration_gateway_1.CollaborationGateway])
], DocumentService);
//# sourceMappingURL=document.service.js.map