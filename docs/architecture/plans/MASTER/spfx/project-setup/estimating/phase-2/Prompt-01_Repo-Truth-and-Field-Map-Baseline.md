# Prompt 01 — Repo Truth and Field-Map Baseline

## Objective

Conduct a repo-truth-first data-contract audit for the Project Setup / `Projects` list persistence layer, then produce the baseline mapping matrix that will govern all later Phase 2 work.

## Context

You are continuing the HB Intel Estimating / Project Setup production-readiness effort in the authoritative repo:

- Repository: `https://github.com/RMF112018/hb-intel.git`

Known facts for this phase:
- The production `Projects` SharePoint list export already exists and is the authoritative schema target.
- The current backend still contains friendly SharePoint field-name assumptions that are not safe against the real production list.
- Phase 2 is focused on data contract correction, not broad auth or infrastructure redesign.

## Critical instructions

- Treat live repo truth as authoritative implementation truth.
- Treat the production `Projects` list export already supplied in context as authoritative schema truth.
- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not start refactoring until you have produced the baseline inventory and mapping matrix.
- Distinguish clearly between:
  1. confirmed repo fact
  2. confirmed production list schema fact
  3. inferred conclusion
  4. unresolved issue

## Required work

1. Audit all backend code that reads or writes the `Projects` list.
2. Identify every domain/business property assumed by Project Setup flows.
3. Identify every SharePoint field currently referenced directly or indirectly.
4. Reconcile repo assumptions against the real production list internal names.
5. Produce a mapping matrix with at minimum:
   - domain property
   - current code assumption
   - SharePoint display name
   - SharePoint internal name
   - SharePoint type
   - required/optional posture
   - read usage
   - create usage
   - update usage
   - mismatch notes
6. Produce a gap list for:
   - code properties with no production field
   - production fields with no code mapping
   - ambiguous fields
   - type mismatches
   - likely null/empty hazards

## Required deliverables

- Baseline field-map matrix markdown file
- Data-contract gap summary markdown file
- Short repo-truth findings summary in the chat

## Acceptance criteria

- No implementation changes are made in this prompt.
- The matrix is complete enough to govern all later Phase 2 refactors.
- Every active persistence path is accounted for.
