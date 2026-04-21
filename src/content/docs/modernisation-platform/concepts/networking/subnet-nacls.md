---
owner_slack: "#modernisation-platform"
title: Subnet Access
last_reviewed_on: 2026-02-26
review_in: 6 months
source_repo: ministryofjustice/modernisation-platform
source_path: concepts/networking/subnet-nacls.html.md.erb
ingested_at: "2026-04-09T10:46:00.942Z"
---

This page summarises which ports and routes are open to what on the subnet sets.

## Allowed Traffic

### All Subnets (Data, Private, Public)

| Traffic type     | Port ranges  | Source/Destination                                                                                                                                          |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ingress & Egress | All          | Business unit VPC                                                                                                                                           |
| Ingress & Egress | All          | Inter business unit VPCs where requested                                                                                                                    |
| Ingress & Egress | All          | Private address ranges which are not part of the Modernisation Platform (Note, these will be blocked by the Firewall unless appropriate rules are in place) |
| Egress           | 443          | 0.0.0.0/0                                                                                                                                                   |
| Ingress          | 1024 - 65535 | 0.0.0.0/0                                                                                                                                                   |

### Public Subnets

| Traffic type | Port ranges  | Source/Destination |
| ------------ | ------------ | ------------------ |
| Ingress      | 443          | 0.0.0.0/0          |
| Ingress      | 1024 - 65535 | 0.0.0.0/0          |
| Egress       | All          | 0.0.0.0/0          |

### Protected Subnets (for VPC endpoints)

| Traffic type | Port ranges  | Source/Destination |
| ------------ | ------------ | ------------------ |
| Ingress      | 25           | Business unit VPC  |
| Ingress      | 443          | Business unit VPC  |
| Ingress      | 587          | Business unit VPC  |
| Ingress      | 5439         | Business unit VPC  |
| Egress       | 1024 - 65535 | Business unit VPC  |
