import slugify from 'slugify';
import {v4 as uuid4} from 'uuid';

export const generateUniqueSlug = (name: string) => {
  return `${slugify(name, {lower: true, replacement: '-', strict: false})}-${uuid4().slice(0, 8)}`;
};
