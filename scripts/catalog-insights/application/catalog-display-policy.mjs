function isFeatureEnabled(value) {
  return value === true;
}

function isDeveloperExperienceProduct(product) {
  const teamName = typeof product?.teamName === 'string' ? product.teamName.trim().toLowerCase() : '';
  const owner = typeof product?.owner === 'string' ? product.owner.trim().toLowerCase() : '';
  const slackChannel =
    typeof product?.slackChannel === 'string' ? product.slackChannel.trim().toLowerCase() : '';

  return (
    teamName === 'octo-developer-experience' ||
    owner === 'developer experience' ||
    slackChannel === '#developer-experience-team'
  );
}

function resolveSecurityVisibility(product) {
  // Security detail visibility is restricted to Developer Experience products.
  if (!isDeveloperExperienceProduct(product)) {
    return { showVulnerabilities: false, showCodeScanning: false };
  }

  return {
    showVulnerabilities: isFeatureEnabled(product.catalogShowVulnerabilities),
    showCodeScanning: isFeatureEnabled(product.catalogShowCodeScanning),
  };
}

/**
 * Applies product-level display flags to generated catalog report content.
 * @param {{ reports?: Record<string, any> }} catalogReport
 * @param {Array<object>} products
 * @returns {{ reports?: Record<string, any> }}
 */
export function applyCatalogDisplayFlags(catalogReport, products) {
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  for (const [slug, report] of Object.entries(catalogReport.reports || {})) {
    const product = productBySlug.get(slug);
    if (!product) continue;

    const { showVulnerabilities, showCodeScanning } = resolveSecurityVisibility(product);

    if (!showVulnerabilities) {
      report.vulnerabilities = undefined;
    }

    if (!showCodeScanning) {
      report.codeScanning = undefined;
    }

    if (Array.isArray(report.repositories)) {
      report.repositories = report.repositories.map((repository) => ({
        ...repository,
        vulnerabilities: showVulnerabilities ? repository.vulnerabilities : undefined,
        codeScanning: showCodeScanning ? repository.codeScanning : undefined,
      }));
    }
  }

  return catalogReport;
}

export { isDeveloperExperienceProduct, resolveSecurityVisibility };