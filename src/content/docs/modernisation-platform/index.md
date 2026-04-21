---
owner_slack: "#modernisation-platform"
title: Modernisation Platform
last_reviewed_on: 2026-02-16
review_in: 6 months
weight: 0
source_repo: ministryofjustice/modernisation-platform
source_path: index.html.md.erb
ingested_at: "2026-04-09T10:46:00.947Z"
---

The Modernisation Platform is a hosting platform where Ministry of Justice teams can host and modernise applications which are not suitable for the [Cloud Platform](https://user-guide.cloud-platform.service.justice.gov.uk/#cloud-platform-user-guide).

This repository holds the Ministry of Justice's Modernisation Platform concepts, team information, team guide, and user guide to help onboard and support the users of our service.

## Who is this for?

This documentation is for anyone interested in the Modernisation Platform and its core concepts; for users of the Modernisation Platform; and for the team.

## User guide

- [Should I use the Cloud Platform, or the Modernisation Platform?](user-guide/cloud-platform-or-modernisation-platform)
- [Our offer to you](user-guide/our-offer-to-you)
- [Sustainability](user-guide/sustainability)

### Getting started

- [Creating environments (aka AWS accounts)](user-guide/creating-environments)
- [Creating networking resources](user-guide/creating-networking)
- [Accessing the AWS Console](user-guide/accessing-the-aws-console)
- [Getting AWS Credentials](user-guide/getting-aws-credentials)
- [Creating resources](user-guide/creating-resources)
- [Deploying your infrastructure](user-guide/deploying-your-infrastructure)
- [Deploying your application](user-guide/deploying-your-application)
- [Standard environment diagram](user-guide/environment-diagram)
- [Working as a Collaborator](user-guide/working-as-a-collaborator)
- [Production Ready Checklist](user-guide/production-ready-checklist)

### How to guides

- [Running Terraform plan locally](user-guide/running-terraform-plan-locally)
- [Accessing EC2s](user-guide/accessing-ec2s)
- [Wider MoJ Connectivity](user-guide/wider-moj-connectivity)
- [How to add VPC endpoints](user-guide/adding-vpc-endpoints)
- [How to configure DNS for public services](user-guide/how-to-configure-dns)
- [How to import a public SSL certificate into AWS Certificate Manager](user-guide/certificate-import)
- [How to view core account/shared resources as a Member Developer](user-guide/member-read-only-core-accounts)
- [How to use shared KMS keys](user-guide/how-to-use-shared-kms-keys)
- [How to integrate CloudWatch Alarms with PagerDuty and Slack](user-guide/integrating-alarms-with-pagerduty-with-slack)
- [How to set up automated patching](user-guide/automated-patching)
- [How to add an ECR for shared Docker images](user-guide/add-an-ecr-for-docker-images)
- [How to setup code scanning locally](user-guide/how-to-setup-code-scanning-locally)
- [How to setup secure commit for git hub](/docs/modernisation-platform/user-guide/how-to-setup-secure-commit)
- [Managing Terraform State](user-guide/managing-terraform-state)
- [How to add default tags](user-guide/how-to-add-default-tags)
- [How to Request an AMI License in an AWS Organization](user-guide/how-to-subscribe-to-ami)
- [How to edit / use the IAM hygiene workflow](user-guide/iam-hygiene-script)
- [Using Github Advanced Security and Code Scanning](user-guide/using-github-advanced-security)
- [Managing an exposed credentials incident](user-guide/iam-exposed-credential-response.html.md.erb)

## Concepts

### Environments (AWS Accounts)

- [The problem and our solution](concepts/environments/problem-and-solution)
- [Environment Architecture](concepts/environments/architecture)
- [Security](concepts/environments/security)
- [Single Sign On](concepts/environments/single-sign-on)
- [Backups](concepts/environments/backups)

### Shared services and tools

- [Auto-nuke](concepts/environments/auto-nuke)
- [Instance Scheduling - automatically stop non-production instances overnight](concepts/environments/instance-scheduling)
- [Platform user roles](user-guide/platform-user-roles)

### Networking

- [Networking approach](concepts/networking/networking-approach)
- [Networking Architecture Diagram](concepts/networking/networking-diagram)
- [Subnet CIDR Allocation](concepts/networking/subnet-allocation)
- [Subnet NACLs](concepts/networking/subnet-nacls)
- [Bastions and Instance Access](concepts/networking/instance-access-and-bastions)
- [DNS](concepts/networking/dns)
- [Certificate Services](concepts/networking/certificate-services)
- [Network Firewall](concepts/networking/network-firewall)
- [R53 Resolver DNS Firewall](concepts/networking/r53-resolver-dns-firewall)

### Security

- [Platform Logging Integration With Protective Monitoring (Cortex XSIAM)](concepts/security/integration-with-protective-monitoring)
- [Modernisation Platform Alarms](concepts/security/modernisation-platform-alarms)

### Software Development Lifecycle

- [Repositories](concepts/sdlc/repositories)
- [Core Workflows (CI/CD)](concepts/sdlc/core-workflow)
- [User Workflows (CI/CD)](concepts/sdlc/user-workflow)
- [Testing Strategy](concepts/sdlc/testing-strategy)
- [Sandbox and testing environments](concepts/sdlc/sandbox-testing-environments)
- [Patching](concepts/sdlc/patching)

## Modernisation Platform Team information

- [Our alliance](team/alliance)
- [Our roadmap](team/roadmap)
- [Our team](team/team)
- [Our vision](team/vision)
- [Our Terraform style guide](team/terraform-style-guide)
- [Our ways of engineering](team/ways-of-engineering)
- [Our ways of working](team/ways-of-working)
- [Operational Processes](team/operational-processes)

## Runbooks

- [Accessing AWS accounts](runbooks/accessing-aws-accounts)
- [Accessing the Observability Platform](runbooks/accessing-the-observability-platform)
- [Adding a new SSO user role](runbooks/adding-a-new-sso-user-role)
- [Adding a new team member to the Modernisation Platform](runbooks/adding-a-new-team-member)
- [Adding collaborators](runbooks/adding-collaborators)
- [Adding wider connectivity](runbooks/adding-wider-connectivity)
- [Applying VPN maintenance](runbooks/applying-vpn-maintenance)
- [Backup and Restore of Terraform Statefile & EC2](runbooks/backup-restore-process)
- [Changing environment (AWS account) details](runbooks/changing-environment-details)
- [Clean up of unused AMIs and unattached EBS volumes](runbooks/ami-and-ebs-cleanup)
- [CloudWatch networking alarms](runbooks/cloudwatch-networking-alarms)
- [Creating Automated Terraform Documentation](user-guide/creating-automated-terraform-documentation)
- [Creating new DNS zones](runbooks/creating-new-dns-zones)
- [Creating new Private DNS zones](runbooks/creating-new-private-dns-zones)
- [Creating VPCs](runbooks/creating-vpcs)
- [Deleting an environment (AWS account)](runbooks/deleting-an-environment)
- [Disaster recovery offering](runbooks/disaster-recovery)
- [Disaster recovery steps](runbooks/dr-process)
- [DoS Attack](runbooks/dos-attack)
- [Duty Rota](runbooks/duty-rota)
- [Enabling AWS Shield Advanced](runbooks/enabling-shield-advanced)
- [Environments-networks json explained](user-guide/environments-networks-json-explained)
- [How to create an AWS account for end users](runbooks/creating-accounts-for-end-users)
- [How to rotate secrets](runbooks/rotating-secrets)
- [How to update external status page](user-guide/how-to-update-pagerduty-status-page)
- [How VPCs access the internet](runbooks/how-vpcs-access-the-internet)
- [Investigate Indicator of Compromise (IoC) - Domain Name (DNS)](runbooks/investigate-a-domain)
- [Joining the team](runbooks/joining-the-team)
- [Manage an incident](runbooks/manage-an-incident)
- [Main Platform Runbook](runbooks/runbook)
- [Migrating an existing AWS account into the Modernisation Platform](runbooks/migrating-an-account-into-the-modernisation-platform)
- [Modifying Service Control Policies (SCPs)](runbooks/modifying-scps)
- [Querying CloudTrail logs with Athena](runbooks/using-athena)
- [Querying VPC flow logs](runbooks/querying-vpc-flow-logs)
- [Recreating the core-logging-production account](runbooks/recreate-core-logging-production-account)
- [Recreating the core-network-services account](runbooks/recreate-core-network-services-account)
- [Recreating the core-shared-services account](runbooks/recreate-core-shared-services-production)
- [Recreating the core-vpc-$environments accounts](runbooks/recreate-core-vpc-$environment-accounts)
- [Recreating the modernisation-platform account](runbooks/recreate-modernisation-platform-account)
- [Removing a team member from the Modernisation Platform](runbooks/removing-a-team-member)
- [Reviewing Dependabot PRs](runbooks/reviewing-dependabot-prs)
- [Reviewing MP Environments PRs](runbooks/reviewing-mp-environments-prs)
- [Revoke Network Access](runbooks/revoke-network-access)
- [Revoking User Access](runbooks/revoking-user-access)
- [S3/Cloudwatch Logs](runbooks/logging-audit-runbook)
- [SCIM Lambda Jobs for GitHub & Entra ID](runbooks/scim-lambda-runbook)
- [Security Monitoring](runbooks/security-monitoring)
- [Security Testing and ITHC](user-guide/security-testing-and-ithc)
- [Terraform](runbooks/terraform)
- [Useful scripts](runbooks/useful-scripts)
- [Using secrets in github workflows](runbooks/using-secrets-in-github-workflows)
- [Oracle License Discovery](runbooks/oracle-license-discovery)
- [Youth Justice Application Framework legacy create account](runbooks/yjaf-account-creation)
- [Youth Justice Application Framework legacy delete account](runbooks/yjaf-delete-account)
- [Youth Justice Application Framework legacy reset password](runbooks/yjaf-password-reset)

## Getting help

- [Ask for help](getting-help)

## Checking Modernisation platform status

To check the operational status of the Modernisation Platform click on the link below, this page will display the current status of any incidents as well as any planned maintenance windows.

[External status page](https://status.modernisation-platform.service.justice.gov.uk)
