'use client';

import { useEffect, useRef, useState } from 'react';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

export default function SearchWidget() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pagefind, setPagefind] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    async function loadPagefind() {
      try {
        // Pagefind generates its JS in /pagefind/pagefind.js at build time
        // and needs the basePath prefix on GitHub Pages.
        const pagefindPath = `${basePath}/pagefind/pagefind.js`;
        const pf = await import(
          // @ts-ignore — dynamic runtime import of generated pagefind bundle
          /* webpackIgnore: true */ pagefindPath
        );

        const pagefindBasePath = `${basePath || ''}/pagefind/`;
        const pagefindBaseUrl = basePath || '/';
        if (typeof pf.options === 'function') {
          await pf.options({
            basePath: pagefindBasePath,
            baseUrl: pagefindBaseUrl,
          });
        }

        setPagefind(pf);
      } catch {
        // Pagefind not available (dev mode) — search will show a message
      }
    }
    loadPagefind();
  }, [basePath]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      if (!pagefind) {
        setResults([]);
        return;
      }
      const search = await pagefind.search(query);
      const items: SearchResult[] = [];
      for (const r of search.results.slice(0, 8)) {
        const data = await r.data();
        const rawUrl = data.url || '/';
        const normalizedUrl =
          basePath && rawUrl.startsWith('/') && !rawUrl.startsWith(`${basePath}/`)
            ? `${basePath}${rawUrl}`
            : rawUrl;
        items.push({
          url: normalizedUrl,
          title: data.meta?.title || 'Untitled',
          excerpt: data.excerpt,
        });
      }
      setResults(items);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, pagefind, basePath]);

  return (
    <div className="portal-search-widget" ref={containerRef}>
      <div className="govuk-form-group">
        <input
          className="govuk-input"
          type="search"
          placeholder="Search documentation…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          aria-label="Search documentation"
        />
      </div>
      {isOpen && query.trim() && (
        <div className="portal-search-results">
          {!pagefind && (
            <p className="portal-search-hint">
              Search is available after building the site. Run <code>npm run build</code> first.
            </p>
          )}
          {pagefind && results.length === 0 && (
            <p className="portal-search-hint">No results found.</p>
          )}
          {results.map((r, i) => (
            <a key={i} href={r.url} className="portal-search-result">
              <strong>{r.title}</strong>
              <span dangerouslySetInnerHTML={{ __html: r.excerpt }} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
