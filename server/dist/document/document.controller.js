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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const common_1 = require("@nestjs/common");
const document_service_1 = require("./document.service");
const create_document_dto_1 = require("./dto/create-document.dto");
const update_document_dto_1 = require("./dto/update-document.dto");
const auth_guard_1 = require("../auth/auth.guard");
const user_dectorator_1 = require("../auth/user.dectorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let DocumentController = class DocumentController {
    documentService;
    constructor(documentService) {
        this.documentService = documentService;
    }
    create(createDocumentDto, user) {
        return this.documentService.create(createDocumentDto, user.id);
    }
    uploadImage(file) {
        return {
            url: `http://localhost:3000/uploads/${file.filename}`,
        };
    }
    async generateShare(id, body, user) {
        return await this.documentService.createShareLink(id, body.role, user.id);
    }
    async createVersion(id, body, user) {
        return await this.documentService.createVersion(id, body.versionName, user.id);
    }
    async getVersion(id, user) {
        return await this.documentService.findVersion(id, user.id);
    }
    async getOneVersion(id, versionId, user) {
        return await this.documentService.findOneVersion(id, versionId, user.id);
    }
    async findAll(user) {
        return await this.documentService.findAll(user.id);
    }
    findOne(id, user) {
        return this.documentService.findOne(id, user.id);
    }
    update(id, updateDocumentDto, user) {
        return this.documentService.update(id, updateDocumentDto, user.id);
    }
    remove(id) {
        return this.documentService.remove(id);
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_dectorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_document_dto_1.CreateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DocumentController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_dectorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "generateShare", null);
__decorate([
    (0, common_1.Post)(':id/version'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_dectorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "createVersion", null);
__decorate([
    (0, common_1.Get)(':id/version'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_dectorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getVersion", null);
__decorate([
    (0, common_1.Get)(':id/version/:versionId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, user_dectorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getOneVersion", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, user_dectorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_dectorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_dectorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_document_dto_1.UpdateDocumentDto, Object]),
    __metadata("design:returntype", void 0)
], DocumentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentController.prototype, "remove", null);
exports.DocumentController = DocumentController = __decorate([
    (0, common_1.Controller)('document'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], DocumentController);
//# sourceMappingURL=document.controller.js.map