import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

import { CLONE_DIR } from './constants.mjs';

export function cloneOrPull(source) {
  const repoSlug = source.repo.replace(/\//g, '--');
  const repoDir = path.join(CLONE_DIR, repoSlug);
  const repoUrl = `https://github.com/${source.repo}.git`;
  const branch = source.branch || 'main';

  if (fs.existsSync(path.join(repoDir, '.git'))) {
    console.log(`  Pulling latest from ${source.repo}...`);
    execFileSync('git', ['fetch', 'origin', branch, '--depth=1'], {
      cwd: repoDir,
      stdio: 'pipe',
    });
    execFileSync('git', ['reset', '--hard', `origin/${branch}`], {
      cwd: repoDir,
      stdio: 'pipe',
    });
  } else {
    console.log(`  Cloning ${source.repo} (shallow)...`);
    execFileSync('git', ['clone', '--depth=1', '--branch', branch, repoUrl, repoDir], {
      stdio: 'pipe',
    });
  }

  return repoDir;
}