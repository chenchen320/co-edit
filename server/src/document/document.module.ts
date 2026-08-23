import { forwardRef, Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { CollaborationModule } from 'src/collaboration/collaboration.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ secret: 'my-secret-key-123' }),
    forwardRef(() => CollaborationModule),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
