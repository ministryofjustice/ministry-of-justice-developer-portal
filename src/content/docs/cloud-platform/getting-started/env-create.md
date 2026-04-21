---
title: Creating a Cloud Platform environment
last_reviewed_on: 2025-03-05
review_in: 6 months
layout: google-analytics
source_repo: ministryofjustice/cloud-platform-user-guide
source_path: getting-started/env-create.html.md.erb
ingested_at: "2026-04-09T10:46:00.212Z"
owner_slack: "#cloud-platform"
---

## Overview

This is a guide to creating an environment (i.e. a `namespace`) for your service in the Cloud Platform's Kubernetes cluster.

In Kubernetes, [namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) provide a way to logically isolate your service and application from any others that reside on the Kubernetes cluster.

Creating a Cloud Platform environment is usually one of the first steps to complete when hosting your service on the Cloud Platform.

Once you have completed this guide, you will be able to [add AWS resources](/docs/cloud-platform/deploying-an-app/add-aws-resources) to your service, such as databases and ECR repositories, and perform `kubectl` commands against your namespace.

## Prerequisites

You will need to:

- be part of the `ministryofjustice` GitHub organisation
- be part of at least one GitHub team for your service
- have the [Cloud Platform CLI](/docs/cloud-platform/getting-started/cloud-platform-cli) installed

## Creating a Cloud Platform environment

Once you have met the prerequisites, you can create an environment in the Cloud Platform by following this process:

1. Clone the `cloud-platform-environments` repository and change directory into it

    ```sh
    $ git clone https://github.com/ministryofjustice/cloud-platform-environments.git
    $ cd cloud-platform-environments
    ```

2. Use the [Cloud Platform CLI](/docs/cloud-platform/getting-started/cloud-platform-cli) to create your namespace

    ```sh
    $ cloud-platform environment create
    ```

    The CLI will prompt you for details about your namespace, and automatically create the [appropriate Kubernetes and Terraform files](/docs/cloud-platform/reference/namespace-definition-files) in the correct location. Your namespace must meet the Ministry of Justice's [guidance on naming things](https://technical-guidance.service.justice.gov.uk/documentation/standards/naming-things).

3. Create a new branch, add your new files, and [create a pull request](https://github.com/ministryofjustice/cloud-platform-environments/pulls) in the `cloud-platform-environments` repository

    ```sh
    $ git checkout -b my-new-environment
    $ git add .
    $ git commit -m "Create namespace for my-new-environment"
    $ git push -u origin my-new-environment
    ```

4. Post your pull request in [#ask-cloud-platform](https://mojdt.slack.com/archives/C57UPMZLY)
5. Once approved by the Cloud Platform team, you can merge it
6. After your pull request is merged, the [Apply pipeline](/docs/cloud-platform/other-topics/concourse-pipelines) will create your namespace in the cluster

>**Note:** Please create one pull request per environment. This makes it easier for the Cloud Platform team to approve pull requests. If your pull request contains multiple environments, it will be automatically rejected.

## Next steps

Once you've created your environment and your pull request has been merged, you can:

- [authenticate to the cluster](/docs/cloud-platform/getting-started/kubectl-config) and [use `kubectl` to access your environment](/docs/cloud-platform/other-topics/quick-reference)
- [add AWS resources to your service](/docs/cloud-platform/deploying-an-app/add-aws-resources), like databases and ECR repositories, and [access the AWS console](/docs/cloud-platform/getting-started/accessing-the-cloud-console)
- follow the [Deploying a 'Hello World' application](/docs/cloud-platform/deploying-an-app/helloworld-app-deploy) guide
