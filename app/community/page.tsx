import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';

export default function CommunityPage() {
  return (
    <div className="govuk-width-container">
      <Breadcrumbs items={[{ label: 'Community' }]} />

      <h1 className="govuk-heading-xl">Community</h1>
      <p className="govuk-body-l">
        Connect with the cross-government developer community through Slack, events,
        blogs, and open source.
      </p>

      <div className="app-cards">
        <div className="app-card">
          <span className="app-card__tag">Chat</span>
          <h2 className="govuk-heading-m app-card__title">Slack Channels</h2>
          <p className="govuk-body app-card__description">
            Join the Ministry of Justice Digital &amp; Technology Slack workspace. Key channels:
            #developers, #cloud-platform, #modernisation-platform, #security.
          </p>
        </div>

        <div className="app-card">
          <span className="app-card__tag">Code</span>
          <h2 className="govuk-heading-m app-card__title">
            <a href="https://github.com/ministryofjustice" className="govuk-link app-card__title-link" rel="noopener noreferrer">
              Open Source
            </a>
          </h2>
          <p className="govuk-body app-card__description">
            Browse our open source projects on GitHub. We code in the open by default.
          </p>
        </div>

        <div className="app-card">
          <span className="app-card__tag">Learn</span>
          <h2 className="govuk-heading-m app-card__title">
            <a href="https://github.com/ministryofjustice/ministry-of-justice-developer-portal" className="govuk-link app-card__title-link" rel="noopener noreferrer">
              Blog
            </a>
          </h2>
          <p className="govuk-body app-card__description">
            Read about what teams are building, technical decisions, and lessons learned
            on the Ministry of Justice Digital blog.
          </p>
        </div>

          <div className="app-card">
              <span className="app-card__tag">Learn</span>
              <h2 className="govuk-heading-m app-card__title">
                  <a href="https://tech-radar.justice.gov.uk/" className="govuk-link app-card__title-link" rel="noopener noreferrer">
                      Tech Radar
                  </a>
              </h2>
              <p className="govuk-body app-card__description">
                  Read about what teams are building, technical decisions, and lessons learned
                  on the Ministry of Justice Digital blog.
              </p>
          </div>

        <div className="app-card">
          <span className="app-card__tag">Events</span>
          <h2 className="govuk-heading-m app-card__title">Events &amp; Meetups</h2>
          <p className="govuk-body app-card__description">
            Regular tech talks, show-and-tells, and cross-government meetups. Watch
            this space for upcoming events.
          </p>
        </div>
      </div>

      <h2 className="govuk-heading-l govuk-!-margin-top-6">Real resources</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <a
            href="https://technical-guidance.service.justice.gov.uk/documentation/governance/ai-governance-framework.html#introduction"
            className="govuk-link"
            rel="noopener noreferrer"
          >
            MoJ AI Governance Framework
          </a>
        </li>
        <li>
          <a href="https://www.gov.uk/service-manual" className="govuk-link" rel="noopener noreferrer">
            GOV.UK Service Manual
          </a>
        </li>
        <li>
          <a href="https://www.gov.uk/service-manual/service-standard" className="govuk-link" rel="noopener noreferrer">
            GOV.UK Service Standard
          </a>
        </li>
        <li>
          <a href="https://design-system.service.gov.uk/" className="govuk-link" rel="noopener noreferrer">
            GOV.UK Design System
          </a>
        </li>
        <li>
          <a href="https://www.gov.uk/guidance/the-technology-code-of-practice" className="govuk-link" rel="noopener noreferrer">
            Technology Code of Practice
          </a>
        </li>
        <li>
          <a href="https://www.gov.uk/guidance/gds-api-technical-and-data-standards" className="govuk-link" rel="noopener noreferrer">
            GDS API technical and data standards
          </a>
        </li>
      </ul>

      <h2 className="govuk-heading-l govuk-!-margin-top-6">Tools used across government</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <a href="https://frontend.design-system.service.gov.uk/" className="govuk-link" rel="noopener noreferrer">
            GOV.UK Frontend
          </a>
        </li>
        <li>
          <a href="https://prototype-kit.service.gov.uk/docs/" className="govuk-link" rel="noopener noreferrer">
            GOV.UK Prototype Kit
          </a>
        </li>
        <li>
          <a href="https://www.payments.service.gov.uk/" className="govuk-link" rel="noopener noreferrer">
            GOV.UK Pay
          </a>
        </li>
        <li>
          <a href="https://www.notifications.service.gov.uk/" className="govuk-link" rel="noopener noreferrer">
            GOV.UK Notify
          </a>
        </li>
        <li>
          <a href="https://www.forms.service.gov.uk/" className="govuk-link" rel="noopener noreferrer">
            GOV.UK Forms
          </a>
        </li>
      </ul>

      <div className="govuk-inset-text govuk-!-margin-top-6">
        <h2 className="govuk-heading-m">Contributing to the Developer Portal</h2>
        <p className="govuk-body">
          This portal is open source and accepts contributions. You can:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          <li>Add your team&apos;s documentation by creating a <code>portal.yaml</code> in your repo</li>
          <li>Suggest new products or guidelines via pull request</li>
          <li>Report issues or request features on GitHub</li>
        </ul>
      </div>

      <ChatBot />
    </div>
  );
}
