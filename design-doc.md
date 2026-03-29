# The Piker Papers - Design Doc (v1)

Status: Draft  
Last updated: 2026-03-13

## 1. Problem Statement

We need a public, source-backed publication site that is:

- static and cheap to host
- Git-native (content changes through pull requests)
- searchable and filterable by structured metadata
- maintainable by a small team without backend operations

The site is intended to function like a Docusaurus-style, article-driven publication with dossier/archive characteristics. It should publish source-backed files that document alleged Hasan Piker misconduct, political messaging, and radicalization rhetoric in an exposé format, while still preserving the navigability and auditability of a structured archive.

## 2. Goals

1. Publish structured files from Markdown with strict front matter invariants.
2. Support category, topic, severity, type, and tag navigation.
3. Provide fast full-text search with metadata filters.
4. Keep runtime architecture static (no server-rendered backend).
5. Add a future submission flow that creates reviewable GitHub PRs.
6. Present the material as a coherent investigative publication rather than a generic documentation portal.

## 3. Non-Goals (v1)

1. Real-time collaboration or live editing in browser.
2. User accounts or authenticated reader roles.
3. Automated truth scoring or ML-based credibility ranking.
4. Full legal automation; moderation remains human-controlled.

## 4. Decision Summary

### Bad -> Better -> Best

Bad: ad-hoc static files with no schema, manual linking, and no enforced review path.  
Better: static generator with taxonomies and search, but no strong content invariants.  
Best: static generator + explicit metadata schema + CI checks + PR-driven moderation.

### Chosen Stack (Best-for-now)

- Static generator: Zola
- Search: Pagefind
- Styling: Tailwind CSS (compiled, not CDN bundle)
- Hosting: GitHub Pages
- CI/CD: GitHub Actions
- Future submission ingestion: serverless endpoint + GitHub API/Actions

### Why this stack

- Zola keeps content workflows simple and fast.
- Pagefind gives static full-text search with low client payload.
- GitHub Pages + Actions keeps cost and ops overhead near zero.
- PR-first flow gives auditability and moderation controls.
- Tailwind remains the target theming system even if the prototype temporarily explores the visual direction in hand-authored Sass.

## 5. Architecture Overview

## 5.1 High-level flow

1. Maintainer edits Markdown entries in `content/entries/`.
2. Pull request runs validation + build + search indexing.
3. On merge to `main`, CI builds static output and deploys to Pages.
4. Reader consumes static HTML/CSS/JS and client-side search.

## 5.2 Components

- Content layer: Markdown entries + front matter metadata
- Presentation layer: Zola templates and Tailwind styles
- Index layer: Pagefind bundle generated from built HTML
- Delivery layer: GitHub Pages
- Quality gate: CI checks (schema, links, build, smoke tests)

## 6. Content Model

## 6.1 Repository layout

```text
content/
  entries/
  _index.md
templates/
  base.html
  entry.html
  taxonomy_list.html
  taxonomy_term.html
static/
  css/
  js/
.github/
  workflows/
```

## 6.2 Entry schema

Each entry must include the following front matter keys.

| Field | Type | Required | Invariant |
|---|---|---:|---|
| `title` | string | yes | non-empty |
| `date` | date | yes | ISO date |
| `summary` | string | yes | 1-300 chars |
| `severity` | enum | yes | `low|medium|high|critical` |
| `entry_type` | string[] | yes | at least one item |
| `topics` | string[] | yes | at least one item |
| `categories` | string[] | yes | at least one item |
| `tags` | string[] | no | optional free tags |
| `sources` | object[] | yes | at least one source object |
| `status` | enum | yes | `published|under_review|retracted` |
| `schema_version` | integer | yes | currently `1` |

Source object shape:

- `kind`: `url|video|image|document|archive`
- `label`: short human-readable label
- `value`: URL or relative asset path
- `captured_at`: optional date

## 6.3 Example entry

```toml
+++
title = "Example statement"
date = 2026-02-14
summary = "Short description of the allegation."
severity = "high"
entry_type = ["speech"]
topics = ["foreign-policy"]
categories = ["public-statements"]
tags = ["campaign"]
status = "published"
schema_version = 1

[[sources]]
kind = "url"
label = "Source article"
value = "https://example.com/article"

[[sources]]
kind = "video"
label = "Video clip"
value = "https://youtu.be/example"
+++

Entry body with context, quote excerpts, and additional notes.
```

## 7. Taxonomy and Routing

Taxonomies:

- `categories`
- `topics`
- `severity`
- `entry_type`
- `tags`

Route shape:

- entry page: `/entries/{slug}/`
- taxonomy term page: `/{taxonomy}/{term}/`
- search page: `/search/`

Invariant: every entry must be reachable through at least one taxonomy page.

## 8. Search and Filtering Design

- Build Pagefind after Zola build.
- Index title, summary, body, and key metadata.
- Search UI supports:
  - free-text query
  - filter chips for `severity`, `categories`, `entry_type`, `topics`
- Fallback behavior:
  - no query: show latest entries
  - query with zero matches: show clear empty state + active filters

## 9. Build and Deployment Pipeline

## 9.1 Local workflow

1. `npm run css:watch`
2. `zola serve`
3. `zola build && npx pagefind --site public`

## 9.2 CI workflow

1. Checkout repository
2. Install Node dependencies
3. Build CSS
4. Validate content schema
5. Build Zola site
6. Build Pagefind index
7. Run smoke tests on generated output
8. Deploy `public/` to GitHub Pages (on `main` only)

## 9.3 CI gates

PR must fail when:

- required front matter fields are missing
- enum values are invalid
- source links fail policy checks (format-level)
- build or indexing fails

## 10. Submission Workflow (Phase 2)

Submission remains separate from publishing. Construction and execution are intentionally split.

Construction:

- user submits form payload
- endpoint validates and normalizes payload
- endpoint creates candidate Markdown entry in branch

Execution:

- GitHub Action opens/updates PR
- reviewer approves or requests changes
- merge publishes via normal deploy pipeline

State model:

- `received`
- `validated`
- `pr_open`
- `changes_requested`
- `approved`
- `merged`
- `rejected`

All transitions are explicit and logged in PR history.

## 11. Moderation, Safety, and Legal Controls

- Default all external submissions to `under_review`.
- Require at least one source per claim.
- Preserve edit history through Git; never silent-edit published claims.
- Retraction policy:
  - keep page live
  - mark `status = "retracted"`
  - include rationale and date in body
- Add contributor guidance for verifiability and non-defamatory wording.

## 12. UX and Visual Direction

- Product tone:
  - investigative and editorial rather than neutral-reference only
  - source-backed and audit-friendly rather than sensational by structure
  - closer to a dossier-style publication than a general-purpose blog
- Visual language:
  - minimalist, modern, documentation-like page structure
  - strong branded masthead with tabloid/newspaper and comic-book headline influence
  - restrained surfaces and spacing so the content carries the page
  - subtle OSINT / watch-desk / dossier overtones rather than full parody or overt "spy dashboard" styling
- Header and navigation:
  - persistent top masthead with publication logo, navigation, and always-available search
  - navigation should prioritize quick movement between front page, file listings, categories, search, and submission flow
- Typography:
  - expressive display face for masthead and major headlines
  - readable serif for long-form text-heavy sections
  - clean sans for interface controls and utility text
  - mono remains acceptable for metadata labels and compact technical markers where useful
- File cards show: title, date, severity, category/type chips, short summary.
- Naming:
  - prefer `file` / `files` in reader-facing UI over `entry` / `entries`
- Brand direction:
  - the project should feel like a modern investigative microsite with print-era propaganda and newspaper echoes
  - the tone should be dramatic but still controlled, readable, and credible
- Mobile-first list and filter interactions.
- Accessibility baseline:
  - keyboard operable filters and search
  - visible focus states
  - contrast checks in CI/lint process

## 13. Performance Targets

- First contentful paint under 2.0s on median mobile 4G for key pages.
- Search bootstrap payload under 200 KB for first query path.
- Keep CSS bundle lean through purge/minification.
- Optimize local images at build time.

## 14. Testing Strategy

Behavior-boundary tests are part of the design, not a postscript.

Test layers:

1. Schema tests: validate front matter invariants and enums.
2. Build tests: ensure Zola + Pagefind artifacts generate successfully.
3. Template smoke tests: ensure key pages render expected sections.
4. Link checks: validate internal links and source URL format.
5. Search tests: query fixture content and assert expected hit IDs.

Test style:

- small fixtures
- direct assertions
- helper utilities for repetitive setup

## 15. Rollout Plan

Phase 1 (now):

- finalize schema and taxonomy config
- implement base templates and styling foundation
- integrate Pagefind
- deploy via GitHub Actions + Pages

Phase 2:

- add submission form and ingestion endpoint
- auto-open PRs for submissions
- moderation checklist and templates

Phase 3:

- analytics
- stronger accessibility audits
- multilingual support if needed

## 16. Acceptance Criteria for v1

1. New entry can be added through one Markdown file and appears in:
   - home listing
   - entry detail page
   - relevant taxonomy pages
   - search results
2. PR checks fail for invalid schema values.
3. Merge to `main` deploys updated static site automatically.
4. Site is usable on desktop and mobile with keyboard-accessible search/filter UI.

## 17. Open Questions

1. Should `status` be user-visible on listing cards, or only on entry pages?
2. Do we require archived source snapshots (`archive.org` or equivalent) for all external URLs?
3. Should severity definitions be documented with strict criteria in-repo?
4. Should retracted entries stay indexed in search by default?
