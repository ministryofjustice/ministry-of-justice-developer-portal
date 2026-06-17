import { vi } from 'vitest';

vi.mock('@/components/SearchWidget', () => ({
  default: () => <div data-testid="search-widget" />,
}));
