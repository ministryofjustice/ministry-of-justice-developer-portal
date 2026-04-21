---
owner_slack: "#analytical-platform-notifications"
title: Analytical Platform
last_reviewed_on: 2024-12-19
review_in: 6 months
weight: 0
source_repo: ministryofjustice/analytical-platform
source_path: index.html.md.erb
ingested_at: "2026-04-09T10:46:01.568Z"
---

The Analytical Platform provides users with a place to ingest, store, and consume data.

This repository holds the Ministry of Justice’s Analytical Platforms published technical documentation and code to build its infrastructure for our users.

If you are a user of the Analytical Platform, please see our [User Guidance](https://user-guidance.analytical-platform.service.justice.gov.uk/).

## Overview

- [What is the Analytical Platform?](/docs/analytical-platform/platform/introduction/index)

## Architecture

- [Architecture Decision Records (ADR)](/docs/analytical-platform/adrs/adr-index)
- [Architecture diagrams](/docs/analytical-platform/diagrams/architecture-diagrams)
- [Wardley maps](/docs/analytical-platform/diagrams/wardley-maps/wardley-maps)

## Infrastructure

- [Containers](/docs/analytical-platform/platform/infrastructure/containers)
- [DNS](/docs/analytical-platform/platform/infrastructure/dns)
- [Developing the Analytical Platform](/docs/analytical-platform/platform/infrastructure/developing)
- [GitHub Actions](/docs/analytical-platform/platform/infrastructure/github-actions)
- [GitHub Actions self-hosted runners](/docs/analytical-platform/platform/infrastructure/self-hosted-runners)
- [Terraform](/docs/analytical-platform/platform/infrastructure/terraform)
- [QuickSight Interactions with IAM Policies](/docs/analytical-platform/platform/infrastructure/quicksight-interactions-with-iam-policies)

## Services

These are the services that we maintain and support as a platform. If you want to know what are our responsibilities then please see [Shared Responsibility Model](https://user-guidance.analytical-platform.service.justice.gov.uk/shared-responsibility-model.html#onboarding-and-offboarding).

| Service | Description |
| --- | --- |
| [Amazon Managed Workflows](documentation/platform/services/airflow) | Amazon Managed Workflows for Apache Airflow (Amazon MWAA) orchestrates your workflows using Directed Acyclic Graphs (DAGs) written in Python |
| [Control Panel](documentation/platform/services/analytical-platform-ui) | Provides users with data management and access to analytical tooling including Airflow, Jupyter notebooks, RStudio and VScode |
| [Create a Derived Table](documentation/platform/services/create-a-derived-table) | A service to allow you to schedule deployments of tables derived from data available on the Analytical Platform straight to Athena. |
| [Data Sharing](documentation/platform/services/data-sharing) | This service allows users to ingest data into their Analytical Platform data warehouse using protocols such as SFTP. |
| [Jupyter Lab](documentation/platform/services/jupyter-lab) | Provides a interactive notebook documents that allows users to create and share documents containing live code, equations, visualisations, and narrative text |
| [RStudio](documentation/platform/services/rstudio) | Integrated development environment (IDE) for R which integrates with git |
| [Visual Studio Code](documentation/platform/services/vscode) | Visual Studio Code provides data scientists with powerful tools for coding, debugging, and managing data, including integrated support for Jupyter Notebooks |

## Team information

### Internal Processes

- [Feature request](documentation/platform/team-processes/feature-requests)
- [Joining Our Team](/docs/analytical-platform/joining-our-team/index)
- [Runbooks](/docs/analytical-platform/runbooks/index)
- [Ways of Working](/docs/analytical-platform/ways-of-working/index)

## Who Are We?

Find our team on [MoJ People Finder](https://peoplefinder.service.gov.uk/teams/analytical-platform).
