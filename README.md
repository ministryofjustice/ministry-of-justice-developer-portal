# Ministry of Justice Developer Portal

A cross-government developer portal inspired by [Singapore's Government Developer Portal](https://developer.tech.gov.sg/), built with GOV.UK styles.

**Status:** Alpha — this is a proof of concept.

## What it does

- **Product catalogue** — browse platforms, tools, and APIs available across government (mix of real MoJ platforms)
- **Documentation hub** — technical docs ingested automatically from source repositories (Cloud Platform, Modernisation Platform, Analytical Platform)
- **Guidelines** — standards and best practices organised by project lifecycle phase, linking out to real cross-government resources (Service Standard, Technology Code of Practice, NCSC guidance, MoJ AI Governance Framework, GOV.UK Design System, and more)
- **Community** — links to Slack channels, open source, events
- **AI chatbot** — contextual help assistant (mock responses in alpha)
- **Full-text search** — powered by [Pagefind](https://pagefind.app/)
- **MoJ Design System** — internal page showcasing design system patterns and components, with a subtle fade animation effect

## Tech stack

| Component | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, static export) |
| Styles | [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) v6 + Sass |
| Content | Markdown with YAML frontmatter |
| Search | [Pagefind](https://pagefind.app/) (client-side, zero-dependency) |
| Ingestion | Node.js script that clones repos and converts `.html.md.erb` → `.md` |
| Hosting | Cloud Platform (containerised, Kubernetes) |

## Getting started

### Prerequisites

- Node.js 22+
- npm

### Run locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Ingest real documentation

The portal can pull documentation from external GitHub repositories:

```bash
# Ingest all enabled sources (clones repos, converts docs)
npm run ingest

# Preview what would be ingested without writing files
npm run ingest:dry-run

# Ingest a specific source only
node scripts/ingest.mjs cloud-platform

# Ingest and then build
npm run ingest:build
```

Source repos are configured in a single registry: [`sources.json`](sources.json).
Each source has an `onboardingMode` flag:

- `manual` for PR-managed entries
- `automated` for self-service registered entries

#### `portal.yaml` override contract

`sources.json` remains the source of truth for `id`, `repo`, `branch`, `format`, and `enabled`.
Self-service registrations write to this same file with `onboardingMode: automated`.

The ingestion script supports only these overrides from source repository `portal.yaml`:

- `docs.path`
- `owner_slack`

All other source-selection fields must be changed in `sources.json`.

### Build for production

```bash
npm run build
```

This runs `next build` followed by Pagefind indexing. Output is in `out/`.

### Unit Testing

The portal employs Vitest for lightweight, fast unit testing. Tests should be named under the convention `*.test.ts`.

The following scripts are vital to know:

```bash
# Run all unit tests located in the unit directory.
npm run test

# Run all unit tests and generate a coverage report
npm run test:coverage

# Run all unit tests via a clickable web browser for interactive reporting
npm run test:ui

# # Run all unit tests with the runner remaining open and running continuously as files change.
npm run test:watch
```

### E2E Testing

The portal employs Playwright for E2E testing. Tests should be named under the convention `*.spec.ts`.

The following scripts are vital to know:

```bash
# Run all E2E tests located in the E2E directory in headless mode. Use case: local test runs
npm run test:e2e

# Run all E2E tests located in the E2E directory in Playwright UI mode. Use case: running individual tests, debugging tests,
# and re-running quickly.
npm run test:e2e-ui

# Run all E2E tests located in the E2E directory in headed mode. Use case: allows you to observe the test run.
npm run test:e2e-headed

# Run all E2E tests located in the E2E directory in debug mode. Use case: allows you to step through the tests, pause actions,
# inspect selectors, and debug in finer detail.
npm run test:e2e-debug

```

## Project structure

The project is structured with source code and tests in parallel (as in the example below).

```
root/
├── src/                    
│   ├── app/
│   │   ├── community      
│   │   ├── contact-us
│   │   ├── docs
│   │   └── ...
│   ├── components/
│   └── lib/
├── tests/                    
│   ├── unit/
│   │   ├── app/      
│   │   │   ├── community
│   │   │   └── ...
│   │   ├── components/  
│   │   │   ├── breadcrumbs
│   │   │   └── ...
│   │   └── ../  
│   ├── e2e/
│   │   ├── smoke/      
│   │   │   ├── home
│   │   │   └── navigation
│   │   ├── a11y/  
│   │   │   ├── home
│   │   │   └── ...
│   │   ├── pages/  
│   │   │   ├── home
│   │   │   └── ...


### Common local commands

You can use the `Makefile` for common tasks:

```bash
make install
make ingest
make build
make docker-build IMAGE_URI=local/ministry-of-justice-developer-portal:dev
make k8s-apply-dev IMAGE_URI=<your-ecr-image-uri>
make smoke-dev
```

## Content structure

```
content/
├── docs/                    # Documentation (auto-generated by ingestion)
│   ├── cloud-platform/
│   │   ├── _meta.json       # Source metadata
│   │   ├── index.md
│   │   ├── getting-started/
│   │   └── ...
│   ├── modernisation-platform/
│   └── analytical-platform/
├── products/
│   └── products.json        # Product catalogue data
└── guidelines/
    └── guidelines.json      # Guidelines data (internal + external links)
```

## Template Contracts

- [Product template contract](docs/templates/spec-products.md)
- [Guideline template contract](docs/templates/spec-guidelines.md)
- [Documentation template contract](docs/templates/spec-documentation.md)
- [Community template contract](docs/templates/spec-community.md)

### Guidelines: internal vs external

Guidelines in `guidelines.json` can be either internal (rendered as portal pages) or external (linked out to the canonical source). An entry with an `externalUrl` field links directly — no internal page is generated.

Current external links:

| Phase | Resource | Source |
|---|---|---|
| Inception | [GOV.UK Service Manual](https://www.gov.uk/service-manual) | GDS |
| Inception | [Service Standard](https://www.gov.uk/service-manual/service-standard) | GDS |
| Development | [GDS API Technical & Data Standards](https://www.gov.uk/guidance/gds-api-technical-and-data-standards) | GDS |
| Development | [NCSC Secure Development & Deployment](https://www.ncsc.gov.uk/collection/developers-collection) | NCSC |
| Technology | [Technology Code of Practice](https://www.gov.uk/guidance/the-technology-code-of-practice) | CDDO |
| Technology | [GOV.UK Design System](https://design-system.service.gov.uk/) | GDS |
| Standards | [MoJ AI Governance Framework](https://technical-guidance.service.justice.gov.uk/documentation/governance/ai-governance-framework.html#introduction) | MoJ |
| Standards | [NCSC Cloud Security Guidance](https://www.ncsc.gov.uk/collection/cloud-security) | NCSC |
| Measuring | [Measuring service performance](https://www.gov.uk/service-manual/measuring-success) | GDS |

Detailed documentation source setup and ingestion workflow are described in [docs/templates/spec-documentation.md](docs/templates/spec-documentation.md).

### Webhook-driven updates

Source repos can trigger re-ingestion automatically using `repository_dispatch`. See [`docs/runbooks/notify-portal.yml.example`](docs/runbooks/notify-portal.yml.example) for a workflow to add to source repos.

Required notification contract:

- `event-type` must be `docs-update`
- `client_payload.source_id` must match an `id` in [`sources.json`](sources.json), or include registration fields for self-service creation
- source repo must provide GitHub App secrets:
    - `MOJ_DEV_PORTAL_ONBOARDING_APP_ID`
    - `MOJ_DEV_PORTAL_ONBOARDING_APP_PRIVATE_KEY`

Example payload:

```json
{
    "event_type": "docs-update",
    "client_payload": {
        "source_id": "cloud-platform"
    }
}
```

Self-service onboarding payload (register or update source automatically):

```json
{
    "event_type": "docs-update",
    "client_payload": {
        "source_id": "my-team-docs",
        "repo": "ministryofjustice/my-team-repo",
        "branch": "main",
        "docsPath": "docs",
        "format": "markdown",
        "owner_slack": "#my-team",
        "enabled": true
    }
}
```

When this payload is sent, the portal workflow creates or updates the source in [`sources.json`](sources.json)
with `onboardingMode: automated` and ingests only that source.

### Onboarding checklist for a new documentation source

1. Choose onboarding mode:
    - Managed: add source metadata in [`sources.json`](sources.json)
    - Self-service: send registration payload via `repository_dispatch`
2. Add source `portal.yaml` in upstream repository root (optional but recommended) for `docs.path`/`owner_slack` overrides.
3. Add notification workflow in source repo based on [`docs/runbooks/notify-portal.yml.example`](docs/runbooks/notify-portal.yml.example).
4. Set `MOJ_DEV_PORTAL_ONBOARDING_APP_ID` and `MOJ_DEV_PORTAL_ONBOARDING_APP_PRIVATE_KEY` as org-level secrets shared to source repos (or as repo secrets where needed).
5. Validate with a targeted manual run via ingest workflow using `source_id`.
6. Validate failure behavior with an invalid `source_id` (expect `No matching sources found`).
7. Confirm no-op behavior when ingestion content is unchanged (workflow should not commit).
8. Run portal checks: `npm run validate:all` and `npm run build`.

## GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| [`ingest.yml`](.github/workflows/ingest.yml) | Schedule (6h), manual, webhook | Ingest external docs and commit updates |
| [`deploy-dev.yml`](.github/workflows/deploy-dev.yml) | Push to main, manual | Build image, push to ECR, deploy to dev namespace |
| [`deploy-prod.yml`](.github/workflows/deploy-prod.yml) | Manual | Build image, push to ECR, deploy to prod namespace |
| [`preview.yml`](.github/workflows/preview.yml) | Pull request | Dry-run ingest + build check |

## Deployment

### Cloud Platform (containerised)

This repository deploys to Cloud Platform via dedicated dev and prod GitHub workflows. The container image is built from the included `Dockerfile`, pushed to ECR, and deployed to Kubernetes using environment-scoped credentials.

#### Required GitHub Actions secrets

The deploy workflows expect separate Kubernetes credentials for dev and prod:

| Environment | Required secrets |
|---|---|
| Dev | `ECR_ROLE_TO_ASSUME`, `DEV_KUBE_CLUSTER`, `DEV_KUBE_NAMESPACE`, `DEV_KUBE_CERT`, `DEV_KUBE_TOKEN` |
| Prod | `PROD_ECR_ROLE_TO_ASSUME`, `PROD_KUBE_CLUSTER`, `PROD_KUBE_NAMESPACE`, `PROD_KUBE_CERT`, `PROD_KUBE_TOKEN` |

These are provided by Cloud Platform module configuration (for this repository) once the relevant Cloud Platform PRs are merged.

#### Required GitHub Actions variables

The workflows also require:

- `ECR_REGION`
- `ECR_REPOSITORY`

Set these in GitHub Actions variables at repository level, or as environment variables in `dev` and `prod` if you need them to differ between environments.

#### Deployment workflows

- Dev deployment runs automatically on push to `main` and can also be run manually via `.github/workflows/deploy-dev.yml`.
- Prod deployment is manual-only via `.github/workflows/deploy-prod.yml`.

#### Runbooks

- [Cloud Platform deployment runbook](docs/runbooks/cloud-platform-deployment-runbook.md)
- [Documentation ingestion runbook](docs/runbooks/ingestion-runbook.md)
- [Source team docs ingestion onboarding](docs/runbooks/source-team-docs-ingestion-onboarding.md)

#### Runtime hardening

Both Kubernetes deployments apply a baseline container hardening profile:

- Pod-level `runAsNonRoot` with explicit UID/GID (`101`), and `seccompProfile: RuntimeDefault`
- `automountServiceAccountToken: false` for workloads that do not call the Kubernetes API
- Container-level `allowPrivilegeEscalation: false` and Linux capability drop (`ALL`)

This keeps the runtime aligned with Cloud Platform security expectations while remaining compatible with the current NGINX-based image.

#### Target domains

- Dev: `https://dev.developer-portal.service.justice.gov.uk`
- Prod: `https://developer-portal.service.justice.gov.uk`

#### Cutover from GitHub Pages

1. Merge Cloud Platform PRs that provision domains and GitHub secrets.
2. Merge this deployment branch to `main`.
3. Trigger/confirm successful dev deployment and smoke test (`/healthz` returns `ok`).
4. Trigger/confirm successful prod deployment and smoke test (`/healthz` returns `ok`).
5. After prod is serving from Cloud Platform, disable GitHub Pages in repository settings.

Keeping Pages enabled until prod verification avoids downtime during migration.

## Licence

[MIT](LICENCE)
