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

- Reduce exposure to known vulnerabilities
- Prevent exposure of credentials and sensitive information
- Improve accountability and ownership
- Support compliance with government cyber security standards
- Maintain evidence required for audit and assurance activities
- Improve visibility of organisational security posture

---

## Objectives

This standard aims to

- Define mandatory alert-management practices
- Establish risk-based remediation timelines
- Introduce consistent governance across repositories
- Reduce alert backlogs and unmanaged security debt
- Provide measurable compliance standards

---

## Scope

This standard applies to

- All repositories within Ministry of Justice GitHub organisations
- GitHub Advanced Security findings
- Dependabot alerts
- Dependency Review findings
- Secret Scanning alerts
- CodeQL alerts
- Approved third-party scanning tools integrated with GitHub

This standard applies regardless of repository visibility.

---

## Alert Ownership and Accountability

Every repository **must**

- Have defined `CODEOWNERS`
- Have an owning team assigned
- Have a nominated service owner

Repository owners are accountable for

- Alert triage
- Alert remediation
- Alert dismissal justification
- **SLA** compliance
- Exception management

Repositories without clear ownership **must** be treated as governance findings.

---

## Alert Classification

GitHub security findings shall be classified into the following categories:

### Secret Scanning

Includes:

- API keys
- Access tokens
- Cloud credentials
- Service account credentials
- Private keys

All Secret Scanning alerts **must** be treated as Critical severity.

### Dependency Vulnerabilities

Includes

- Dependabot alerts
- Dependency Review findings
- Vulnerable packages and libraries

Severity is determined using GitHub and advisory database classifications.

### Code Scanning Findings

Includes

- CodeQL alerts
- Static analysis findings
- Security rule violations

Severity is determined by the scanning engine.

### Other Security Findings

Includes

- Approved third-party **SAST** tools
- Approved repository security tooling

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

- Implement compensating controls
- Submit a documented risk acceptance

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

- Breach of **SLA** must be escalated to the owning service team immediately
- Production secret exposure must follow incident-management processes
- Credential rotation must occur before alert closure

### High Severity Alerts

- Breach of **SLA** must be reported to service ownership
- Repeated non-compliance must be reviewed by engineering leadership

### Systemic Failure

Where repositories repeatedly fail alert **SLAs**

- A remediation plan must be created
- Platform governance teams may introduce additional controls
- Security teams may require corrective action

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
- Central monitoring platforms

### SLA Validation

Automated workflows may

- Warn when alerts approach **SLA** breach
- Fail when alerts exceed **SLA**
- Generate compliance reports

---

## Governance and Reporting

### Weekly Reporting

Teams should review

- Open alerts
- **SLA** breaches
- Vulnerability trends
- Ageing findings

### Quarterly Reviews

A quarterly review must assess

- Compliance rates
- Persistent findings
- Common root causes
- Exception trends

### Assurance Evidence

Evidence retained for audit shall include

- Alert history
- Remediation records
- Closure evidence
- Risk acceptance decisions

---

## Exceptions and Risk Acceptance

Exceptions may be granted where

- No remediation exists
- Vendor patches are unavailable
- Operational constraints prevent immediate remediation

All exceptions must

- Be documented
- Have an accountable owner
- Include a review date
- Be reviewed at least annually

Exceptions must not become permanent without review.

---

## Continuous Improvement

Estate-wide security reviews should identify

- Long-running findings
- Repeated **SLA** failures
- Unowned repositories
- Opportunities for automation

Analysis of organisational alert data indicates that remediation times significantly exceed recommended targets.
Resolving, high-severity findings represent the largest ongoing backlog.
Teams should prioritise improving ownership, triage, and automated enforcement to reduce security debt.

---

## References

- [GitHub Advanced Security Documentation](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)
- [NCSC Cyber Assessment Framework (CAF)](https://www.ncsc.gov.uk/collection/cyber-assessment-framework)
- [Government Cyber Security Standard](https://www.security.gov.uk/policy-and-guidance/the-cyber-security-standard/)
- [GovS 007 Security](https://www.gov.uk/government/publications/government-functional-standard-govs-007-security)
- [GitHub Secret Scanning Documentation](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning)
- [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/dependabot-quickstart#about-dependabot)
- [GitHub CodeQL Documentation](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning)
