import { vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));
