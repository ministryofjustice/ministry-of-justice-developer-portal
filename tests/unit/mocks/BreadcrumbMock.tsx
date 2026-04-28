import { vi } from 'vitest';

vi.mock('@/components/Breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs" />,
}));
