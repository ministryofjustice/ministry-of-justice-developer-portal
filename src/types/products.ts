import type { StatusTagValue } from './components';

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

export interface ProductCardProps {
  slug: string;
  name: string;
  category: string;
  description: string;
  status: StatusTagValue;
  tags: string[];
}
