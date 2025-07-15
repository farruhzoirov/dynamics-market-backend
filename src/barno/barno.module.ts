import { Module } from '@nestjs/common';
import { BarnoController } from './barno.controller';
import { BarnoService } from './barno.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { Request } from 'express';
import {
  FileSizeLargerException,
  InvalidFileTypeException,
} from '../common/errors/file-upload/file-upload.exception';

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
          const destinationDirectory = path.join('./linguabarno');
          if (!fs.existsSync(destinationDirectory)) {
            await fs.promises.mkdir(destinationDirectory, { recursive: true });
          }
          cb(null, destinationDirectory);
        },
        filename: (req, file, cb) => {
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
  controllers: [BarnoController],
  providers: [BarnoService],
})
export class BarnoModule {}
