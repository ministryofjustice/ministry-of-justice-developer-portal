import { vi } from 'vitest';

vi.mock('@/components/templateRender/MetaBar', () => ({
  MetaBar: ({ items }: any) => (
    <dl data-testid="meta-bar">
      {items.map((item: any) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  ),
}));