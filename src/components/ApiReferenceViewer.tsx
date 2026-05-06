'use client';

import { useEffect, useMemo } from 'react';

declare global {
  interface Window {
    Redoc?: {
      init: (specOrSpecUrl: string | Record<string, unknown>, options: Record<string, unknown>, element: HTMLElement | null) => void;
    };
  }
}

type ApiReferenceViewerProps = {
  specUrl: string;
};

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function getSchemaNames(spec: Record<string, JsonValue>): Set<string> {
  const components = spec.components;
  if (!components || typeof components !== 'object' || Array.isArray(components)) return new Set();
  const schemas = (components as Record<string, JsonValue>).schemas;
  if (!schemas || typeof schemas !== 'object' || Array.isArray(schemas)) return new Set();
  return new Set(Object.keys(schemas as Record<string, JsonValue>));
}

function resolveBrokenSchemaRef(ref: string, schemaNames: Set<string>): string {
  const match = ref.match(/^#\/components\/schemas\/([^/]+)$/);
  if (!match) return ref;

  const schemaName = match[1];
  if (schemaNames.has(schemaName)) return ref;

  // Known upstream mismatch in hmpps-integration-api.
  if (schemaName === 'PersonNotFoundError' && schemaNames.has('PersonNotFound')) {
    return '#/components/schemas/PersonNotFound';
  }

  const withoutErrorSuffix = schemaName.replace(/Error$/, '');
  if (withoutErrorSuffix !== schemaName && schemaNames.has(withoutErrorSuffix)) {
    return `#/components/schemas/${withoutErrorSuffix}`;
  }

  return ref;
}

function normalizeRefs(value: JsonValue, schemaNames: Set<string>): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeRefs(item, schemaNames));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const obj = value as Record<string, JsonValue>;
  const out: Record<string, JsonValue> = {};

  for (const [key, raw] of Object.entries(obj)) {
    if (key === '$ref' && typeof raw === 'string') {
      out[key] = resolveBrokenSchemaRef(raw, schemaNames);
      continue;
    }
    out[key] = normalizeRefs(raw, schemaNames);
  }

  return out;
}

export function ApiReferenceViewer({ specUrl }: ApiReferenceViewerProps) {
  const containerId = useMemo(() => `redoc-${specUrl.replace(/[^a-zA-Z0-9]/g, '-')}`, [specUrl]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const initialize = async () => {
      if (!window.Redoc) return;

      const redocOptions = {
        hideDownloadButton: false,
        disableSearch: false,
        nativeScrollbars: true,
        theme: {
          colors: {
            primary: {
              main: '#005ea5',
            },
          },
          typography: {
            fontFamily: 'GDS Transport, Arial, sans-serif',
          },
        },
      };

      try {
        const response = await fetch(specUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch spec: ${response.status}`);
        }

        const spec = (await response.json()) as Record<string, JsonValue>;
        const schemaNames = getSchemaNames(spec);
        const normalizedSpec = normalizeRefs(spec, schemaNames) as Record<string, unknown>;
        window.Redoc.init(normalizedSpec, redocOptions, container);
      } catch {
        // Fallback to URL-based loading if parsing or normalization fails.
        window.Redoc.init(specUrl, redocOptions, container);
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-redoc-standalone="true"]');
    if (existingScript) {
      if (window.Redoc) {
        initialize();
      } else {
        existingScript.addEventListener('load', initialize, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';
    script.async = true;
    script.setAttribute('data-redoc-standalone', 'true');
    script.addEventListener('load', initialize, { once: true });
    document.body.appendChild(script);
  }, [containerId, specUrl]);

  return <div id={containerId} />;
}
