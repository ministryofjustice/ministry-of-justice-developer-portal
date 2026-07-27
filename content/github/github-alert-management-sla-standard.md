# GitHub Security Alert Management and SLA Standard

- [Summary](#summary)
- [Objectives](#objectives)
- [Scope](#scope)
- [1. Alert Ownership and Accountability](#1-alert-ownership-and-accountability)
- [2. Alert Classification](#2-alert-classification)
- [3. Security Alert Service Level Agreements](#3-security-alert-service-level-agreements)
- [4. Alert Triage Requirements](#4-alert-triage-requirements)
- [5. Escalation Requirements](#5-escalation-requirements)
- [6. Enforcement Controls](#6-enforcement-controls)
- [7. Governance and Reporting](#7-governance-and-reporting)
- [8. Exceptionsand-risk-acceptance](#8-exceptions-and-risk-acceptance)
- [9. Continuous Improvement](#9-continuous-improvement)

## Summary

GitHub provides multiple security capabilities including:

- Dependabot Alerts
- Dependency Review
- Code Scanning (CodeQL)
- Secret Scanning
- Third-party SAST and security tooling

These controls are only effective when alerts are reviewed, triaged, and remediated within defined timeframes.

This standard establishes the mandatory requirements for managing GitHub security alerts across Ministry of Justice GitHub organisations.
It defines alert ownership, service level agreements (SLAs), escalation paths, governance controls, and reporting requirements.

The objectives are to:

- Reduce exposure to known vulnerabilities.
- Prevent exposure of credentials and sensitive information.
- Improve accountability and ownership.
- Support compliance with Government Cyber Security Standards.
- Maintain evidence required for audit and assurance activities.
- Improve visibility of organisational security posture.

---

## Objectives

This standard aims to:

- Define mandatory alert-management practices.
- Establish risk-based remediation timelines.
- Introduce consistent governance across repositories.
- Reduce alert backlogs and unmanaged security debt.
- Provide measurable compliance standards.

---

## Scope

This standard applies to:

- All repositories within Ministry of Justice GitHub organisations.
- GitHub Advanced Security findings.
- Dependabot alerts.
- Dependency Review findings.
- Secret Scanning alerts.
- CodeQL alerts.
- Approved third-party scanning tools integrated with GitHub.

This standard applies regardless of repository visibility.

---

## 1. Alert Ownership and Accountability

Every repository MUST:

- Have defined CODEOWNERS.
- Have an owning team assigned.
- Have a nominated service owner.

Repository owners are accountable for:

- Alert triage.
- Alert remediation.
- Alert dismissal justification.
- SLA compliance.
- Exception management.

Repositories without clear ownership MUST be treated as governance findings.

---

## 2. Alert Classification

GitHub security findings SHALL be classified into the following categories:

### Secret Scanning

Includes:

- API keys
- Access tokens
- Cloud credentials
- Service account credentials
- Private keys

All Secret Scanning alerts MUST be treated as Critical severity.

### Dependency Vulnerabilities

Includes:

- Dependabot Alerts
- Dependency Review findings
- Vulnerable packages and libraries

Severity is determined using GitHub and advisory database classifications.

### Code Scanning Findings

Includes:

- CodeQL alerts
- Static analysis findings
- Security rule violations

Severity is determined by the scanning engine.

### Other Security Findings

Includes:

- Approved third-party SAST tools
- Approved repository security tooling

Severity SHALL be assessed using organisational vulnerability-management guidance.

---

## 3. Security Alert Service Level Agreements

The following SLAs are mandatory.

| Alert Type                     | Severity | Acknowledgement | Remediation               |
| ------------------------------ | -------- | --------------- | ------------------------- |
| Secret Scanning                | Critical | 24 Hours        | 24 Hours (Production)     |
| Secret Scanning                | Critical | 24 Hours        | 72 Hours (Non-Production) |
| Dependency Vulnerability       | Critical | 24 Hours        | 72 Hours                  |
| Dependency Vulnerability       | High     | 48 Hours        | 7 Days                    |
| Code Scanning                  | High     | 48 Hours        | 14 Days                   |
| SAST / Other Security Findings | Medium   | 5 Days          | 30 Days                   |

Where remediation cannot be completed within SLA, teams MUST either:

- Implement compensating controls; or
- Submit a documented risk acceptance.

Failure to do so constitutes non-compliance.

---

## 4. Alert Triage Requirements

All alerts MUST be triaged upon acknowledgement.

The outcome of triage MUST be one of:

### Valid Finding

The vulnerability exists and requires remediation.

### Accepted Risk

The issue cannot currently be remediated and has documented approval.

### False Positive

The finding has been investigated and dismissed with justification.

### Duplicate

The issue is already tracked elsewhere.

All dismissals MUST include documented rationale.

Alerts MUST NOT remain open indefinitely without action.

---

## 5. Escalation Requirements

The following escalation requirements apply:

### Critical Alerts

- Breach of SLA MUST be escalated to the owning service team immediately.
- Production secret exposure MUST follow incident-management processes.
- Credential rotation MUST occur before alert closure.

### High Severity Alerts

- Breach of SLA MUST be reported to service ownership.
- Repeated non-compliance MUST be reviewed by engineering leadership.

### Systemic Failure

Where repositories repeatedly fail alert SLAs:

- A remediation plan MUST be created.
- Platform governance teams MAY introduce additional controls.
- Security teams MAY require corrective action.

---

## 6. Enforcement Controls

### Branch Protection

Protected branches SHOULD prevent deployment of unresolved critical issues where technically feasible.

### Automated Monitoring

Repositories MUST enable relevant GitHub security features where licensed and available.

This includes:

- Dependabot
- Dependency Review
- Secret Scanning
- Code Scanning

### Automated Notifications

Alerts SHOULD be routed into any of the below:

- Microsoft Teams
- Slack
- Central monitoring platforms

### SLA Validation

Automated workflows MAY:

- Warn when alerts approach SLA breach.
- Fail when alerts exceed SLA.
- Generate compliance reports.

---

## 7. Governance and Reporting

### Weekly Reporting

Teams SHOULD review:

- Open alerts
- SLA breaches
- Vulnerability trends
- Ageing findings

### Quarterly Reviews

A quarterly review MUST assess:

- Compliance rates
- Persistent findings
- Common root causes
- Exception trends

### Assurance Evidence

Evidence retained for audit SHALL include:

- Alert history
- Remediation records
- Closure evidence
- Risk acceptance decisions

---

## 8. Exceptions and Risk Acceptance

Exceptions MAY be granted where:

- No remediation exists.
- Vendor patches are unavailable.
- Operational constraints prevent immediate remediation.

All exceptions MUST:

- Be documented.
- Have an accountable owner.
- Include a review date.
- Be reviewed at least annually.

Exceptions MUST NOT become permanent without review.

---

## 9. Continuous Improvement

Estate-wide security reviews SHOULD identify:

- Long-running findings.
- Repeated SLA failures.
- Unowned repositories.
- Opportunities for automation.

Analysis of organisational alert data indicates that remediation times significantly exceed recommended targets.
Resolving, high-severity findings represent the largest ongoing backlog.
Teams should prioritise improving ownership, triage, and automated enforcement to reduce security debt.

---

## References

- GitHub Advanced Security Documentation
- NCSC Cyber Assessment Framework (CAF)
- Government Cyber Security Standard
- GovS 007 Security
- GDS Service Standard
- MoJ Vulnerability Management Guidance
- MoJ Modernisation Platform Security Guidance
- GitHub Secret Scanning Documentation
- GitHub Dependabot Documentation
- GitHub CodeQL Documentation
