import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@tests/unit/mocks/AllMocks';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }),
}));

vi.mock('@/lib/review', () => ({
  getReviewStatus: () => 'current',
}));

vi.mock('@/lib/markdown/markdownToHtml', () => ({
  markdownToHtml: async (md: string) => `<p>${md}</p>`,
}));

vi.mock('@/lib/docs', () => ({
  getGuidelinePage: vi.fn(),
}));

vi.mock('../../../../content/guidelines/guidelines.json', () => ({
  default: {
    title: 'Guidelines',
    items: [
      {
        slug: 'choosing-hosting',
        title: 'Choosing a hosting platform',
        phase: 'inception',
        owner: 'Cloud Platform team',
        lastReviewedOn: '2026-02-01',
        reviewIn: '6 months',
      },
      {
        slug: 'external-guide',
        title: 'An External Guide',
        phase: 'development',
        owner: 'Digital Services',
        lastReviewedOn: '2026-01-01',
        reviewIn: '12 months',
        externalUrl: 'https://example.com/guide',
      },
    ],
  },
}));

import { getGuidelinePage } from '@/lib/docs';
import GuidelinePage, { generateStaticParams } from '@/app/guidelines/[slug]/page';
import { notFound } from 'next/navigation';

const params = (slug: string) => Promise.resolve({ slug });

describe('GuidelinePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(notFound).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
  });

  describe('generateStaticParams', () => {
    it('returns slugs for non-external guidelines only', () => {
      const result = generateStaticParams();

      expect(result).toEqual([{ slug: 'choosing-hosting' }]);
      expect(result).not.toContainEqual({ slug: 'external-guide' });
    });
  });

  describe('with a valid slug and file content', () => {
    it('renders the page title', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue({ content: 'Some guideline content' });

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      expect(screen.getByRole('heading', { name: 'Choosing a hosting platform' })).toBeInTheDocument();
    });

    it('renders the phase tag', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue({ content: 'Content' });

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      expect(screen.getByTestId('tag-row')).toHaveTextContent('Project Inception');
    });

    it('renders the markdown content', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue({ content: 'Some guideline content' });

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      expect(screen.getByText('Some guideline content', { exact: false })).toBeInTheDocument();
    });

    it('renders the meta bar with last reviewed date and owner', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue({ content: 'Content' });

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      const metaBar = screen.getByTestId('meta-bar');
      expect(metaBar).toHaveTextContent('Last reviewed');
      expect(metaBar).toHaveTextContent('formatted-2026-02-01');
      expect(metaBar).toHaveTextContent('Cloud Platform team');
    });

    it('renders the review badge', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue({ content: 'Content' });

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      expect(screen.getByTestId('review-badge')).toHaveTextContent('current');
    });

    it('renders the breadcrumbs', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue({ content: 'Content' });

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    it('renders the feedback widget', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue({ content: 'Content' });

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      expect(screen.getByTestId('feedback-widget')).toBeInTheDocument();
    });
  });

  describe('when no file content is found', () => {
    it('renders a coming soon placeholder containing the guideline title', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue(null);

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      expect(screen.getByText(/This guideline is coming soon/i)).toBeInTheDocument();
    });

    it('renders the owner name in the placeholder', async () => {
      vi.mocked(getGuidelinePage).mockReturnValue(null);

      render(await GuidelinePage({ params: params('choosing-hosting') }));

      const proseContent = document.querySelector('.app-prose-scope');
      expect(proseContent?.textContent).toMatch(/Cloud Platform team/i);
    });
  });

  describe('for an external URL guideline', () => {
    it('renders the external link', async () => {
      render(await GuidelinePage({ params: params('external-guide') }));

      const link = screen.getByRole('link', { name: 'https://example.com/guide' });
      expect(link).toHaveAttribute('href', 'https://example.com/guide');
    });

    it('renders the guideline title', async () => {
      render(await GuidelinePage({ params: params('external-guide') }));

      expect(screen.getByRole('heading', { name: 'An External Guide' })).toBeInTheDocument();
    });
  });

  describe('for an unknown slug', () => {
    it('calls notFound()', async () => {
      await expect(
        GuidelinePage({ params: params('does-not-exist') }),
      ).rejects.toThrow('NEXT_NOT_FOUND');

      expect(notFound).toHaveBeenCalledOnce();
    });
  });
});
