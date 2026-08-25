import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as Y from 'yjs';
import { CollaborationGateway } from './../collaboration/collaboration.gateway';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    @Inject(forwardRef(() => CollaborationGateway))
    private readonly collaborationGateway: CollaborationGateway,
  ) {}

  create(createDocumentDto: CreateDocumentDto, authorId: string) {
    return this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        content: createDocumentDto.content,
        authorId,
      },
    });
  }

  // 💡 统一零信任权限卫士：在后端彻底防范越权垂直与平行漏洞
  private async checkDocumentPermission(
    documentId: string,
    userId: string,
    action: 'read' | 'edit' | 'delete' = 'read',
  ) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException('未找到对应文档');
    }

    const isOwner = Boolean(
      doc.authorId && doc.authorId.trim() === userId.trim(),
    );
    let userRole: 'owner' | 'editor' | 'viewer' | 'none' = 'none';

    if (isOwner) {
      userRole = 'owner';
    } else {
      const collab = await this.prisma.collaborator.findUnique({
        where: {
          documentId_userId: { documentId, userId },
        },
      });
      if (collab) {
        userRole = collab.role as 'editor' | 'viewer';
      }
    }

    // 💡 规则 1：游客一律驱逐，禁止任何操作
    if (userRole === 'none') {
      throw new ForbiddenException('您没有访问此文档的权限');
    }

    // 💡 规则 2：执行「修改 (edit)」操作时，Viewer 只读协作者必须被强行拦截！
    if (action === 'edit' && userRole === 'viewer') {
      throw new ForbiddenException('您作为只读查看者，无权修改文档内容');
    }

    // 💡 规则 3：执行「删除 (delete)」操作时，必须且只能由所有者 (Owner) 本人操作！
    if (action === 'delete' && userRole !== 'owner') {
      throw new ForbiddenException('只有文档所有者才能删除该文档');
    }

    return doc;
  }

  async createShareLink(
    documentId: string,
    role: 'edit' | 'view',
    userId: string,
  ) {
    // 💡 查验权限：至少需要 read 权限才能申请分享链接
    const doc = await this.checkDocumentPermission(documentId, userId, 'read');

    // 确定申请者的具体身份
    const isOwner = doc.authorId === userId;
    let userRole: 'owner' | 'editor' | 'viewer' = 'viewer';

    if (isOwner) {
      userRole = 'owner';
    } else {
      const collab = await this.prisma.collaborator.findUnique({
        where: { documentId_userId: { documentId, userId } },
      });
      if (collab && collab.role === 'editor') {
        userRole = 'editor';
      }
    }

    // 只读用户不允许派发编辑链接
    if (userRole === 'viewer' && role === 'edit') {
      throw new ForbiddenException('您作为只读查看者，无法生成编辑链接');
    }

    // 生成 Token
    const shareToken = this.jwt.sign({ documentId, role }, { expiresIn: '7d' });
    const shareUrl = `http://localhost:5173/document/${documentId}?shareToken=${shareToken}`;

    return { shareUrl, role };
  }

  
  async createVersion(documentId: string, versionName: string, userId: string) {
    // 💡 查验权限：必须是 edit 级别及以上（Owner/Editor）才能创建版本快照
    const doc = await this.checkDocumentPermission(documentId, userId, 'edit');

    // 跨界索要Yjs二进制YDoc
    let snapshotBuffer =
      this.collaborationGateway.getDocumentSnapshot(documentId);

    // 防空兜底(无人在线时)
    if (!snapshotBuffer) {
      const tempDoc = new Y.Doc();
      const text = tempDoc.getText('codewrite');
      text.insert(0, doc.content || '');
      snapshotBuffer = Buffer.from(Y.encodeStateAsUpdate(tempDoc));
    }
    // 存入数据库的DocumentVersion表中
    return this.prisma.documentVersion.create({
      data: {
        documentId,
        versionName: versionName || `保存于${new Date().toLocaleString()}`,
        snapshot: Buffer.from(snapshotBuffer),
      },
    });
  }

  async findVersion(documentId: string, userId: string) {
    // 💡 查验权限：有 read 权限的人即可获取版本列表
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

  async findOneVersion(documentId: string, versionId: string, userId: string) {
    // 💡 查验权限：有 read 权限的人可以获取具体版本的快照大包
    await this.checkDocumentPermission(documentId, userId, 'read');

    const version = await this.prisma.documentVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.documentId !== documentId) {
      throw new NotFoundException('未找到对应版本快照');
    }

    return version;
  }

  async rollbackVersion(docId: string, userId: string, targetVerId: string) {
    await this.checkDocumentPermission(docId, userId, 'edit');
    const targetVersion = await this.prisma.documentVersion.findFirst({
      where: { documentId: docId, id: targetVerId },
    });
    if (!targetVersion) {
      throw new NotFoundException('未查找到相关历史版本的内容');
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

    await this.collaborationGateway.applyRollback(
      docId,
      targetContent,
      historyUpdate,
    );

    return newVersion;
  }

  async findAll(authorId: string) {
    return await this.prisma.document.findMany({
      where: { authorId },
    });
  }

  // 💡 修复越权：加载单个文档详情时，绑定 checkDocumentPermission 进行协作者查验
  async findOne(id: string, userId: string) {
    return await this.checkDocumentPermission(id, userId, 'read');
  }

  // 💡 修复越权：更新文档详情（如修改标题等动作）时，必须是 edit 权限以上
  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ) {
    await this.checkDocumentPermission(id, userId, 'edit');
    return await this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.document.delete({
      where: { id },
    });
  }
}
