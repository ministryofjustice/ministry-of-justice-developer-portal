import type {
  InlinePart,
  ListItem,
  ParagraphBlock,
  ListBlock,
  SubsectionBlock,
  Block,
} from '@/types/content';
import { Subsection } from '@/components/templateRender/Subsection';

export function renderInlineContent(parts: InlinePart[]) {
  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return <span key={index}>{part}</span>;
    }

    switch (part.type) {
      case 'link':
        return (
          <a key={index} href={part.href} className="govuk-link">
            {part.label}
          </a>
        );
      case 'bold':
        return <strong key={index}>{part.text}</strong>;
    }
  });
}

export function renderListItem(item: ListItem, itemIndex: number) {
  if (typeof item === 'string') {
    return <li key={itemIndex}>{item}</li>;
  }

  return (
    <li key={itemIndex}>
      {item.text}
      {item.link && (
        <a href={item.link.href} className="govuk-link">
          {item.link.label}
        </a>
      )}
      {item.suffix}
    </li>
  );
}

export function renderParagraph(block: ParagraphBlock, blockIndex: number) {
  return (
    <p key={blockIndex} className="govuk-body">
      {renderInlineContent(block.text)}
    </p>
  );
}

export function renderList(block: ListBlock, blockIndex: number) {
  return (
    <ul key={blockIndex} className="govuk-list govuk-list--bullet">
      {block.items.map((item, itemIndex) => renderListItem(item, itemIndex))}
    </ul>
  );
}

export function renderSubsection(block: SubsectionBlock, blockIndex: number) {
  return (
    <Subsection key={blockIndex} heading={block.heading}>
      {block.content.map((subBlock, subIndex) => {
        switch (subBlock.type) {
          case 'paragraph':
            return renderParagraph(subBlock, subIndex);
          case 'list':
            return renderList(subBlock, subIndex);
        }
        return null;
      })}
    </Subsection>
  );
}

export function renderBlockContent(block: Block, blockIndex: number) {
  switch (block.type) {
    case 'paragraph':
      return renderParagraph(block, blockIndex);

    case 'list':
      return renderList(block, blockIndex);

    case 'subsection':
      return renderSubsection(block, blockIndex);
  }
}
