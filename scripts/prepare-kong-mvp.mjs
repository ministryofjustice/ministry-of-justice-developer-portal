import { generateKeyPairSync } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mvpDirectory = path.join(repoRoot, 'mvp');
const localDirectory = path.join(mvpDirectory, '.local');
const templatePath = path.join(mvpDirectory, 'kong.yml.template');
const publicKeyPath = path.join(localDirectory, 'jwt-public.pem');
const privateKeyPath = path.join(localDirectory, 'jwt-private.pem');
const renderedConfigPath = path.join(localDirectory, 'kong.yml');

mkdirSync(localDirectory, { recursive: true, mode: 0o700 });

if (existsSync(publicKeyPath) !== existsSync(privateKeyPath)) {
  throw new Error('Local JWT keypair is incomplete. Remove mvp/.local and prepare again.');
}

if (!existsSync(publicKeyPath)) {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  writeFileSync(privateKeyPath, privateKey, { mode: 0o600, flag: 'wx' });
  writeFileSync(publicKeyPath, publicKey, { mode: 0o644, flag: 'wx' });
}

const template = readFileSync(templatePath, 'utf8');
const publicKey = readFileSync(publicKeyPath, 'utf8');
const placeholder = '__JWT_PUBLIC_KEY_JSON__';

if (template.split(placeholder).length !== 2) {
  throw new Error(`Expected exactly one ${placeholder} placeholder in ${templatePath}`);
}

const renderedConfig = template.replace(placeholder, JSON.stringify(publicKey));
writeFileSync(renderedConfigPath, renderedConfig, { mode: 0o600 });

console.log('Prepared local Kong config and an ephemeral test keypair in mvp/.local.');
