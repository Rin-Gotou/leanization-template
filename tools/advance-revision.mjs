import { readFileSync, writeFileSync, existsSync, copyFileSync, renameSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const resolve = name => path.join(root, name);
const read = name => readFileSync(resolve(name), 'utf8');
const state = JSON.parse(read('paper/revision.json'));
if (!Number.isSafeInteger(state.current) || !Number.isSafeInteger(state.baseline)
    || state.baseline < 1 || state.current <= state.baseline) throw new Error('Invalid revision state');
const current = state.current;
const next = current + 1;
const source = `paper/new/main_${current}.tex`;
const baseline = `paper/oldfile/main_${current}.tex`;
const target = `paper/new/main_${next}.tex`;
// Refuse collisions before any mutation; historical baselines remain intact.
for (const name of [baseline, target]) {
  if (existsSync(resolve(name))) throw new Error(`Already exists: ${name}`);
}
const edits = new Map();
for (const name of ['AGENTS.md', 'paper/AGENTS.md', 'README.md', 'notes/HANDOFF.md']) {
  const text = read(name)
    .replaceAll(`paper/oldfile/main_${state.baseline}.tex`, baseline)
    .replaceAll(`build/baseline/main_${state.baseline}.pdf`, `build/baseline/main_${current}.pdf`)
    .replaceAll(`paper/new/main_${current}.tex`, target)
    .replaceAll(`build/paper/main_${current}.pdf`, `build/paper/main_${next}.pdf`)
    .replaceAll(`build/diff/main_${current}_diff.pdf`, `build/diff/main_${next}_diff.pdf`);
  edits.set(name, text);
}
const manifest = JSON.parse(read('lean-paper-viewer.json'));
manifest.paper.pdf = `build/paper/main_${next}.pdf`;
edits.set('lean-paper-viewer.json', JSON.stringify(manifest, null, 2) + '\n');
edits.set('paper/revision.json', JSON.stringify({ current: next, baseline: current }, null, 2) + '\n');
const originals = new Map([...edits.keys()].map(name => [name, read(name)]));
try {
  copyFileSync(resolve(source), resolve(baseline));
  renameSync(resolve(source), resolve(target));
  for (const [name, text] of edits) writeFileSync(resolve(name), text);
} catch (error) {
  for (const [name, text] of originals) writeFileSync(resolve(name), text);
  if (existsSync(resolve(target)) && !existsSync(resolve(source))) renameSync(resolve(target), resolve(source));
  if (existsSync(resolve(baseline))) unlinkSync(resolve(baseline));
  throw error;
}
console.log(`Baseline: ${baseline}\nCurrent: ${target}`);
const result = spawnSync(process.execPath, [resolve('tools/build-paper.mjs'), 'paper'], { cwd: root, stdio: 'inherit' });
if (result.error || result.status !== 0) {
  console.error('Revision advanced; paper build failed. Fix the error and run npm run check:paper. Do not advance again.');
  process.exitCode = 1;
} else {
  const diff = spawnSync(process.execPath, [resolve('tools/build-paper.mjs'), 'diff'], { cwd: root, stdio: 'inherit' });
  if (diff.error || diff.status !== 0) {
    console.error('Revision advanced; diff build failed. Run npm run check:paper after fixing it. Do not advance again.');
    process.exitCode = 1;
  }
}
