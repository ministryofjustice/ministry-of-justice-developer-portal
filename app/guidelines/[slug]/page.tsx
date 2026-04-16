import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { ChatBot } from '@/components/ChatBot';
import { formatLongDate } from '@/lib/date';
import { getReviewStatus } from '@/lib/review';
import { MetaBar } from '@/components/templateRender/MetaBar';
import { PageIntro } from '@/components/templateRender/PageIntro';
import { ReviewBadge, type ReviewStatus } from '@/components/templateRender/ReviewBadge';
import { TagRow } from '@/components/templateRender/TagRow';
import guidelines from '@/content/guidelines/guidelines.json';

// Sample content for each guideline — in production these would be MDX files
const guidelineContent: Record<string, string> = {
  'choosing-hosting': `
## Overview

When starting a new service, one of the first decisions is where to host it. The Ministry of Justice offers two main hosting platforms:

### Cloud Platform (recommended default)

Use Cloud Platform if your application:
- Can be containerised (Docker)
- Is stateless and follows 12-factor app principles
- Needs Kubernetes features (auto-scaling, zero-downtime deploys)
- Doesn't require PSN connectivity

### Modernisation Platform

Use Modernisation Platform if your application:
- Cannot be containerised
- Needs EC2 instances or non-Kubernetes infrastructure
- Requires PSN connectivity
- Is a legacy application being migrated

### Decision tree

1. **Can your app run in a container?** → Yes → Cloud Platform
2. **Does it need PSN?** → Yes → Modernisation Platform
3. **Is it a legacy app?** → Consider Modernisation Platform for initial hosting, with a plan to migrate to Cloud Platform

### Getting started

- [Cloud Platform User Guide](/docs/cloud-platform)
- [Modernisation Platform User Guide](/docs/modernisation-platform)
  `,
  'api-design-standards': `
## Principles

All APIs should follow these core principles:

### Use RESTful conventions

- Use nouns for resource URLs: \`/records\`, not \`/getRecords\`
- Use HTTP methods: GET, POST, PUT, PATCH, DELETE
- Return appropriate status codes: 200, 201, 400, 401, 403, 404, 500

### Versioning

- Include the major version in the URL: \`/v1/records\`
- Use semantic versioning for the API overall
- Document breaking changes clearly in the changelog

### Error handling

Return consistent error responses:

\`\`\`json
{
  "status": 400,
  "errorCode": "VALIDATION_ERROR",
  "userMessage": "The request was invalid",
  "developerMessage": "Field 'recordId' is required",
  "moreInfo": "/docs/errors/VALIDATION_ERROR"
}
\`\`\`

### Pagination

Use cursor-based pagination for large datasets:

\`\`\`
GET /v1/records?cursor=abc123&limit=20
\`\`\`

### Authentication

- Use OAuth 2.0 with appropriate auth for Ministry of Justice services
- Use API keys for simpler integrations
- Never pass credentials in query strings
  `,
  'accessibility-requirements': `
## Legal requirements

All public-facing government services must meet WCAG 2.2 Level AA. This is a legal requirement under the Public Sector Bodies Accessibility Regulations 2018.

### What you need to do

1. **Test with automated tools** — Use axe, WAVE, or Lighthouse. These catch ~30% of issues.
2. **Test manually** — Keyboard navigation, screen reader testing (NVDA, VoiceOver), zoom to 400%.
3. **Test with users** — Include disabled users in your research.
4. **Publish an accessibility statement** — Required by law. Use the GOV.UK template.

### Common issues

- Missing alt text on images
- Poor colour contrast (use GOV.UK Design System colours)
- Forms without proper labels
- Missing skip links
- Focus not visible on interactive elements

### GOV.UK Design System

Using the GOV.UK Design System and Frontend gives you a strong accessibility baseline. The components have been extensively tested with assistive technologies.

### Resources

- [GOV.UK accessibility requirements](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps)
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Ministry of Justice Design System](/products/moj-design-system/system)
  `,
};

const phaseLabels: Record<string, string> = {
  inception: 'Project Inception',
  development: 'Development & Iteration',
  technology: 'Technology Choice',
  standards: 'Standards & Best Practices',
  measuring: 'Measuring Success',
};

type Params = { slug: string };

export function generateStaticParams() {
  return guidelines.items.filter((g) => !g.externalUrl).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guideline = guidelines.items.find((g) => g.slug === slug);
  if (!guideline) return {};
  return { title: guideline.title };
}

export default async function GuidelineDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guideline = guidelines.items.find((g) => g.slug === slug);

  if (!guideline) {
    notFound();
  }

  const content =
    guidelineContent[guideline.slug] ||
    `
## ${guideline.title}

This guideline is coming soon. Content is being developed.

**Owner:** ${guideline.owner}

If you have questions, reach out to the ${guideline.owner} team.
  `;

  const reviewStatus = getReviewStatus(guideline.lastReviewedOn, guideline.reviewIn);

  return (
    <div className="govuk-width-container">
      <Breadcrumbs
        items={[{ label: guidelines.title, href: '/guidelines' }, { label: guideline.title }]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <TagRow categoryTag={phaseLabels[guideline.phase]} />
          <PageIntro
            title={guideline.title}
            titleClassName="govuk-heading-xl govuk-!-margin-top-2 govuk-!-margin-bottom-2"
          />

          <div
            className="app-prose-scope"
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }}
          />

          <MetaBar
            items={[
              {
                label: 'Last reviewed',
                value: formatLongDate(guideline.lastReviewedOn),
              },
              {
                label: 'Review status',
                value: <ReviewBadge status={reviewStatus as ReviewStatus} />,
              },
              { label: 'Owner', value: guideline.owner },
            ]}
          />

          <FeedbackWidget />
        </div>
      </div>

      <ChatBot />
    </div>
  );
}

// Minimal markdown-to-HTML for inline guideline content, producing GOV.UK-styled markup
function simpleMarkdown(md: string): string {
  const lines = md.trim().split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      out.push(
        `<pre class="app-code-block"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
      );
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      out.push(`<h3 class="govuk-heading-s">${inline(line.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      out.push(`<h2 class="govuk-heading-m">${inline(line.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      out.push(`<h1 class="govuk-heading-l">${inline(line.slice(2))}</h1>`);
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(`<li>${inline(lines[i].slice(2))}</li>`);
        i++;
      }
      out.push(`<ul class="govuk-list govuk-list--bullet">${items.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ul class="govuk-list govuk-list--number">${items.join('')}</ul>`);
      continue;
    }

    // Blank line — skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('- ') &&
      !lines[i].startsWith('```') &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    out.push(`<p class="govuk-body">${inline(paraLines.join(' '))}</p>`);
  }

  return out.join('\n');
}

function inline(text: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const resolvedHref = href.startsWith('/') ? basePath + href : href;
      return `<a class="govuk-link" href="${resolvedHref}">${label}</a>`;
    });
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
