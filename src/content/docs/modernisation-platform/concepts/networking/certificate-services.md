---
owner_slack: "#modernisation-platform"
title: Certificate Services
last_reviewed_on: 2026-02-09
review_in: 6 months
source_repo: ministryofjustice/modernisation-platform
source_path: concepts/networking/certificate-services.html.md.erb
ingested_at: "2026-04-09T10:46:00.938Z"
---

## Public Certificates

There are two main ways to use public certificates for DNS on the Modernisation Platform; [ACM (Amazon Certificate Manager)](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview) public certificates, and Gandi.net certificates imported into ACM. Please see [How to configure DNS for public services](../../user-guide/how-to-configure-dns) for more information.

## Private Certificates

We provide a [Private root Certificate Authority (CA)](https://docs.aws.amazon.com/acm-pca/latest/userguide/PcaWelcome) in the [network services account and VPC](networking-approach.html#other-vpcs), along with subordinate production and non production CAs.

The subordinate CA's are then shared to the application environments via a [Resource Access Manager (RAM)](https://docs.aws.amazon.com/ram/latest/userguide/what-is) share (either production or non-production depending on the environment).

Certificates can then be created using the Private subordinate CA, the certificates remain local to the application environment.

![Certificate Services](../../images/certificate-services.png)
