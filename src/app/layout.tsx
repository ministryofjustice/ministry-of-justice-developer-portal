import '../../styles/globals.scss';
import type { Metadata } from 'next';
import { LayoutShell } from '@/app/layoutShell';

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
      <body className="govuk-template__body js-enabled">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
