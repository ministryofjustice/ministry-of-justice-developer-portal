# Product Template Contract

Status: Draft v1  
Owner: Developer Experience  
Applies to: Product and service detail pages under `/products`.

## Purpose

Product pages should answer four questions quickly:

- What is this product?
- Who is it for?
- Who owns it?
- Where should I go next?

## Current implementation in this repo

Products are currently defined in `content/products/products.json` and rendered by:

- `app/products/page.tsx` for the index
- `app/products/[slug]/page.tsx` for the detail page

Current live fields in `products.json` are:

- `slug`
- `name`
- `category`
- `description`
- `owner`
- `status`
- `tags`
- optional `slackChannel`
- optional `docsUrl`
- optional `externalUrl`

Current field mapping to the target contract:

- `name` -> `title`
- `description` -> `summary`
- `docsUrl` and `externalUrl` -> `primaryLinks[]`
- `slackChannel` -> `supportChannel`

This matters because contributors update `products.json` today, even though the longer-term contract below uses more consistent names.

## Target page contract

Required sections:

1. Header: title, category, status, owner, summary
2. Core details: what it does, who should use it, scope
3. Primary actions: at least one next step
4. Metadata: owner, status, review information when available

Optional sections:

- Slack or support channel
- Tags
- Usage examples
- Limitations
- Security or compliance notes
- Related products
- Feedback prompt

## Target metadata model

Required:

- `slug` (string)
- `title` (string)
- `summary` (string)
- `category` (string)
- `owner` (string)
- `status` (`live` | `beta` | `alpha`)
- `primaryLinks` (array, at least one item)

Recommended:

- `lastReviewedOn` (ISO date)
- `reviewIn` (for example `6 months`)
- `tags` (string array)
- `supportChannel` (string)
- `pageType` (`product`)

## Content guidance

Do:

- Use a plain-language summary.
- Make the next action obvious.
- Keep ownership specific.
- Keep status honest.

Do not:

- Turn the page into full documentation.
- Use vague marketing language.
- Publish without a useful link.

## MVP

The minimum useful product page is:

- title, category, status, owner, summary
- one short description section
- one action link
- owner and status metadata
