import { mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const paper = path.join(root, 'paper');
const build = path.join(root, 'build');
const mode = process.argv[2] ?? 'paper';
const revision = JSON.parse(readFileSync(path.join(paper, 'revision.json'), 'utf8'));
const currentName = `main_${revision.current}`;
const baselineName = `main_${revision.baseline}`;
function run(command, args, cwd, extra = {}) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: false, ...extra });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.signal ?? result.status})`);
  return result;
}
function compile(source, output) {
  mkdirSync(output, { recursive: true });
  const cwd = path.dirname(source);
  const name = path.basename(source, '.tex');
  const env = { ...process.env,
    TEXINPUTS: [cwd, path.join(paper, 'new'), paper, process.env.TEXINPUTS ?? ''].join(path.delimiter),
    BIBINPUTS: [paper, process.env.BIBINPUTS ?? ''].join(path.delimiter),
    BSTINPUTS: [paper, process.env.BSTINPUTS ?? ''].join(path.delimiter) };
  const tex = () => run('pdflatex', ['-synctex=1', '-interaction=nonstopmode',
    '-halt-on-error', '-file-line-error', `-output-directory=${output}`, source], cwd, { env });
  tex();
  if (readFileSync(path.join(output, `${name}.aux`), 'utf8').includes('\\bibdata{')) {
    run('bibtex', [name], output, { env });
    tex();
  }
  tex();
  let log = readFileSync(path.join(output, `${name}.log`), 'utf8');
  for (let pass = 0; pass < 3 && /Rerun to get cross-references right/.test(log); pass += 1) {
    tex();
    log = readFileSync(path.join(output, `${name}.log`), 'utf8');
  }
  if (/Rerun to get cross-references right|There were undefined references|There were multiply-defined labels|Citation .* undefined|Reference .* undefined/.test(log)) {
    throw new Error(`Unresolved references/citations or duplicate labels: ${path.relative(root, output)}/${name}.log`);
  }
  console.log(`PDF: ${path.relative(root, path.join(output, `${name}.pdf`))}`);
}
try {
  mkdirSync(build, { recursive: true });
  // Both output directories resolve the unchanged bibliography path ../refs here.
  copyFileSync(path.join(paper, 'refs.bib'), path.join(build, 'refs.bib'));
  if (mode === 'paper') {
    compile(path.join(paper, `new/${currentName}.tex`), path.join(build, 'paper'));
  } else if (mode === 'baseline') {
    compile(path.join(paper, `oldfile/${baselineName}.tex`), path.join(build, 'baseline'));
  } else if (mode === 'diff') {
    const output = path.join(build, 'diff');
    mkdirSync(output, { recursive: true });
    const result = run('latexdiff', ['--disable-citation-markup', '--math-markup=whole',
      '--append-safecmd=widetilde', `oldfile/${baselineName}.tex`, `new/${currentName}.tex`], paper,
      { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const source = path.join(output, `${currentName}_diff.tex`);
    // latexdiff can misread [g] after \\left\\{ as an optional argument,
    // splitting one whole-equation markup group across the paired delimiters.
    // Merge only that generator-induced split; retain both full equations.
    let diffSource = result.stdout.replace(/}\[\\DIF(del|add)\{g\}\]\\DIF\1\{/g, '[g]');
    // Deleted passages can retain refs whose labels latexdiff comments out.
    // Resolve only those removed labels using the fixed baseline's numbering.
    const labelsIn = (text) => new Set([...text.matchAll(/\\label\{([^}]+)\}/g)].map(m => m[1]));
    const currentLabels = labelsIn(readFileSync(path.join(paper, `new/${currentName}.tex`), 'utf8'));
    const oldLabels = labelsIn(readFileSync(path.join(paper, `oldfile/${baselineName}.tex`), 'utf8'));
    const removedRefs = [...diffSource.matchAll(/\\(ref|eqref)\{([^}]+)\}/g)]
      .filter(m => oldLabels.has(m[2]) && !currentLabels.has(m[2]));
    if (removedRefs.length) {
      const baselineOutput = path.join(build, 'baseline');
      compile(path.join(paper, `oldfile/${baselineName}.tex`), baselineOutput);
      const aux = readFileSync(path.join(baselineOutput, `${baselineName}.aux`), 'utf8');
      const oldNumbers = new Map([...aux.matchAll(/\\newlabel\{([^}]+)\}\{\{([^}]+)\}/g)]
        .map(m => [m[1], m[2]]));
      diffSource = diffSource.replace(/\\(ref|eqref)\{([^}]+)\}/g, (match, command, label) => {
        if (!oldLabels.has(label) || currentLabels.has(label)) return match;
        const number = oldNumbers.get(label);
        if (!number) throw new Error(`Missing baseline reference number: ${label}`);
        return command === 'eqref' ? `\\textup{(${number})}` : `\\textup{${number}}`;
      });
    }
    writeFileSync(source, diffSource);
    compile(source, output);
  } else if (mode === 'reviews') {
    for (const name of readdirSync(path.join(root, 'reviews')).filter(n => n.endsWith('.tex')).sort()) {
      compile(path.join(root, 'reviews', name), path.join(build, 'reviews'));
    }
  } else {
    throw new Error(`Unknown build target: ${mode}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
