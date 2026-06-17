import { vi } from 'vitest';

vi.mock('@/components/templateRender/TagRow', () => ({
  TagRow: ({ categoryTag }: any) => <div data-testid="tag-row">{categoryTag}</div>,
}));