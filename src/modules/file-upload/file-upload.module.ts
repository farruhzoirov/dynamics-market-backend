import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import {
  FileSizeLargerException,
  InvalidFileTypeException,
} from '../../common/errors/file-upload/file-upload.exception';

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  const allowMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml',
    'image/webp',
  ];
  if (!allowMimeTypes.includes(file.mimetype.toLowerCase())) {
    return cb(new InvalidFileTypeException('Invalid file type'), false);
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return cb(
      new FileSizeLargerException('File size larger than limit!'),
      false,
    );
  }
  return cb(null, true);
};

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const destinationDirectory = path.join('./uploads');
          if (!fs.existsSync(destinationDirectory)) {
            await fs.promises.mkdir(destinationDirectory, { recursive: true });
          }
          cb(null, destinationDirectory);
        },
        filename: (req, file, cb) => {
          console.log('originalname', file.originalname);
          const uniquePrefix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const sanitizedFileName = file.originalname
            .trim()
            .replace(/\s+/g, '-');
          cb(null, `${uniquePrefix}-${sanitizedFileName}`);
        },
      }),
      fileFilter: fileFilter,
    }),
  ],
  providers: [FileUploadService],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
