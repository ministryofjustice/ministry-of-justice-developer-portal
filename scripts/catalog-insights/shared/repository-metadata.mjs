function normaliseRepositoryUrl(url) {
  if (typeof url !== 'string') return undefined;
  return url.replace(/^git\+/, '').replace(/\.git$/, '');
}

/**
 * Projects repository-level metadata from package.json into catalog shape.
 * @param {object} packageJson
 * @returns {{ name: string | undefined, url: string | undefined, homepage: string | undefined, bugsUrl: string | undefined, version: string | undefined }}
 */
export function buildRepositoryMetadata(packageJson) {
  return {
    name: packageJson?.name,
    url: normaliseRepositoryUrl(packageJson?.repository?.url),
    homepage: packageJson?.homepage,
    bugsUrl: packageJson?.bugs?.url,
    version: packageJson?.version,
  };
}
