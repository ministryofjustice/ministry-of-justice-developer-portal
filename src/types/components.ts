import type { ReactNode } from 'react';

export type StatusTagValue = 'live' | 'beta' | 'alpha' | 'deprecated';

export interface ReviewBadgeProps {
  status: ReviewStatus;
}

export type CalloutTone = 'info' | 'warning';

export interface CalloutProps {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}

export type ReviewStatus = 'ok' | 'warning' | 'overdue';

export interface ReviewBadgeProps {
  status: ReviewStatus;
}

export interface PageIntroProps {
  title: string;
  summary?: string;
  titleId?: string;
  titleClassName?: string;
  summaryClassName?: string;
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

export interface StatusTagProps {
  status: StatusTagValue;
}

export interface TagRowProps {
  kicker?: string;
  categoryTag?: string;
  status?: StatusTagValue;
  children?: ReactNode;
}

export interface TagListProps {
  tags: string[];
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
<<<<<<< HEAD:src/types/types.ts

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
=======
>>>>>>> 40d4f1bd4e3e3f74d433aa9323e0d8e8e70b99f7:src/types/components.ts
