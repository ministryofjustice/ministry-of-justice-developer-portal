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
  slackChannel?: string;
  docsUrl?: string;
  externalUrl?: string;
  status: StatusTagValue;
  tags: string[];
}