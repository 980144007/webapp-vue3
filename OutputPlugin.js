import archiver from 'archiver';
import fs from 'fs';
import { rimraf } from 'rimraf';

export default function OutputPlugin({
  outputZipPath = 'dist/output.zip',
  sourceDir = 'dist'
}) {
  
  if(process.env.NODE_ENV !== "production") return;
  return {
    name: 'output-plugin',
    closeBundle() {
      const output = fs.createWriteStream(outputZipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        console.log('压缩包创建完成:', outputZipPath);
        rimraf(sourceDir);
      });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    }
  };
}