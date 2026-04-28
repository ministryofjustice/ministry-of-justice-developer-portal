import { render, screen } from '@testing-library/react';
import '@tests/mocks/AllMocks'; // NOTE - this MUST be BEFORE the component import.
import Home from '@/app/page';

/* This test is set up to demonstrate how to use the reusable mocks.
The mocks still override the actual components but are set up in a central location. This test uses
 all the base mocks (every component) but you can also import only what is needed which can then allow
 flexibility for overriding. */

describe('Home page', () => {
  it('renders hero content', () => {
    render(<Home />);

    expect(screen.getByText('Ministry of Justice Developer Portal')).toBeInTheDocument();

    expect(screen.getByText(/central place for cross-government developers/i)).toBeInTheDocument();
  });

  it('renders search widget and chatbot', () => {
    render(<Home />);

    expect(screen.getByTestId('search-widget')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-button')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<Home />);

    expect(screen.getByText('Products & Services')).toBeInTheDocument();
    expect(screen.getByText('Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  it('renders feature links correctly', () => {
    render(<Home />);

    const link = screen.getByRole('link', { name: 'Products & Services' });

    expect(link).toHaveAttribute('href', '/products');
  });

  it('renders "What’s new" section', () => {
    render(<Home />);

    expect(screen.getByText("What's new")).toBeInTheDocument();

    expect(screen.getByText('Developer Portal launched in Alpha')).toBeInTheDocument();
  });

  it('renders multiple news items', () => {
    render(<Home />);

    const items = screen.getAllByText(/Cloud Platform|Modernisation|API design/);

    expect(items.length).toBeGreaterThan(1);
  });

  it('formats dates correctly', () => {
    render(<Home />);

    const dateItems = screen.getAllByTestId('date');

    expect(dateItems.length).toBeGreaterThan(0);

    dateItems.forEach((date) => {
      expect(date).toHaveTextContent(/\d{1,2} [A-Za-z]+ \d{4}/);
    });
  });
});
