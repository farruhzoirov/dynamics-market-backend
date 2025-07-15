import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BarnoService } from './barno.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('upload')
export class BarnoController {
  constructor(private readonly barnoService: BarnoService) {}
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Array of files to upload (up to 10 files)',
        },
      },
    },
  })
  @Post('barno')
  @UseInterceptors(FilesInterceptor('file', 10))
  uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    return this.barnoService.handleFileUpload(files);
  }
}
