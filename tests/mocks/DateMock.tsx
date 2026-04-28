import { vi } from 'vitest';

vi.mock('@/lib/date', () => ({
  formatEventDateTime: (date: string) => `formatted-${date}`,
}));
