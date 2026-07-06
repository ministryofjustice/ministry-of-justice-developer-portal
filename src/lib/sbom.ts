import { ProductSbomSummary, SbomDocument, SbomPackage } from '@/types/types';

export interface SbomPackagePreview {
  name: string;
  version?: string;
  license?: string;
}

export interface SbomCountItem {
  name: string;
  count: number;
}

export interface SbomInsights {
  documentName?: string;
  spdxVersion?: string;
  createdAt?: string;
  creator?: string;
  packageCount: number;
  relationshipCount: number;
  topPackages: SbomPackagePreview[];
  licenses: SbomCountItem[];
  ecosystems: SbomCountItem[];
}

export interface SbomDependencyNode {
  spdxId: string;
  name: string;
  depth: number;
}

function normalisePackage(doc: SbomDocument | undefined): SbomPackage[] {
  return doc?.packages || [];
}

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function getPackageLicense(pkg: SbomPackage): string | undefined {
  return pkg.licenseDeclared || pkg.licenseConcluded;
}

function getEcosystemFromPurl(purl?: string): string | undefined {
  if (!purl || !purl.startsWith('pkg:')) return undefined;
  const remainder = purl.slice(4);
  const type = remainder.split('/')[0]?.split('@')[0];
  return type ? type.toUpperCase() : undefined;
}

function parseLicenseTokens(expression?: string): string[] {
  if (!expression) return [];

  const cleaned = expression.replace(/[()]/g, ' ');
  const parts = cleaned.split(/\s+AND\s+|\s+OR\s+|\s+WITH\s+/i);

  return parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .filter((part) => !/^AND|OR|WITH$/i.test(part));
}

function toSortedCounts(values: string[]): SbomCountItem[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function extractSbomDocument(report: ProductSbomSummary | undefined): SbomDocument | undefined {
  return report?.sbom;
}

export function deriveSbomInsights(report: ProductSbomSummary | undefined): SbomInsights | null {
  const document = extractSbomDocument(report);
  if (!document) return null;

  const packages = normalisePackage(document);
  const relationships = document.relationships || [];
  const packagePreviews = packages.slice(0, 8).map((pkg) => ({
    name: pkg.name || 'Unknown package',
    version: pkg.versionInfo,
    license: getPackageLicense(pkg),
  }));
  const licenseValues = packages.flatMap((pkg) => parseLicenseTokens(getPackageLicense(pkg)));
  const ecosystemValues = unique(
    packages.flatMap((pkg) =>
      (pkg.externalRefs || [])
        .map((reference) => reference.referenceLocator)
        .map(getEcosystemFromPurl),
    ),
  );

  const createdAt = document.creationInfo?.created;
  const creator = document.creationInfo?.creators?.[0];

  return {
    documentName: document.name,
    spdxVersion: document.spdxVersion,
    createdAt,
    creator,
    packageCount: packages.length,
    relationshipCount: relationships.length,
    topPackages: packagePreviews,
    licenses: toSortedCounts(licenseValues),
    ecosystems: toSortedCounts(ecosystemValues),
  };
}

export function deriveSbomDependencyNodes(
  report: ProductSbomSummary | undefined,
  maxDepth: number,
): SbomDependencyNode[] {
  const document = extractSbomDocument(report);
  if (!document || !Array.isArray(document.relationships)) return [];

  const packagesById = new Map<string, SbomPackage>();
  for (const pkg of document.packages || []) {
    if (pkg.SPDXID) {
      packagesById.set(pkg.SPDXID, pkg);
    }
  }

  const dependsOn = new Map<string, string[]>();
  let rootId = 'SPDXRef-Repository';

  for (const relationship of document.relationships) {
    if (!relationship.relationshipType) continue;

    if (
      relationship.relationshipType === 'DESCRIBES' &&
      relationship.spdxElementId?.includes('DOCUMENT') &&
      relationship.relatedSpdxElement
    ) {
      rootId = relationship.relatedSpdxElement;
    }

    if (
      relationship.relationshipType === 'DEPENDS_ON' &&
      relationship.spdxElementId &&
      relationship.relatedSpdxElement
    ) {
      const current = dependsOn.get(relationship.spdxElementId) || [];
      current.push(relationship.relatedSpdxElement);
      dependsOn.set(relationship.spdxElementId, current);
    }
  }

  const limit = Number.isFinite(maxDepth) && maxDepth > 0 ? maxDepth : 1;
  const queue: Array<{ id: string; depth: number }> = [{ id: rootId, depth: 0 }];
  const visited = new Set<string>();
  const nodes: SbomDependencyNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    const nextDependencies = dependsOn.get(current.id) || [];
    for (const dependencyId of nextDependencies) {
      const dependencyDepth = current.depth + 1;
      const visitKey = `${dependencyId}:${dependencyDepth}`;
      if (visited.has(visitKey) || dependencyDepth > limit) {
        continue;
      }
      visited.add(visitKey);

      const dependencyPkg = packagesById.get(dependencyId);
      if (dependencyPkg) {
        nodes.push({
          spdxId: dependencyId,
          name: dependencyPkg.name || dependencyId,
          depth: dependencyDepth,
        });
      }

      queue.push({ id: dependencyId, depth: dependencyDepth });
    }
  }

  nodes.sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name));
  return nodes;
}
