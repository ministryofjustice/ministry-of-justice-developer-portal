import { vi } from 'vitest';

vi.mock('@/components/MojFrontendInit', () => ({
  MojFrontendInit: () => null,
}));