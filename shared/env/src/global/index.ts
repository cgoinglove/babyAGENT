import path from 'path';
import { load } from '../load';
import { fileURLToPath } from 'url';

const currentPaths = path.dirname(fileURLToPath(import.meta.url));

load(currentPaths);
