# Ministry of Justice Developer Portal

A cross-government developer portal inspired by [Singapore's Government Developer Portal](https://developer.tech.gov.sg/), built with GOV.UK styles.

**Status:** Alpha — this is a proof of concept.
**NOTE:** Current version of Node is pinned at 25.9.4 due to build issues with 25.9.5 (too new release)

## What it does

- **Product catalogue** — browse platforms, tools, and APIs available across government (mix of real MoJ platforms)
- **Documentation hub** — technical docs ingested automatically from source repositories (Cloud Platform, Modernisation Platform, Analytical Platform)
- **Guidelines** — standards and best practices organised by key themes, linking out to real cross-government resources including but not limited to:
  - Service Standard
  - Technology Code of Practice
  - NCSC guidance
  - MoJ AI Governance Framework
  - GOV.UK Design System
- **Community** — links to Slack channels, open source, events
- **AI chatbot** — contextual help assistant (mock responses in alpha)
- **Full-text search** — powered by [Pagefind](https://pagefind.app/)
- **MoJ Design System** — internal page showcasing design system patterns and components, with a subtle fade animation effect

## Tech stack

| Component     | Technology                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org/) (App Router, static export)               |
| Styles        | [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) v6 + Sass |
| Content       | Markdown with YAML frontmatter                                              |
| Search        | [Pagefind](https://pagefind.app/) (client-side, zero-dependency)            |
| Ingestion     | Node.js script that clones repos and converts `.html.md.erb` → `.md`        |
| Hosting       | Cloud Platform (containerised, Kubernetes)                                  |
| User Tracking | PostHog Cloud (Using native JS tooling)                                     |

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

Source repos are configured in [`sources.json`](sources.json).

### Build for production

```bash
npm run build
```

This runs `next build` followed by Pagefind indexing. Output is in `out/`.

### Build and test the containerized application locally

You can build and test the containerized application locally:

```bash
# Build the Docker image
make docker-build

# Run the container locally on port 8080
make docker-run
```

Open [http://localhost:8080](http://localhost:8080) to verify the containerized application works as expected.
This simulates the exact environment that will run in production, catching any container-related issues before deployment.

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

# # Run all PostHog tests
npx vitest run tests/unit/components/PostHog*.test.tsx
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

### Load Testing

The portal employs traffic:generate for load testing.

The following scripts are vital to know:

```bash
# Run traffic generation (see scripts/generate-pothog-traffic.mjs for details)
npm run traffic:generate -- --url http://localhost:3000 --dry-run
```

## Project structure

The project is structured with source code and tests in parallel (as in the example below).

````shell
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
````

## Content structure

```shell
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

Guidelines in `guidelines.json` can be either internal (rendered as portal pages) or external (linked out to the canonical source).
An entry with an `externalUrl` field links directly — no internal page is generated.

Current external links:

| Phase       | Resource                                                                                                                                            | Source |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Inception   | [GOV.UK Service Manual](https://www.gov.uk/service-manual)                                                                                          | GDS    |
| Inception   | [Service Standard](https://www.gov.uk/service-manual/service-standard)                                                                              | GDS    |
| Development | [GDS API Technical & Data Standards](https://www.gov.uk/guidance/gds-api-technical-and-data-standards)                                              | GDS    |
| Development | [NCSC Secure Development & Deployment](https://www.ncsc.gov.uk/collection/developers-collection)                                                    | NCSC   |
| Technology  | [Technology Code of Practice](https://www.gov.uk/guidance/the-technology-code-of-practice)                                                          | CDDO   |
| Technology  | [GOV.UK Design System](https://design-system.service.gov.uk/)                                                                                       | GDS    |
| Standards   | [MoJ AI Governance Framework](https://technical-guidance.service.justice.gov.uk/documentation/governance/ai-governance-framework.html#introduction) | MoJ    |
| Standards   | [NCSC Cloud Security Guidance](https://www.ncsc.gov.uk/collection/cloud-security)                                                                   | NCSC   |
| Measuring   | [Measuring service performance](https://www.gov.uk/service-manual/measuring-success)                                                                | GDS    |

Detailed documentation source setup and ingestion workflow are described in [docs/templates/spec-documentation.md](docs/templates/spec-documentation.md).

### Webhook-driven updates

Source repos can trigger re-ingestion automatically using `repository_dispatch`.
See [`.github/workflows/notify-portal.yml.example`](.github/workflows/notify-portal.yml.example) for a workflow to add to source repos.

## GitHub Actions

| Workflow                                               | Trigger                        | Purpose                                            |
| ------------------------------------------------------ | ------------------------------ | -------------------------------------------------- |
| [`ingest.yml`](.github/workflows/ingest.yml)           | Schedule (6h), manual, webhook | Ingest external docs and commit updates            |
| [`deploy-dev.yml`](.github/workflows/deploy-dev.yml)   | Push to main, manual           | Build image, push to ECR, deploy to dev namespace  |
| [`deploy-prod.yml`](.github/workflows/deploy-prod.yml) | Manual                         | Build image, push to ECR, deploy to prod namespace |
| [`preview.yml`](.github/workflows/preview.yml)         | Pull request                   | Dry-run ingest + build check                       |

## Deployment

### Cloud Platform (containerised)

This repository deploys to Cloud Platform via dedicated dev and prod GitHub workflows.
The container image is built from the included `Dockerfile`, pushed to ECR, and deployed to Kubernetes using environment-scoped credentials.

#### Required GitHub Actions secrets

The deploy workflows expect separate Kubernetes credentials for dev and prod:

| Environment | Required secrets                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Dev         | `ECR_ROLE_TO_ASSUME`, `DEV_KUBE_CLUSTER`, `DEV_KUBE_NAMESPACE`, `DEV_KUBE_CERT`, `DEV_KUBE_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
| Prod        | `PROD_ECR_ROLE_TO_ASSUME`, `PROD_KUBE_CLUSTER`, `PROD_KUBE_NAMESPACE`, `PROD_KUBE_CERT`, `PROD_KUBE_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |

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

#### Search Indexing (Interim)

- `public/robots.txt` contains temporary crawler guidance for Issue #299.
- Core pages remain indexable; high-risk/utility paths are disallowed (`/search`, `/api/`, `/_next/`, and parameterized URLs via `/*?*`).
- Rules are intended to be reviewed after automated refresh work in Issue #281 is complete.

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

## Checking dependency updates

When updating dependencies or changing `overrides` in `package.json`, verify the dependency tree from a clean install before merging.

### 1. Reinstall dependencies

```sh
rm -rf node_modules package-lock.json
npm install
```

### 2. Check for vulnerabilities

```sh
npm audit
```

The audit should complete without reporting vulnerabilities.

This project currently uses an npm override for `postcss` because `next` can otherwise resolve a nested `postcss` version that is flagged by `npm audit`.

To inspect how `postcss` is being resolved:

```sh
npm explain postcss
npm ls postcss
```

### 3. Run validation and tests

```sh
npm run validate:all
npm run spellcheck
npm test
npm run test:coverage
```

### 4. Check the application builds

```sh
npm run build
```

This also runs the design system asset sync and Pagefind indexing.

### 5. Check ingestion still works

```sh
npm run ingest:dry-run
npm run ingest:build
```

### 6. Run end-to-end tests

```sh
npm run test:e2e
```

If Playwright browsers are not installed locally, run:

```sh
npx playwright install
```

Then rerun the end-to-end tests.

### 7. Manually smoke test the app

```sh
npm run dev
```

Check that:

- the homepage loads
- documentation/content pages load
- search works after a production build
- MoJ/GOV.UK styles and assets render correctly
- catalogue/cards/navigation pages still behave as expected
- there are no obvious browser console errors

### Minimum checks before merging

At a minimum, run:

```sh
npm audit
npm run validate:all
npm test
npm run build
npm run ingest:dry-run
```

For higher confidence, run the full set of checks above, including coverage, ingestion build, end-to-end tests, and a manual smoke test.

## Licence

[MIT](LICENCE)
