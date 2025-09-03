import { readdir } from 'node:fs/promises';
import * as fs from 'node:fs';
import path from 'node:path';
import tinify from 'tinify';
tinify.key = 'TINIFY_KEY';
const inputDir = './654-781';
const outputDir = './654-781-compressed';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function compressImages() {
  try {
    const entries = await readdir(inputDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile()) {
        const inputPath = path.join(inputDir, entry.name);
        const outputPath = path.join(outputDir, entry.name);

        console.log(`Compressing: ${entry.name}...`);

        const source = tinify.fromFile(inputPath);
        await source.toFile(outputPath);

        console.log(`✅ Saved: ${outputPath}`);
      }
    }

    console.log('🎉 All images compressed successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

compressImages();
