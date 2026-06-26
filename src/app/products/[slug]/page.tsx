import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { ChatBot } from '@/components/ChatBot';
import { getProductCategoryLabel } from '@/lib/categoryLabels';
import { ActionLinks} from '@/components/templateRender/ActionLinks';
import { MetaBar } from '@/components/templateRender/MetaBar';
import { PageIntro } from '@/components/templateRender/PageIntro';
import { StatusTag} from '@/components/templateRender/StatusTag';
import { TagRow } from '@/components/templateRender/TagRow';
import { TagList } from '@/components/templateRender/TagList';
import { Section } from '@/components/templateRender/Section';
import { Tabs } from '@/components/templateRender/Tabs';
import { VulnerabilitiesTable } from '@/components/VulnerabilitiesTable';
import { CodeScanningTable } from '@/components/CodeScanningTable';
import { PackagesTable } from '@/components/PackagesTable';
import { loadCatalogReportEntryBySlug } from '@/lib/catalogReports';
import products from '../../../../content/products/products.json';
import sources from '../../../../sources.json';
import { ActionLink, Product, ProductSbomSummary } from '@/types/types';



type Params = { slug: string };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  return { title: product.name };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug) as Product | undefined;

  if (!product) {
    notFound();
  }

  const sourceIds = new Set(
    sources.sources.filter((source) => source.enabled !== false).map((source) => source.id),
  );
  const isDocsSourceLink = Boolean(product.docsUrl?.startsWith('/docs/'));
  const docsSourceId = isDocsSourceLink
    ? product.docsUrl?.replace(/^\/docs\//, '').split('/')[0]
    : undefined;
  const hasValidDocsLink = Boolean(
    product.docsUrl && (!isDocsSourceLink || (docsSourceId && sourceIds.has(docsSourceId))),
  );
  const hasInternalServiceLink = Boolean(product.externalUrl?.startsWith('/'));
  const hasCatalogInsights = typeof product.teamName === 'string' && product.teamName.trim().length > 0;
  const reportFile = await loadCatalogReportEntryBySlug(product.slug);
  const sbomEntry = reportFile?.report;
  const sbom = sbomEntry?.status ? (sbomEntry as unknown as ProductSbomSummary) : undefined;
  const repositoryInsights = sbom?.repositories || [];
  const sbomGeneratedAt = sbom?.generatedAt;

  // Product-level deduplicated packages (aggregated by catalog-report-service)
  const allPackages = sbom?.packages ?? [];

  // Product-level vulnerability data
  const vulnerabilities = sbom?.vulnerabilities;
  const vulnAlerts = vulnerabilities?.alerts ?? [];
  const hasVulnerabilities = (vulnerabilities?.total ?? 0) > 0;
  const codeScanning = sbom?.codeScanning;
  const codeScanningAlerts = codeScanning?.alerts ?? [];
  const hasCodeScanning = (codeScanning?.total ?? 0) > 0;
  const archivedRepositories = repositoryInsights.filter((repository) => repository.status === 'archived').length;
  const publicRepositories = repositoryInsights.filter((repository) => repository.visibility === 'public').length;
  const internalRepositories = repositoryInsights.filter((repository) => repository.visibility === 'internal').length;
  const privateRepositories = repositoryInsights.filter((repository) => repository.visibility === 'private').length;
  const severityOrder = ['critical', 'high', 'medium', 'low'] as const;

  // Product-level ecosystem and license totals (aggregated server-side in the report)
  const ecosystems = sbom?.ecosystems ?? {};
  const licenses = sbom?.licenses ?? {};

  const sortedEcosystems = Object.entries(ecosystems).sort(([, a], [, b]) => b - a);
  const sortedLicenses = Object.entries(licenses).sort(([, a], [, b]) => b - a);

  const formatSbomStatus = (value: string) => {
    const normalised = value.toLowerCase();
    if (normalised === 'completed') return 'Ready';
    if (normalised === 'pending') return 'In progress';
    if (normalised === 'partial') return 'Partial';
    if (normalised === 'failed') return 'Failed';
    return value;
  };
  const actionLinks: ActionLink[] = [
    ...(product.docsUrl && hasValidDocsLink
      ? [{ label: 'View documentation', href: product.docsUrl, external: false }]
      : []),
    ...(product.externalUrl
      ? [{ label: 'Visit service', href: product.externalUrl, external: !hasInternalServiceLink }]
      : []),
  ];

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Products', href: '/products' }, { label: product.name }]} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <TagRow categoryTag={getProductCategoryLabel(product.category)} />
          <PageIntro
            title={product.name}
            summary={product.description}
            titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
          />

          <table className="govuk-table">
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">
                  Status
                </th>
                <td className="govuk-table__cell">
                  <StatusTag status={product.status} />
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">
                  Owner
                </th>
                <td className="govuk-table__cell">{product.owner}</td>
              </tr>
              {product.slackChannel && (
                <tr className="govuk-table__row">
                  <th className="govuk-table__header" scope="row">
                    Slack
                  </th>
                  <td className="govuk-table__cell">{product.slackChannel}</td>
                </tr>
              )}
              <tr className="govuk-table__row">
                <th className="govuk-table__header" scope="row">
                  Tags
                </th>
                <td className="govuk-table__cell">
                  <TagList tags={product.tags} />
                </td>
              </tr>
            </tbody>
          </table>

          <ActionLinks links={actionLinks} />
        </div>
      </div>

      {sbom && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <Section heading="Catalog insights">
              <Tabs
                tabs={[
                  {
                    id: 'overview',
                    label: 'Overview',
                    content: (
                      <div>
                        <table className="govuk-table">
                          <tbody className="govuk-table__body">
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Status</th>
                              <td className="govuk-table__cell">
                                <div>{formatSbomStatus(sbom.status)}</div>
                                <div className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                                  Completed <strong>{sbom.completedRepositories || 0}</strong>, Failed <strong>{sbom.failedRepositories || 0}</strong>, Pending <strong>{sbom.pendingRepositories || 0}</strong>
                                </div>
                              </td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Team</th>
                              <td className="govuk-table__cell">{product.teamName || 'Not configured'}</td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Last updated</th>
                              <td className="govuk-table__cell">{sbomGeneratedAt || 'Not available'}</td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Repositories</th>
                              <td className="govuk-table__cell">
                                <strong>{sbom.repositoryCount || 0}</strong> total -{' '}
                                <strong>{archivedRepositories}</strong> archived,{' '}
                                <strong>{publicRepositories}</strong> public,{' '}
                                <strong>{internalRepositories}</strong> internal,{' '}
                                <strong>{privateRepositories}</strong> private
                              </td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Total packages</th>
                              <td className="govuk-table__cell">{sbom.packageCount || 0}</td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Ecosystems</th>
                              <td className="govuk-table__cell">{sortedEcosystems.length > 0 ? sortedEcosystems.map(([name]) => name).join(', ') : 'None detected'}</td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Unique licenses</th>
                              <td className="govuk-table__cell">
                                <strong>{sortedLicenses.length}</strong>
                              </td>
                            </tr>
                            {hasVulnerabilities && (
                              <tr className="govuk-table__row">
                                <th className="govuk-table__header" scope="row">Vulnerabilities (open)</th>
                                <td className="govuk-table__cell">
                                  <strong>{vulnerabilities!.total}</strong> total —{' '}
                                  <strong className="govuk-!-colour-red">{vulnerabilities!.critical}</strong> critical,{' '}
                                  <strong>{vulnerabilities!.high}</strong> high,{' '}
                                  <strong>{vulnerabilities!.medium}</strong> medium,{' '}
                                  <strong>{vulnerabilities!.low}</strong> low
                                </td>
                              </tr>
                            )}
                            {hasCodeScanning && (
                              <tr className="govuk-table__row">
                                <th className="govuk-table__header" scope="row">Code scanning (open)</th>
                                <td className="govuk-table__cell">
                                  <strong>{codeScanning!.total}</strong> total —{' '}
                                  <strong className="govuk-!-colour-red">{codeScanning!.critical}</strong> critical,{' '}
                                  <strong>{codeScanning!.high}</strong> high,{' '}
                                  <strong>{codeScanning!.medium}</strong> medium,{' '}
                                  <strong>{codeScanning!.low}</strong> low
                                </td>
                              </tr>
                            )}
                            {sbom.error && (
                              <tr className="govuk-table__row">
                                <th className="govuk-table__header" scope="row">Error</th>
                                <td className="govuk-table__cell">{sbom.error}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ),
                  },
                  {
                    id: 'repositories',
                    label: 'Repositories',
                    content: repositoryInsights.length > 0 ? (
                      <table className="govuk-table govuk-!-margin-bottom-0">
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th className="govuk-table__header" scope="col">Repository</th>
                            <th className="govuk-table__header" scope="col">Status</th>
                            <th className="govuk-table__header" scope="col">Packages</th>
                            <th className="govuk-table__header" scope="col">Ecosystems</th>
                            <th className="govuk-table__header" scope="col">Updated</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {repositoryInsights.map((repository) => (
                            <tr className="govuk-table__row" key={`${repository.owner}/${repository.repo}`}>
                              <td className="govuk-table__cell">
                                {repository.reportUrl ? (
                                  <a className="govuk-link" href={repository.reportUrl} target="_blank" rel="noreferrer">
                                    {repository.repo}
                                  </a>
                                ) : (
                                  repository.repo
                                )}
                              </td>
                              <td className="govuk-table__cell">{formatSbomStatus(repository.status)}</td>
                              <td className="govuk-table__cell">
                                {typeof repository.packageCount === 'number' ? repository.packageCount : '—'}
                              </td>
                              <td className="govuk-table__cell">
                                {repository.ecosystems
                                  ? Object.keys(repository.ecosystems).join(', ')
                                  : '—'}
                              </td>
                              <td className="govuk-table__cell">{repository.generatedAt || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="govuk-body">No team repositories were returned for this product.</p>
                    ),
                  },
                  {
                    id: 'ecosystems',
                    label: 'Ecosystems',
                    content: sortedEcosystems.length > 0 ? (
                      <table className="govuk-table govuk-!-margin-bottom-0">
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th className="govuk-table__header" scope="col">Ecosystem</th>
                            <th className="govuk-table__header" scope="col">Packages</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {sortedEcosystems.map(([name, count]) => (
                            <tr className="govuk-table__row" key={name}>
                              <td className="govuk-table__cell">{name}</td>
                              <td className="govuk-table__cell">{count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="govuk-body">No ecosystem data available.</p>
                    ),
                  },
                  {
                    id: 'licenses',
                    label: 'Licenses',
                    content: sortedLicenses.length > 0 ? (
                      <table className="govuk-table govuk-!-margin-bottom-0">
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th className="govuk-table__header" scope="col">License</th>
                            <th className="govuk-table__header" scope="col">Packages</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {sortedLicenses.map(([name, count]) => (
                            <tr className="govuk-table__row" key={name}>
                              <td className="govuk-table__cell">{name}</td>
                              <td className="govuk-table__cell">{count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="govuk-body">No license data available.</p>
                    ),
                  },
                  {
                    id: 'vulnerabilities',
                    label: 'Vulnerabilities',
                    content: hasVulnerabilities ? (
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                          {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
                            <div key={sev}>
                              <p className="govuk-body-s govuk-!-margin-bottom-1" style={{ textTransform: 'capitalize' }}>{sev}</p>
                              <strong className="govuk-tag">
                                {vulnerabilities![sev]}
                              </strong>
                            </div>
                          ))}
                        </div>
                        <VulnerabilitiesTable alerts={vulnAlerts} />
                      </div>
                    ) : (
                      <p className="govuk-body">No open Dependabot vulnerability alerts found. This may mean the repositories are secure, Dependabot is not enabled, or the token lacks <code>security_events</code> scope.</p>
                    ),
                  },
                  {
                    id: 'code-scanning',
                    label: 'Code scanning',
                    content: hasCodeScanning ? (
                      <div>
                        <table className="govuk-table">
                          <tbody className="govuk-table__body">
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Open alerts</th>
                              <td className="govuk-table__cell">
                                {codeScanning!.total} total ({codeScanning!.critical} critical, {codeScanning!.high} high, {codeScanning!.medium} medium, {codeScanning!.low} low)
                              </td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Last analyzed</th>
                              <td className="govuk-table__cell">{codeScanning!.lastAnalyzedAt || 'Not available'}</td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Rule types</th>
                              <td className="govuk-table__cell">
                                {Object.keys(codeScanning!.byRuleType).length > 0
                                  ? Object.entries(codeScanning!.byRuleType).map(([name, count]) => `${name}: ${count}`).join(', ')
                                  : 'Not available'}
                              </td>
                            </tr>
                            <tr className="govuk-table__row">
                              <th className="govuk-table__header" scope="row">Languages</th>
                              <td className="govuk-table__cell">
                                {Object.keys(codeScanning!.byLanguage).length > 0
                                  ? Object.entries(codeScanning!.byLanguage).map(([name, count]) => `${name}: ${count}`).join(', ')
                                  : 'Not available'}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <CodeScanningTable alerts={codeScanningAlerts} />
                      </div>
                    ) : (
                      <p className="govuk-body">No open code scanning alerts found. This may mean the repositories are secure, code scanning is not enabled, or the token lacks code scanning permissions.</p>
                    ),
                  },
                  {
                    id: 'packages',
                    label: 'Packages',
                    content: allPackages.length > 0 ? (
                      <PackagesTable packages={allPackages} />
                    ) : (
                      <p className="govuk-body">No package data available. Package details are extracted when the catalog sync runs with a valid GitHub token.</p>
                    ),
                  },
                ]}
                defaultTabId="overview"
              />
            </Section>
          </div>
        </div>
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <MetaBar
            items={[
              { label: 'Owner', value: product.owner },
              { label: 'Status', value: <StatusTag status={product.status} /> },
              { label: 'Slack', value: product.slackChannel || null },
            ]}
          />

          <FeedbackWidget />
        </div>
      </div>

      <ChatBot />
    </div>
  );
}
