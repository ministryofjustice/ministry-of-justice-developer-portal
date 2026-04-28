import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import SearchWidget from '@/components/SearchWidget';

describe('Search widget component', () => {
  it('renders search widget', () => {
    render(<SearchWidget />);

    expect(
      screen.getByRole('searchbox', {
        name: 'Search documentation',
      }),
    ).toBeInTheDocument();
  });

  it('shows unavailable message when pagefind is not loaded', async () => {
    const user = userEvent.setup();

    render(<SearchWidget />);

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Search documentation',
      }),
      'testing',
    );

    expect(
      await screen.findByText(/Search is available after building the site/i),
    ).toBeInTheDocument();

    expect(screen.getByText('npm run build')).toBeInTheDocument();
  });

  it('clears results when query is empty', async () => {
    const user = userEvent.setup();

    render(<SearchWidget />);

    const input = screen.getByRole('searchbox', {
      name: 'Search documentation',
    });

    await user.type(input, 'docs');
    await user.clear(input);

    expect(
      screen.queryByText(/Search is available after building the site/i),
    ).not.toBeInTheDocument();
  });

  it('closes results when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <>
        <SearchWidget />
        <button>Outside</button>
      </>,
    );

    await user.type(
      screen.getByRole('searchbox', {
        name: 'Search documentation',
      }),
      'docs',
    );

    expect(
      await screen.findByText(/Search is available after building the site/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => {
      expect(
        screen.queryByText(/Search is available after building the site/i),
      ).not.toBeInTheDocument();
    });
  });
});
