import { render, screen } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';

type RenderFn = () => RenderResult | Promise<RenderResult>;

interface CommonPageOptions {
  /**
   * Asserts a heading with this exact name is present.
   */
  heading?: string;
  /**
   * Asserts the breadcrumb nav is rendered.
   */
  breadcrumbs?: boolean;
  /**
   * Asserts the chatbot button is rendered.
   */
  chatbot?: boolean;
  /**
   * Asserts the search widget is rendered.
   */
  searchWidget?: boolean;
  /**
   * Asserts the feedback widget is rendered.
   */
  feedbackWidget?: boolean;
}

/**
 * Inserts shared `it()` blocks for common page behaviours.
 *
 * Call this inside a `describe()` block in your test file alongside
 * page-specific tests. The `vi.mock()` calls must still live at the top
 * of each test file — Vitest hoists them and they cannot be abstracted.
 *
 * Works for both synchronous and async page components:
 *
 * @example
 * // Synchronous page
 * describe('GuidelinesPage', () => {
 *   itBehavesLikeAPage(() => render(<GuidelinesPage />), {
 *     heading: 'Guidelines',
 *     breadcrumbs: true,
 *   });
 *
 *   it('renders section headings', () => { ... });
 * });
 *
 * @example
 * // Async page component
 * describe('with a valid slug', () => {
 *   beforeEach(() => {
 *     vi.mocked(getGuidelinePage).mockReturnValue({ content: 'Content' });
 *   });
 *
 *   itBehavesLikeAPage(
 *     async () => render(await GuidelinePage({ params: Promise.resolve({ slug: 'choosing-hosting' }) })),
 *     { breadcrumbs: true, feedbackWidget: true },
 *   );
 * });
 */
export function itBehavesLikeAPage(renderFn: RenderFn, options: CommonPageOptions = {}) {
  const { heading, breadcrumbs, chatbot, searchWidget, feedbackWidget } = options;

  if (heading) {
    it('renders the page heading', async () => {
      await renderFn();

      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    });
  }

  if (breadcrumbs) {
    it('renders breadcrumbs', async () => {
      await renderFn();

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });
  }

  if (chatbot) {
    it('renders the chatbot', async () => {
      await renderFn();

      expect(screen.getByTestId('chatbot-button')).toBeInTheDocument();
    });
  }

  if (searchWidget) {
    it('renders the search widget', async () => {
      await renderFn();

      expect(screen.getByTestId('search-widget')).toBeInTheDocument();
    });
  }

  if (feedbackWidget) {
    it('renders the feedback widget', async () => {
      await renderFn();

      expect(screen.getByTestId('feedback-widget')).toBeInTheDocument();
    });
  }
}

