# Secrets Management Guidance

- [Purpose](#purpose)
- [Scope](#scope)
- [Definition of a secret](#definition-of-a-secret)
- [Types of secret](#types-of-secret)
- [Core principles](#core-principles)
- [If a secret is exposed](#if-a-secret-is-exposed)
- [Compliance](#compliance)

## Purpose

This guidance explains how secrets should be created, stored, accessed, and protected when working in GitHub at the Ministry of Justice (**MOJ**).

Its objectives are to

- protect MOJ systems and data from unauthorised access
- prevent exposure of credentials in code and repositories
- support secure development and operations practices

## Scope

This guidance applies to all

- MOJ staff, contractors, and suppliers who can access or contribute to repositories used for MOJ work
- all repository visibility levels (public, internal, and private) and all repository content (including code, configuration, commits, pull requests, issues, comments, logs, attachments, and generated artefacts)
- all environments (development, test, staging, production)

## Definition of a secret

A **secret** is any piece of information used to authenticate or secure systems, including

- passwords and passphrases
- API keys and tokens (including GitHub PATs)
- GitHub App private keys
- encryption keys and certificates
- database connection strings
- machine user credentials
- OAuth tokens and client secrets

## Types of secret

Secrets fall into three kinds. Knowing which you have tells you who is responsible for it.

**User secrets** are owned by an individual (for example, your GitHub or AWS credentials). Keep these in a password manager. Do not share them or use them in applications.

**System secrets** are used by system components such as CI pipelines. Use a [machine user](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#machine-users), not a personal account. The system owner is responsible for them.

**Application secrets** are needed by an application at runtime (for example, third party API keys, database credentials, cookie encryption keys).

Application secrets are a shared responsibility

- the application owner creates the secret, stores its value in an approved store, and rotates it
- the platform team hosting your application keeps the secret secure within the environment

## Core principles

### Never store secrets in code or repositories

Secrets should never be committed to GitHub, including

- public repositories, internal repositories and private repositories
- test data, temporary credentials, sample code, commented out code and .env files, unless reliably gitignored
- configuration files, shared documents or spreadsheets etc.

### Use approved secrets storage

All secrets should be stored in an approved secure system. These are

- GitHub Actions secrets, scoped to a repository or environment
- GitHub Environments, where a secret belongs to a deployment target
- AWS Secrets Manager
- Azure Key Vault
- 1Password

### Least privilege access

Access to secrets should

- be restricted to users and services that need them
- be granted through controlled, auditable processes
- be removed when no longer required

### No shared credentials

- shared accounts and credentials should not be used
- each user or service should have unique credentials
- automation should use a machine user, not a personal account
- machine users should be clearly owned and documented

### Rotation and lifecycle management

Secrets should be

- rotated regularly (based on risk level)
- rotated immediately if
  - exposure is suspected
  - a user leaves or changes role
  - a supplier engagement ends
- expired or deleted when no longer needed

### Secure use in pipelines and automation

CI/CD pipelines should

- use secure secret injection (for example, [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets))
- use [OpenID Connect (OIDC)](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect) rather than stored cloud credentials where possible
- set workflow permissions explicitly
- never expose secrets in
  - logs
  - build outputs and artefacts
  - container images
  - error messages

Personal Access Tokens (**PATs**) should be

- minimised, in favour of a GitHub App, GITHUB_TOKEN, or OIDC
- scoped to least privilege
- time limited where possible
- recorded against a named owner

Where PATs are required, fine grained PATs should be used.

### Logging and monitoring

- use of secrets should be auditable
- systems should log
  - access to secrets
  - changes or rotations
- monitoring tools should detect
  - secret leaks in repositories
  - unusual access patterns

MOJ has [secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning) and push protection enabled across its GitHub organisations. Push protection should not be bypassed. Where a push is blocked, rotate the value and remove it from the commit.

### Use of organisation level secrets

Organisation level secrets present a heightened security risk due to their broad scope and potential impact if compromised. Their use should be minimised and only used where a secret must be shared across multiple repositories, applications, or services.

- when used, access should be restricted to only the repositories, applications, or services that require the secret
- organisation level secrets should be centrally managed to support governance and rotation
- new organisation level secrets should only be created with appropriate approval and documented business justification
- access and usage should be reviewed periodically to ensure continued necessity and least privilege access

## If a secret is exposed

The following actions should be taken.

1. Revoke or rotate the secret immediately.
2. Remove the secret from the codebase (including commit history if required).
3. Report the incident to [#ask-developer-experience-team](https://moj.enterprise.slack.com/archives/C0AJBK3P5A8).
4. Assess impact and take remediation actions.

## Compliance

This guidance supports the MOJ Secrets Management policy, which sets out compliance and enforcement.

- MOJ may scan repositories for leaked secrets, audit access and usage logs, and require remediation
- If you suspect a breach or security incident, [report it immediately](https://intranet.justice.gov.uk/guidance/security/report-a-security-incident/?agency=hq)
- If you are unsure whether something complies, contact the Developer Experience team via [#ask-developer-experience-team](https://moj.enterprise.slack.com/archives/C0AJBK3P5A8) or email DeveloperExperienceTeam@justice.gov.uk
