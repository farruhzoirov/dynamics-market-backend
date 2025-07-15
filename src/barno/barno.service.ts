import { Injectable } from '@nestjs/common';
import {
  FileNotFoundException,
  InvalidFilePathException,
  NoFileUploadedException,
} from '../common/errors/file-upload/file-upload.exception';

import * as path from 'node:path';
import * as fs from 'node:fs';

@Injectable()
export class BarnoService {
  handleFileUpload(files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new NoFileUploadedException('No file uploaded');
    }

    files.forEach((file) => {
      file.size = +(file.size / (1024 * 1024)).toFixed(3);
      file['extension'] = file.originalname.split('.').pop() || '';
    });
    return {
      message: 'Uploaded successfully.',
      files,
    };
  }

  async deleteFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new FileNotFoundException('File not found');
    }
    const realPath = path.resolve(filePath);
    const uploadsPath = path.resolve('./uploads');
    if (!realPath.startsWith(uploadsPath)) {
      throw new InvalidFilePathException('Invalid file path');
    }
    await fs.promises.unlink(filePath);
  }
}
