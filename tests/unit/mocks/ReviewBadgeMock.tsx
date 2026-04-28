import { vi } from 'vitest';

vi.mock('@/components/templateRender/ReviewBadge', () => ({
  ReviewBadge: ({ status }: any) => <span data-testid="review-badge">{status}</span>,
}));
