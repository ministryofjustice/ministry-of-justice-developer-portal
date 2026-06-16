/** @typedef {import('../shared/types.mjs').SbomSummary} SbomSummary */
/** @typedef {import('../shared/types.mjs').FailureSummary} FailureSummary */

function firstStringValue(values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function firstNumberValue(values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

/**
 * Returns the SBOM document node regardless of wrapper shape.
 * @param {object} payload
 * @returns {object | undefined}
 */
export function extractSbomDocument(payload) {
  return payload?.sbom || payload;
}

/**
 * Extracts package count from known API/schema variants.
 * @param {object} payload
 * @returns {number | undefined}
 */
export function extractPackageCount(payload) {
  const sbom = extractSbomDocument(payload);

  return firstNumberValue([
    sbom?.packages?.length,
    payload?.packages?.length,
    payload?.summary?.package_count,
    payload?.summary?.packageCount,
    payload?.package_count,
    payload?.packageCount,
  ]);
}

/**
 * Extracts the most reliable generation timestamp from known fields.
 * @param {object} payload
 * @returns {string | undefined}
 */
export function extractGeneratedAt(payload) {
  const sbom = extractSbomDocument(payload);

  return firstStringValue([
    payload?.generated_at,
    payload?.generatedAt,
    payload?.created_at,
    payload?.createdAt,
    payload?.updated_at,
    payload?.updatedAt,
    sbom?.creationInfo?.created,
  ]);
}

/**
 * Normalizes source status and infers completion when document data is present.
 * @param {object} payload
 * @param {number | undefined} packageCount
 * @param {object | undefined} sbom
 * @returns {string}
 */
export function extractStatus(payload, packageCount, sbom) {
  let status = firstStringValue([
    payload?.status,
    payload?.state,
    payload?.report?.status,
    payload?.report_status,
  ]) || 'unknown';

  if (status === 'unknown' && (typeof packageCount === 'number' || sbom)) {
    status = 'completed';
  }

  return status;
}

/**
 * Extracts report URL with fallback to request endpoint when absent in payload.
 * @param {object} payload
 * @param {string} fallbackUrl
 * @returns {string | undefined}
 */
export function extractReportUrl(payload, fallbackUrl) {
  return firstStringValue([
    payload?.html_url,
    payload?.url,
    payload?.report_url,
    fallbackUrl,
  ]);
}

/**
 * Converts raw API payload into the normalized SBOM summary model.
 * @param {object} payload
 * @param {string} fallbackReportUrl
 * @returns {SbomSummary}
 */
export function toSbomSummary(payload, fallbackReportUrl) {
  const sbom = extractSbomDocument(payload);
  const packageCount = extractPackageCount(payload);
  const generatedAt = extractGeneratedAt(payload);
  const status = extractStatus(payload, packageCount, sbom);
  const reportUrl = extractReportUrl(payload, fallbackReportUrl);

  return {
    status,
    generatedAt,
    packageCount,
    reportUrl,
    sbom,
  };
}

/**
 * Standard failure projection for per-source fetch errors.
 * @param {unknown} error
 * @returns {FailureSummary}
 */
export function toFailureSummary(error) {
  return {
    status: 'failed',
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}

/**
 * Lightweight signal projection for future catalog scoring/quality gates.
 * @param {{ sbom?: object, packageCount?: number }} summary
 * @returns {{ hasSbom: boolean, hasPackages: boolean, packageCount: number }}
 */
export function extractCatalogSignals(summary) {
  return {
    hasSbom: Boolean(summary?.sbom),
    hasPackages: typeof summary?.packageCount === 'number' && summary.packageCount > 0,
    packageCount: typeof summary?.packageCount === 'number' ? summary.packageCount : 0,
  };
}

/**
 * Extracts package ecosystem from a PURL string (e.g. "pkg:npm/lodash@4.17.21" → "npm").
 * @param {string} purl
 * @returns {string | undefined}
 */
function extractEcosystemFromPurl(purl) {
  if (typeof purl !== 'string') return undefined;
  const match = purl.match(/^pkg:([^/]+)/);
  return match ? match[1].toLowerCase() : undefined;
}

/**
 * Extracts ecosystem distribution from SBOM package externalRefs (PURL).
 * @param {object | undefined} sbom
 * @returns {Record<string, number>}
 */
export function extractEcosystems(sbom) {
  if (!Array.isArray(sbom?.packages)) return {};

  const counts = {};
  for (const pkg of sbom.packages) {
    if (!Array.isArray(pkg?.externalRefs)) continue;
    for (const ref of pkg.externalRefs) {
      if (ref?.referenceCategory !== 'PACKAGE-MANAGER' || ref?.referenceType !== 'purl') continue;
      const ecosystem = extractEcosystemFromPurl(ref.referenceLocator);
      if (ecosystem) counts[ecosystem] = (counts[ecosystem] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Extracts license distribution from SBOM packages using licenseConcluded with fallback to licenseDeclared.
 * @param {object | undefined} sbom
 * @returns {Record<string, number>}
 */
export function extractLicenses(sbom) {
  if (!Array.isArray(sbom?.packages)) return {};

  const counts = {};
  for (const pkg of sbom.packages) {
    const license = pkg?.licenseConcluded || pkg?.licenseDeclared;
    if (typeof license === 'string' && license.trim().length > 0) {
      const key = license.trim();
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Extracts all packages from SBOM with enriched fields including purpose, purl, and supplier.
 * @param {object | undefined} sbom
 * @returns {Array<{ name: string, version?: string, license?: string, ecosystem?: string, purpose?: string, purl?: string, supplier?: string }>}
 */
export function extractTopPackages(sbom) {
  if (!Array.isArray(sbom?.packages)) return [];

  return sbom.packages
    .map((pkg) => {
      let ecosystem;
      let purl;

      if (Array.isArray(pkg?.externalRefs)) {
        for (const ref of pkg.externalRefs) {
          if (ref?.referenceCategory === 'PACKAGE-MANAGER' && ref?.referenceType === 'purl') {
            purl = ref.referenceLocator;
            ecosystem = extractEcosystemFromPurl(purl);
            break;
          }
        }
      }

      // Normalise supplier: strip "Organization: " / "Person: " prefixes from SPDX
      let supplier;
      const rawSupplier = pkg?.supplier;
      if (typeof rawSupplier === 'string' && rawSupplier.trim().length > 0) {
        supplier = rawSupplier.replace(/^(Organization|Person):\s*/i, '').trim() || undefined;
      }

      return {
        name: pkg?.name,
        version: pkg?.versionInfo || undefined,
        license: pkg?.licenseConcluded || pkg?.licenseDeclared || undefined,
        ecosystem,
        purl,
        purpose: pkg?.primaryPackagePurpose || undefined,
        supplier,
      };
    })
    .filter((pkg) => typeof pkg.name === 'string');
}

/**
 * Merges two ecosystem or license count maps by summing values.
 * @param {Record<string, number>} a
 * @param {Record<string, number>} b
 * @returns {Record<string, number>}
 */
export function mergeCountMaps(a, b) {
  const result = { ...a };
  for (const [key, value] of Object.entries(b)) {
    result[key] = (result[key] || 0) + value;
  }
  return result;
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

/**
 * Normalises raw Dependabot alert objects into a compact vulnerability summary.
 * @param {Array<object>} alerts
 * @returns {{ critical: number, high: number, medium: number, low: number, total: number, alerts: Array<object> }}
 */
export function normaliseVulnerabilityAlerts(alerts) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  const normalised = alerts.map((alert) => {
    const severity = (alert?.security_advisory?.severity ?? 'unknown').toLowerCase();
    if (severity in counts) counts[severity]++;

    return {
      number: alert?.number,
      severity,
      summary: alert?.security_advisory?.summary,
      cve: alert?.security_advisory?.cve_id ?? undefined,
      cvss: alert?.security_advisory?.cvss?.score ?? undefined,
      package: alert?.dependency?.package?.name,
      ecosystem: alert?.dependency?.package?.ecosystem,
      vulnerableRange: alert?.security_vulnerability?.vulnerable_version_range ?? undefined,
      fixedIn: alert?.security_vulnerability?.first_patched_version?.identifier ?? undefined,
      url: alert?.html_url ?? undefined,
    };
  });

  // Sort critical → high → medium → low → unknown
  normalised.sort((a, b) => {
    const ai = SEVERITY_ORDER.indexOf(a.severity);
    const bi = SEVERITY_ORDER.indexOf(b.severity);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return {
    ...counts,
    total: normalised.length,
    alerts: normalised,
  };
}
