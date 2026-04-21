---
owner_slack: "#analytical-platform-notifications"
title: ADR-002 Use Modernisation Platform for hosting infrastructure unsuitable for Cloud Platform
last_reviewed_on: 2024-12-19
review_in: 6 months
source_repo: ministryofjustice/analytical-platform
source_path: adrs/adr-002-use-moderisation-platform-for-hosting-infrastructure-not-suitable-for-cloud-platform.html.md.erb
ingested_at: "2026-04-09T10:46:01.560Z"
---

## Status

✅ Accepted

## Context

We need a location to host AWS workloads. Historically, the team has managed projects and products in the data space,
in their own AWS accounts. This approach has led to issues with misalignment of security baselines and independent
management of some AWS accounts.

The available options are:

- Self managed AWS accounts
- [Modernisation Platform](https://user-guide.modernisation-platform.service.justice.gov.uk/) managed AWS accounts

## Decision

We will use the Modernisation Platform for hosting infrastructure that is not suitable for [Cloud Platform](/docs/analytical-platform/adrs/adr-001-use-cloud-platform-for-hosting-infrastructure). Modernisation Platform is a managed public cloud platform endorsed by
Justice Digital. Features include centralised security, networking, monitoring and service wrap.

## Consequences

As a result of this decision we will benefit from all of the features documented in the [Modernisation User Guide](https://user-guide.modernisation-platform.service.justice.gov.uk/user-guide/our-offer-to-you).

In addition to the drawing on wider Platforms & Architecture expertise,
we will be able to take advantage of

- A defined security baseline out of the box
- Minimisation of clickops with restricted console access
- Github Actions bots already in place to maintain IaC quality (TFSEC / Checkov / CTFLint)
- PR approval workflows for infrastructure
- Cost effectiveness of re-use rather than build from scratch
- Sustainability with automatic tear-down of experimental environments
