import { describe, expect, it } from 'vitest';
import { deriveSbomDependencyNodes, deriveSbomInsights } from '@/lib/sbom';

describe('deriveSbomInsights', () => {
  it('derives readable insights from an SPDX document', () => {
    const result = deriveSbomInsights({
      status: 'completed',
      sbom: {
        name: 'example/repo',
        spdxVersion: 'SPDX-2.3',
        creationInfo: {
          created: '2026-06-08T12:00:00Z',
          creators: ['Tool: GitHub.com-Dependency-Graph'],
        },
        packages: [
          {
            name: 'rails',
            licenseDeclared: 'MIT',
            externalRefs: [
              {
                referenceLocator: 'pkg:gem/rails@1.0.0',
              },
            ],
          },
          {
            name: 'rack',
            licenseConcluded: 'MIT',
            externalRefs: [
              {
                referenceLocator: 'pkg:gem/rack@2.0.0',
              },
            ],
          },
        ],
        relationships: [
          {
            relationshipType: 'DEPENDS_ON',
            spdxElementId: 'SPDXRef-Repository',
            relatedSpdxElement: 'SPDXRef-Package',
          },
        ],
      },
    });

    expect(result).toEqual({
      documentName: 'example/repo',
      spdxVersion: 'SPDX-2.3',
      createdAt: '2026-06-08T12:00:00Z',
      creator: 'Tool: GitHub.com-Dependency-Graph',
      packageCount: 2,
      relationshipCount: 1,
      topPackages: [
        { name: 'rails', version: undefined, license: 'MIT' },
        { name: 'rack', version: undefined, license: 'MIT' },
      ],
      licenses: [{ name: 'MIT', count: 2 }],
      ecosystems: [{ name: 'GEM', count: 1 }],
    });
  });

  it('returns null when no SPDX document is present', () => {
    expect(deriveSbomInsights(undefined)).toBeNull();
  });
});

describe('deriveSbomDependencyNodes', () => {
  it('returns dependencies up to the requested depth', () => {
    const nodes = deriveSbomDependencyNodes(
      {
        status: 'completed',
        sbom: {
          packages: [
            { SPDXID: 'SPDXRef-Package-A', name: 'package-a' },
            { SPDXID: 'SPDXRef-Package-B', name: 'package-b' },
            { SPDXID: 'SPDXRef-Package-C', name: 'package-c' },
          ],
          relationships: [
            {
              relationshipType: 'DESCRIBES',
              spdxElementId: 'SPDXRef-DOCUMENT',
              relatedSpdxElement: 'SPDXRef-Repository',
            },
            {
              relationshipType: 'DEPENDS_ON',
              spdxElementId: 'SPDXRef-Repository',
              relatedSpdxElement: 'SPDXRef-Package-A',
            },
            {
              relationshipType: 'DEPENDS_ON',
              spdxElementId: 'SPDXRef-Package-A',
              relatedSpdxElement: 'SPDXRef-Package-B',
            },
            {
              relationshipType: 'DEPENDS_ON',
              spdxElementId: 'SPDXRef-Package-B',
              relatedSpdxElement: 'SPDXRef-Package-C',
            },
          ],
        },
      },
      2,
    );

    expect(nodes).toEqual([
      { spdxId: 'SPDXRef-Package-A', name: 'package-a', depth: 1 },
      { spdxId: 'SPDXRef-Package-B', name: 'package-b', depth: 2 },
    ]);
  });
});
