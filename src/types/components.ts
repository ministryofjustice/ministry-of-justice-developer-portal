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
