---
title: Application Log Collection and Storage
last_reviewed_on: 2025-04-24
review_in: 6 months
layout: google-analytics
source_repo: ministryofjustice/cloud-platform-user-guide
source_path: logging-an-app/log-collection-and-storage.html.md.erb
ingested_at: "2026-04-09T10:46:00.214Z"
owner_slack: "#cloud-platform"
---

### Overview

The Cloud Platform automatically collects and stores your application logs, and lets you access them via an AWS-Hosted [OpenSearch].

### Log Collection

Logs are collected via [Fluentbit], which is a cluster-wide log collection service, with read permissions across the whole cluster. As long as your application logs to `stdout`, your logs will be collected.

### Log Storage

The logs are shipped to an AWS-Hosted OpenSearch cluster. All application logs are retained for 30 days.

---

### ModSec logging

If you have enabled ModSec WAF then the ModSec Audit logs are sent to a different OpenSearch cluster.

For more details and instructions to enable ModSec [see here](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/networking/modsecurity)

[Fluentbit]: https://fluentbit.io/
[OpenSearch]: https://app-logs.cloud-platform.service.justice.gov.uk/_dashboards/app/home#/
