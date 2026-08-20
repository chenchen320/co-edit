import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/user.dectorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('document')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto, @User() user: any) {
    return this.documentService.create(createDocumentDto, user.id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      url: `http://localhost:3000/uploads/${file.filename}`,
    };
  }

  @Post(':id/share')
  async generateShare(
    @Param('id') id: string,
    @Body() body: { role: 'edit' | 'view' },
    @User() user: any,
  ) {
    return await this.documentService.createShareLink(id, body.role, user.id);
  }


  @Get()
  async findAll(@User() user: any) {
    return await this.documentService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
