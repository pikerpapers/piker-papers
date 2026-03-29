# The Piker Papers

The Piker Papers is a static Zola site for publishing source-backed files, clips, and transcripts with a shared archive-style UI and Pagefind-powered search.

## Stack

- `Zola` for static site generation
- `Sass` for the site theme
- `Pagefind` for full-text search
- Markdown content with front matter under `content/entries/`

## Site Structure

- `Front Page`
- `All Files`
- `Advanced Search`
- individual file pages under `content/entries/`
- a shared shell in [templates/base.html](/Users/frederikhaaning/Code/piker-papers/templates/base.html)

Category browsing is folded into `All Files`; there is no separate categories experience in the main navigation.

## Content States

Entries currently support:

- `published`
- `under_review`
- `retracted`

Retracted files remain available by direct URL but are hidden from normal discovery flows.

## Local Development

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run check
npm run preview
```

- `npm run build` generates the static site and refreshes the Pagefind index
- `npm run check` runs content validation and a full build
- `npm run preview` serves the built output

## Analytics And Monitoring

GA4 and Sentry are both wired through the shared base template and remain disabled until configured in [config.toml](/Users/frederikhaaning/Code/piker-papers/config.toml).

Supported config keys:

```toml
[extra]
ga4_measurement_id = ""
sentry_dsn = ""
sentry_environment = ""
sentry_traces_sample_rate = 0.0
```

## Publication Notes

Before publishing:

1. Set `base_url` in [config.toml](/Users/frederikhaaning/Code/piker-papers/config.toml) to the real GitHub Pages URL.
2. Verify any analytics or Sentry settings are intentional.
3. Build the site with `npm run build`.

The `Submit File` page is intentionally a disabled UI shell at the moment. It is a design and product placeholder, not a live submission pipeline.
