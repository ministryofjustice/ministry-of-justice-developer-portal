# GitHub Terms of Service

These are the official Terms of Service governing use of GitHub by the Ministry of Justice.

They define the mandatory security, compliance, and operational standards that **all users** must follow.

---

## Core Principles

GitHub is a platform for collaborative development and version control of code. These Terms of Service establish three core principles:

1. **Code only** — GitHub repositories **must only contain** source code and
   development artefacts. **Do not** store organisational, business, or operational
   data.

2. **Security first** — Repositories **must never contain** secrets, credentials,
   or sensitive information. **Do not** commit passwords, API keys, private keys, or
   regulated data such as Personal Information and PCI
   (Payment Card Information).

3. **Compliance by design** — All users **must comply** with these standards to protect the organisation and the people we serve.

---

## Scope

This standard applies to **all staff and contributors** who can access or contribute to repositories used for MoJ work — regardless of role or seniority.

**All repository visibility levels** (public, internal, and private) and **all repository
content** (including code, configuration, commits, pull requests, issues, comments, logs,
attachments, and generated artefacts) are covered.

Restrictions apply regardless of file format or how the data is stored - whether as structured files, plain text, compressed archives, or any other form.

---

## What You Cannot Store

### Organisational data

**Do not** store organisation-specific data in repositories. This includes:

- Business, operational, or service data
- Production data (including non-production copies)
- Internal reports, extracts, or datasets
- Data exports from internal systems
- User, staff, or citizen records
- Justice identifiers: Prisoner IDs, NOMIS IDs, PNC numbers, CRO numbers, CRNs, LAA Case Reference Numbers

### Personal or regulated data

**Do not** store data covered by privacy or payment regulations including, but not limited to:

**Personal Information:**

- Full names
- Home addresses
- Personal email addresses
- Phone numbers
- Dates of birth
- National Insurance numbers
- Passport numbers
- Driving licence numbers
- Medical information
- Biometric data

**PCI (Payment Card Information):**

- Cardholder names
- Primary account numbers (PAN)
- Expiry dates
- Service codes
- Card verification values (CVV/CVC)
- Magnetic stripe or chip track data
- PIN data

### Secrets and credentials

**Do not** store secrets in repositories including, but not limited to:

- Passwords
- API keys
- Private keys
- Certificates
- Connection strings
- Credentials
- Service account keys

---

## What You Can Store

GitHub repositories are for development work. Acceptable content includes:

- Source code and scripts
- Configuration files and infrastructure as code
- Documentation and technical guides
- Automated test code and synthetic test fixtures
- CI/CD pipeline definitions
- Development tooling and build artefacts

### Synthetic Test Data

The only permitted data-like content is synthetic test data required for automated testing. Test data **must**:

- Be obviously fake and non-real
- Contain no organisational, Personal Information, or PCI data
- Contain no secrets
- Have a filename that clearly identifies it as test data (for example, `test-data.json`, `mock-users.test.json`)

**Do not** use ambiguous names like `data.csv` or `users.json` for test datasets.

### Synthetic Identifier Formats

These patterns are illustrative only — not official matching rules. Real production patterns may vary.

When testing, use visibly fake values with repeated digits or simple sequences:

| Identifier | Format | Example |
| --- | --- | --- |
| National Insurance number | 2 letters, 6 digits, suffix A–D | CD000000A |
| PNC number | 4 digits/5–7 digits + letter | 0000/00000A |
| CRO number | digits/2 digits + letter | 000/34B |
| LAA case reference | 11 digits/letter/letter/digit | 00000000000/A/A/1 |

---

## Your Responsibilities

All teams and contributors **must**:

- Store secrets using **approved secret management tools** — never in repository files
- Ensure **appropriate security and access controls** are configured for your repositories and in CI/CD pipelines
- **Review all code** entering repositories (e.g. from pull requests, third-party libraries) for accidental data or secrets exposure
- Treat AI-generated code and files as **untrusted** — review for data or secret leakage before committing

In the event of a breach:

- **Immediately remove and rotate** any exposed secret, and remove any accidentally committed Personal Information, PCI, or organisational data
- **Report** any exposure of secrets, Personal Information, PCI, or organisational data as a security incident **immediately**

---

## Compliance

Any breach of these Terms of Service **must** be treated as a security and governance
incident and escalated through the appropriate MoJ process. Repositories or workflows
found to be non-compliant **may** be suspended until remediation is complete.

If you suspect a breach or security incident, [**report it immediately**](https://intranet.justice.gov.uk/guidance/security/report-a-security-incident/?agency=hq).

If you are unsure whether something complies, contact the Developer Experience team
via Slack [#ask-developer-experience-team](https://moj.enterprise.slack.com/archives/C0AJBK3P5A8)
or email <DeveloperExperienceTeam@justice.gov.uk>.
