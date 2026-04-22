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
import guidelines from '../../../../content/guidelines/guidelines.json';

// Sample content for each guideline — in production these would be MDX files
const guidelineContent: Record<string, string> = {};


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
