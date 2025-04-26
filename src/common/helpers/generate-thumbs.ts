import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { FileMetadataDto } from 'src/shared/dto/file-meta.dto';

export const generateThumbs = async (images: FileMetadataDto[]) => {
  const thumbs: FileMetadataDto[] = [];
  for (const image of images) {
    const fileName = path.basename(image.path);
    const thumbName = `thumb-${fileName}`;
    const thumbPath = path.join('uploads/thumbs', thumbName);
    await fs.mkdir(path.dirname(thumbPath), { recursive: true });
    const thumbInfo = await sharp(image.path)
      .resize(200, 200)
      .toFile(thumbPath);

    thumbs.push({
      fieldname: 'thumb',
      originalname: fileName,
      encoding: '7bit',
      mimetype: thumbInfo.format ? `image/${thumbInfo.format}` : 'image/jpeg',
      destination: 'uploads/thumbs',
      filename: thumbName,
      path: thumbPath,
      size: +(thumbInfo.size / (1024 * 1024)).toFixed(3),
      extension: path.extname(thumbPath).replace('.', ''),
    });

    return thumbs;
  }
};
