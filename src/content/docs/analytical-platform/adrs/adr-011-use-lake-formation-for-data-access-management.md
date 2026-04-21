---
owner_slack: "#analytical-platform-notifications"
title: ADR-011 Use Lake Formation for data access management
last_reviewed_on: 2024-12-19
review_in: 6 months
source_repo: ministryofjustice/analytical-platform
source_path: adrs/adr-011-use-lake-formation-for-data-access-management.html.md.erb
ingested_at: "2026-04-09T10:46:01.564Z"
---

## Status

✅ Accepted

## Context

We use [IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction) to manage access to data based on resources. However, IAM lacks fine-grained access controls, such as column and row level permissions. Additionally, we are receiving increasing requests to share sensitive data [across accounts](/docs/analytical-platform/adrs/adr-009-use-separate-aws-accounts-for-data), where data producers want to control access to their own data. This highlights the need for solutions that allow more detailed access management and data governance.

## Decision

We have chosen to implement AWS [Lake Formation](https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation) to meet our needs for fine-grained data permissions and robust data governance. While IAM manages resource-based permissions, it does not offer the column and row level controls we require. Lake Formation addresses these gaps by providing fine-grained access management capabilities.

Additionally, Lake Formation supports our growing need to share sensitive data across accounts, enabling data producers to govern their own data. This solution not only enhances security and compliance but also streamlines the process of data sharing and management within our organization.

## Consequences

### General consequences

- We will need to support and maintain a Terraform module for teams to enable and configure Lake Formation
- Current methods for granting and revoking will need to be reviewed with users
- We will need to build and maintain a central tag repository to avoid tagging collisions
- We will still require a solution for unstructured data

### Advantages

- Enables secure data sharing across accounts. Data can stay within the account without the need for exporting or data pipelines which reduces duplication
- Integration with AWS Identity Center and our existing identity management system
- Improved data compliance with [security event logging](https://docs.aws.amazon.com/lake-formation/latest/dg/security-event-logging) and auditing capabilities
- We can give data owners direct control over who has access to their data
- Fine and coarse-grain access control with attributes from users Entra ID profile
- We can make use of tag based access control [TBAC](https://docs.aws.amazon.com/lake-formation/latest/dg/tag-based-access-control) also known as attribute-based access control [ABAC](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_attribute-based-access-control.html#introduction_attribute-based-access-control_compare-rbac). This reduces the number of access policies and roles

### Disadvantages

- Onboarding of datasets will need more up front work by engineers
