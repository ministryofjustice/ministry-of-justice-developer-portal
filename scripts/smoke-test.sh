#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  echo "Usage: $0 <environment-name> <health-url> [resolve-ip]" >&2
  exit 2
fi

ENV_NAME="$1"
HEALTH_URL="$2"
RESOLVE_IP="${3:-}"
OUTPUT_FILE="/tmp/${ENV_NAME}-smoke.out"

if [[ ! "${HEALTH_URL}" =~ ^https?://([^/]+) ]]; then
  echo "Invalid health URL: ${HEALTH_URL}" >&2
  exit 2
fi

HOST="${BASH_REMATCH[1]}"
PORT="80"
if [[ "${HEALTH_URL}" == https://* ]]; then
  PORT="443"
fi

curl_args=(-sS -o "${OUTPUT_FILE}" -w "%{http_code}")
if [[ -n "${RESOLVE_IP}" ]]; then
  curl_args+=(--resolve "${HOST}:${PORT}:${RESOLVE_IP}")
fi

set +e
HTTP_CODE=$(curl "${curl_args[@]}" "${HEALTH_URL}")
CURL_EXIT=$?
set -e

if [ "${CURL_EXIT}" -ne 0 ]; then
  echo "Smoke test request failed for ${ENV_NAME} (curl exit ${CURL_EXIT})"
  if [[ "${CURL_EXIT}" -eq 6 ]]; then
    echo "DNS resolution failed for ${HOST}."
    echo "Consider passing a resolve-ip (ingress load balancer IP) as the third argument."
  fi
  exit 1
fi

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
