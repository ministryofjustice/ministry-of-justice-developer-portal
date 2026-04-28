import { vi } from 'vitest';

vi.mock('@/components/templateRender/Callout', () => ({
  Callout: ({ title, children }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));
