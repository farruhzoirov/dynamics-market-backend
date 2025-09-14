import { readdir, stat } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import FormData from 'form-data';

const dir = './782-830-compressed';

const API_URL = '<host>/file-upload/upload'; // endpointingni shu yerga qo'y

const FIELD_NAME = 'file';
const TOKEN = '';

async function uploadFile(filePath) {
  const filename = path.basename(filePath);
  const baseName = filename.split('.')[0];
  const stats = await stat(filePath);

  const form = new FormData();
  form.append(FIELD_NAME, fs.createReadStream(filePath), {
    filename,
    knownLength: stats.size,
  });

  const headers = {
    ...form.getHeaders(),
    Authorization: `Bearer ${TOKEN}`,
  };

  const res = await axios.post(API_URL, form, {
    headers,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 60_000,
  });

  return res.data;
}

const entries = await readdir(dir, { withFileTypes: true });

for (const entry of entries) {
  const fullPath = path.join(dir, entry.name);
  if (entry.isFile()) {
    try {
      const result = await uploadFile(fullPath);
      console.log('✅ YUBORILDI:', entry.name, '->', result);
      const baseName = entry.name.split('.')[0];
      const updateResult = await updateProduct(result.files, baseName);
      console.log(updateResult);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      console.error('❌ XATO:', entry.name, '| status:', status ?? 'unknown');
      if (data) {
        console.error(
          'Response:',
          typeof data === 'string' ? data : JSON.stringify(data, null, 2),
        );
      } else if (err.message) {
        console.error('Error:', err.message);
      }
    }
  }
}

async function updateProduct(files, imageName) {
  try {
    const headers = {
      Authorization: `Bearer ${TOKEN}`,
    };

    const res = await axios.post(
      '<host>/product/products-image',
      {
        images: files,
        imageName,
      },
      { headers },
    );

    console.log(res.data);

    if (res.data.status === 200) {
      return res.data.message;
    }
    if (res.data.status === 404) {
      return res.data.message;
    }
  } catch (err) {
    console.error('error updating product', err);
  }
}
