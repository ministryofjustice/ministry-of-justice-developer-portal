# Cloud Platform Deployment Runbook

## Review Dates

- Last reviewed: 2026-04-24

## Scope

This runbook covers deployment of `ministryofjustice/ministry-of-justice-developer-portal` to Cloud Platform Kubernetes namespaces:

- `developer-portal-dev`
- `developer-portal-prod`

It documents required GitHub configuration, deployment flow, and operational kubectl commands.

## Canonical Repository and Workflow Links

- Repository: <https://github.com/ministryofjustice/ministry-of-justice-developer-portal>
- Dev deploy workflow file: <https://github.com/ministryofjustice/ministry-of-justice-developer-portal/blob/main/.github/workflows/deploy-dev.yml>
- Prod deploy workflow file: <https://github.com/ministryofjustice/ministry-of-justice-developer-portal/blob/main/.github/workflows/deploy-prod.yml>
- Smoke test script: <https://github.com/ministryofjustice/ministry-of-justice-developer-portal/blob/main/scripts/smoke-test.sh>
- Dev k8s manifest: <https://github.com/ministryofjustice/ministry-of-justice-developer-portal/blob/main/k8s/dev/deployment.yaml>
- Prod k8s manifest: <https://github.com/ministryofjustice/ministry-of-justice-developer-portal/blob/main/k8s/prod/deployment.yaml>

## GitHub Actions Configuration

### Repository Variables (Actions)

Set these at:
<https://github.com/ministryofjustice/ministry-of-justice-developer-portal/settings/variables/actions>

Required:

- `ECR_REGION`
- `ECR_REPOSITORY`

### Environment Secrets: Dev

Set these at:
<https://github.com/ministryofjustice/ministry-of-justice-developer-portal/settings/environments/dev>

Required:

- `DEV_ECR_ROLE_TO_ASSUME`
- `DEV_KUBE_CLUSTER`
- `DEV_KUBE_NAMESPACE`
- `DEV_KUBE_CERT`
- `DEV_KUBE_TOKEN`

Expected values:

- `DEV_KUBE_NAMESPACE=developer-portal-dev`
- `DEV_KUBE_CLUSTER` should be the full API server URL (for example `https://...eks.amazonaws.com`)
- `DEV_KUBE_CERT` should be the PEM CA cert (plain text)

### Environment Secrets: Prod

Set these at:
<https://github.com/ministryofjustice/ministry-of-justice-developer-portal/settings/environments/prod>

Required:

- `PROD_ECR_ROLE_TO_ASSUME`
- `PROD_KUBE_CLUSTER`
- `PROD_KUBE_NAMESPACE`
- `PROD_KUBE_CERT`
- `PROD_KUBE_TOKEN`

Expected values:

- `PROD_KUBE_NAMESPACE=developer-portal-prod`
- `PROD_KUBE_CLUSTER` should be the full API server URL
- `PROD_KUBE_CERT` should be the PEM CA cert (plain text)

## How To Add A New Environment/Namespace

Use this process for a new environment such as `staging`.

1. Provision namespace access in Cloud Platform for the new namespace (for example `developer-portal-staging`) and obtain:

- cluster API URL
- cluster CA cert
- service account token with namespace-scoped deploy permissions

1. Create a GitHub Environment (for example `staging`) at:

<https://github.com/ministryofjustice/ministry-of-justice-developer-portal/settings/environments>

1. Add environment secrets following existing naming conventions:

- `<ENV>_ECR_ROLE_TO_ASSUME`
- `<ENV>_KUBE_CLUSTER`
- `<ENV>_KUBE_NAMESPACE`
- `<ENV>_KUBE_CERT`
- `<ENV>_KUBE_TOKEN`

1. Add namespace manifests under `k8s/<env>/deployment.yaml` by copying an existing manifest and updating:

- namespace
- ingress host
- ingress class
- external-dns annotations (`aws-weight`, `set-identifier`)
- TLS secret name

1. Add a deploy workflow (for example `.github/workflows/deploy-<env>.yml`) by copying `deploy-dev.yml` or `deploy-prod.yml` and updating:

- `environment: <env>`
- secret names to `<ENV>_*`
- manifest path `k8s/<env>/deployment.yaml`
- smoke test hostname

1. Run workflow_dispatch for the new workflow and validate:

- rollout success in new namespace
- ingress created and synced
- smoke test returns `200` with body `ok`

1. Add operational commands for the new namespace in this runbook once verified.

## Deployment Flow

### Dev Deployment

Trigger options:

- Automatic on push to `main`
- Manual dispatch at: <https://github.com/ministryofjustice/ministry-of-justice-developer-portal/actions/workflows/deploy-dev.yml>

Execution sequence:

1. Validate required ECR variables/secrets.
2. Assume AWS role for ECR.
3. Build and push image to ECR using `docker buildx --platform linux/amd64`.
4. Configure kubectl context using `DEV_KUBE_*` secrets.
5. Apply `k8s/dev/deployment.yaml` with image replacement and namespace substitution.
6. Wait for rollout in `developer-portal-dev`.
7. Resolve ingress load balancer host to IP.
8. Run smoke test against `https://dev.developer-portal.service.justice.gov.uk/healthz`.

Note: smoke test uses `curl --resolve` internally to avoid transient DNS failures on GitHub runners.

### Prod Deployment

Trigger:

- Manual dispatch at: <https://github.com/ministryofjustice/ministry-of-justice-developer-portal/actions/workflows/deploy-prod.yml>

Execution sequence:

1. Validate required ECR variables/secrets.
2. Assume AWS role for ECR.
3. Build and push image to ECR using `docker buildx --platform linux/amd64`.
4. Configure kubectl context using `PROD_KUBE_*` secrets.
5. Apply `k8s/prod/deployment.yaml` with image replacement and namespace substitution.
6. Wait for rollout in `developer-portal-prod`.
7. Resolve ingress load balancer host to IP.
8. Run smoke test against `https://developer-portal.service.justice.gov.uk/healthz`.

## Cloud Platform Namespace Commands

Prerequisites:

- `kubectl` installed
- kubeconfig/context with access to Cloud Platform cluster

### Context and Namespace Helpers

```bash
kubectl config get-contexts
kubectl config current-context

# Optional convenience aliases
alias kdev='kubectl -n developer-portal-dev'
alias kprod='kubectl -n developer-portal-prod'
```

### Dev Namespace (`developer-portal-dev`)

```bash
kubectl -n developer-portal-dev get deploy,pods,svc,ing
kubectl -n developer-portal-dev rollout status deployment/developer-portal --timeout=180s
kubectl -n developer-portal-dev describe ingress developer-portal
kubectl -n developer-portal-dev get endpoints developer-portal -o wide
kubectl -n developer-portal-dev logs deployment/developer-portal --tail=100
```

Ingress direct health check (bypass local DNS):

```bash
LB=$(kubectl -n developer-portal-dev get ingress developer-portal -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl -skI -H 'Host: dev.developer-portal.service.justice.gov.uk' "https://${LB}/healthz"
```

### Prod Namespace (`developer-portal-prod`)

```bash
kubectl -n developer-portal-prod get deploy,pods,svc,ing
kubectl -n developer-portal-prod rollout status deployment/developer-portal --timeout=180s
kubectl -n developer-portal-prod describe ingress developer-portal
kubectl -n developer-portal-prod get endpoints developer-portal -o wide
kubectl -n developer-portal-prod logs deployment/developer-portal --tail=100
```

Ingress direct health check (bypass local DNS):

```bash
LB=$(kubectl -n developer-portal-prod get ingress developer-portal -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl -skI -H 'Host: developer-portal.service.justice.gov.uk' "https://${LB}/healthz"
```

## DNS Troubleshooting Quick Checks

```bash
# Public resolver

dig +short @8.8.8.8 dev.developer-portal.service.justice.gov.uk
dig +short @8.8.8.8 developer-portal.service.justice.gov.uk

# Local resolver path

dig +short dev.developer-portal.service.justice.gov.uk
dig +short developer-portal.service.justice.gov.uk
```

If local resolution fails but ingress host-header checks return `HTTP/2 200`, deployment is healthy and issue is DNS visibility/resolver path.

## Rollback Approach

Use rollout undo per namespace if a newly deployed ReplicaSet is unhealthy:

```bash
kubectl -n developer-portal-dev rollout undo deployment/developer-portal
kubectl -n developer-portal-prod rollout undo deployment/developer-portal
```

Then verify:

```bash
kubectl -n developer-portal-dev rollout status deployment/developer-portal
kubectl -n developer-portal-prod rollout status deployment/developer-portal
```
