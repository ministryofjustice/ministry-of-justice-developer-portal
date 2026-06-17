'use client';
import { useEffect } from 'react';

export function MojFrontendInit() {
  useEffect(() => {
    import('@ministryofjustice/frontend').then(({ initAll }) => initAll());
  }, []);
  return null;
}