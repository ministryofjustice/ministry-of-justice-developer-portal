import fs from 'fs';

/**
 * Filesystem dependency adapter used by catalog-insights layers.
 */
export const fileSystemDependency = {
  existsSync(path) {
    return fs.existsSync(path);
  },

  readFileUtf8Sync(path) {
    return fs.readFileSync(path, 'utf8');
  },

  writeFileUtf8Sync(path, content) {
    fs.writeFileSync(path, content);
  },

  readdirWithFileTypesSync(path) {
    return fs.readdirSync(path, { withFileTypes: true });
  },

  mkdirRecursiveSync(path) {
    fs.mkdirSync(path, { recursive: true });
  },

  unlinkSync(path) {
    fs.unlinkSync(path);
  },

  readJsonIfExists(path, fallbackValue) {
    if (!fs.existsSync(path)) {
      return fallbackValue;
    }

    return JSON.parse(fs.readFileSync(path, 'utf8'));
  },

  writeJson(path, value) {
    fs.writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
  },

  removeFileIfExists(path) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  },
};
