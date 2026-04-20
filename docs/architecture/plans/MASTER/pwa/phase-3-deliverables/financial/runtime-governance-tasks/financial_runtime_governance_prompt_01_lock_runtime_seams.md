# Financial Runtime-Governance Definition — Prompt 01
## Objective
Complete the first runtime-governance definition workstream for the Financial module by locking the final runtime persistence families, repository seams, and authoritative domain/service boundaries required for production-safe implementation.

## Context
You are working inside the HB Intel repo. Your task is limited to runtime-governance definition and implementation-control work for the Financial module.

This prompt is not a broad architecture rewrite.
This prompt is not a UI build pass.
This prompt is not a route implementation pass.
This prompt is a runtime-governance and seam-definition pass.

## Critical Guardrails
- Follow repo-truth order strictly:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. authoritative target-architecture / blueprint files
  3. master plans
  4. phase deliverables
  5. existing code seams and tests
  6. local comments / inferred intent
- Stay grounded in actual repo truth and actual implementation seams.
- Do not overclaim live implementation maturity.
- Do not invent new persistence architecture unless repo truth clearly requires closure of a missing decision.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not implement UI, page, or shell work in this prompt unless a tiny non-functional documentation-adjacent fix is strictly necessary.
- Prefer tightening existing runtime-governance files over creating redundant new ones, unless one narrowly scoped reconciliation or contract file is clearly needed.

## Files to Inspect First
Inspect the repo directly and ground the work in actual file content, especially:

### Core repo-truth and planning files
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/Target-Architecture-Blueprint.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`

### Financial runtime and source-of-truth doctrine
- Financial doctrine control index, if present
- Financial source-of-truth / action-boundary files
- Financial runtime entity model files
- Financial route/context files where runtime state durability matters
- Financial review / publication / history / audit doctrine
- any Financial runtime governance specs for budget, forecast, cash flow, buyout, review, publication, or audit

### Likely implementation seams
- Financial repositories, services, facades, adapters, providers, or data-access code
- Financial models and versioned-record packages
- data-access / query-hooks / shared workflow packages
- any tests that encode Financial persistence or mutation expectations

## Required Actions
1. Inventory the current runtime-governance posture.
   - For each major Financial capability, identify:
     - current persistence family or implied persistence family
     - current repository / service / facade seam
     - current write owner
     - current read-model owner
     - current authoritative record family
     - transitional versus target-state persistence assumptions

2. Identify runtime-governance gaps and drift.
   - Find where persistence families are undefined, transitional-only, redundant, or contradictory.
   - Find repository seams that are implied in doctrine but absent in code or absent in governing docs.
   - Find UI-driven data handling that should be governed through domain or repository seams instead.
   - Find places where read/write boundaries are ambiguous.

3. Lock the final runtime persistence families.
   - Clarify, capability by capability, what persistent record families must exist for production-safe Financial behavior.
   - Explicitly distinguish:
     - source import artifacts
     - working-state records
     - versioned snapshots / confirmed versions
     - review / approval artifacts
     - publication / release artifacts
     - audit / history / investigation artifacts
     - stale-state / invalidation / recovery-supporting records, if applicable

4. Define the canonical repository and service seam model.
   - Make explicit which repositories or domain services own:
     - loading
     - normalization
     - mutation
     - validation
     - version creation
     - review transitions
     - publication eligibility evaluation
     - audit retrieval / explainability support
   - Tighten or create doctrine so downstream implementers do not guess where logic belongs.

5. Reconcile transitional storage versus target runtime storage.
   - If current-state lists, workbook-shaped entities, or temporary stores are still referenced, explicitly mark whether they are:
     - transitional tolerated seams
     - prohibited final seams
     - migration dependencies
   - Do not leave this implicit.

6. If needed, create one narrowly scoped runtime-governance control document.
   - Only do this if existing files cannot be made implementation-safe through direct edits.
   - Preferred naming pattern:
     - `Financial-Runtime-Governance-Control.md`
     - or another concise name consistent with repo conventions.

7. Update doctrine cross-references.
   - Make sure the doctrine control index, runtime model docs, source-of-truth docs, and tool-specific governance specs all point to the canonical runtime seam decisions.

## Deliverables
1. Revised runtime-governance doctrine for persistence families and seams.
2. Any new or revised runtime-governance control doc, if needed.
3. Updated cross-references.
4. A concise summary of persistence-family decisions.
5. A concise summary of repository/service seam decisions.
6. A clear list of unresolved runtime-governance risks, if any.

## Definition of Done
This prompt is complete only when:
- each major Financial capability has an explicit runtime persistence posture,
- transitional versus final persistence seams are clearly distinguished,
- repository and service ownership boundaries are explicit,
- downstream implementation can proceed without guessing where persistence and mutation logic belong,
- and unresolved runtime-governance risks are explicit and bounded.

## Output Format
Return:
1. objective completed
2. files changed
3. persistence-family findings
4. repository/service seam findings
5. summary of what was normalized
6. unresolved risks / follow-ups
