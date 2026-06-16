/** @typedef {import('./types.mjs').CatalogSource} CatalogSource */

/**
 * Returns true when a product has an explicit GitHub team mapping for insights.
 * @param {object} product
 * @returns {boolean}
 */
export function hasCatalogTeam(product) {
  return typeof product?.teamName === 'string' && product.teamName.trim().length > 0;
}

/**
 * Resolves GitHub team locator with default organization.
 * @param {object} product
 * @returns {{ org: string, teamSlug: string } | undefined}
 */
export function resolveCatalogTeam(product) {
  if (!hasCatalogTeam(product)) return undefined;

  return {
    org:
      typeof product?.teamOrg === 'string' && product.teamOrg.trim().length > 0
        ? product.teamOrg.trim()
        : 'ministryofjustice',
    teamSlug: product.teamName.trim(),
  };
}
