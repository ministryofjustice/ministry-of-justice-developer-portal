import { vi } from 'vitest';

vi.mock('@/components/FeedbackWidget', () => ({
  FeedbackWidget: () => <div data-testid="feedback-widget" />,
}));