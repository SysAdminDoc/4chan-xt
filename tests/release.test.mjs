import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import generateManifest from '../src/meta/manifestJson.js';
import generateMetadata from '../src/meta/metadata.js';
import removeTestCode from '../tools/rollup-plugin-remove-test-code.js';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const version = JSON.parse(await readFile(new URL('../version.json', import.meta.url)));

test('the default install manifest is Manifest V3', () => {
  const manifest = JSON.parse(generateManifest(pkg, version));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background.service_worker, 'eventPage.js');
  assert.equal(manifest.background.scripts, undefined);
});

test('the reloadable extension uses the supported manifest', async () => {
  const manifest = JSON.parse(await readFile(new URL('../builds/crx/manifest.json', import.meta.url)));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, version.version);
  assert.equal(manifest.background.service_worker, 'eventPage.js');
});

test('primary install metadata belongs to this fork', async () => {
  const metadata = await generateMetadata(pkg, '4chan-XT.user.js', '4chan-XT.meta.js');
  assert.match(metadata, /@updateURL\s+https:\/\/raw\.githubusercontent\.com\/SysAdminDoc\/4chan-xt\/project-XT\/builds\/4chan-XT\.meta\.js/);
  assert.match(metadata, /@downloadURL\s+https:\/\/raw\.githubusercontent\.com\/SysAdminDoc\/4chan-xt\/project-XT\/builds\/4chan-XT\.user\.js/);
  assert.match(metadata, new RegExp('@version\\s+' + version.version.replaceAll('.', '\\.')));
});

test('permissions and host restrictions are preserved', () => {
  const manifest = JSON.parse(generateManifest(pkg, version, 3));
  assert.deepEqual(manifest.permissions, ['storage', 'scripting', 'webRequest']);
  assert.deepEqual(manifest.host_permissions, pkg.meta.matches_only.concat(pkg.meta.matches));
  assert.deepEqual(manifest.content_scripts[0].exclude_matches, pkg.meta.exclude_matches);
  assert.equal(manifest.content_scripts[0].run_at, 'document_start');
  assert.equal(manifest.content_scripts[0].matches.includes('<all_urls>'), false);
});

test('source test stripping preserves code around each test region', async () => {
  const plugin = removeTestCode({include: '**/Main.js', sourceMap: false});
  const source = 'before();\n// #region tests_enabled\ntestOnly();\n// #endregion\nafter();';
  const result = await plugin.transform(source, '/src/Main.js');
  assert.match(result.code, /before\(\)/);
  assert.match(result.code, /after\(\)/);
  assert.doesNotMatch(result.code, /testOnly/);
});

test('MIT attribution remains in each readable distributable', async () => {
  for (const file of ['builds/4chan-XT.user.js', 'builds/crx/script.js']) {
    const source = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    assert.match(source, /4chan X Copyright © 2009-2023 ccd0/);
    assert.match(source, /Permission is hereby granted, free of charge/);
    assert.match(source, /TuxedoTako\/4chan-xt/);
  }
});
