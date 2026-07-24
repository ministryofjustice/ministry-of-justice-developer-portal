# GitHub Repository Archival

- [GitHub Repository Archival](#github-repository-archival)
  - [Executive Summary](#executive-summary)
  - [Context and Problem Statement](#context-and-problem-statement)
  - [Objectives](#objectives)
  - [Definition of "Archived"](#definition-of-archived)
  - [Signals of Candidacy for Archival](#signals-of-candidacy-for-archival)
    - [1. Activity Signals](#1-activity-signals)
    - [2. Operational Signals](#2-operational-signals)
    - [3. Usage Signals](#3-usage-signals)
    - [4. Ownership Signals](#4-ownership-signals)
    - [5. Edge Cases](#5-edge-cases)
  - [Proposed Archival Process](#proposed-archival-process)
  - [Archive Management](#archive-management)
  - [De-Archival Process](#de-archival-process)

## Executive Summary

**Overview:**

The current GitHub estate contains over 4,000 repositories, with more than half marked as archived. The use of archiving is inconsistent and lacks defined standards.

The result:

- Huge volumes of stale repositories,  
- Possible security risks from public archived repositories with retained secrets,
- Reduced visibility of active, maintained services,  
- Gaps in ownership and governance,
- Possible FinOps considerations,
- Inappropriately managed services.  

Without a consistent approach, archived repositories may expose risk and generate operational noise.

**Proposal:**

Introduce a standardised approach to archival across MoJ including:

- Clear criteria for when a repository should be archived,
- A defined archival process,
- Security standards to ensure archived repositories are non-operational,
- Governance and review standards for compliance management.

**Key Principles:**

This standard is built upon:

- **Safety first:** archived repositories must not contain active secrets, deployments, integrations, pipelines, workflows, or actions.
- **Clarity:** active and inactive repositories should be clearly distinguishable.
- **Signals for archival:** archival is based upon a combination of usage, ownership, and operational signals vs arbitrary timelines.
- **Controlled lifecycles:** archival/unarchiving should be defined procedures.

**Key Recommendations:**

- Define and adopt a clear definition for “archived”,
- Introduce signal-based criteria to identify archival candidates for review,
- Implement a mandatory process:
  - Removal of secrets and tokens,
  - Disabling workflows and interactions,
  - Closure of issues and pull requests.
- Default archived repositories to a private visibility,
- Introduce regular review cycles to identify candidates and maintain standards,
- Consider segregation of archived and active repositories for clarity and governance.

**Key Benefits:**

- Reduced security exposure,
- Reduced attack surface,
- Improved visibility,
- Stronger ownership and governance,
- Reduced estate complexity,
- Reduced operational overhead,
- Potential for FinOps/GreenOps optimisation.

## Context and Problem Statement

The current GitHub estate for the `ministryofjustice` organisation contains approximately:

- 4,600 repositories
- 2,400 archived repositories (~52%)
- 1,400 public archived repositories (~30% of total, ~58% of archived)

There is currently no consistent definition of what “archived” means, and the archive flag is applied inconsistently.

As a result:

- Archived repositories may still contain open issues and pull requests,  
- Secrets, tokens, integrations, workflows, deployments, and/or pipelines may remain active,  
- Public archived repositories increase exposure risk,  
- Ownership is unclear or absent for many repositories,  
- An unusually large portion of the estate is stale, reducing visibility of active services.

This creates:

- Security risks,
- Operational noise,
- Governance and ownership gaps,

## Objectives

This standard aims to introduce a standardised approach to archival including:

- Defining a clear and consistent standard for repository archival  
- Establishing signals and criteria for identifying archival candidates  
- Defining a safe and controlled archival process  
- Introducing governance and review mechanisms  
- Reducing estate noise while improving security and clarity  

We must also consider how to implement this incrementally to apply to the current estate.

## Definition of "Archived"

A repository is considered archived when:

> It is no longer actively developed, deployed, or required for operational use, and is retained only for reference, audit, or historical purposes.

An archived repository must be:

- Immutable (no further changes expected – or possible),  
- Non-executable (no pipelines, deployments, or integrations),  
- Non-sensitive (no active secrets or credentials)
- Remain clearly owned (CODEOWNERS must be defined, and a team assigned to the repository).

## Signals of Candidacy for Archival

To monitor candidacy for archival, we should define signal-based criteria to identify and manage archival processes.
This proposal focuses on setting the ongoing standards, recommendations for managing the current estate in its existing format will be provided via addendum.

Archival should occur when multiple signals are displayed. All mandatory signals (bold) must be present for archival.

### 1. Activity Signals

- No commits within a period of 12 months,
- No recent pull requests,
- No active contributors.  

### 2. Operational Signals

- **No active deployments**
- **No linked environment/namespace**
- **No CI/CD relevance**

### 3. Usage Signals

- Low/no traffic (clones, views, forks, etc.)
- **No dependencies (internal or external)**

### 4. Ownership Signals

- **No active owners (CODEOWNERS or team)**
- Service is retired or replaced by another service

### 5. Edge Cases

Some repositories will trigger a candidacy for archival erroneously.
In these cases, repositories may be retained as active or classified with adhoc labels to indicate their status. Examples include:

- Libraries infrequently updated but still in use,
- Infrastructure used only for bootstrapping or initialisation of other services,
- Template Repositories

## Proposed Archival Process

To remain consistent, an archival process which is repeatable and clearly defined is required broken down into:

1. Pre-archival checks
2. Security and Deactivation
3. Access Control
4. Application of Status
5. Relocation.

**1. Pre-Archival Checks:**

- Confirm usage and mandatory criteria,
- Identify current (or candidate) CODEOWNERS,
- Verify no downstream consumers,
- Triage and close open issues/pull requests,
- Update README with:
  - Archival status,
  - Reason for archival,
  - Date of archival.

**2. Security and Deactivation:**

- Remove all secrets (AWS, repository, environment),
- Revoke any tokens and credentials,
- Disable GitHub Actions,
- Remove/disable any webhooks and external integrations,
- Disable any relevant GitHub Apps,
- Decommission in cloud platform.

**3. Access Control:**

- Review visibility and set to private/internal.
- Ensure no data is exposed.
- Restrict write access.

**4. Application of Status:**

- Apply the GitHub archive flag,
- Confirm the repository is made read-only,

**5. (Optional) Relocation:**

- Move to a dedicated archival organisation

Benefits of relocation to an archive organisation include:

- Reduced congestion of the primary Ministry of Justice GitHub Organisation,
- Clear management and separation of active and inactive services,
- Application of stricter governance which can be implemented with greater ease.  

## Archive Management

Archived repositories should be:

- Readable internally,
- Not modified,
- Not contain integrations of secrets,
- Not be in production.

Should any of this change for any reason, the repository should undergo a formal de-archival process.

## De-Archival Process

This process is recommended as an outline only and should not be common practice.
Ultimately, archival should be considered final and irrevocable except in extreme or extenuating circumstances.
The following steps must be followed:

- A clear justification provided,
- Approval obtained from relevant stakeholders,
- Ownership assigned (if not already present) or reassigned,
- A security review conducted,
- Pipelines, dependencies, and integrations revalidated,
- Migrated back to the main organisation.

**Dependency Considerations:**

Before archiving, it must be confirmed if the repository is consumed by other repositories or is used in build or deployment processes.
If dependencies exist, then consumers must be migrated away, or the repository should remain active and supported.

**Governance and Ownership:**

All repositories should have a defined owner and where ownership cannot be identified, repositories should be flagged and reviewed.  

For archived repositories ownership may remain with the original team or be transferred to a central governance or platform team depending on the situation.

**Review and Enforcement:**

An exercise must be regularly undertaken to identify new candidates for archival and review existing archived repositories.
It is recommended this is scheduled quarterly with cadence reviewed annually.
Whilst a cadence is defined for formal checks, a repository can be migrated to archived at any point by the repository's `CODEOWNERS` subject to the defined critera.

**The following enforcement mechanisms are recommended:**

- Automated reporting to identify repositories with no activity/owner. Archived repositories which do not currently meet archival criteria.
- Dashboards (in the developer portal) to create visibility of active and archived repositories alongside compliance with standards.
- In conjunction with mandated code owners, teams can be held accountable for inappropriately archived repositories.
