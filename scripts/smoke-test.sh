#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <environment-name> <health-url>" >&2
  exit 2
fi

ENV_NAME="$1"
HEALTH_URL="$2"
OUTPUT_FILE="/tmp/${ENV_NAME}-smoke.out"

HTTP_CODE=$(curl -sS -o "${OUTPUT_FILE}" -w "%{http_code}" "${HEALTH_URL}")
if [ "${HTTP_CODE}" != "200" ]; then
  echo "Expected HTTP 200 from ${ENV_NAME} smoke test, got ${HTTP_CODE}"
  cat "${OUTPUT_FILE}"
  exit 1
fi

if ! grep -Eq '^ok$' "${OUTPUT_FILE}"; then
  echo "Unexpected ${ENV_NAME} smoke response body"
  cat "${OUTPUT_FILE}"
  exit 1
fi
