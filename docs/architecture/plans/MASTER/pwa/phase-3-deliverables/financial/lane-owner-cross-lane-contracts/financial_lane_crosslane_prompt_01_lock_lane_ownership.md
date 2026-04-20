# Financial Lane / Cross-Lane Contract Completion — Prompt 01
## Objective
Complete the first lane-ownership and cross-lane contract workstream for the Financial module by locking canonical capability ownership by lane across PWA and SPFx.

## Context
You are working inside the HB Intel repo. Your task is limited to lane-ownership doctrine completion and cross-lane contract normalization for the Financial module.

This is not a runtime implementation pass.
This is not a UI polish pass.
This is not a broad architecture rewrite.
This is a lane-ownership doctrine pass.

## Critical Guardrails
- Follow repo-truth order strictly:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. authoritative target-architecture / blueprint files
  3. master plans
  4. phase deliverables
  5. local file comments / inferred intent
- Stay grounded in actual repo files and plan language.
- Do not overclaim implementation maturity.
- Do not collapse PWA and SPFx into generic shared ownership unless repo truth clearly supports it.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make runtime, routing, or UI code changes in this pass unless a tiny documentation-adjacent housekeeping fix is absolutely required.
- Prefer updating existing doctrine files over creating redundant new files, unless a new reconciliation/control file is clearly necessary.

## Files to Inspect First
Inspect the repo directly and ground your work in actual file content, especially:

### Core repo-truth and planning files
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`

### Financial doctrine package
- every relevant file under:
  - `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`
- the Financial doctrine control index if it already exists
- Financial route/context doctrine
- Financial source-of-truth / action-boundary doctrine
- Financial acceptance/readiness files

### Lane and cross-lane doctrine
- lane capability matrix files
- cross-lane navigation / handoff files
- lane-specific acceptance files
- Project Hub shell / route / context doctrine that materially affects lane posture
- any ADRs or blueprint docs governing dual-lane architecture

## Required Actions
1. Inventory all Financial capabilities that need lane decisions.
   - At minimum assess:
     - Financial module landing / home
     - Budget Import
     - Forecast Summary
     - Forecast Checklist
     - GC-GR Forecast
     - Cash Flow Forecast
     - Buyout Log
     - Review / PER
     - Publication / Export
     - History / Audit
     - any role-specific summary or launch surfaces materially defined in repo truth

2. For each capability, determine the canonical lane posture.
   - Explicitly classify each capability as one of:
     - PWA-native
     - SPFx-native
     - launch-to-PWA from SPFx
     - read-only / summary in one lane, actionable in the other
     - dual-lane only if repo truth clearly requires it and responsibilities are still differentiated
   - Identify:
     - primary actor group
     - expected shell / host surface
     - depth of workflow allowed in each lane
     - whether editing is permitted in each lane
     - whether approval/review behavior is lane-specific

3. Identify doctrine contradictions and ambiguity.
   - Find where Financial plan files, lane matrices, route/context doctrine, or current-state docs disagree.
   - Find where a capability appears to be owned by both lanes without a clean distinction.
   - Find where summary/launch behavior is conflated with deep workflow ownership.

4. Normalize the doctrine package.
   - Update the authoritative files so each Financial capability has an explicit lane-ownership posture.
   - Tighten wording so a future implementer can answer:
     - where the capability lives canonically
     - where it may be launched from
     - what work is allowed in each lane
     - what evidence is required to say the lane implementation is complete

5. If needed, create one narrow control surface.
   - Only if existing doctrine cannot safely absorb the normalization.
   - Prefer a concise file name such as:
     - `Financial-Lane-Ownership-Decision-Matrix.md`
   - This file must be decision-oriented, not explanatory clutter.

6. Update the Financial doctrine control index and any relevant README surfaces.
   - Ensure developers can find the canonical lane decision file(s) immediately.

## Deliverables
1. Revised lane-ownership doctrine.
2. Any needed capability-by-capability lane decision matrix.
3. Updated Financial doctrine control index references.
4. A contradiction / ambiguity summary.
5. A changed-files summary.
6. A short list of remaining lane risks, if any.

## Definition of Done
This prompt is complete only when:
- each major Financial capability has an explicit canonical lane posture,
- summary/launch behavior is clearly separated from deep workflow ownership,
- PWA vs SPFx responsibilities are no longer materially ambiguous,
- downstream implementers can tell where each Financial workflow belongs,
- and no implementation maturity was overstated during doctrine cleanup.

## Output Format
Return:
1. objective completed
2. files changed
3. capability-by-capability lane findings
4. contradiction / ambiguity resolutions made
5. summary of what was normalized
6. remaining risks / follow-ups
