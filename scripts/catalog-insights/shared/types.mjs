/**
 * @typedef {Object} CatalogSource
 * @property {string} productSlug
 * @property {string} owner
 * @property {string} repo
 * @property {'public' | 'private' | 'internal' | 'unknown' | undefined} visibility
 * @property {string | undefined} deploymentEnvironment
 */

/**
 * @typedef {Object} RepositoryInsight
 * @property {string} owner
 * @property {string} repo
 * @property {string} status can be 'success', 'archived', or 'error'
 * @property {'public' | 'private' | 'internal' | 'unknown' | undefined} visibility
 * @property {string | undefined} sbomRef
 * @property {'deployment_sha' | 'default_branch' | undefined} sbomRefType
 * @property {string | undefined} deploymentRef
 * @property {'sha' | 'branch' | 'tag' | 'unknown' | undefined} deploymentRefKind
 * @property {string | undefined} deploymentEnvironment
 * @property {string | undefined} deploymentDate
 * @property {string | undefined} generatedAt
 * @property {number | undefined} packageCount
 * @property {string | undefined} reportUrl
 * @property {Record<string, number> | undefined} ecosystems
 * @property {Record<string, number> | undefined} licenses
 * @property {{ critical: number, high: number, medium: number, low: number, total: number, alerts?: Array<object> } | undefined} vulnerabilities
 * @property {{ critical: number, high: number, medium: number, low: number, total: number, byRuleType: Record<string, number>, byLanguage: Record<string, number>, lastAnalyzedAt?: string, alerts?: Array<object> } | undefined} codeScanning
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
 * @property {string | undefined} [deploymentEnvironment]
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
