# Financial SoR / Entity / Action-Boundary Completion — Prompt 01
## Objective
Complete the first source-of-truth / entity / action-boundary workstream for the Financial module by locking the canonical source-of-truth model, canonical entity model, and ownership boundaries for all major Financial capabilities.

## Context
You are working inside the HB Intel repo. Your task in this prompt is limited to source-of-truth, entity, and ownership-boundary doctrine plus the minimum required repo-truth reconciliation needed to make that doctrine implementation-safe.

This is not a broad runtime implementation pass.
This is not a UI pass.
This is not a route-wiring pass.
This is not a generic architecture brainstorm.

## Critical Guardrails
- Follow repo-truth order strictly:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. authoritative target-architecture / blueprint files
  3. master plans
  4. phase deliverables
  5. local file comments / inferred intent
- Stay grounded in actual repo files and actual plan language.
- Do not overclaim implementation maturity.
- Do not silently harmonize contradictions; resolve them explicitly where repo truth allows, and document them where it does not.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make runtime, UI, route, or service implementation changes in this prompt unless a tiny documentation-adjacent cleanup is strictly necessary.
- Do not invent new entities unless repo truth clearly requires them to close a contradiction or gap.

## Files to Inspect First
Inspect the repo directly and ground your work in actual file content, especially:

### Core repo-truth and planning files
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/Target-Architecture-Blueprint.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`

### Financial doctrine and runtime files
- all relevant files under:
  - `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`
- especially files governing:
  - source-of-truth / action-boundary definitions
  - runtime entity models
  - aggregate models
  - budget import
  - forecast versioning / checklist
  - GC-GR
  - cash flow
  - buyout
  - review / PER
  - publication / export
  - history / audit

### Related shared doctrine
- lane and cross-lane doctrine that materially affects Financial ownership
- Project Hub shared-spine doctrine where entity ownership or publication boundaries matter
- acceptance / readiness files that mention write ownership, record ownership, or canonical records

## Required Actions
1. Inventory the current Financial source-of-truth model.
   - For each major capability, identify:
     - system of record / authoritative source
     - operational working owner
     - canonical write owner
     - canonical read model owner
     - transitional or derived data stores
     - publication / reporting owner where relevant

2. Inventory the current Financial entity model.
   - Identify the canonical runtime entities already defined in repo truth.
   - Classify each entity as:
     - authoritative / canonical
     - operational working-state
     - derived / computed
     - import-session / staging / reconciliation
     - review / approval / publication artifact
     - audit / history / evidence
   - Identify missing or weakly governed entity families.

3. Identify contradictions, fragmentation, and shallow workbook-shaped modeling.
   - Find where source-of-truth rules are split across multiple files without clear precedence.
   - Find where entity definitions are too conceptual, too worksheet-shaped, or too thin for operational implementation.
   - Find where write ownership or read-model ownership is ambiguous.

4. Lock the canonical source-of-truth and entity posture.
   - Update the doctrine package so a future implementer can answer, for every major Financial capability:
     - what the authoritative source is
     - what the working state is
     - what the runtime record family is
     - what the write owner is
     - what the read owner is
     - what the derived artifacts are
     - what transitions or boundaries create stale-state or invalidation behavior

5. Create or revise one canonical developer-facing control document for Financial SoR and entity ownership.
   - Prefer updating the strongest existing file if it already serves this purpose.
   - If needed, create a narrowly scoped new file with a name like:
     - `Financial-Source-of-Truth-and-Entity-Control.md`
   - This file must not be duplicative; it must consolidate and clarify.

6. Update cross-references.
   - Make sure the Financial doctrine control index and related doctrine files point to the canonical SoR / entity control file.
   - Add explicit references where action-boundary and route/lane files depend on these ownership rules.

## Deliverables
1. Revised canonical SoR / entity doctrine.
2. Any necessary new control doc or revisions to existing control docs.
3. A source-of-truth ownership matrix or equivalent explicit mapping.
4. A changed-files summary.
5. A concise list of remaining ownership or entity risks.

## Definition of Done
This prompt is complete only when:
- each major Financial capability has an explicit authoritative source and working-state owner,
- the runtime entity posture is explicit enough for downstream implementation,
- ambiguous ownership has been resolved or explicitly documented,
- workbook-shaped or weak entity doctrine has been identified and corrected where repo truth allows,
- and a future implementer can find the canonical SoR / entity truth without guessing.

## Output Format
Return:
1. objective completed
2. files changed
3. source-of-truth findings
4. entity-model findings
5. contradictions resolved
6. remaining risks / follow-ups
