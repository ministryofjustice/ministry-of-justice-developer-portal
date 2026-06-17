import { vi } from 'vitest';

vi.mock('@/components/Footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));
