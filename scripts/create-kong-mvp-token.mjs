import { sign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const privateKeyPath = path.join(repoRoot, 'mvp', '.local', 'jwt-private.pem');
const privateKey = readFileSync(privateKeyPath, 'utf8');
const now = Math.floor(Date.now() / 1000);
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const signingInput = [
  encode({ alg: 'RS256', typ: 'JWT' }),
  encode({ iss: 'mvp-local-issuer', sub: 'mvp-consumer', iat: now, exp: now + 300 }),
].join('.');
const signature = sign('RSA-SHA256', Buffer.from(signingInput), privateKey).toString('base64url');

process.stdout.write(`${signingInput}.${signature}\n`);
