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
exports.CollaborationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const sync_1 = require("y-protocols/sync");
const lib0_1 = require("lib0");
const socket_io_1 = require("socket.io");
const Y = __importStar(require("yjs"));
let CollaborationGateway = class CollaborationGateway {
    documents = new Map();
    server;
    handleDisconnect(client) {
        console.log(client.id);
    }
    handleJoin(client, payload) {
        const { documentId } = payload;
        const docs = this.documents.get(documentId);
        if (documentId) {
            if (!docs) {
                const doc = new Y.Doc();
                this.documents.set(documentId, doc);
            }
            client.join(documentId);
            client.data.documentId = documentId;
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
    handleSync(client, data) {
        const originalData = data instanceof Buffer ? new Uint8Array(data) : data;
        const documentId = client.data.documentId;
        const doc = this.documents.get(documentId);
        if (!documentId || !doc)
            return;
        const decoder = lib0_1.decoding.createDecoder(data);
        const messageType = lib0_1.decoding.readVarUint(decoder);
        if (messageType !== 0) {
            return;
        }
        const syncMessageType = lib0_1.decoding.readVarUint(decoder);
        const replyEncoder = lib0_1.encoding.createEncoder();
        const origin = client;
        (0, sync_1.readSyncMessage)(decoder, replyEncoder, doc, origin);
        if (lib0_1.encoding.length(replyEncoder) > 0) {
            const replyMessage = lib0_1.encoding.toUint8Array(replyEncoder);
            client.emit('sync', Buffer.from(replyMessage));
        }
        if (syncMessageType === 2) {
            client.to(documentId).emit('sync', Buffer.from(originalData));
        }
    }
};
exports.CollaborationGateway = CollaborationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Socket)
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
__decorate([
    (0, websockets_1.SubscribeMessage)('sync'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Buffer]),
    __metadata("design:returntype", void 0)
], CollaborationGateway.prototype, "handleSync", null);
exports.CollaborationGateway = CollaborationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], CollaborationGateway);
//# sourceMappingURL=collaboration.gateway.js.map