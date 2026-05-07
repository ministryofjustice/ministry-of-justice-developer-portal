# Ingestion Bash + Python Quickstart

This quickstart is for maintainers who prefer Bash/Python workflows and do not
want to work directly with Node `.mjs` internals.

## What this gives you

- Preflight validation for `sources.json`
- One Bash command to run ingestion
- Optional build execution
- Post-run report of generated docs pages/assets

## Commands

### 1. Validate source configuration

```bash
npm run ingest:validate-config
```

### 2. Run ingestion (all enabled sources)

```bash
npm run ingest:ops
```

### 3. Dry-run only (no writes)

```bash
bash scripts/ingestion_tools/run_ingestion.sh --dry-run
```

### 4. Ingest one source only

```bash
bash scripts/ingestion_tools/run_ingestion.sh --source cloud-platform
```

### 5. Ingest and run production build

```bash
bash scripts/ingestion_tools/run_ingestion.sh --build
```

### 6. Generate report only

```bash
npm run ingest:report
```

## Notes

- The Bash wrapper still calls the existing ingestion pipeline under the hood.
- Validation errors are reported with clear field-level messages.
- Report output is folder-based (`content/docs/<source-id>`), which helps detect
  unexpected drops in page/asset counts.
