import { constants, copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
try {
  const { current, baseline } = JSON.parse(readFileSync(path.join(root, 'paper/revision.json'), 'utf8'));
  if (!Number.isSafeInteger(current) || !Number.isSafeInteger(baseline)
      || baseline < 1 || current <= baseline) throw new Error('Invalid revision state');
  const result = spawnSync(process.execPath, [path.join(root, 'tools/build-paper.mjs'), 'diff'],
    { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('Diff build failed; no annotation copy was created.');
  // Explicit Tokyo time, independent of the host timezone.
  const fields = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
  const stamp = `${fields.year}-${fields.month}-${fields.day}_${fields.hour}${fields.minute}${fields.second}_JST`;
  const directory = path.join(root, 'reviews/annotations');
  mkdirSync(directory, { recursive: true });
  const source = path.join(root, `build/diff/main_${current}_diff.pdf`);
  const stem = `main_${current}_diff_${stamp}`;
  for (let suffix = 0; ; suffix += 1) {
    const destination = path.join(directory, `${stem}${suffix ? `_${suffix}` : ''}.pdf`);
    try {
      copyFileSync(source, destination, constants.COPYFILE_EXCL);
      console.log(`Annotation copy: ${path.relative(root, destination)}`);
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
