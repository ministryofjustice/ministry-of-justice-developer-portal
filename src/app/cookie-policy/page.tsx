import Link from 'next/link'
import { CookiePreferences } from '@/components/CookiePreferences'

export default function CookiePolicyPage() {
  return (
    <div className="govuk-width-container govuk-!-margin-top-8">
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Cookie policy</h1>

        <p className="govuk-body">
          This site uses cookies to make the service work and to improve how it works.
          Essential cookies are always used. Analytics cookies are optional and are only enabled if you accept them.
        </p>

        <h2 className="govuk-heading-l">What analytics cookies do</h2>
        <p className="govuk-body">
          If you accept analytics cookies, we use PostHog to collect anonymous usage data.
          This can include page views, browser and device details, session activity, and interactions with surveys.
        </p>

        <h2 className="govuk-heading-l">What we do not collect by default</h2>
        <p className="govuk-body">
          We do not collect personal identity data unless you explicitly choose to provide it. Analytics tracking is only started after you accept analytics cookies.
        </p>

        <h2 className="govuk-heading-l">Managing your choices</h2>
        <p className="govuk-body">
          You can change your choice about analytics cookies at any time using the controls below.
        </p>
        <CookiePreferences />

        <p className="govuk-body">
          Back to <Link href="/">home</Link>.
        </p>
      </main>
    </div>
  )
}
