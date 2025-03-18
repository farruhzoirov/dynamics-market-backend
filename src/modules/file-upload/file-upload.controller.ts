import {Body, Controller, HttpCode, HttpStatus, Post, UploadedFiles, UseInterceptors,} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {FileUploadService} from './file-upload.service';
import {ApiBearerAuth, ApiBody, ApiConsumes} from '@nestjs/swagger';
import {FilePathDto} from './dto/file-path.dto';
import {FileDeletedSuccessResponse} from '../../shared/success/success-responses';

@ApiBearerAuth()
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete-file')
  async deleteFile(@Body() body: FilePathDto) {
    await this.fileUploadService.deleteFile(body.filePath);
    return new FileDeletedSuccessResponse();
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {type: 'string', format: 'binary'},
          description: 'Array of files to upload (up to 10 files)',
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FilesInterceptor('file', 10))
  uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    return this.fileUploadService.handleFileUpload(files);
  }
}
