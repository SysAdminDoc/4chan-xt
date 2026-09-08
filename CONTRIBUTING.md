# Contributing to this preservation fork

Upstream 4chan XT stopped development in December 2025. Changes here don't imply an upstream restart or guaranteed support.

## Report a problem

Use [this fork's issue tracker](https://github.com/SysAdminDoc/4chan-xt/issues) for a problem with a build from this repository. Include the installed version, browser and installation method. Describe what you did, what you expected, and what happened.

Try a fresh browser profile containing only this extension or userscript. Don't reset your normal profile as a troubleshooting shortcut. If the problem also happens with XT disabled, mention that.

You can open the browser's developer tools through its menu to inspect errors. Include a small relevant excerpt. Don't dismiss every Content Security Policy error; it may explain a blocked feature.

Do not attach a full settings export, browsing history, cookies or private post content. Even an export without history may contain saved personal values. Use fictional examples and include only the affected setting after checking it.

## Work on the source

Use Node.js 22 or newer. Clone this fork and install its locked build dependencies with `npm ci`.

- Source changes belong in `src/`, not the generated files under `builds/`.
- Use TypeScript for new modules. Keep broad language conversions separate from behavior changes.
- Run `npm run build:release` for a clean package and the local regression tests.
- Exercise the exact packaged extension in a separate browser profile before proposing a change. Use sample data and avoid live posting.
- Explain any inherited TypeScript diagnostics or integration checks you couldn't complete. Don't describe the current bundle as fully type-safe.

The original browser test tools can be included with `npm run build -- -test`. They provide post-building and ordering checks through the application's menus; they aren't an unattended full test suite.

A small, reproducible fix is easier to review than an unrelated cleanup. Keep the existing upstream copyright notices and MIT terms.

Changes to the shared archive registry belong at [4chenz/archives.json](https://github.com/4chenz/archives.json). The [original developer documentation](https://github.com/ccd0/4chan-x/wiki/Developer-Documentation) describes the inherited architecture and may be outdated.
