import { vi } from 'vitest';

// To be used when functionality is not a concern i.e. layout tests/rendering tests.

vi.mock('next/link', () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/SearchWidget', () => ({
  default: () => <div data-testid="search-widget" />,
}));

vi.mock('@/components/ChatBot', () => ({
  ChatBot: () => <div data-testid="chatbot-button" />,
}));

vi.mock('@/components/Breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs" />,
}));

vi.mock('@/components/templateRender/Section', () => ({
  Section: ({ heading, children }: any) => (
    <section>
      <h2>{heading}</h2>
      {children}
    </section>
  ),
}));
