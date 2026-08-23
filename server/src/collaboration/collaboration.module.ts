import { forwardRef, Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { DocumentModule } from 'src/document/document.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: 'my-secret-key-123', // 保持与 JWT 系统密钥一致
    }),
    forwardRef(() => DocumentModule), // 💡 解决循环依赖
  ],
  providers: [CollaborationGateway],
  exports: [CollaborationGateway], // 💡 必须导出以供 DocumentService 注入
})
export class CollaborationModule {}
