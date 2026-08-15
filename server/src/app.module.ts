import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentModule } from './document/document.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    PrismaModule,
    DocumentModule,
    UserModule,
    AuthModule,
    CollaborationModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
