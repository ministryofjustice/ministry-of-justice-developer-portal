import { render, screen, within } from '@testing-library/react';
import {
  renderBlockContent,
  renderInlineContent,
  renderList,
  renderListItem,
  renderParagraph,
  renderSubsection,
} from '@/utils/renderContent';
import type {
  Block,
  InlinePart,
  ListBlock,
  ListItem,
  ParagraphBlock,
  SubsectionBlock,
} from '@/types/content';

describe('renderInlineContent', () => {
  it('renders plain text', () => {
    const content: InlinePart[] = ['This is normal text.'];

    render(renderInlineContent(content));

    expect(screen.getByText('This is normal text.').tagName).toBe('SPAN');
  });

  it('renders bold text', () => {
    const content: InlinePart[] = ['Some ', { type: 'bold', text: 'bold text' }];

    render(renderInlineContent(content));

    expect(screen.getByText('bold text').tagName).toBe('STRONG');
  });

  it('renders links with their label and href', () => {
    const content: InlinePart[] = [
      'Read ',
      { type: 'link', href: 'https://example.com', label: 'the guidance' },
      '.',
    ];

    render(renderInlineContent(content));

    expect(screen.getByRole('link', { name: 'the guidance' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });
});

describe('renderListItem', () => {
  it('renders a string list item', () => {
    render(renderListItem('A plain item', 0));

    expect(screen.getByRole('listitem')).toHaveTextContent('A plain item');
  });

  it('renders an object list item with text', () => {
    const item: ListItem = { text: 'An item with text' };

    render(renderListItem(item, 0));

    expect(screen.getByRole('listitem')).toHaveTextContent('An item with text');
  });

  it('renders a linked list item with text before and after the link', () => {
    const item: ListItem = {
      text: 'Read ',
      link: { href: 'https://example.com', label: 'the guidance' },
      suffix: ' for details.',
    };

    render(renderListItem(item, 0));

    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveTextContent('Read the guidance for details.');
    expect(within(listItem).getByRole('link', { name: 'the guidance' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });
});

describe('renderParagraph', () => {
  it('renders paragraph text with the expected class', () => {
    const block: ParagraphBlock = {
      type: 'paragraph',
      text: ['A paragraph.'],
    };

    const { container } = render(renderParagraph(block, 0));

    expect(container.querySelector('p')).toHaveClass('govuk-body');
    expect(container.querySelector('p')).toHaveTextContent('A paragraph.');
  });

  it('renders inline links and bold text in a paragraph', () => {
    const block: ParagraphBlock = {
      type: 'paragraph',
      text: [
        'Read ',
        { type: 'link', href: 'https://example.com', label: 'this' },
        ' and note the ',
        { type: 'bold', text: 'important detail' },
        '.',
      ],
    };

    const { container } = render(renderParagraph(block, 0));

    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveTextContent('Read this and note the important detail.');
    expect(within(paragraph!).getByRole('link', { name: 'this' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
    expect(within(paragraph!).getByText('important detail').tagName).toBe('STRONG');
  });
});

describe('renderList', () => {
  it('renders a bullet list with string and linked items', () => {
    const block: ListBlock = {
      type: 'list',
      items: [
        'A plain item',
        {
          text: 'A linked item: ',
          link: { href: 'https://example.com', label: 'read more' },
          suffix: '.',
        },
      ],
    };

    render(renderList(block, 0));

    const list = screen.getByRole('list');
    expect(list).toHaveClass('govuk-list', 'govuk-list--bullet');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('A plain item')).toBeInTheDocument();
    expect(within(list).getByRole('link', { name: 'read more' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });
});

describe('renderSubsection', () => {
  it('renders its heading, paragraph, and list content', () => {
    const block: SubsectionBlock = {
      type: 'subsection',
      heading: 'Subsection heading',
      content: [
        { type: 'paragraph', text: ['Subsection paragraph.'] },
        { type: 'list', items: ['First item', 'Second item'] },
      ],
    };

    render(renderSubsection(block, 0));

    const section = screen.getByRole('region', { name: 'Subsection heading' });
    expect(
      within(section).getByRole('heading', { name: 'Subsection heading', level: 3 }),
    ).toBeInTheDocument();
    expect(within(section).getByText('Subsection paragraph.')).toBeInTheDocument();
    expect(within(section).getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('renderBlockContent', () => {
  it.each([
    {
      block: { type: 'paragraph', text: ['Rendered paragraph.'] },
      expected: 'Rendered paragraph.',
    },
    {
      block: { type: 'list', items: ['Rendered list item.'] },
      expected: 'Rendered list item.',
    },
    {
      block: {
        type: 'subsection',
        heading: 'Rendered subsection',
        content: [{ type: 'paragraph', text: ['Rendered nested paragraph.'] }],
      },
      expected: 'Rendered nested paragraph.',
    },
  ] satisfies Array<{ block: Block; expected: string }>)(
    'renders a $block.type block',
    ({ block, expected }) => {
      render(renderBlockContent(block, 0));

      expect(screen.getByText(expected)).toBeInTheDocument();
    },
  );
});
