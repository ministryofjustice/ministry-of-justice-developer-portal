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
