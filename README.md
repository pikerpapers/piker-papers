# The Piker Papers

The Piker Papers is a static archive site built with Zola for publishing source-backed files, clips, and transcripts about Hasan Piker in a structured, searchable format. Each file is a Markdown entry with front matter for title, date, description, taxonomies, status, and sources, and the site renders those entries into the shared archive UI.

## Contributing

In the future, the `Submit File` page is intended to post directly through the GitHub API and open a pull request automatically. For now, if you want to submit a file, open a pull request and add a new Markdown entry under `content/entries/`. You do not need to touch templates or site code. Create a new file named like `YYYY-MM-DD-short-slug.md`, then include the required front matter fields and the body content. At minimum, each entry needs a `title`, `date`, `description`, a `taxonomies` block (`tags`, `severity`, and `entry_type`), an `[extra]` block with `status` and `schema_version`, and at least one `[[extra.sources]]` item. A minimal example looks like this:

```toml
+++
title = "Example File Title"
date = 2026-03-29
description = "One-sentence summary of what the file documents."
template = "entry.html"

[taxonomies]
severity = ["high"]
entry_type = ["video"]
tags = ["transcript", "clip"]

[extra]
status = "under_review"
schema_version = 1

[[extra.sources]]
kind = "video"
label = "Source clip"
value = "https://www.youtube.com/watch?v=example&t=123s"
+++

Body text goes here.
```

Use the body of the file for the narrative summary, context, and any quoted excerpts. Keep source labels clear and include timestamped URLs where relevant. Open the pull request with the new entry file and any related edits only; the maintainers can review, normalize, and publish from there.
