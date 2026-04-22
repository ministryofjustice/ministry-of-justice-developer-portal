import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';
import { MojDesignSystemShowcase } from '@/components/MojDesignSystemShowcase';

export const metadata = {
  title: 'Ministry of Justice Design System',
};

export default function MojDesignSystemPage() {
  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          { label: 'Ministry of Justice Design System', href: '/products/moj-design-system' },
          { label: 'Design system' },
        ]}
      />

      <h1 className="govuk-heading-xl">Ministry of Justice Design System</h1>
      <p className="govuk-body-l" data-moj-fade-target="intro">
        The unified pattern library for enchanted public services — field-tested across ward
        licensing, service registration, and interdimensional border control. Every component here
        has survived a containment breach drill.
      </p>

      <MojDesignSystemShowcase />

      <ChatBot />
    </div>
  );
}
