import { Breadcrumbs } from '@/components/Breadcrumbs';
import { renderBlockContent } from '@/utils/renderContent';

import contentJson from '../../../../content/products/forward-deployed-engineers-plan.json';
import { Section } from '@/components/templateRender/Section';
import { PageIntro } from '@/components/templateRender/PageIntro';
import { Content } from '@/types/content';

const content = contentJson as Content;

export default function ForwardDeployedEngineersPlan() {
  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          { label: 'Forward deployed engineers plan' },
        ]}
      />

      <PageIntro title={content.title} titleClassName="govuk-heading-xl govuk-!-margin-bottom-6" />

      {content.sections.map((section) => (
        <Section key={section.id} heading={section.title} id={section.id}>
          {section.blocks.map((block, blockIndex) => {
            return renderBlockContent(block, blockIndex);
          })}
        </Section>
      ))}
    </div>
  );
}
