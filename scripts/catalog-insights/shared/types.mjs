/**
 * @typedef {Object} CatalogSource
 * @property {string} productSlug
 * @property {string} owner
 * @property {string} repo
 */

/**
 * @typedef {Object} RepositoryInsight
 * @property {string} owner
 * @property {string} repo
 * @property {string} status
 * @property {string | undefined} generatedAt
 * @property {number | undefined} packageCount
 * @property {string | undefined} reportUrl
 * @property {Record<string, number> | undefined} ecosystems
 * @property {Record<string, number> | undefined} licenses
 * @property {{ critical: number, high: number, medium: number, low: number, total: number, alerts?: Array<object> } | undefined} vulnerabilities
 * @property {string | undefined} error
 */

/**
 * @typedef {Object} CatalogPackage
 * @property {string} name
 * @property {string | undefined} version
 * @property {string | undefined} license
 * @property {string | undefined} ecosystem
 * @property {string | undefined} purpose
 * @property {string | undefined} purl
 * @property {string | undefined} supplier
 * @property {string[]} repos
 */

/**
 * @typedef {Object} FetchOptions
 * @property {string} token
 * @property {string} apiVersion
 * @property {string} userAgent
 */

/**
 * @typedef {Object} SbomSummary
 * @property {string} status
 * @property {string | undefined} generatedAt
 * @property {number | undefined} packageCount
 * @property {string | undefined} reportUrl
 * @property {object | undefined} sbom
 */

/**
 * @typedef {Object} FailureSummary
 * @property {string} status
 * @property {string} error
 */

/**
 * @typedef {Object} InsightsOutput
 * @property {string} fetchedAt
 * @property {Record<string, RepositoryInsight[]>} reports
 */

/**
 * @typedef {Object} CatalogReportOutput
 * @property {string} generatedAt
 * @property {object} repository
 * @property {{ count: number, files: string[] }} actions
 * @property {Record<string, object>} reports
 */

export {};
