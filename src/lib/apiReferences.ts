import apiReferences from '../../content/api/apis.json';
import { ApiReference } from '@/types/types';

type ApiReferencesContent = {
  items: ApiReference[];
};

export function getApiReferences(): ApiReference[] {
  const content = apiReferences as ApiReferencesContent;
  return Array.isArray(content.items) ? content.items : [];
}

export function getApiReference(slug: string): ApiReference | null {
  const items = getApiReferences();
  return items.find((item) => item.slug === slug) || null;
}
