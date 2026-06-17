import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT = path.resolve(__dirname, '..', '..');
export const CONTENT_DIR = path.join(ROOT, 'content', 'docs');
export const SOURCES_FILE = path.join(ROOT, 'sources.json');
export const CLONE_DIR = path.join(ROOT, '.ingestion-cache');