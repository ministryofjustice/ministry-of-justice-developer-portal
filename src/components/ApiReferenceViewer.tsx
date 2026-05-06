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

export function ApiReferenceViewer({ specUrl }: ApiReferenceViewerProps) {
  const containerId = useMemo(() => `redoc-${specUrl.replace(/[^a-zA-Z0-9]/g, '-')}`, [specUrl]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const initialize = () => {
      if (window.Redoc) {
        window.Redoc.init(
          specUrl,
          {
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
          },
          container
        );
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
