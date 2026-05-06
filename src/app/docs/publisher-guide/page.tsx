import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ChatBot } from '@/components/ChatBot';

export const dynamic = 'force-static';

export default function PublisherGuidePage() {
  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Documentation Portal Publisher Guide' },
        ]}
      />

      <h1 className="govuk-heading-xl">Documentation Portal Publisher Guide</h1>
      <p className="govuk-body-l">
        A practical guide for teams publishing documentation into the MoJ Developer Portal using
        ingestion and supported source formats.
      </p>

      <h2 className="govuk-heading-l">Who this is for</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>Teams publishing technical documentation for services or platforms</li>
        <li>Teams onboarding new documentation sources into the portal</li>
        <li>Maintainers validating docs quality, freshness, and ownership metadata</li>
      </ul>

      <h2 className="govuk-heading-l">Supported publication models</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>Tech Docs Template sources (for example .html.md.erb and markdown)</li>
        <li>Markdown sources</li>
        <li>Docsify-style markdown sources (Docsify links rewritten to portal routes)</li>
        <li>OpenAPI API references rendered under API References via ReDoc</li>
      </ul>

      <h2 className="govuk-heading-l">Publishing workflow</h2>
      <ol className="govuk-list govuk-list--number">
        <li>Add or update your source definition in sources.json through pull request review.</li>
        <li>Ensure docsPath and format are correct for your source repository.</li>
        <li>Optionally define portal.yaml in the source repo for supported overrides.</li>
        <li>Trigger ingestion by schedule, manual run, or docs-update dispatch event.</li>
        <li>Review generated docs output, metadata, and link integrity in the portal.</li>
      </ol>

      <h2 className="govuk-heading-l">Required metadata and ownership</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>Source id, repo, branch, docsPath, and format</li>
        <li>Team ownership details (for example owner Slack channel)</li>
        <li>Review cadence metadata on key docs pages where applicable</li>
      </ul>

      <h2 className="govuk-heading-l">Quality checks before publishing</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>Validate source config and supported format</li>
        <li>Check for broken internal links and missing assets</li>
        <li>Ensure generated content appears in expected documentation sections</li>
        <li>Confirm no unexpected mass deletions in generated output</li>
      </ul>

      <h2 className="govuk-heading-l">Where to start</h2>
      <p className="govuk-body">
        For operational setup and source onboarding details, use the runbooks in this repository:
      </p>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <a className="govuk-link" href="/docs/runbooks/ingestion-runbook">
            Documentation Ingestion Runbook
          </a>
        </li>
        <li>
          <a className="govuk-link" href="/docs/runbooks/source-team-docs-ingestion-onboarding">
            Source Team Docs Ingestion Onboarding
          </a>
        </li>
      </ul>

      <ChatBot />
    </div>
  );
}
