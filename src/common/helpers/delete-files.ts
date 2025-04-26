import fs from 'fs/promises';
import { FileMetadata } from '../schema/file-meta.schema';

export const deleteFiles = async (images: FileMetadata[]) => {
  for (const image of images) {
    if (fs.access(image.path)) {
      await fs.unlink(image.path);
    }
  }
};
