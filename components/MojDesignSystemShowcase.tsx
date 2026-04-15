'use client';

import { useEffect, useRef } from 'react';

const ANIMATION_DURATION_MS = 7000;
const PAUSE_BETWEEN_SECTIONS_MS = 900;

function pickNextIndex(length: number, previous: number): number {
  if (length <= 1) return 0;

  let next = Math.floor(Math.random() * length);
  while (next === previous) {
    next = Math.floor(Math.random() * length);
  }

  return next;
}

export function MojDesignSystemShowcase() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-moj-fade-target]')
    );
    if (targets.length === 0) return;

    let previousIndex = -1;
    let stopped = false;
    const timerIds: number[] = [];

    const pulseTarget = (index: number) => {
      const target = targets[index];
      target.classList.remove('moj-fade-pulse');
      void target.offsetHeight;

      const onAnimationEnd = () => {
        target.classList.remove('moj-fade-pulse');
      };

      target.addEventListener('animationend', onAnimationEnd, { once: true });
      target.classList.add('moj-fade-pulse');

      const fallbackId = window.setTimeout(onAnimationEnd, ANIMATION_DURATION_MS + 300);
      timerIds.push(fallbackId);
    };

    const scheduleNext = () => {
      if (stopped) return;
      const id = window.setTimeout(() => {
        if (stopped) return;
        previousIndex = pickNextIndex(targets.length, previousIndex);
        pulseTarget(previousIndex);
        scheduleNext();
      }, ANIMATION_DURATION_MS + PAUSE_BETWEEN_SECTIONS_MS);
      timerIds.push(id);
    };

    previousIndex = pickNextIndex(targets.length, previousIndex);
    pulseTarget(previousIndex);
    scheduleNext();

    return () => {
      stopped = true;
      timerIds.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div ref={containerRef}>
      <div className="govuk-inset-text">
        This system is maintained by the Design Standards Office. Every pattern and component
        published here has been stress-tested under live service load and cleared for deployment
        to citizen-facing services.
      </div>

      <p className="govuk-body-s" data-moj-fade-target="disclaimer">
        Decorative motion appears occasionally on this page for demo purposes. It is subtle,
        non-blocking, and disabled when reduced-motion is enabled.
      </p>

      <section className="govuk-!-margin-top-7" data-moj-fade-target="principles">
        <h2 className="govuk-heading-l">Design principles</h2>
        <ul className="govuk-list govuk-list--bullet">
          <li><strong>Make outcomes legible:</strong> users should always know what will happen next.</li>
          <li><strong>Design for real pressure:</strong> interfaces must remain usable during incidents and spikes.</li>
          <li><strong>Use consistent language:</strong> plain, direct content across every service and team.</li>
          <li><strong>Prefer reusable patterns:</strong> speed through standardisation, not reinvention.</li>
        </ul>
      </section>

      <section className="govuk-!-margin-top-7">
        <h2 className="govuk-heading-l">Foundations</h2>
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">Foundation</th>
              <th scope="col" className="govuk-table__header">Standard</th>
              <th scope="col" className="govuk-table__header">Why it matters</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            <tr className="govuk-table__row">
              <td className="govuk-table__cell">Typography standards</td>
              <td className="govuk-table__cell">Clear hierarchy for headings, body content, and legal notices</td>
              <td className="govuk-table__cell">Prevents misinterpretation when users scan documents under pressure</td>
            </tr>
            <tr className="govuk-table__row">
              <td className="govuk-table__cell">Layout spacing</td>
              <td className="govuk-table__cell">Consistent spacing that holds across desktop and mobile viewports</td>
              <td className="govuk-table__cell">Ensures form layouts remain stable during responsive rendering</td>
            </tr>
            <tr className="govuk-table__row">
              <td className="govuk-table__cell">Content style</td>
              <td className="govuk-table__cell">Plain language first, technical terminology only where legally required</td>
              <td className="govuk-table__cell">Reduces failed submissions — 73% of permit errors trace to unclear phrasing</td>
            </tr>
            <tr className="govuk-table__row">
              <td className="govuk-table__cell">Colour and contrast</td>
              <td className="govuk-table__cell">Meets WCAG 2.2 AA in bright, low-light, and glare-prone conditions</td>
              <td className="govuk-table__cell">Not all Ministry offices have consistent ambient lighting</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="govuk-!-margin-top-7">
        <h2 className="govuk-heading-l">Core components</h2>
        <dl className="govuk-summary-list">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Critical action controls</dt>
            <dd className="govuk-summary-list__value">
              Primary actions are singular and irreversible — the interface must make consequences
              obvious before activation. Secondary actions (modify parameters, request review) are
              available but visually subordinate.
              <div className="govuk-button-group govuk-!-margin-top-2">
                <button className="govuk-button" type="button">Activate control</button>
                <button className="govuk-button govuk-button--secondary" type="button">Review parameters</button>
              </div>
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Operational status tags</dt>
            <dd className="govuk-summary-list__value">
              Every registered service, permit, and active process carries a visible status tag.
              Operational teams rely on these for triage during surge events and service reviews.
              <p className="govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                <strong className="govuk-tag govuk-tag--green govuk-!-margin-right-1">Active</strong>
                <strong className="govuk-tag govuk-tag--blue govuk-!-margin-right-1">Under review</strong>
                <strong className="govuk-tag govuk-tag--yellow govuk-!-margin-right-1">Pending</strong>
                <strong className="govuk-tag govuk-tag--red">Action required</strong>
              </p>
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Incident warnings</dt>
            <dd className="govuk-summary-list__value">
              High-severity alerts use warning text with the exclamation icon. These are reserved
              for situations where inaction causes measurable harm — critical failures,
              expired safeguards, and revoked permits with active incidents.
              <div className="govuk-warning-text govuk-!-margin-top-2 govuk-!-margin-bottom-0">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  Protection setting expired. Re-activate before resuming fieldwork or users may be exposed to unmanaged risk.
                </strong>
              </div>
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Permit summary cards</dt>
            <dd className="govuk-summary-list__value">
              Permit details are displayed in structured summary lists so caseworkers can verify
              conditions at a glance during high-volume processing windows.
            </dd>
          </div>
        </dl>
      </section>

      <section className="govuk-!-margin-top-7">
        <h2 className="govuk-heading-l">Service patterns</h2>
        <h3 className="govuk-heading-m">Pattern: Service licence application</h3>
        <ol className="govuk-list govuk-list--number">
          <li>Confirm eligibility — applicant must hold a valid identity credential and have no outstanding compliance notices.</li>
          <li>Capture destination preferences and restricted-zone exclusions through a stepped form with clear progress indication.</li>
          <li>Present a confirmation page stating the licence reference, effective date, and any conditions imposed by the Service Review Board.</li>
        </ol>

        <h3 className="govuk-heading-m">Pattern: Service registration and welfare check</h3>
        <ol className="govuk-list govuk-list--number">
          <li>Identify the service class from a validated taxonomy — free-text descriptions are mapped to the nearest registered classification with a confidence indicator.</li>
          <li>Collect operational requirements, access constraints, and assurance grade through conditional form sections that adapt based on service class.</li>
          <li>Schedule an initial welfare inspection and issue a provisional registration with a 90-day review window.</li>
        </ol>

        <h3 className="govuk-heading-m">Pattern: Incident response</h3>
        <p className="govuk-body">
          During active incidents, the interface reduces navigation depth to two levels,
          promotes the status banner to fixed position, and limits available actions to those
          that directly support containment or citizen safety. Non-critical functions are
          suppressed, not hidden — they show a &quot;temporarily unavailable during active incident&quot;
          state with an estimated restoration time.
        </p>
      </section>

      <section className="govuk-!-margin-top-7">
        <h2 className="govuk-heading-l">Accessibility and multi-channel support</h2>
        <p className="govuk-body">
          Ministry services are used by practitioners, citizens, staff, and automated
          assistant systems. The design system accounts for this range explicitly:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          <li><strong>Hands-free navigation:</strong> every action is reachable by keyboard, voice, and assistive input. No interaction requires complex gestures.</li>
          <li><strong>Multi-context readability:</strong> content is tested across standard, low-light, and high-glare conditions at WCAG 2.2 AA minimum.</li>
          <li><strong>Temporal consistency:</strong> interfaces must render identically regardless of the user&apos;s local time zone. All timestamps use UTC.</li>
          <li><strong>Assistive technology parity:</strong> ARIA labels and semantic descriptions provide equivalent information to users of different assistive tools.</li>
          <li><strong>Automation-agent compatibility:</strong> automated agents acting on behalf of a user receive the same semantic structure as human users, ensuring no degraded experience for delegated tasks.</li>
        </ul>
      </section>

      <section className="govuk-!-margin-top-7">
        <h2 className="govuk-heading-l">Contribution model</h2>
        <p className="govuk-body">
          New components and patterns are proposed through a Design Contribution Request (DCR).
          Each DCR must include:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          <li>A documented user need grounded in an active service or policy requirement</li>
          <li>Accessibility evidence covering keyboard, screen reader, and automation-agent testing</li>
          <li>Impact classification (standard, elevated, or critical) with rationale</li>
          <li>At least one working prototype deployable to the staging environment</li>
        </ul>
        <p className="govuk-body">
          Accepted DCRs are versioned in the pattern registry and published with migration
          guidance so service teams can adopt new patterns without disrupting active services.
          Breaking changes require a 60-day deprecation notice and a compatibility shim for the
          previous version.
        </p>
        <div className="govuk-inset-text">
          The Design Standards Office reviews DCRs on a fortnightly cadence. Proposals with
          cross-service impact are escalated to the Cross-Service Interface Council for joint review.
        </div>
      </section>
    </div>
  );
}
