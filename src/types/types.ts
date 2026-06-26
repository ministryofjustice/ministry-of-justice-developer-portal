import { ReactNode } from 'react';

export interface DocMeta {
  slug: string[];
  title: string;
  lastReviewedOn?: string;
  reviewIn?: string;
  ownerSlack?: string;
  sourceRepo?: string;
  sourcePath?: string;
  ingestedAt?: string;
  weight?: number;
}

export interface DocPage {
  meta: DocMeta;
  content: string;
}

export interface NavItem {
  title: string;
  slug: string[];
  children?: NavItem[];
  weight?: number;
}

export interface DocSource {
  slug: string;
  name: string;
  description: string;
  category: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ProductCardProps {
  slug: string;
  name: string;
  category: string;
  description: string;
  status: string;
  tags: string[];
  sbom?: ProductSbomSummary;
}

export interface ProductSbomSummary {
  status: string;
  generatedAt?: string;
  packageCount?: number;
  reportUrl?: string;
  error?: string;
  repositoryCount?: number;
  completedRepositories?: number;
  failedRepositories?: number;
  pendingRepositories?: number;
  sbomRefCoverage?: {
    deploymentShaRepositories: number;
    defaultBranchRepositories: number;
  };
  ecosystems?: Record<string, number>;
  licenses?: Record<string, number>;
  packages?: SbomPackageLite[];
  vulnerabilities?: VulnerabilitySummary;
  codeScanning?: CodeScanningSummary;
  repositories?: ProductRepositoryInsight[];
  sbom?: SbomDocument;
}

export interface SbomPackageLite {
  name: string;
  version?: string;
  license?: string;
  ecosystem?: string;
  purpose?: string;
  purl?: string;
  supplier?: string;
  repos: string[];
}

export interface VulnerabilityAlert {
  number?: number;
  severity: string;
  summary?: string;
  cve?: string;
  cvss?: number;
  package?: string;
  ecosystem?: string;
  manifestPath?: string;
  scope?: string;
  vulnerableRange?: string;
  fixedIn?: string;
  url?: string;
  observedVersions?: string[];
  matchQuality?: 'exact' | 'inferred';
  currentVersion?: string;
  currentVersionReason?: string;
  _repo?: string;
}

export interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  alerts?: VulnerabilityAlert[];
}

export interface CodeScanningSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  byRuleType: Record<string, number>;
  byLanguage: Record<string, number>;
  lastAnalyzedAt?: string;
  alerts?: CodeScanningAlert[];
}

export interface CodeScanningAlert {
  number?: number;
  severity: string;
  ruleId?: string;
  ruleName?: string;
  ruleDescription?: string;
  ruleType?: string;
  language?: string;
  tool?: string;
  state?: string;
  dismissedReason?: string;
  path?: string;
  line?: number;
  htmlUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  _repo?: string;
}

export interface ProductRepositoryInsight {
  owner: string;
  repo: string;
  status: string;
  visibility?: 'public' | 'private' | 'internal' | 'unknown';
  sbomRef?: string;
  sbomRefType?: 'deployment_sha' | 'default_branch';
  deploymentRef?: string;
  deploymentRefKind?: 'sha' | 'branch' | 'tag' | 'unknown';
  deploymentEnvironment?: string;
  deploymentDate?: string;
  generatedAt?: string;
  packageCount?: number;
  reportUrl?: string;
  ecosystems?: Record<string, number>;
  licenses?: Record<string, number>;
  vulnerabilities?: Omit<VulnerabilitySummary, 'alerts'>;
  codeScanning?: CodeScanningSummary;
  error?: string;
}

export interface CatalogReportRepository {
  name?: string;
  url?: string;
  homepage?: string;
  bugsUrl?: string;
  version?: string;
}

export interface CatalogReportCatalogMetadata {
  slug: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  teamName?: string;
  teamOrg?: string;
  slackChannel?: string;
  docsUrl?: string;
  externalUrl?: string;
  status: StatusTagValue;
  tags: string[];
}

export interface CatalogReportEntry {
  status?: string;
  generatedAt?: string;
  packageCount?: number;
  reportUrl?: string;
  error?: string;
  sbom?: SbomDocument;
  catalog: CatalogReportCatalogMetadata;
}

export interface CatalogReportActionUsage {
  count: number;
  files: string[];
}

export interface CatalogReport {
  generatedAt: string;
  repository?: CatalogReportRepository;
  actions?: CatalogReportActionUsage;
  reports: Record<string, CatalogReportEntry>;
}

export interface CatalogReportFile {
  generatedAt: string;
  repository?: CatalogReportRepository;
  actions?: CatalogReportActionUsage;
  report: CatalogReportEntry;
}

export interface SbomCreator {
  creator?: string;
}

export interface SbomExternalRef {
  referenceCategory?: string;
  referenceType?: string;
  referenceLocator?: string;
}

export interface SbomPackage {
  SPDXID?: string;
  name?: string;
  versionInfo?: string;
  licenseDeclared?: string;
  licenseConcluded?: string;
  externalRefs?: SbomExternalRef[];
}

export interface SbomRelationship {
  relationshipType?: string;
  spdxElementId?: string;
  relatedSpdxElement?: string;
}

export interface SbomDocument {
  name?: string;
  spdxVersion?: string;
  creationInfo?: {
    created?: string;
    creators?: string[];
  };
  packages?: SbomPackage[];
  relationships?: SbomRelationship[];
}

export interface SearchWidgetResult {
  url: string;
  title: string;
  excerpt: string;
}

export type CalloutTone = 'info' | 'warning';

export interface CalloutProps {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}

export interface ActionLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface ActionLinksProps {
  links: ActionLink[];
}

export type HeaderStatus = StatusTagValue;

export interface HeaderProps {
  title: string;
  categoryTag?: string;
  owner?: string;
  status?: HeaderStatus;
  summary?: string;
  kicker?: string;
  actions?: ReactNode;
}

export type StatusTagValue = 'live' | 'beta' | 'alpha' | 'deprecated';

export interface StatusTagProps {
  status: StatusTagValue;
}

export interface TagRowProps {
  kicker?: string;
  categoryTag?: string;
  status?: StatusTagValue;
  children?: ReactNode;
}

export interface MetaItem {
  label: string;
  value: ReactNode;
}

export interface MetaBarProps {
  items: MetaItem[];
  className?: string;
}

export interface SectionProps {
  heading: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  teamName?: string;
  teamOrg?: string;
  catalogDeploymentEnvironment?: string;
  deploymentEnvironment?: string;
  slackChannel?: string;
  docsUrl?: string;
  externalUrl?: string;
  status: StatusTagValue;
  tags: string[];
}