import { WORSPACE_ROOT } from './root';
import fs from 'fs';
import path from 'path';

/**
 *
 * @param {import('fs').PathLike} pathLike
 * @param {string|string[]} target
 */
const clean = (pathLike, target) => {
  const _target = typeof target == 'string' ? [target] : target;
  fs.readdir(pathLike, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      const filePath = path.join(pathLike, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (!stats.isDirectory()) return;
        if (!_target.includes(file)) return clean(filePath, _target);
        fs.rm(filePath, { force: true, recursive: true }, (err) => {
          if (err) return console.error(`Error removing directory ${filePath}: ${err}`);
          console.log(`Success removing ${filePath} `);
        });
      });
    });
  });
};

clean(WORSPACE_ROOT, ['node_modules', '.turbo', '.next', 'pnpm-lock.yaml']);
