# GitHub Actions Cloud Authentication Credential Usage

- [Summary](#summary)
- [Requirements](#requirements)
- [1. Authenticating via OIDC](#1-authenticating-via-oidc)
- [2. Distinguishing the Identity Provider from the Credential Mechanism](#2-distinguishing-the-identity-provider-from-the-credential-mechanism)
- [3. Workflows Using id-token: write When Using OIDC](#3-workflows-using-id-token-write-when-using-oidc)
- [4. Exceptions for Long-lived Credentials](#4-exceptions-for-long-lived-credentials)
- [5. Identifying High-Blast-Radius Repositories](#5-identifying-high-blast-radius-repositories)
- [6. Credential and Variable Naming Convention](#6-credential-and-variable-naming-convention)
- [7. Flagged Repositories and the Verification Process](#7-flagged-repositories-and-the-verification-process)
- [8. Continuous Monitoring of Cloud Authentication Posture](#8-continuous-monitoring-of-cloud-authentication-posture)
- [Related Standards](#related-standards)
- [Appendix A - Migration Walkthrough (AWS)](#appendix-a---migration-walkthrough-aws)
- [References](#references)

## Summary

To be effective, GitHub Actions workflows that authenticate to a cloud provider must do so without storing long-lived static credentials.
This standard defines how all MoJ teams using GitHub Actions in the ministryofjustice organisation must authenticate to cloud providers (AWS, Azure, GCP, etc.).

This will enable:

- Organisations to have reliable, auditable assurance over its cloud credential posture.
- Teams have a single clear answer to “how should my pipeline authenticate to the cloud?”

## Requirements

This standard is made up of the following requirements:

- [1. Authenticating via OIDC](#1-authenticating-via-oidc)
- [2. Distinguishing the Identity Provider from the Credential Mechanism](#2-distinguishing-the-identity-provider-from-the-credential-mechanism)
- [3. Workflows Using `id-token: write` When Using OIDC](#3-workflows-using-id-token-write-when-using-oidc)
- [4. Exceptions for Long-lived Credentials](#4-exceptions-for-long-lived-credentials)
- [5. Identifying High-Blast-Radius Repositories](#5-identifying-high-blast-radius-repositories)
- [6. Credential and Variable Naming Convention](#6-credential-and-variable-naming-convention)
- [7. Flagged Repositories and the Verification Process](#7-flagged-repositories-and-the-verification-process)
- [8. Continuous Monitoring of Cloud Authentication Posture](#8-continuous-monitoring-of-cloud-authentication-posture)
- [Related Standards](#related-standards)
- [Appendix A - Migration Walkthrough (AWS)](#appendix-a---migration-walkthrough-aws)
- [References](#references)

## 1. Authenticating via OIDC

GitHub Actions workflows that authenticate to a cloud provider MUST use OpenID Connect (OIDC) federated identity.
Workflows MUST NOT use long-lived static credentials (AWS access keys, Azure client secrets, GCP service account keys) stored as repository or organisation secrets.
Any long-lived static credentials MUST have logged exceptions detailing their usage, as set out below.

OIDC exchanges a short-lived signed token for cloud credentials at the moment they are needed.
The cloud provider validates the token’s repository, branch, environment and other claims before issuing a session that typically expires within an hour.

This is preferred over long-lived credentials for five reasons:

**1. No persistent secret to leak:**
  > Nothing static is stored in GitHub, so a log dump, malicious dependency, or compromised contributor cannot exfiltrate what does not exist.

**2. Automatic Expiry:**
> A leaked token has minutes of utility, not months.

**3. Scoped Trust:**
> The cloud-side trust policy can require specific repository, branch, ref or environment claims.
> A token issued to a feature branch cannot assume a role intended for main.

**4. No Rotation Burden:**

There are no keys to rotate, audit, or accidentally let expire.

**5. Cleaner audit trail:**

Each token exchange is logged with the originating repository and run.

This aligns with:

- The NCSC cloud security guidance principle of minimising the lifetime and blast radius of credentials
- The GDS Service Standard requirement to manage information risk.

Continued use of long-lived credentials exposes MoJ to:

- Credential exfiltration through logs and supply-chain dependencies.
- Stale and over-privileged secrets.
- Lateral movement from leaked keys usable anywhere on the internet.
- A detection gap where keys surface publicly before they are noticed.
- Dormant-credential risk, where a key left in repository settings after migration remains
  fully exploitable until deleted.

## 2. Distinguishing the Identity Provider from the Credential Mechanism

Both concern authentication (AuthN) — proving which workload is calling the cloud — as distinct from authorisation (AuthZ).
Authz governs what that workload may then do (covered here only by the least-privilege requirements).
Per Microsoft's identity platform guidance, OIDC is the protocol used for authentication, which is precisely the mechanism this standard mandates.
Within AuthN, the identity provider and the credential mechanism are independent decisions,
and teams MUST be able to state the credential mechanism, not only the identity provider.

**Identity provider (who the workload is):**

For nearly all MoJ teams this is Entra ID (Azure AD), the org-wide SSO.
This is true regardless of how any individual workflow authenticates,
so “we use Entra ID” does not describe compliance.

**Credential mechanism (how the workflow proves it at runtime):**

This is what this standard governs. It MUST be one of: a short-lived OIDC federated token (compliant), or a stored long-lived secret (non-compliant, exception required).

An Entra ID app registration can use either mechanism:
a registration authenticating via a federated credential is compliant OIDC,
while the same registration authenticating via a client secret is a long-lived credential.
“We use Entra ID” and “this is long-lived” are frequently both true at once.

When establishing a workflow's posture, teams MUST ask questions that name the mechanism directly:

- **AWS:**
  - Does the workflow assume an IAM role via aws-actions/configure-aws-credentials with role-to-assume and `id-token: write`?
  - Does the workflow use a stored AWS access key and secret in GitHub secrets?
- **Azure:**
  - Does the Entra app registration use a federated credential (no stored secret), or a client secret / certificate
  - Does the workflow use azure/login with `id-token: write`?
- Is the flagged workflow file actively used in the repository, or is it a dormant workflow that has been left in the repo?
- Are there any long-lived secrets stored in the repository, even if it's using OIDC for some workflows? (e.g., a stored AWS access key or Azure client secret)

## 3. Workflows Using `id-token: write` When Using OIDC

A workflow is performing OIDC if and only if the job:

- sets permissions: `id-token: write`; and
- uses a cloud-side role or identity assumption, such as:
  - `aws-actions/configure-aws-credentials` with `role-to-assume`
  - `azure/login` with a federated client-id
  - `google-github-actions/auth`

A workflow without `id-token: write` MUST NOT be treated as OIDC, because the runner cannot mint an OIDC token without it.
Where such a workflow also references `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`, `AZURE_CLIENT_SECRET`, or `GCP_SA_KEY`, it is long-lived.
This is the authoritative signal and is reported by the central audit tooling (moj-github-discovery) as the `has_id_token_write` field.

## 4. Exceptions for Long-lived Credentials

Before logging an exception, teams MUST first confirm the workflow is still in use.
Obsolete workflow files MUST be deleted rather than migrated or excepted.
Long-lived credentials MAY be retained only where one of the following applies:

1. The target service does not support OIDC federation.
2. OIDC is technically possible but not yet enabled by the platform team (temporary only; remediation MUST be tracked).
3. There is a lack of project support, ownership, or capacity to migrate.
  This is an organisational blocker and the exception MUST name the blocker,
  an accountable owner, and a target review date.
4. The credential is for a non-cloud-provider service, in which case it is out of scope for this standard but MUST follow general MoJ secret management guidance.

Where an exception applies, the team MUST:

- Record it in the team risk log with a justification and review date.
- Restrict the credential to least-privilege permissions.
- Use the naming convention below so audit tooling can discover it.
- Rotate it on a defined schedule of no longer than 90 days unless the platform team specifies otherwise.
  - An unrotated long-lived credential is a finding in its own right and MUST NOT be treated as a steady state.
- Review the exception at least annually.

## 5. Identifying High-Blast-Radius Repositories

Where a single repository controls a disproportionate share of an estate,
for example a DNS repository managing approximately 99.99% of MoJ DNS,
it MUST be classified as a Risk Asset and its migration prioritised,
even where its keys are least-privilege scoped.
Scope reduces the permissions blast radius but not the operational blast radius of the systems the repository governs.
For such repositories, “never rotated” combined with “no clear migration owner” MUST be escalated to team leadership rather than left in the risk log.

## 6. Credential and Variable Naming Convention

A standardised naming convention is required so that credential usage is discoverable by moj-github-discovery and workflows are readable across teams.
Non-standard names defeat automated scanning and MUST NOT be used.

OIDC role ARNs and regions are configuration, not secrets, and MUST be stored as GitHub Actions variables:

- **AWS:**
  - `AWS_ROLE_TO_ASSUME`
  - `AWS_REGION`
- **Azure:**
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`
- **GCP:**
  - `GCP_WORKLOAD_IDENTITY_PROVIDER`
  - `GCP_SERVICE_ACCOUNT`

Where long-lived credentials are retained under an exception, they MUST be stored as GitHub Actions secrets using these canonical names:

- **AWS:**
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_SESSION_TOKEN` (optional)
- **Azure:**
  - `AZURE_CREDENTIALS`
  - `AZURE_CLIENT_SECRET`
- **GCP:**
  - `GCP_SA_KEY`

Environment-specific values MUST be prefixed in upper case, for example `PROD_AWS_ROLE_TO_ASSUME` or `DEV_AWS_ACCESS_KEY_ID`.

The following MUST NOT be used:

- Custom or abbreviated names (`MY_AWS_KEY`, `ACCESS_TOKEN`, `CLOUD_KEY`, `K`, `SECRET1`)
- Personal or team-prefixed names (`JOHN_AWS_KEY`, `TEAM_X_AWS_SECRET`)
- Credentials stored as:

  - plaintext in workflow files
  - repository variables
  - `.env` files
  
Any occurrences of the above which MUST be treated as a security incident rather than a compliance deviation.

## 7. Flagged Repositories and the Verification Process

A long_lived_credentials classification from moj-github-discovery is a candidate for review, not a confirmed finding.
The scan cannot determine whether a flagged file is still in use, or whether a stored secret is live or dormant.
A flagged workflow MUST be resolved into one of three states:

1. Genuine long-lived — the workflow is live and uses a stored secret. It MUST be migrated to OIDC or covered by a logged exception.
2. False positive (obsolete file) — the flagged file is no longer in use. It MUST be deleted, not migrated.
3. Migrated, secrets dormant — the workflow already uses OIDC but old secrets remain in settings.
  3.1. The secrets MUST be deleted and the underlying identity disabled; until then the dormant credential is a live risk.

Teams MUST follow this resolution sequence for each flagged repository:

1. Confirm whether the file is live or obsolete (delete if obsolete);
1. If live, confirm the mechanism using the id-token: write test; if already OIDC, remove dormant secrets
1. If genuinely long-lived, triage need then migrate or log an exception capturing rotation cadence, least-privilege scope, and data-sensitivity / Risk Asset class
1. Record the verified posture with supporting maintainer confirmation in the remediation log.

## 8. Continuous Monitoring of Cloud Authentication Posture

Posture MUST be assessed continuously, not only at a point in time. `moj-github-discovery` runs against the estate and classifies each workflow as one of:

- `oidc`
- `long_lived_credentials`
- `mixed`
- `none`

A scheduled scan workflow has been developed via [moj-github-discovery ticket 160](https://github.com/moj-github-discovery/issues/160).
This workflow can be used to flag new long-lived credential usage.
Teams whose workflows are flagged MUST be contacted to migrate, delete an obsolete file, remove dormant secrets, or log an exception.

## Related Standards

This standard is the GitHub-Actions-specific application of MoJ’s wider secrets-management guidance and should be read alongside it.
The general controls for secret generation, approved secret stores, secret scanning, and incident response are covered by MoJ's secrets-management standard.
This standard does not restate them and focuses only on how GitHub Actions workflows authenticate to cloud providers.
SHA pinning of third-party actions is covered by MoJ's existing SHA-pinning guidance.

## Appendix A - Migration Walkthrough (AWS)

This appendix is informative only.
It shows the standard AWS migration path; equivalent flows for other providers and MoJ platforms are availale in [References](#references).

**1. Provision the OIDC identity provider in your AWS account:**

- This should be done once per account utilising the provider URL `https://token.actions.githubusercontent.com`.
- The audience claim should be set to `sts.amazonaws.com`.
- If it is absent, raise a request with the account owner.

**2. Create an IAM role for your workflow:**

The IAM role should have a trust policy scoped to the repository, branch, and environment that will be using it.
The role should have a least-privilege policy attached to it, scoped to the resources the workflow needs to access.

```json
{ 
    "Version": "2012-10-17", 
    "Statement": [ 
        { 
            "Effect": "Allow", 
            "Principal": { 
                "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com" 
            }, 
            "Action": "sts:AssumeRoleWithWebIdentity", 
            "Condition": { 
                "StringEquals": { 
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" 
                }, 
                "StringLike": { 
                    "token.actions.githubusercontent.com:sub": "repo:ministryofjustice/YOUR-REPO:ref:refs/heads/main" 
                } 
            } 
        }
    ] 
} 
```

Tighten the sub-claim further where possible, for example to a specific environment or tag.

**3. Attach a least-privilege policy to the role*:*

Grant only what the workflow needs; do not reuse a policy designed for human users.

**4. Update your workflow to use the OIDC role:**

An example workflow snippet is shown below.
The `id-token: write` permission is required to mint the OIDC token, and the `role-to-assume` input points to the IAM role created in step 2.
Ensure all actions are pinned to a full commit SHA, not a branch or tag, to avoid supply-chain compromise.

```yaml
permissions: 
    id-token: write 
    contents: read 

jobs:
    deploy: 
        runs-on: ubuntu-latest 
        steps: 
            - uses: actions/checkout@<full-commit-sha> 
            - name: Configure AWS credentials 
              uses: aws-actions/configure-aws-credentials@<full-commit-sha> 
              with: 
                role-to-assume: ${{ vars.AWS_ROLE_TO_ASSUME }} 
                aws-region: ${{ vars.AWS_REGION }} 
            - run: aws sts get-caller-identity 
```

**5. Validate the Workflow:**

Run against a non-production branch first; confirm with `aws sts get-caller-identity` that the assumed role and session permissions are correct.

**6. Remove Old Credentials:**

Delete the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets and disable or delete the underlying IAM user.
This step is the most often forgotten; until it is done the dormant key remains fully exploitable and the migration provides no security benefit.

## References

- [About security hardening with OpenID Connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [Azure: Workload identity federation with GitHub Actions](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-config-app-trust-github)
- [GCP: Workload Identity Federation with Deployment pipelines](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Microsoft: Authentication vs Authorization](https://learn.microsoft.com/en-us/entra/identity-platform/authentication-vs-authorization)
- [NCSC cloud security guidance](https://www.ncsc.gov.uk/collection/cloud)
- [GDS Service Standard](https://www.gov.uk/service-manual/service-standard)
- [Cloud Platform OIDC Usage Example](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/deploying-an-app/container-repositories/create.html)
- [Modernisation Platform OIDC Usage Example](https://user-guide.modernisation-platform.service.justice.gov.uk/user-guide/deploying-your-application.html#deploying-your-application)
