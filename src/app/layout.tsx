import '../../styles/globals.scss';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PhaseBanner } from '@/components/PhaseBanner';

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
        <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
          Skip to main content
        </a>
        <Header />
        <PhaseBanner />
        <main className="govuk-main-wrapper" id="main-content" role="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
