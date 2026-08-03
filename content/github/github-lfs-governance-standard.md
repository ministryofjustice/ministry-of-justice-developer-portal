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

- repository performance
- clone and fetch times
- continuous Integration performance
- storage consumption
- developer productivity

GitHub provides Git Large File Storage (Git LFS) specifically to manage large binary assets without increasing repository history unnecessarily.

This standard defines repository file-size controls and Git LFS requirements for Ministry of Justice GitHub organisations.

---

## Objectives

This standard aims to

- maintain repository performance
- reduce repository bloat
- improve CI/CD efficiency
- standardise Git LFS adoption
- prevent GitHub push failures
- improve estate-wide governance

---

## Scope

This standard applies to

- all repositories within Ministry of Justice GitHub organisations
- source code repositories
- infrastructure repositories
- template repositories
- internal and external repositories

---

## Repository size management

Repositories **should** contain

- source code
- configuration
- documentation
- small static assets

Repositories **should** not contain

- large binary artefacts
- backups
- database exports
- virtual machine images
- ISO files
- build artefacts
- generated content

Alternative storage locations **should** be used where appropriate.

---

## Large file thresholds

The following thresholds are mandatory

### Soft limit (50 MB)

Files at or above 50 MB **must** be reviewed.

Repository owners **must** determine whether

- Git LFS **should** be used
- the file is necessary
- an alternative storage solution is appropriate

### Hard limit (100 MB)

Files at or above 100 MB **must not** be committed to repositories.

GitHub rejects files exceeding this threshold.

Any attempt to commit such files **must** be treated as non-compliant.

---

## Mandatory requirements

Repository owners **must**

- prevent unnecessary large files entering Git history
- use Git LFS for approved large binary assets
- maintain repository hygiene
- remove obsolete assets whenever practical

Repositories **must not** use Git as a file-storage platform.

---

## Git LFS usage

Git LFS **must** be used where

- binary assets exceed 50 MB
- assets require versioning
- assets are retained within repository workflows

Common examples include

- media files
- machine-learning artefacts
- GIS datasets
- large test datasets
- compiled package assets

A repository using Git LFS **must** include

- appropriate `.gitattributes` configuration
- contributor guidance
- ownership responsibility for stored assets

---

## Monitoring and enforcement

### Estate scanning

An automated scan **should** be executed weekly to identify

- files above 50 MB
- repository growth trends
- new policy violations

Reporting **should** include

- repository name
- file path
- file size
- recommended remediation

### CI controls

Repositories **should** implement automated validation to

- warn when files exceed 50 MB
- prevent introduction of non-compliant assets

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

- assess impact
- consider repository cleanup
- use approved tooling such as git-filter-repo where appropriate

History rewrites **must** be managed carefully due to downstream impact.

---

## Ownership and accountability

Repository owners are accountable for

- compliance with file-size policies
- Git LFS management
- asset lifecycle management
- remediation of policy breaches

Repositories without ownership **must** be investigated and assigned.

---

## Exceptions

Exceptions **may** be granted where

- Git LFS is technically unsuitable
- a platform dependency exists
- business requirements prevent migration

All exceptions **must**

- be documented
- include a justification
- include an owner
- include a review date

Exceptions **must** be reviewed annually.

---

## Governance and reporting

Repository file-size compliance **should** be reviewed regularly.

Monitoring **should** focus on

- large-file trends
- repeat offenders
- repository growth
- **LFS** adoption rates

Recent estate analysis of the most active repositories identified

- strong compliance with GitHub file-size limits
- very low rates of large-file policy breaches
- no breaches of GitHub’s hard file-size limit

Ongoing monitoring **should** be maintained to preserve this compliance position and prevent repository degradation over time.

---

## References

- [GitHub repository limits guidance](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits)
- [GitHub Large File Storage documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [GitHub repository health guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [NCSC Secure Development Guidance](https://www.ncsc.gov.uk/collection/developers-collection)
