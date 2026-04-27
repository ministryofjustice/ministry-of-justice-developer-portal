import '../../styles/globals.scss';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PhaseBanner } from '@/components/PhaseBanner';
import { MojFrontendInit } from '@/components/MojFrontendInit';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
        Skip to main content
      </a>
      <Header />
      <PhaseBanner />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        {children}
      </main>
      <Footer />
      <MojFrontendInit />
    </>
  );
}
