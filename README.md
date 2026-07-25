# CoEdit (在线协同文档编辑器)

CoEdit 是一款基于 React 和 NestJS 实现的轻量级在线协作块级文档编辑器。项目采用前后端分离架构，核心亮点在于通过 Yjs (CRDT 算法) 和 WebSocket 实现多人实时的文档编辑与状态感知。

本项目为个人全栈学习与实践项目，旨在打通前端富文本编辑、后端服务开发、实时协同以及容器化部署的完整生命周期。

## 🛠️ 技术栈

### 前端 (Client)
- **核心框架**: React 19 + TypeScript
- **构建工具**: Vite
- **编辑器核心**: Tiptap (基于 ProseMirror 扩展的块级编辑器)
- **协同客户端**: Yjs + `@hocuspocus/provider` (或 `y-websocket`)
- **样式方案**: Vanilla CSS / Tailwind CSS

### 后端 (Server)
- **核心框架**: NestJS + TypeScript
- **数据库/ORM**: PostgreSQL + Prisma ORM
- **实时协同服务端**: `@hocuspocus/server` (或 NestJS WebSocket Gateway)
- **安全/认证**: JWT + bcrypt

### 运维部署 (DevOps)
- **本地环境**: Docker + Docker Compose
- **部署方案**: Docker 容器化部署

---

## 🚀 本地开发指南

### 前置要求
- Node.js >= 22 (建议使用 LTS 版本)
- Docker Desktop (用于运行本地数据库)

### 1. 启动本地数据库
在项目根目录下执行以下命令启动 PostgreSQL：
```bash
docker compose up -d