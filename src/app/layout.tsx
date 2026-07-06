import '../../styles/globals.scss';
import '@ministryofjustice/frontend/moj/moj-frontend.min.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LayoutShell } from '@/app/layoutShell';
import { PostHogPageview } from '@/components/posthog/PostHogPageview';
import { PostHogSurvey } from '@/components/posthog/PostHogSurvey';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PostHogProvider } from '@/components/posthog/PostHogProvider';


export const metadata: Metadata = {
  title: {
    template: '%s - Ministry of Justice Developer Portal',
    default: 'Ministry of Justice Developer Portal',
  },
  description:
    'The Ministry of Justice Developer Portal — documentation, products, and guidelines for cross-government developers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="govuk-template">
      <body className="govuk-template__body" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{
    __html: `document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '')`
  }} /> // Added PostHog provider to ensure PostHog is initialized before any pageviews are captured
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageview />
            <PostHogSurvey />
          </Suspense>
          <ErrorBoundary>
            <LayoutShell>{children}</LayoutShell>
          </ErrorBoundary>
        </PostHogProvider>
      </body>
    </html>
  );
}