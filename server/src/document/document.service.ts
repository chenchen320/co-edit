import { Document } from './entities/document.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService,
    private jwt:JwtService
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

  async createShareLink(
    documentId: string,
    role: 'edit' | 'view',
    userId: string,
  ) {
    // 💡 补齐 await 异步查询
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) {
      throw new ForbiddenException('未找到对应文档');
    }

    const isOwner = doc.authorId === userId;
    let userRole: 'owner' | 'editor' | 'viewer' | 'none' = 'none';

    if (isOwner) {
      userRole = 'owner';
    } else {
      // 💡 修复：使用正确的 Prisma 联合主键查询语法，并加 await
      const collab = await this.prisma.collaborator.findUnique({
        where: {
          documentId_userId: { documentId, userId }
        }
      });
      if (collab) {
        userRole = collab.role as 'editor' | 'viewer';
      }
    }

    // 💡 核心拦截：游客(none)拦截
    if (userRole === 'none') {
      throw new ForbiddenException('您没有分享此文档的权限');
    }

    // 💡 核心拦截：只读用户不允许派发编辑链接
    if (userRole === 'viewer' && role === 'edit') {
      throw new ForbiddenException('您作为只读查看者，无法生成编辑链接');
    }

    // 💡 生成 Token
    const shareToken = this.jwt.sign({ documentId, role }, { expiresIn: '7d' });
    const shareUrl = `http://localhost:5173/document/${documentId}?shareToken=${shareToken}`;
    
    return { shareUrl, role };
  }


  async findAll(authorId: string) {
    return await this.prisma.document.findMany({
      where: { authorId },
    });
  }

  async findOne(id: string) {
    return await this.prisma.document.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
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
