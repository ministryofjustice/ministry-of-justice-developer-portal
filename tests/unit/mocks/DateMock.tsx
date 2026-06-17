import { vi } from 'vitest';

vi.mock('@/lib/date', () => ({
  formatLongDate: (date: string) => `formatted-${date}`,
  formatEventDateTime: (date: string) => `formatted-${date}`,
}));
