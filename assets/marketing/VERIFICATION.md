# 4chan XT v2.24.3 verification

Review date: 2026-09-08.

## Installed interface

The actual Manifest V3 extension was loaded into a fresh, task-owned headless
Chromium 153.0.8010.12 profile. The viewport was 1440 by 1000 CSS pixels at scale 1.
Screenshots are browser captures, including direct captures of individual panels.
They are not redrawn interfaces or edited screenshot pixels.

Twenty checks covered first-run settings, a six-thread catalog, search and clearing,
reply-count sorting and its reverse order, the visible thread watcher, an export
with history explicitly disabled, a saved subject filter and settings after reload.
The four-post thread view also initialized without runtime exceptions.

The readable release userscript was imported through Violentmonkey 2.48.0's own
file-install interface in a separate headless profile. Its editor bytes matched
the release file before saving. The same 20 behavior checks passed for that
installed userscript, including the installed version in the generated export.
Automatic update checks were disabled only in the test profile.

The fixture uses fictional posts with the host's Tomorrow stylesheet. All board
responses are local substitutions. Requests outside that fixture are blocked; no
live posts, account actions or uploads were used. Test settings belong only to the
isolated profile. Full-screen captures retain the deliberately empty media areas,
so they are kept in the review archive rather than used as product hero images.

## Build limits

The project bundles successfully, but its unfinished JavaScript-to-TypeScript
migration emits 576 distinct diagnostics. The extension build prints that set
twice (1,152 messages); each userscript build prints it once. Both the count and
the diagnostic messages match the baseline. This is not a passing whole-project typecheck.

Six local regression tests passed. The suite checks the default V3 manifest, package metadata, host
restrictions, test-code stripping and retained MIT attribution. The release writer
also checks every ZIP entry against the bytes it packaged. SHA256SUMS.txt is supplied
with release downloads.

## Package and presentation checks

Both release ZIPs were extracted with an independent ZIP reader. All 77 entries
matched the release inventory. The extracted Chromium extension and userscript
passed the installed checks described above. All three README product images
matched fresh captures from the packaged extension byte for byte.

The repository keeps 25 PNG files: original icons, before-and-after product
captures and local README previews, including the three selected product images.
Their dimensions and SHA-256 hashes are recorded in [the asset inventory](asset-manifest.json).
Desktop and narrow-screen README previews loaded every image without horizontal
overflow. They aren't screenshots of the live GitHub page.

## Not established by these checks

- Current compatibility with every supported board or browser.
- Live posting, CAPTCHA, uploads, archive restoration or embedded media services.
- A security assessment of the inherited runtime or an anonymity guarantee.
- A signed CRX, Firefox XPI or upstream store listing for this fork.

The screenshot review checks legibility and representative task states. It is not
a complete accessibility certification. Small controls and dense settings remain
part of the inherited interface.
