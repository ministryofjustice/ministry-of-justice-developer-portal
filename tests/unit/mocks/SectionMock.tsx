import { vi } from 'vitest';

vi.mock('@/components/templateRender/Section', () => ({
  Section: ({ heading, children }: any) => (
    <section>
      <h2>{heading}</h2>
      {children}
    </section>
  ),
}));
