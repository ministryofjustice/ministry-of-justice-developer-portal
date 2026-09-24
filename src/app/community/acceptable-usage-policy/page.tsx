import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageIntro } from "@/components/templateRender/PageIntro";
import { Section } from "@/components/templateRender/Section";
import { Subsection } from "@/components/templateRender/Subsection";
import policy from "../../../../content/community/acceptable-usage-policy.json";

type ParagraphBlock = {
    type: "paragraph";
    text: InlinePart[];
};

type ListBlock = {
    type: "list";
    items: ListItem[];
};

type SubsectionBlock = {
    type: "subsection";
    heading: string;
    content: Block[];
};

type Block = ParagraphBlock | ListBlock | SubsectionBlock;

type InlinePart =
  | string
  | {
      type: "link";
      href: string;
      label: string;
    };

type ListItem =
  | string
  | {
      text: string;
      link?: {
        href: string;
        label: string;
      };
      suffix?: string;
    };

function renderInlineContent(parts: InlinePart[]) {
    return parts.map((part, index) => {
        if (typeof part === "string") {
            return <span key={index}>{part}</span>;
        }

        return (
            <a key={index} href={part.href} className="govuk-link">
                {part.label}
            </a>
        );
    });
}

function renderListItem(item: ListItem, itemIndex: number) {
    if (typeof item === "string") {
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

function renderParagraph(block: ParagraphBlock, blockIndex: number) {
    return (
        <p key={blockIndex} className="govuk-body">
            {renderInlineContent(block.text)}
        </p>
    );
}

function renderList(block: ListBlock, blockIndex: number) {
    return (
        <ul key={blockIndex} className="govuk-list govuk-list--bullet">
            {block.items.map((item, itemIndex) => renderListItem(item, itemIndex))}
        </ul>
    );
}

function renderSubsection(block: SubsectionBlock, blockIndex: number) {
    return (
        <Subsection key={blockIndex} heading={block.heading}>
            {block.content.map((subBlock, subIndex) => renderBlockContent(subBlock, subIndex))}
        </Subsection>
    );
}

function renderBlockContent(block: Block, blockIndex: number) {
    switch (block.type) {
        case "paragraph":
            return renderParagraph(block, blockIndex);

        case "list":
            return renderList(block, blockIndex);

        case "subsection":
            return renderSubsection(block, blockIndex);
    }
}

export default function AcceptableUsagePolicy() {
    return (
        <div className="govuk-width-container">
            <Breadcrumbs items={[{ label: 'Community', href: '/community' }, { label: 'Acceptable Usage Policy' }]} />
            <PageIntro
                title={policy.title}
                titleClassName ="govuk-!-margin-bottom-6"
            />

            <nav className="govuk-!-margin-bottom-6" aria-label="Table of contents">
                <p className="govuk-body">Table of contents:</p>
                <ul className="govuk-list">
                {policy.sections.map((section) => (
                    <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                    </li>
                ))}
                </ul>
            </nav>

            {policy.sections.map((section) => (
                <Section key={section.id} heading={section.title} id={section.id}>
                    {section.blocks.map((block, blockIndex) => {
                        return renderBlockContent(block, blockIndex);
                    })}
                </Section>
            ))}
        </div>
    );
}