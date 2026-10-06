import { render, screen, within } from '@testing-library/react';
import '@tests/unit/mocks/AllMocks';
import AcceptableUsagePolicy from '@/app/community/acceptable-usage-policy/page';

vi.mock('@/../content/community/acceptable-usage-policy.json', () => ({
  default: {
    title: 'Acceptable Usage Policy',
    sections: [
      {
        id: 'section-1',
        title: 'Section 1',
        blocks: [
          {
            type: 'paragraph',
            text: [
              'This is a paragraph block. It has a ',
              {
                type: 'link',
                href: 'https://example.com',
                label: 'hyperlink',
              },
              ' in it.',
            ],
          },
          {
            type: 'subsection',
            heading: 'Subsection 1',
            content: [
              {
                type: 'list',
                items: ['Subsection 1 Item 1', 'Subsection 1 Item 2'],
              },
            ],
          },
        ],
      },
      {
        id: 'section-2',
        title: 'Section 2',
        blocks: [
          {
            type: 'subsection',
            heading: 'Subsection 2',
            content: [
              {
                type: 'paragraph',
                text: ['This is a paragraph block within the subsection.'],
              },
              {
                type: 'list',
                items: [
                  {
                    text: 'Item 1 with a ',
                    link: {
                      href: 'https://example.com',
                      label: 'link',
                    },
                    suffix: ' and text after the link',
                  },
                  'Item 2',
                  'Item 3',
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}));

describe("Acceptable Usage Policy", () => {
    it('renders the page intro', () => {
        render(<AcceptableUsagePolicy />);
        expect(screen.getByText("Acceptable Usage Policy")).toBeInTheDocument();
    });

    it('renders the table of contents links correctly', () => {
        render(<AcceptableUsagePolicy />);
        const tableOfContents = screen.getByRole('navigation');
        const tableOfContentsLinks = within(tableOfContents).getAllByRole('link');
        expect(tableOfContentsLinks[0]).toHaveTextContent("Section 1");
        expect(tableOfContentsLinks[1]).toHaveTextContent("Section 2");
    });

    it('renders the sections', () => {
        render(<AcceptableUsagePolicy />);
        expect(screen.getByRole('heading', { name: 'Section 1', level: 2 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Section 2', level: 2 })).toBeInTheDocument();
    });

    it('renders the subsections', () => {
        render(<AcceptableUsagePolicy />);
        expect(screen.getByText("Subsection 1")).toBeInTheDocument();
        expect(screen.getByText("Subsection 2")).toBeInTheDocument();
    });

    it('renders the content within the subsections', () => {
        render(<AcceptableUsagePolicy />);

        expect(screen.getByText("Subsection 1 Item 1")).toBeInTheDocument();
        expect(screen.getByText("Subsection 1 Item 2")).toBeInTheDocument();

        expect(screen.getByText("This is a paragraph block within the subsection.")).toBeInTheDocument();
        const linkedListItem = screen.getAllByRole('listitem').find(
            (item) => item.textContent === 'Item 1 with a link and text after the link'
        );
        expect(linkedListItem).toBeInTheDocument();
    });

    it('renders the links within list items correctly', () => {
        render(<AcceptableUsagePolicy />);
        const listItem = screen.getAllByRole('listitem').find(
            (item) => item.textContent === 'Item 1 with a link and text after the link'
        );
        expect(listItem).toBeInTheDocument();
        const link = within(listItem!).getByRole('link', { name: 'link' });
        expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders links within paragraphs correctly', () => {
        render(<AcceptableUsagePolicy />);
        const paragraph = screen.getAllByRole('paragraph').find(
            (p) => p.textContent === "This is a paragraph block. It has a hyperlink in it."
        );
        expect(paragraph).toBeInTheDocument();
        const link = within(paragraph!).getByRole('link', { name: 'hyperlink' });
        expect(link).toHaveAttribute('href', 'https://example.com');
    });
});