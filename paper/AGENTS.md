# Mathematical manuscript editing

Read the current revision from paper/revision.json. Initially edit
paper/new/main_2.tex; paper/oldfile/main_1.tex is the fixed comparison baseline.
Read SUBJECT_RULES.md before editing. Preserve mathematical meaning, notation,
labels, citations, and unrelated author changes. Never invent references or proofs.
Do not silently change hypotheses or conclusions to avoid a proof gap; record it
in notes/FORMALIZATION_STATUS.md and explain the required decision.
Keep shared macros in preamble.tex and filewise_preamble.tex. Use relative paths.
When responding to reviews, preserve original annotations and distinguish proposed
repairs, implemented edits and unresolved mathematical questions.
Run npm run check:paper after edits; check unresolved references and citations.
Generated PDFs and latexdiff sources belong in build/ and are not editable sources.
Advance versions only on an explicit request using npm run revision:advance.
If it reports a build failure after advancing, do not advance again.
