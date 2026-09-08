# 4chan XT preservation roadmap

## Current delivery

- [x] Identify this repository as a preservation fork of discontinued upstream.
- [x] Use Manifest V3 in the reloadable Chromium folder.
- [x] Keep upstream attribution and the inherited icon.
- [x] Exercise the installed extension with fictional board data.
- [x] Exercise the userscript in Violentmonkey 2.48.0.
- [x] Complete exact-package verification for v2.24.3.

## Remaining verification and maintenance

- Resolve the 576 distinct inherited TypeScript diagnostics without hiding them.
- Exercise a wider set of board layouts and current third-party integrations.
- Validate live posting and CAPTCHA only in a separately authorized test context.
- Check Firefox and userscript managers other than the reviewed Violentmonkey build.
- Recover the original signing identity before offering a signed package that claims
  to update an existing extension. Do not reuse the upstream store identity.

These are recorded needs, not a release schedule. The upstream project is archived.
