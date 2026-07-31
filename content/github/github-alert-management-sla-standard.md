# GitHub security alert management SLA standard

- [Summary](#summary)
- [Objectives](#objectives)
- [Scope](#scope)
- [Alert ownership and accountability](#alert-ownership-and-accountability)
- [Alert classification](#alert-classification)
- [Security alert service level agreements](#security-alert-service-level-agreements)
- [Alert triage requirements](#alert-triage-requirements)
- [Escalation requirements](#escalation-requirements)
- [Enforcement controls](#enforcement-controls)
- [Governance and reporting](#governance-and-reporting)
- [Exceptions and risk acceptance](#exceptions-and-risk-acceptance)
- [Continuous improvement](#continuous-improvement)

## Summary

GitHub provides multiple security capabilities including

- dependabot alerts
- dependency review
- code scanning (CodeQL)
- secret scanning
- third-party **SAST** and security tooling

These controls are only effective when alerts are reviewed, triaged, and remediated within defined timeframes.

This standard establishes the mandatory requirements for managing GitHub security alerts across Ministry of Justice GitHub organisations.
It defines alert ownership, service level agreements (**SLAs**), escalation paths, governance controls, and reporting requirements.

The objectives are to

- reduce exposure to known vulnerabilities
- prevent exposure of credentials and sensitive information
- improve accountability and ownership
- support compliance with government cyber security standards
- maintain evidence required for audit and assurance activities
- improve visibility of organisational security posture

---

## Objectives

This standard aims to

- define mandatory alert-management practices
- establish risk-based remediation timelines
- introduce consistent governance across repositories
- reduce alert backlogs and unmanaged security debt
- provide measurable compliance standards

---

## Scope

This standard applies to

- all repositories within Ministry of Justice GitHub organisations
- GitHub Advanced Security findings
- Dependabot alerts
- Dependency Review findings
- secret scanning alerts
- CodeQL alerts
- approved third-party scanning tools integrated with GitHub

This standard applies regardless of repository visibility.

---

## Alert Ownership and Accountability

Every repository **must**

- have defined `CODEOWNERS`
- have an owning team assigned
- have a nominated service owner

Repository owners are accountable for

- alert triage
- alert remediation
- alert dismissal justification
- **SLA** compliance
- exception management

Repositories without clear ownership **must** be treated as governance findings.

---

## Alert Classification

GitHub security findings shall be classified into the following categories:

### Secret Scanning

Includes:

- API keys
- access tokens
- cloud credentials
- service account credentials
- private keys

All Secret Scanning alerts **must** be treated as Critical severity.

### Dependency Vulnerabilities

Includes

- dependabot alerts
- dependency Review findings
- vulnerable packages and libraries

Severity is determined using GitHub and advisory database classifications.

### Code Scanning Findings

Includes

- CodeQL alerts
- static analysis findings
- security rule violations

Severity is determined by the scanning engine.

### Other Security Findings

Includes

- approved third-party **SAST** tools
- approved repository security tooling

Severity shall be assessed using organisational vulnerability-management guidance.

---

## Security Alert Service Level Agreements

The following **SLA**s are mandatory

| Alert Type                     | Severity | Acknowledgement | Remediation               |
| ------------------------------ | -------- | --------------- | ------------------------- |
| Secret Scanning                | Critical | 24 Hours        | 24 Hours (Production)     |
| Secret Scanning                | Critical | 24 Hours        | 72 Hours (Non-Production) |
| Dependency Vulnerability       | Critical | 24 Hours        | 72 Hours                  |
| Dependency Vulnerability       | High     | 48 Hours        | 7 Days                    |
| Code Scanning                  | High     | 48 Hours        | 14 Days                   |
| SAST / Other Security Findings | Medium   | 5 Days          | 30 Days                   |

Where remediation cannot be completed within **SLA**, teams must either

- implement compensating controls
- submit a documented risk acceptance

Failure to do so constitutes non-compliance.

---

## Alert Triage Requirements

All alerts must be triaged upon acknowledgement

The outcome of triage must be one of

### Valid Finding

The vulnerability exists and requires remediation

### Accepted Risk

The issue cannot currently be remediated and has documented approval

### False Positive

The finding has been investigated and dismissed with justification

### Duplicate

The issue is already tracked elsewhere

All dismissals must include documented rationale

Alerts must not remain open indefinitely without action

---

## Escalation Requirements

The following escalation requirements apply

### Critical Alerts

- breach of **SLA** must be escalated to the owning service team immediately
- production secret exposure must follow incident-management processes
- credential rotation must occur before alert closure

### High Severity Alerts

- breach of **SLA** must be reported to service ownership
- repeated non-compliance must be reviewed by engineering leadership

### Systemic Failure

Where repositories repeatedly fail alert **SLAs**

- a remediation plan must be created
- platform governance teams may introduce additional controls
- security teams may require corrective action

---

## Enforcement Controls

### Branch Protection

Protected branches should prevent deployment of unresolved critical issues where technically feasible.

### Automated Monitoring

Repositories must enable relevant GitHub security features where licensed and available.

This includes

- Dependabot
- Dependency Review
- Secret Scanning
- Code Scanning

### Automated notifications

Alerts should be routed into any of the below

- Microsoft Teams
- Slack
- central monitoring platforms

### SLA Validation

Automated workflows may

- warn when alerts approach **SLA** breach
- fail when alerts exceed **SLA**
- generate compliance reports

---

## Governance and Reporting

### Weekly Reporting

Teams should review

- open alerts
- **SLA** breaches
- vulnerability trends
- ageing findings

### Quarterly Reviews

A quarterly review must assess

- compliance rates
- persistent findings
- common root causes
- exception trends

### Assurance Evidence

Evidence retained for audit shall include

- alert history
- remediation records
- closure evidence
- risk acceptance decisions

---

## Exceptions and Risk Acceptance

Exceptions may be granted where

- no remediation exists
- vendor patches are unavailable
- operational constraints prevent immediate remediation

All exceptions must

- be documented
- have an accountable owner
- include a review date
- be reviewed at least annually

Exceptions must not become permanent without review.

---

## Continuous Improvement

Estate-wide security reviews should identify

- long-running findings
- repeated **SLA** failures
- unowned repositories
- opportunities for automation

Analysis of organisational alert data indicates that remediation times significantly exceed recommended targets.
Resolving, high-severity findings represent the largest ongoing backlog.
Teams should prioritise improving ownership, triage, and automated enforcement to reduce security debt.

---

## References

- [GitHub Advanced Security documentation](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)
- [NCSC Cyber Assessment Framework (CAF)](https://www.ncsc.gov.uk/collection/cyber-assessment-framework)
- [Government Cyber Security Standard](https://www.security.gov.uk/policy-and-guidance/the-cyber-security-standard/)
- [GovS 007 Security](https://www.gov.uk/government/publications/government-functional-standard-govs-007-security)
- [GitHub Secret Scanning documentation](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning)
- [GitHub Dependabot documentation](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/dependabot-quickstart#about-dependabot)
- [GitHub CodeQL documentation](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning)
