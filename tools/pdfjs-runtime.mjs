// Reuse the installed Viewer's PDF parser without downloading another runtime.
import { readdir, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
const candidates = [fileURLToPath(new URL('../media/pdfjs/', import.meta.url))];
if (process.env.LEAN_PAPER_PDFJS_DIR) candidates.push(process.env.LEAN_PAPER_PDFJS_DIR);
for (const directory of ['.vscode-server/extensions', '.vscode/extensions']) {
  const root = path.join(os.homedir(), directory);
  let names; try { names = await readdir(root); } catch { continue; }
  for (const name of names.filter(n => n.startsWith('local-development.lean-paper-viewer-')).sort().reverse()) {
    candidates.push(path.join(root, name, 'media/pdfjs'));
  }
}
let runtime;
for (const directory of candidates) {
  try {
    await access(path.join(directory, 'pdf.legacy.min.mjs'));
    await access(path.join(directory, 'pdf.legacy.worker.min.mjs'));
    runtime = directory; break;
  } catch { /* Try the next installed extension. */ }
}
if (!runtime) throw Error('Lean Paper Viewerをインストールするか、LEAN_PAPER_PDFJS_DIRにPDF.js legacyモジュールのディレクトリを指定してください。');
// Annotation extraction does not render pages or use matrix operations.
globalThis.DOMMatrix ??= class DOMMatrix {};
export const pdfjsLib = await import(pathToFileURL(path.join(runtime, 'pdf.legacy.min.mjs')).href);
export const workerUrl = pathToFileURL(path.join(runtime, 'pdf.legacy.worker.min.mjs')).href;
