# Local Kong OSS API Gateway MVP

This is a local-only experiment that puts Kong Gateway OSS in front of synthetic
responses for four API contracts found in Ministry of Justice repositories.
It does not call any real MoJ API, use production endpoints, or accept real
personal data or credentials.

The existing Developer Portal supplies the catalogue page. The alpha API
records are marked as prototypes and link to their source OpenAPI files. Their
source repository containing a specification does not prove that an API is
available, supported, approved for publication, or ready to be routed.

The first-pass GitHub search also found specification files in repositories
including `opg-pdf-service`, `opg-data-lpa-uid`, `opg-sirius`,
`hmpps-prisoner-to-nomis-update`, `hmpps-book-a-video-link-api`,
`hmpps-activities-management-api`, `cica-apply-data-capture-service`, and
`laa-civil-manage-api`. Some search hits may be generated or mock contracts;
this is not a complete or owner-verified API inventory.

## What this MVP demonstrates

- The portal can list API metadata, link to its OpenAPI specification and source
  repository, and show a local Gateway path.
- Kong declarative configuration maps those paths to mock upstream services.
- Kong's bundled JWT plugin verifies a short-lived RS256 test token.
- Kong's bundled rate-limiting plugin applies a per-consumer local limit of 60
  requests per minute.

The JWT is signed by a temporary key generated on this machine. This proves
basic JWT signature verification only. It does **not** implement OIDC discovery,
SSO login, issuer/audience policy, IdP key rotation, or MoJ identity-provider
integration. Kong's official OpenID Connect plugin is an Enterprise feature;
full OIDC remains an OSS gap to assess separately.

Kong is acting as a gateway, not as the business orchestration engine. The
existing `integration-hub-api-platform` repository already contains an
orchestration Lambda for its benefit-checker pilot. The synthetic upstreams
here only prove route and policy behaviour; they do not call that Lambda or
other live APIs.

The file-transfer route is only a mock of the ticket-control API. The actual
file contents should continue to upload directly to S3 using pre-signed URLs,
not pass through Kong.

## Start locally

From the Developer Portal repository root:

```bash
npm run mvp:kong:prepare
docker compose -f mvp/docker-compose.yml up --build
```

In another terminal, generate a five-minute local test token:

```bash
npm run --silent mvp:kong:token
```

Use the token with a route:

```bash
TOKEN="$(npm run --silent mvp:kong:token)"
curl -i http://127.0.0.1:8000/api/ualpa/v1/lpas \
  -H "Authorization: Bearer $TOKEN"
```

Try a request without a token to confirm that Kong rejects it:

```bash
curl -i http://127.0.0.1:8000/api/ualpa/v1/lpas
```

Other synthetic operations:

- `GET /api/benefit-checker/health`
- `POST /api/benefit-checker/v1/benefit-checks/assessments`
- `POST /api/file-transfer/transfer-tickets`
- `GET /api/ualpa/v1/lpas`
- `GET /api/manage-pom-cases/health`

All proxy and Admin API ports bind to loopback. The Kong Admin API is
unauthenticated and is for this local experiment only; do not expose these
ports to a shared network.

## Stop and reset

Stop containers with `Ctrl+C`, or run:

```bash
docker compose -f mvp/docker-compose.yml down
```

The generated keypair and rendered config are stored under the ignored
`mvp/.local/` directory. They are not committed. To rotate the local keypair,
stop the containers and remove that specific directory before running the
prepare command again.

## Boundaries and next decisions

- The API list is an initial discovery sample, not a complete inventory of
  MoJ APIs. The source repositories and specifications need owner review before
  entries are treated as supported or published.
- The mock APIs do not enforce each source API's contract or authorization
  scheme. Kong's one test JWT is not equivalent to each API's consumer access
  policy.
- OIDC/SSO requires either a separate authorization component or a Kong product
  with the official OIDC plugin. Do not treat this local JWT test as evidence
  that OSS meets the SSO requirement.
- No production deployment, external API call, real token, or real file upload
  is part of this MVP.
