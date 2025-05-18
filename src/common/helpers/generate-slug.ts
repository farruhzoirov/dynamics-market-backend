import slugify from 'slugify';
import { v4 as uuid4 } from 'uuid';

export const generateUniqueSlug = (name: string) => {
  return `${slugify(name, { lower: true, replacement: '-', strict: true })}`;
};

export const generateUniqueNewsSlug = (name: string) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];

  return `${slugify(name, { lower: true, replacement: '-', strict: true })}-${randomChar}`;
};

export const generateUniqueSlugForProduct = (name: string) => {
  const slug = `${slugify(name, { lower: true, replacement: '-', strict: true })}`;
  const uniqueChar = uuid4()
    .replace(/[^a-z]/g, '')
    .charAt(0);

  return `${slug}-${uniqueChar}`;
};
