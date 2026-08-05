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
exports.CollaborationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const socket_io_2 = require("socket.io");
let CollaborationGateway = class CollaborationGateway {
    server;
    handleDisconnect(client) {
        console.log(client.id);
    }
    handleJoin(client, payload) {
        if (payload.documentId) {
            client.join(payload.documentId);
            return { status: 'ok' };
        }
        else {
            client.emit('error', { message: '...' });
        }
    }
    handleDocumentEditor(client, payload) {
        if (payload.documentId) {
            client.to(payload.documentId).emit('document-updated', {
                userId: client.id,
                content: payload.content,
                timestamp: new Date().toISOString(),
            });
        }
    }
};
exports.CollaborationGateway = CollaborationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_2.Server)
], CollaborationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-document'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('document-update'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleDocumentEditor", null);
exports.CollaborationGateway = CollaborationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], CollaborationGateway);
//# sourceMappingURL=collaboration.gateway.js.map