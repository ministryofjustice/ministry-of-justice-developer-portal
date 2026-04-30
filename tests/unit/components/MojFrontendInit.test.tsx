import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MojFrontendInit } from '@/components/MojFrontendInit';

const initAll = vi.fn();

vi.mock('@ministryofjustice/frontend', () => ({
  initAll,
}));

describe('MojFrontendInit', () => {
  it('calls initAll on mount', async () => {
    render(<MojFrontendInit />);

    await waitFor(() => {
      expect(initAll).toHaveBeenCalledTimes(1);
    });
  });

  it('renders nothing', () => {
    const { container } = render(<MojFrontendInit />);

    expect(container).toBeEmptyDOMElement();
  });
});