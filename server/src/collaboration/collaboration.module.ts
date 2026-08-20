import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: 'my-secret-key-123', // 💡 与系统真实 JWT 密钥保持一致
    }),
  ],
  providers: [CollaborationGateway],
})
export class CollaborationModule {}

