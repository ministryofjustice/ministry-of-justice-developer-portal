---
owner_slack: "#Analytical-platform-notifications"
title: Data Sharing
last_reviewed_on: 2024-12-09
review_in: 6 months
source_repo: ministryofjustice/analytical-platform
source_path: platform/services/data-sharing.html.md.erb
ingested_at: "2026-04-09T10:46:01.592Z"
---

🌱 _Allows external and internal data to be shared via SFTP_

Based on [AWS Transfer Family](https://aws.amazon.com/aws-transfer-family/), the ingestion service allows secure transfers to AWS S3 services using SFTP, FTPS, FTP, and AS2 protocols and includes scanning for malicious files.

## Repositories

| Repository | Description |
| --- | --- |
| [Analytical Platform Ingestion Notify](https://github.com/ministryofjustice/analytical-platform-ingestion-notify)          | Image for the Analytical Platform Ingestion service. It is deployed as an AWS Lambda function within the analytical-platform-ingestion account  |
| [Analytical Platform Ingestion Scan](https://github.com/ministryofjustice/analytical-platform-ingestion-scan)          | This repository contains the image used in the Analytical Platform Ingestion service. It is deployed as an AWS Lambda function within the analytical-platform-ingestion account and is called as part of the AWS Transfer Family Server workflows  |
| [Analytical Platform Ingestion Transfer](https://github.com/ministryofjustice/analytical-platform-ingestion-transfer)          | This repository contains the image  used in the Analytical Platform Ingestion service. It is deployed as an AWS Lambda function within the analytical-platform-ingestion account  |

## Useful links

| Link | Description |
| --- | --- |
| [User Guidance on Ingestion](https://user-guidance.analytical-platform.service.justice.gov.uk/tools/ingestion/) |Guidance on Ingestion  |
