import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { zipSync, unzipSync } from 'fflate';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(join(root, 'version.json'))).version;
const pkg = JSON.parse(readFileSync(join(root, 'package.json')));
assert.equal(pkg.version, version, 'Version sources differ');
assert.match(version, /^\d+\.\d+\.\d+$/);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => readFileSync(join(root, file));
const realRoot = realpathSync(root);

function ownedDirectory(relative) {
  const target = join(root, relative);
  mkdirSync(target, { recursive: true });
  assert.equal(realpathSync(target), join(realRoot, relative), 'Build path must not redirect outside this checkout');
  assert.ok(!lstatSync(target).isSymbolicLink(), 'Build directory must not be a link');
  return target;
}

function clearKnownFiles(relative, allowed) {
  const directory = ownedDirectory(relative);
  for (const name of readdirSync(directory)) {
    if (relative === 'builds' && name === 'crx') continue;
    assert.ok(allowed(name), `Refusing to delete an unknown build entry: ${relative}/${name}`);
    const target = join(directory, name);
    assert.ok(lstatSync(target).isFile() && !lstatSync(target).isSymbolicLink(), 'Only regular generated files may be cleared');
    unlinkSync(target);
  }
}

clearKnownFiles('builds/crx', name => ['script.js', 'eventPage.js', 'manifest.json', 'manifestV3.json', 'icon16.png', 'icon48.png', 'icon128.png'].includes(name));
clearKnownFiles('builds', name => /^4chan-XT(?:\.min)?\.(?:user|meta)\.js(?:\.map)?$/.test(name));
clearKnownFiles('dist', name => /^4chan-XT(?:\.meta|\.user)\.js$/.test(name) || /^4chan-XT-v\d+\.\d+\.\d+-(?:chromium|userscript)\.zip$/.test(name) || ['release-manifest.json', 'SHA256SUMS.txt'].includes(name));
const reports = ownedDirectory('.reports');
let buildLog = '';
const diagnostics = [];
for (const flags of [['-min', '-platform=userscript'], ['-platform=userscript'], ['-platform=crx']]) {
  const result = spawnSync(process.execPath, ['tools/rollup.js', ...flags], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, windowsHide: true });
  buildLog += result.stdout + result.stderr;
  writeFileSync(join(reports, 'release-build.log'), buildLog);
  assert.equal(result.status, 0, `Build failed; inspect .reports/release-build.log`);
  const warnings = [...result.stderr.matchAll(/\[plugin typescript\].*TS\d+:.*$/gm)].map(match => match[0]);
  diagnostics.push({ target: flags.join(' '), messages: warnings.length, distinct: new Set(warnings).size });
  console.warn(`${flags.join(' ')}: ${warnings.length} TypeScript diagnostic messages (${new Set(warnings).size} distinct). This is not a clean typecheck.`);
}

const tests = spawnSync(process.execPath, ['--test', 'tests/release.test.mjs'], { cwd: root, encoding: 'utf8', windowsHide: true });
writeFileSync(join(reports, 'release-tests.log'), tests.stdout + tests.stderr);
process.stdout.write(tests.stdout);
process.stderr.write(tests.stderr);
assert.equal(tests.status, 0, 'Local regression tests failed');
for (const file of ['builds/4chan-XT.user.js', 'builds/4chan-XT.min.user.js', 'builds/crx/script.js', 'builds/crx/eventPage.js']) {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, `Syntax check failed for ${file}: ${result.stderr}`);
}

const docs = ['README.md', 'LICENSE', 'CHANGELOG.md', 'CONTRIBUTING.md', 'ROADMAP.md', 'LOGO_PROMPTS.md'];
function collect(relative) {
  return readdirSync(join(root, relative), { withFileTypes: true }).flatMap(entry => {
    const file = relative + '/' + entry.name;
    assert.ok(!entry.isSymbolicLink(), 'Do not package linked files');
    return entry.isDirectory() ? collect(file) : [file];
  });
}
docs.push(...collect('assets/marketing'));
const documentation = Object.fromEntries(docs.map(file => [file, read(file)]));
const artifacts = [];
function writeArtifact(name, bytes) {
  writeFileSync(join(root, 'dist', name), bytes);
  artifacts.push({ name, bytes: bytes.length, sha256: sha(bytes) });
}
const packages = [];
function makeZip(name, entries) {
  for (const file of Object.keys(entries)) assert.ok(!file.includes('\\') && !file.startsWith('/') && !file.split('/').includes('..'), 'Invalid ZIP path');
  const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b, 'en')));
  const zip = zipSync(sorted, { level: 9, mtime: new Date(2020, 0, 1), os: 3, attrs: 0o644 << 16 });
  const unpacked = unzipSync(zip);
  assert.deepEqual(Object.keys(unpacked).sort(), Object.keys(entries).sort(), 'ZIP entry inventory differs');
  for (const [file, bytes] of Object.entries(entries)) assert.equal(sha(unpacked[file]), sha(bytes), `ZIP mismatch: ${file}`);
  writeArtifact(name, zip);
  packages.push({ name, entries: Object.fromEntries(Object.entries(entries).map(([file, bytes]) => [file, sha(bytes)])) });
}
const extensionFiles = ['script.js', 'eventPage.js', 'manifest.json', 'manifestV3.json', 'icon16.png', 'icon48.png', 'icon128.png'];
makeZip(`4chan-XT-v${version}-chromium.zip`, { ...documentation, ...Object.fromEntries(extensionFiles.map(file => [file, read('builds/crx/' + file)])) });
makeZip(`4chan-XT-v${version}-userscript.zip`, { ...documentation, '4chan-XT.user.js': read('builds/4chan-XT.user.js'), '4chan-XT.meta.js': read('builds/4chan-XT.meta.js') });
writeArtifact('4chan-XT.user.js', read('builds/4chan-XT.user.js'));
writeArtifact('4chan-XT.meta.js', read('builds/4chan-XT.meta.js'));
writeArtifact('release-manifest.json', Buffer.from(JSON.stringify({ project: '4chan XT', version, diagnostics, artifacts: [...artifacts], packages,
  signing: 'No original signing key is available. No signed CRX or Firefox XPI is included.',
  verification: 'ZIP entries match their source bytes; local tests and JavaScript syntax checks passed. TypeScript diagnostics remain.' }, null, 2) + '\n'));
writeFileSync(join(root, 'dist', 'SHA256SUMS.txt'), artifacts.map(item => `${item.sha256}  ${item.name}`).join('\n') + '\n');
console.log(`Built ${version}: ${artifacts.length + 1} release files, ${packages.reduce((sum, item) => sum + Object.keys(item.entries).length, 0)} verified ZIP entries.`);
