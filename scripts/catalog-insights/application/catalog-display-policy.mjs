function isFeatureEnabled(value) {
  return value === true;
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

    const showVulnerabilities = isFeatureEnabled(product.catalogShowVulnerabilities);
    const showCodeScanning = isFeatureEnabled(product.catalogShowCodeScanning);

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