---
owner_slack: "#modernisation-platform"
title: Modifying Service Control Policies (SCPs)
last_reviewed_on: 2026-03-19
review_in: 6 months
source_repo: ministryofjustice/modernisation-platform
source_path: runbooks/modifying-scps.html.md.erb
ingested_at: "2026-04-09T10:46:00.965Z"
---

We use the following SCPs for the Modernisation Platform to restrict certain actions at an account level.

| SCP                           | Location                                                                                                                                                                                                                             | Description                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Modernisation Platform Member | [`aws-root-account/management-account/terraform/organizations-policy-service-control.tf`](https://github.com/ministryofjustice/aws-root-account/blob/main/management-account/terraform/organizations-policy-service-control.tf#L288) | SCP for accounts with the account type of "member" |

The SCPs are modified in the `management-account` Terraform of the [aws-root-account](https://github.com/ministryofjustice/aws-root-account).

To make changes to these SCPs please raise a pull request against the [aws-root-account](https://github.com/ministryofjustice/aws-root-account) repository.
