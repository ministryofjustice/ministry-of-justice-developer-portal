#!/bin/sh
set -eu

TEMPLATE="/usr/share/nginx/html/runtime-config.template.js"
OUTPUT="/usr/share/nginx/html/runtime-config.js"

export NEXT_PUBLIC_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY:-}"
export NEXT_PUBLIC_POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST:-}"

if [ -f "$TEMPLATE" ]; then
  envsubst '${NEXT_PUBLIC_POSTHOG_KEY} ${NEXT_PUBLIC_POSTHOG_HOST}' < "$TEMPLATE" > "$OUTPUT"
else
  cat > "$OUTPUT" <<EOF
window.__RUNTIME_CONFIG__ = {
  NEXT_PUBLIC_POSTHOG_KEY: '${NEXT_PUBLIC_POSTHOG_KEY}',
  NEXT_PUBLIC_POSTHOG_HOST: '${NEXT_PUBLIC_POSTHOG_HOST}',
};
EOF
fi
