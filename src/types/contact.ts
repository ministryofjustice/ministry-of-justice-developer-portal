type ContactOption = {
  slug: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
  cssModifier?: string;
  isCopyOnly?: boolean;
};

export type ContactPageData = {
  title: string;
  summary: string;
  items: ContactOption[];
};
