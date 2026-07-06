/**
 * Performs an authenticated GitHub API request and returns parsed JSON payload with response headers.
 * @param {object} args
 * @param {string} args.endpoint
 * @param {string} args.token
 * @param {string} args.apiVersion
 * @param {string} args.userAgent
 * @returns {Promise<{ payload: object, headers: Headers }>}
 */
export async function requestGithubJsonWithHeaders({ endpoint, token, apiVersion, userAgent }) {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': apiVersion,
      'User-Agent': userAgent,
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail =
      payload && typeof payload.message === 'string'
        ? payload.message
        : `HTTP ${response.status}`;
    const error = new Error(detail);
    error.status = response.status;
    error.endpoint = endpoint;
    throw error;
  }

  return {
    payload: payload || {},
    headers: response.headers,
  };
}

/**
 * Performs an authenticated GitHub API request and returns parsed JSON payload.
 * @param {object} args
 * @param {string} args.endpoint
 * @param {string} args.token
 * @param {string} args.apiVersion
 * @param {string} args.userAgent
 * @returns {Promise<object>}
 */
export async function requestGithubJson(args) {
  const { payload } = await requestGithubJsonWithHeaders(args);
  return payload;
}
