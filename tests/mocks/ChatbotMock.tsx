import { vi } from 'vitest';

vi.mock('@/components/ChatBot', () => ({
  ChatBot: () => <div data-testid="chatbot-button" />,
}));
