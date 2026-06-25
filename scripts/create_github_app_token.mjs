#!/usr/bin/env node

import crypto from 'crypto';

function parseArgs(argv) {
  const args = { owner: undefined, repo: undefined, installationId: undefined, json: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--owner') {
      args.owner = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--repo') {
      args.repo = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--installation-id') {
      args.installationId = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--json') {
      args.json = true;
      continue;
    }
  }

  return args;
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function normalisePrivateKey(rawValue) {
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    throw new Error('Missing GITHUB_APP_PRIVATE_KEY.');
  }

  let value = rawValue.trim();
  value = value.replace(/^"/, '').replace(/"$/, '');
  value = value.replace(/\\n/g, '\n').replace(/\r/g, '');

  if (value.includes('BEGIN') && value.includes('PRIVATE KEY')) {
    return value;
  }

  try {
    const decoded = Buffer.from(value.replace(/\s+/g, ''), 'base64').toString('utf8');
    if (decoded.includes('BEGIN') && decoded.includes('PRIVATE KEY')) {
      return decoded;
    }
  } catch {
    // Ignore; we'll throw below.
  }

  throw new Error('Invalid GITHUB_APP_PRIVATE_KEY format. Provide PEM, escaped-newline PEM, or base64 PEM.');
}

function createAppJwt({ appId, privateKey }) {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60,
    iss: appId,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), privateKey);
  const encodedSignature = signature
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signingInput}.${encodedSignature}`;
}

async function githubRequest({ url, method = 'GET', token, body }) {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'moj-developer-portal-local-token-helper',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const message = payload?.message || `HTTP ${response.status}`;
    throw new Error(`${method} ${url} failed: ${message}`);
  }

  return payload;
}

async function resolveInstallationId({ owner, repo, appJwt }) {
  if (!owner || !repo) {
    throw new Error('Provide --installation-id, or both --owner and --repo.');
  }

  const payload = await githubRequest({
    url: `https://api.github.com/repos/${owner}/${repo}/installation`,
    token: appJwt,
  });

  if (!payload?.id) {
    throw new Error(`Could not resolve installation for ${owner}/${repo}.`);
  }

  return String(payload.id);
}

async function createInstallationToken({ installationId, appJwt }) {
  return githubRequest({
    url: `https://api.github.com/app/installations/${installationId}/access_tokens`,
    method: 'POST',
    token: appJwt,
  });
}

async function main() {
  const { owner, repo, installationId: cliInstallationId, json } = parseArgs(process.argv.slice(2));

  const appId = process.env.GITHUB_APP_ID || process.env.DEV_PORTAL_GH_APP_ID;
  const privateKeyRaw = process.env.GITHUB_APP_PRIVATE_KEY || process.env.DEV_PORTAL_GH_APP_PRIVATE_KEY;

  if (!appId) {
    throw new Error('Missing GITHUB_APP_ID (or DEV_PORTAL_GH_APP_ID).');
  }

  const privateKey = normalisePrivateKey(privateKeyRaw);
  const appJwt = createAppJwt({ appId, privateKey });

  const installationId = cliInstallationId || await resolveInstallationId({ owner, repo, appJwt });
  const tokenPayload = await createInstallationToken({ installationId, appJwt });

  if (json) {
    process.stdout.write(`${JSON.stringify({
      token: tokenPayload.token,
      expiresAt: tokenPayload.expires_at,
      installationId,
    }, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${tokenPayload.token}\n`);
  process.stderr.write(`Token expires at ${tokenPayload.expires_at} (installation ${installationId}).\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
