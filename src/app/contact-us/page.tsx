import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';
import { PageIntro } from '@/components/templateRender/PageIntro';
import contactOptions from '../../../content/contact/contacts.json';

type ContactOption = {
  slug: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
  cssModifier?: string;
  isCopyOnly?: boolean;
};

type ContactPageData = {
  title: string;
  summary: string;
  items: ContactOption[];
};

export default function ContactPage() {
  const contact = contactOptions as ContactPageData;

  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Contact us' }]} />

      <PageIntro
        title={contactOptions.title}
        summary={contactOptions.summary}
        summaryClassName="govuk-body-l"
      />

      {contact.items.map((item) => (
        <section
          key={item.slug}
          className={`app-phase-card ${item.cssModifier ? `app-phase-card--${item.cssModifier}` : ''}`}
        >
          <h2 className="govuk-heading-m govuk-!-margin-bottom-2">{item.title}</h2>

          <p className="govuk-body">{item.description}</p>

          {item.isCopyOnly ? (
            <p className="govuk-body govuk-!-margin-top-2">
              <strong>Email:</strong> <>{item.linkText}</>
            </p>
          ) : (
            <Link
              href={item.href}
              className="govuk-link govuk-link--no-visited-state"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.linkText}
            </Link>
          )}

          <span className="govuk-visually-hidden"> (opens in a new tab) </span>
        </section>
      ))}

      <ChatBot />
    </div>
  );
}
