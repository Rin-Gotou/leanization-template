# Leanization Template

## Purpose and layout

General mathematical paper formalization. Open this directory as the workspace.
Read paper/revision.json for active revision numbers. Initially the current paper
is paper/new/main_2.tex and the fixed baseline is paper/oldfile/main_1.tex.
Paper sources belong in paper/, Lean in PaperProject/, progress in notes/,
review records in reviews/, and generated output in build/.
Read paper/AGENTS.md and paper/SUBJECT_RULES.md before manuscript work.

## Mathematical integrity

Read complete statements and surrounding definitions before edits. Never silently
strengthen hypotheses, weaken conclusions, or replace a target by a toy model.
Record gaps and paper/Lean differences in notes/FORMALIZATION_STATUS.md.
Do not claim completion for sorry, admit, custom axioms or their dependents.
Separate kernel checking, paper correspondence, and human review.
Add public modules to PaperProject.lean. Search existing library sources first;
add only necessary dependencies, pinned to a compatible commit.
Use prompts/lean-formalization.md for 「Lean化を進める」.

## Links and checks

Follow docs/linking-conventions.md. Stable semantic IDs and fully qualified
Lean names are required; never save line numbers. New or semantically changed
mappings are proposed; only a human sets reviewed. Work-target links require
explicit scope and missing connections. Preserve unrelated comments and drafts.
Run lake build after Lean changes. Run npm run check:paper after TeX changes.
After link changes run both, then npm run validate:links. Report failed or omitted
checks and their limits. Do not edit generated output or vendor files.

## Operations

「版上げ」 / 「版を進めて」: npm run revision:advance, only when requested.
A failed build can occur after the revision has advanced: fix and rebuild rather
than advancing again. Historical baselines must not be overwritten.
「注釈コピー」: npm run annotations:create. Annotate retained copies in
reviews/annotations/, never transient PDFs in build/.
For 「原稿反映」 read saved review comments, preserve original wording and record
responses and unresolved issues before rebuilding the paper and diff.
「Lean相談」 alone is a discussion, not an implementation request.
Do not commit, push, or publish unless requested. There is no automatic Git sync.
