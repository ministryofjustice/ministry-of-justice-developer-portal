import { vi } from 'vitest';

vi.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header" />,
}));
