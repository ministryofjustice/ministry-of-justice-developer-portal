import { vi } from 'vitest';

vi.mock('@/components/PhaseBanner', () => ({
  PhaseBanner: () => <div data-testid="phase-banner" />,
}));
