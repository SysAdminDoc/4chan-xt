# Artwork and presentation review

Version reviewed: 4chan XT v2.24.3. Date: 2026-09-08.

## Identity decision

Keep the inherited pixel-X icon. It is a historical product identifier, not a new
brand approved for a relaunch. A new premium-looking identity would imply more
active product development than this preservation release provides.

Untouched copies of the inherited 16, 48 and 128 pixel icons are in `originals/`.
The existing historical screenshots remain in the repository's `img/` directory;
they are not presented as current product evidence. [Future briefs](../../../LOGO_PROMPTS.md)
are unexecuted and unadopted.

## Screenshot selection

`before/` and `after/` contain all seven reviewed states captured at the same
viewport, using the same fictional threads and host theme. Settings retains its
layout and changes only its visible version label. The displayed Settings,
Thread Watcher and export-choice captures are selected for their usefulness in
explaining setup and privacy, not as evidence of a redesigned interface.

The full catalog/search captures aren't used as hero images: the empty media
slots and sparse sample content don't make a useful product introduction.
The blank filter editor is also kept as evidence rather than promoted as a
marketing image. No screenshot pixels were edited to make those states look better.

`readme-preview/` holds the reviewed desktop, narrow-screen and privacy-section
renders. These are local Markdown previews, not screenshots of the live GitHub
page. [The asset inventory](../asset-manifest.json) records image sizes and hashes.

Review findings:

1. Settings opens correctly and exposes the main controls, but the long list is dense.
2. Catalog search and sorting work on the sample data. The captured media-free layout
   is accurate, but visually weak as a lead image.
3. Thread Watcher works and is readable at its native size. Don't enlarge the tiny
   panel into a banner.
4. History is initially selected in Export. The README now tells readers to turn it
   off deliberately and still inspect the file before sharing it.

The installed flows passed local checks. Live posting, outside services and full
accessibility conformance are not established. See [verification notes](../VERIFICATION.md).
