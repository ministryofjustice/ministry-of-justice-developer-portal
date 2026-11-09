import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageIntro } from '@/components/templateRender/PageIntro';
import { Section } from '@/components/templateRender/Section';
import { renderBlockContent } from '@/utils/renderContent';
import policyJson from '../../../../content/community/acceptable-usage-policy.json';
import { Content } from '@/types/content';

const policy = policyJson as Content;

export default function AcceptableUsagePolicy() {
  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[{ label: 'Community', href: '/community' }, { label: 'Acceptable Usage Policy' }]}
      />
      <PageIntro title={policy.title} titleClassName="govuk-!-margin-bottom-6" />

      <nav className="govuk-!-margin-bottom-6" aria-label="Table of contents">
        <p className="govuk-body">Table of contents:</p>
        <ul className="govuk-list">
          {policy.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="govuk-link">
                {section.title}
              </a>
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
