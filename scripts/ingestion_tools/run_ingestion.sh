#!/usr/bin/env bash
set -euo pipefail

# Operator-friendly wrapper around existing Node ingestion.
# Supports a small set of flags so teams can use Bash workflows without
# understanding the underlying .mjs implementation.

usage() {
  cat <<'EOF'
Usage: bash scripts/ingestion_tools/run_ingestion.sh [options]

Options:
  --source <id>   Ingest a single source id
  --dry-run       Run ingestion preview only
  --build         Run full build after ingestion
  --skip-report   Skip post-ingestion report
  -h, --help      Show this help
EOF
}

source_id=""
dry_run="false"
run_build="false"
skip_report="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      source_id="${2:-}"
      shift 2
      ;;
    --dry-run)
      dry_run="true"
      shift
      ;;
    --build)
      run_build="true"
      shift
      ;;
    --skip-report)
      skip_report="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

echo "==> Validating sources config"
python3 scripts/ingestion_tools/validate_sources.py

echo "==> Running ingestion"
if [[ "$dry_run" == "true" ]]; then
  if [[ -n "$source_id" ]]; then
    npm run ingest -- "$source_id" --dry-run
  else
    npm run ingest:dry-run
  fi
else
  if [[ -n "$source_id" ]]; then
    npm run ingest -- "$source_id"
  else
    npm run ingest
  fi
fi

if [[ "$run_build" == "true" && "$dry_run" != "true" ]]; then
  echo "==> Running production build"
  npm run build
fi

if [[ "$skip_report" != "true" ]]; then
  echo "==> Generating ingestion report"
  python3 scripts/ingestion_tools/ingestion_report.py
fi

echo "Ingestion workflow completed"
