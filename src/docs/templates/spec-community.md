# Community Template Contract

Status: Draft v1  
Owner: Developer Experience  
Applies to: Community landing and detail pages under `/community`.

## Purpose

Community content should answer:

- where to connect with other teams
- what kind of community resource this is
- who owns it
- whether it is ongoing or date-based

## Current implementation in this repo

Community content currently lives in `content/community/community.json`.

It is rendered by:

- `app/community/page.tsx` for the landing page
- `app/community/[slug]/page.tsx` for item detail pages

The current file contains both:

- top-level landing-page content such as `title`, `summary`, `supportingSections`, and `contribution`
- detail items under `items[]`

This makes Community structurally similar to Products, but with extra landing-page support content and event-specific fields.

## Current item model

Current item fields are:

- `slug`
- `title`
- `category`
- `description`
- `owner`
- `status`
- `tags`
- `sections`
- optional `primaryLinks`
- optional `eventDate`
- optional `endDate`
- optional `location`
- optional `isRecurring`

## Target page contract

Required sections:

1. Header: title, category, summary, owner, status
2. Body: one or more sections explaining the resource
3. Metadata: owner, status, tags, and event details when relevant
4. Links: primary actions where useful

Optional sections:

- event timing and location
- recurring schedule information
- supporting landing-page resources
- contribution callout
- feedback prompt

## Target metadata model

Required for detail items:

- `slug` (string)
- `title` (string)
- `category` (string)
- `description` (string)
- `owner` (string)
- `status` (string)
- `tags` (string array)
- `sections` (array)

Recommended:

- `primaryLinks` (array)
- `eventDate` (ISO date, event items)
- `endDate` (ISO date, event items)
- `location` (string, event items)
- `isRecurring` (boolean, event items)
- `pageType` (`community`)

## Content guidance

Do:

- make the purpose of the item obvious
- keep item types flexible
- add concrete next actions when they exist
- treat event metadata as required for scheduled events

Do not:

- force every item into an event shape
- publish vague entries with no reason to engage
- mix landing-page support content into item fields

## MVP

The minimum useful community item is:

- title, category, description, owner, status
- tags
- one content section

If the item is an event, add at least the event date and location.
