# GitHub Large File Storage (LFS) Governance Standard

- [Summary](#summary)
- [Objectives](#objectives)
- [Scope](#scope)
- [1. Repository Size Management](#1-repository-size-management)
- [2. Largefile-thresholds](#2-large-file-thresholds)
- [3. Mandatory Requirements](#3-mandatory-requirements)
- [4. Git LFS Usage](#4-git-lfs-usage)
- [5. Monitoring and Enforcement](#5-monitoring-and-enforcement)
- [7. Ownership and Accountability](#7-ownership-and-accountability)
- [References](#references)

## Summary

Git repositories are designed for source code and text-based artefacts.

The storage of large binary files directly within Git repositories can significantly impact:

- Repository performance
- Clone and fetch times
- Continuous Integration performance
- Storage consumption
- Developer productivity

GitHub provides Git Large File Storage (Git LFS) specifically to manage large binary assets without increasing repository history unnecessarily.

This standard defines repository file-size controls and Git LFS requirements for Ministry of Justice GitHub organisations.

---

## Objectives

This standard aims to:

- Maintain repository performance.
- Reduce repository bloat.
- Improve CI/CD efficiency.
- Standardise Git LFS adoption.
- Prevent GitHub push failures.
- Improve estate-wide governance.

---

## Scope

This standard applies to:

- All repositories within Ministry of Justice GitHub organisations.
- Source code repositories.
- Infrastructure repositories.
- Template repositories.
- Internal and external repositories.

---

## 1. Repository Size Management

Repositories SHOULD contain:

- Source code
- Configuration
- Documentation
- Small static assets

Repositories SHOULD NOT contain:

- Large binary artefacts
- Backups
- Database exports
- Virtual machine images
- ISO files
- Build artefacts
- Generated content

Alternative storage locations SHOULD be used where appropriate.

---

## 2. Large File Thresholds

The following thresholds are mandatory.

### Soft Limit

**50 MB:**

Files at or above 50 MB MUST be reviewed.

Repository owners MUST determine whether:

- Git LFS should be used.
- The file is necessary.
- An alternative storage solution is appropriate.

### Hard Limit

**100 MB:**

Files at or above 100 MB MUST NOT be committed to repositories.

GitHub rejects files exceeding this threshold.

Any attempt to commit such files MUST be treated as non-compliant.

---

## 3. Mandatory Requirements

Repository owners MUST:

- Prevent unnecessary large files entering Git history.
- Use Git LFS for approved large binary assets.
- Maintain repository hygiene.
- Remove obsolete assets whenever practical.

Repositories MUST NOT use Git as a file-storage platform.

---

## 4. Git LFS Usage

Git LFS MUST be used where:

- Binary assets exceed 50 MB.
- Assets require versioning.
- Assets are retained within repository workflows.

Common examples include:

- Media files
- Machine-learning artefacts
- GIS datasets
- Large test datasets
- Compiled package assets

A repository using Git LFS MUST include:

- Appropriate `.gitattributes` configuration.
- Contributor guidance.
- Ownership responsibility for stored assets.

---

## 5. Monitoring and Enforcement

### Estate Scanning

An automated scan SHOULD be executed weekly to identify:

- Files above 50 MB.
- Repository growth trends.
- New policy violations.

Reporting SHOULD include:

- Repository name
- File path
- File size
- Recommended remediation

### CI Controls

Repositories SHOULD implement automated validation to:

- Warn when files exceed 50 MB.
- Prevent introduction of non-compliant assets.

### Pre-Push Enforcement

Local tooling SHOULD prevent committing files exceeding approved thresholds.

---

## 6. Remediation Requirements

Where a file exceeds policy thresholds, teams MUST choose one of the following:

### Option 1: Migrate to Git LFS

Move the asset into Git LFS management.

### Option 2: Use Alternative Storage

Store the asset externally using an approved platform.

### Option 3: Remove the Asset

Delete unnecessary content.

### Historical Repository Cleanup

Where repository history already contains significant large files, teams SHOULD:

- Assess impact.
- Consider repository cleanup.
- Use approved tooling such as git-filter-repo where appropriate.

History rewrites MUST be managed carefully due to downstream impact.

---

## 7. Ownership and Accountability

Repository owners are accountable for:

- Compliance with file-size policies.
- Git LFS management.
- Asset lifecycle management.
- Remediation of policy breaches.

Repositories without ownership MUST be investigated and assigned.

---

## 8. Exceptions

Exceptions MAY be granted where:

- Git LFS is technically unsuitable.
- A platform dependency exists.
- Business requirements prevent migration.

All exceptions MUST:

- Be documented.
- Include a justification.
- Include an owner.
- Include a review date.

Exceptions MUST be reviewed annually.

---

## 9. Governance and Reporting

Repository file-size compliance SHOULD be reviewed regularly.

Monitoring SHOULD focus on:

- Large-file trends.
- Repeat offenders.
- Repository growth.
- LFS adoption rates.

Recent estate analysis of the most active repositories identified:

- Strong compliance with GitHub file-size limits.
- Very low rates of large-file policy breaches.
- No breaches of GitHub’s hard file-size limit.

Ongoing monitoring should be maintained to preserve this compliance position and prevent repository degradation over time.

---

## References

- [GitHub Repository Limits Guidance](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits)
- [GitHub Large File Storage Documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [GitHub Repository Health Guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [NCSC Secure Development Guidance](https://www.ncsc.gov.uk/collection/developers-collection)
