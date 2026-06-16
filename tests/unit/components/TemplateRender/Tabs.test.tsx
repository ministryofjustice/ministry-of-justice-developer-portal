import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/components/templateRender/Tabs';

describe('Tabs', () => {
  const tabs = [
    {
      id: 'tab1',
      label: 'Tab 1',
      content: <div>Content 1</div>,
    },
    {
      id: 'tab2',
      label: 'Tab 2',
      content: <div>Content 2</div>,
    },
    {
      id: 'tab3',
      label: 'Tab 3',
      content: <div>Content 3</div>,
    },
  ];

  it('renders all tab buttons', () => {
    render(<Tabs tabs={tabs} />);

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
  });

  it('displays default tab content on initial render', () => {
    render(<Tabs tabs={tabs} defaultTabId="tab1" />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches tab content when tab button is clicked', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} defaultTabId="tab1" />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();

    const tab2Button = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2Button);

    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('sets aria-selected correctly', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} defaultTabId="tab1" />);

    const tab1Button = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2Button = screen.getByRole('tab', { name: 'Tab 2' });

    expect(tab1Button).toHaveAttribute('aria-selected', 'true');
    expect(tab2Button).toHaveAttribute('aria-selected', 'false');

    await user.click(tab2Button);

    expect(tab1Button).toHaveAttribute('aria-selected', 'false');
    expect(tab2Button).toHaveAttribute('aria-selected', 'true');
  });

  it('uses first tab as default if defaultTabId is not provided', () => {
    render(<Tabs tabs={tabs} />);

    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });
});
