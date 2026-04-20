# Financial Doctrine Completion — Prompt 01
## Objective
Complete the first doctrine-completion workstream for the Financial module by collapsing fragmented Financial doctrine into one canonical developer-control index.

## Context
You are working inside the HB Intel repo. Your task is limited to doctrine completion and doctrine synthesis for the Financial module. Do not implement runtime behavior, UI behavior, route code, or service logic in this prompt unless a tiny non-functional documentation adjacency fix is strictly necessary to remove documentation drift.

This is not a broad repo audit.
This is not a runtime implementation task.
This is a doctrine-completion pass.

## Critical Guardrails
- Follow repo-truth order strictly:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. authoritative target-architecture / blueprint files
  3. master plans
  4. phase deliverables
  5. local file comments / inferred intent
- Do not overclaim implementation status.
- Do not rewrite doctrine based on preference; reconcile doctrine based on repo truth.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make application code changes in this pass other than tightly scoped documentation-adjacent housekeeping if absolutely required.
- Prefer updating existing doctrine files over creating redundant new files, unless a new index file is clearly the correct canonical control surface.

## Files to Inspect First
Inspect the repo directly and ground your work in actual file content, especially:

### Core repo-truth and planning files
- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`

### Financial package
- every relevant file under:
  - `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`

### Related doctrine that materially affects Financial doctrine structure
- Financial route/context contract files
- Financial source-of-truth / action-boundary files
- Financial runtime model files
- lane / cross-lane / acceptance files that materially govern Financial
- any existing Financial README or package-summary files

## Required Actions
1. Inventory the full Financial doctrine package.
   - For each file, identify:
     - primary purpose
     - governed subject area
     - whether it is canonical, supporting, stale, overlapping, or redundant
     - major downstream consumers
     - whether it contains implementation-critical rules versus explanatory/background content

2. Identify doctrine fragmentation and overlap.
   - Find where the same subject is governed in multiple places without clear precedence.
   - Find missing cross-references.
   - Find stale or conflicting language.
   - Find conceptual files that need stronger implementation-control framing.

3. Create a canonical developer-control index for the Financial module.
   - Create a new file if needed, with a name like:
     - `docs/architecture/plans/MASTER/phase-3-deliverables/financial/Financial-Doctrine-Control-Index.md`
   - This file should become the primary entry point for developers working on the Financial module doctrine package.

4. The index must include, at minimum:
   - purpose of the Financial doctrine package
   - repo-truth precedence notes
   - authoritative file map by subject area
   - canonical file for each major Financial capability
   - “read this first” sequence for developers
   - file-to-capability crosswalk
   - known overlaps and how they are resolved
   - explicit note of any unresolved contradictions that should not be silently harmonized
   - implementation-safety notes for future runtime work

5. Update existing README/index surfaces so the new control index is discoverable.
   - Update any relevant README files to point developers to the new canonical index.
   - Remove or reduce ambiguity about where a developer should start.

6. Tighten language where needed.
   - Convert vague conceptual wording into implementation-governing wording where appropriate.
   - Do not invent new runtime behavior in this prompt unless the doctrine already clearly implies it and only needs normalization.

## Deliverables
1. The new or revised Financial doctrine control index.
2. Any necessary README / cross-reference updates.
3. A concise fragmentation and overlap summary.
4. A changed-files summary.
5. A short “remaining doctrine risks” section.

## Definition of Done
This prompt is complete only when:
- there is one clear canonical entry point for the Financial doctrine package,
- each major Financial doctrine subject has an explicit canonical home,
- stale/duplicate/overlapping doctrine is identified and cross-referenced,
- a future developer can enter the Financial plan package without guessing where governing truth lives,
- and no implementation claims were exaggerated during cleanup.

## Output Format
Return:
1. objective completed
2. files changed
3. doctrine fragmentation findings
4. summary of what was normalized
5. remaining risks / follow-ups
