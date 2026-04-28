import { vi } from 'vitest';

vi.mock('@/components/templateRender/PageIntro', () => ({
  PageIntro: ({ title, summary }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{summary}</p>
    </div>
  ),
}));