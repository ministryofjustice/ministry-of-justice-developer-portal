# Product Template Contract (v1)

Status: Draft v1
Owner: Developer Experience
Applies to: Product and service detail pages shown in the Products section.

## Purpose and user need

Product pages help developers quickly answer:
- What is this product/service?
- Is it live and safe to use?
- Who owns it?
- Where do I go next for docs, access, or support?

This template standardises structure so contributors can publish consistent product pages with minimal friction.

## Required sections

1. Header
- Product title
- Category tag
- Status tag
- Owner
- Summary description

2. Core details
- What the product does (short value statement)
- Who should use it
- Scope/coverage (what it does and does not include)

3. Access and links
- At least one primary action link (documentation or service)
- Any prerequisites or access constraints

4. Metadata bar
- Owner
- Status
- Last reviewed date
- Review cadence

## Optional sections

- Slack/support channel
- Tags/topics
- Usage examples
- Known limitations
- Security/compliance notes
- Related products/services
- Change notes/changelog links
- Feedback prompt

Optional sections are encouraged where information exists. Missing optional sections must not block publishing.

## Required metadata fields

- `slug` (string)
- `title` (string)
- `summary` (string)
- `category` (string)
- `owner` (string)
- `status` (enum: `live` | `beta` | `alpha`)
- `primaryLinks` (array, minimum one item)

Recommended metadata fields:
- `lastReviewedOn` (ISO date string)
- `reviewIn` (human-readable cadence, for example `6 months`)
- `tags` (string array)
- `supportChannel` (string)
- `pageType` (string, recommended value `product`)

## Content guidance

Do:
- Use a clear service name and plain language summary.
- Include one obvious next action.
- Make ownership explicit and current.
- Keep status honest (alpha/beta/live).
- Add review metadata so stale pages are visible.

Do not:
- Duplicate long docs content on the product page.
- Use marketing language without concrete capability detail.
- Publish without at least one actionable link.
- Hide ownership behind vague team names.

## Minimum viable product page (MVP)

A contributor can publish with only:
- Header with title/category/status/owner/summary
- One short core details section
- One primary link (docs or service)
- Metadata bar with owner and status

This defines the lowest acceptable quality bar for fast delivery.

## Example skeleton

```md
# Product title
Category: Platform
Status: Live
Owner: Cloud Platform team

Summary: One paragraph explaining what this product is for and when to use it.

## What this product does
A short capability description.

## Access and links
- View documentation: /docs/cloud-platform

## Metadata
- Last reviewed: 2026-04-01
- Review cadence: 6 months
```
