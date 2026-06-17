/**
 * Connector: GitHub repository
 *
 * Connector contract (for future connectors to implement):
 *   fetchSource(source) => repoDir (string path to local checkout)
 *
 * To add a new connector (e.g. S3, Confluence):
 *   1. Create connectors/<name>Connector.mjs implementing fetchSource(source).
 *   2. Register it in connectors/connectorRegistry.mjs (to be added in Phase 3 extension).
 *   3. Add a `connector` field to the source entry in sources.json.
 */

export { cloneOrPull as fetchSource } from '../git.mjs';
