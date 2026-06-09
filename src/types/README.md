# Types

This directory contains shared TypeScript types used across the application.

Types are grouped by domain or purpose rather than being kept in one large file. This keeps imports clearer and helps avoid `types.ts` becoming a catch-all file.

## Files

| File            | Purpose                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `components.ts` | Shared component prop types and presentational UI types.               |
| `docs.ts`       | Types for documentation content, metadata, navigation, and sources.    |
| `guidelines.ts` | Types for the guidelines content model, sections, and guideline items. |
| `navigation.ts` | Shared navigation types, such as breadcrumbs.                          |
| `products.ts`   | Types for product catalogue items and product cards.                   |
| `search.ts`     | Types for search result data.                                          |
| `index.ts`      | Barrel file that re-exports the public types from this directory.      |

## Importing types

Prefer importing from the specific file when the domain is clear:

```ts
import type { GuidelinesContent } from '@/types/guidelines';```

