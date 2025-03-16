'use server';

if (process.env.NODE_ENV != 'production') {
  console.log(`LOAD GLOBAL ENV`);
}
import path from 'path';
import { load } from '../load';
import { fileURLToPath } from 'url';

const currentPaths = path.dirname(fileURLToPath(import.meta.url));
load(currentPaths);
