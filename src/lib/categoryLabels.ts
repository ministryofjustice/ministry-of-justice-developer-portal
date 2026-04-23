export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  platforms: 'Platform',
  apis: 'API',
  tools: 'Tool',
  security: 'Security',
  data: 'Data',
};

export const COMMUNITY_CATEGORY_LABELS: Record<string, string> = {
  chat: 'Chat',
  code: 'Code',
  learn: 'Learn',
  events: 'Events',
};

export function getProductCategoryLabel(category: string) {
  return PRODUCT_CATEGORY_LABELS[category] ?? category;
}

export function getCommunityCategoryLabel(category: string) {
  return COMMUNITY_CATEGORY_LABELS[category] ?? category;
}
