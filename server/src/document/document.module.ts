import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule.register({ secret: 'my-secret-key-123' })],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
