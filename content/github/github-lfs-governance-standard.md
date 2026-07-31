# GitHub Large File Storage (LFS) governance standard

- [Summary](#summary)
- [Objectives](#objectives)
- [Scope](#scope)
- [Repository size management](#repository-size-management)
- [Large file thresholds](#large-file-thresholds)
- [Mandatory requirements](#mandatory-requirements)
- [Git LFS usage](#git-lfs-usage)
- [Monitoring and enforcement](#monitoring-and-enforcement)
- [Ownership and accountability](#ownership-and-accountability)
- [References](#references)

## Summary

Git repositories are designed for source code and text-based artefacts.

The storage of large binary files directly within Git repositories can significantly impact

- Repository performance
- Clone and fetch times
- Continuous Integration performance
- Storage consumption
- Developer productivity

GitHub provides Git Large File Storage (Git LFS) specifically to manage large binary assets without increasing repository history unnecessarily.

This standard defines repository file-size controls and Git LFS requirements for Ministry of Justice GitHub organisations.

---

## Objectives

This standard aims to

- Maintain repository performance
- Reduce repository bloat
- Improve CI/CD efficiency
- Standardise Git LFS adoption
- Prevent GitHub push failures
- Improve estate-wide governance

---

## Scope

This standard applies to

- All repositories within Ministry of Justice GitHub organisations
- Source code repositories
- Infrastructure repositories
- Template repositories
- Internal and external repositories

---

## Repository size management

Repositories **should** contain

- Source code
- Configuration
- Documentation
- Small static assets

Repositories **should** not contain

- Large binary artefacts
- Backups
- Database exports
- Virtual machine images
- ISO files
- Build artefacts
- Generated content

Alternative storage locations **should** be used where appropriate.

---

## Large file thresholds

The following thresholds are mandatory

### Soft limit (50 MB)

Files at or above 50 MB **must** be reviewed.

Repository owners **must** determine whether:

- Git LFS **should** be used.
- The file is necessary.
- An alternative storage solution is appropriate.

### Hard limit (100 MB)

Files at or above 100 MB **must not** be committed to repositories.

GitHub rejects files exceeding this threshold.

Any attempt to commit such files **must** be treated as non-compliant.

---

## Mandatory requirements

Repository owners **must**

- Prevent unnecessary large files entering Git history
- Use Git LFS for approved large binary assets
- Maintain repository hygiene
- Remove obsolete assets whenever practical

Repositories **must not** use Git as a file-storage platform.

---

## Git LFS usage

Git LFS **must** be used where

- Binary assets exceed 50 MB
- Assets require versioning
- Assets are retained within repository workflows

Common examples include

- Media files
- Machine-learning artefacts
- GIS datasets
- Large test datasets
- Compiled package assets

A repository using Git LFS **must** include

- Appropriate `.gitattributes` configuration
- Contributor guidance
- Ownership responsibility for stored assets

---

## Monitoring and enforcement

### Estate scanning

An automated scan **should** be executed weekly to identify

- Files above 50 MB
- Repository growth trends
- New policy violations

Reporting **should** include

- Repository name
- File path
- File size
- Recommended remediation

### CI controls

Repositories **should** implement automated validation to

- Warn when files exceed 50 MB
- Prevent introduction of non-compliant assets

### Pre-Push enforcement

Local tooling **should** prevent committing files exceeding approved thresholds.

---

## Remediation requirements

Where a file exceeds policy thresholds, teams **must** choose one of the following

### Option 1: Migrate to Git LFS

Move the asset into Git LFS management.

### Option 2: Use alternative storage

Store the asset externally using an approved platform.

### Option 3: Remove the asset

Delete unnecessary content.

### Historical repository cleanup

Where repository history already contains significant large files, teams **should**

- Assess impact
- Consider repository cleanup
- Use approved tooling such as git-filter-repo where appropriate

History rewrites **must** be managed carefully due to downstream impact.

---

## Ownership and accountability

Repository owners are accountable for

- Compliance with file-size policies
- Git LFS management
- Asset lifecycle management
- Remediation of policy breaches

Repositories without ownership **must** be investigated and assigned.

---

## Exceptions

Exceptions **may** be granted where

- Git LFS is technically unsuitable
- A platform dependency exists
- Business requirements prevent migration

All exceptions **must**

- Be documented
- Include a justification
- Include an owner
- Include a review date

Exceptions **must** be reviewed annually.

---

## Governance and reporting

Repository file-size compliance **should** be reviewed regularly.

Monitoring **should** focus on

- Large-file trends
- Repeat offenders
- Repository growth
- LFS adoption rates

Recent estate analysis of the most active repositories identified

- Strong compliance with GitHub file-size limits
- Very low rates of large-file policy breaches
- No breaches of GitHub’s hard file-size limit

Ongoing monitoring **should** be maintained to preserve this compliance position and prevent repository degradation over time.

---

## References

- [GitHub repository limits guidance](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits)
- [GitHub Large File Storage documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [GitHub repository health guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [NCSC Secure Development Guidance](https://www.ncsc.gov.uk/collection/developers-collection)
