# Prompt 02 — Financial Production-Readiness Maturity Model and Checklist Normalization

## Objective

Create a single, explicit Financial module production-readiness maturity model and use it to normalize the acceptance/readiness language across the governing Financial and Project Hub documentation.

This prompt should begin **after Prompt 01 is complete**.
Do not start from stale assumptions.
Use the newly reconciled repo-truth wording as the starting point.

## Critical Instructions

- Work from actual repo truth after Prompt 01.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not treat architecture-complete and operationally-proven as the same thing.
- Do not edit code in this prompt unless a file path or status reference must be corrected for truthfulness.
- The purpose here is to create a durable maturity model that prevents future overclaiming.

## Required Outcome

By the end of this prompt, the repo must contain a clear Financial maturity framework that distinguishes at minimum:

- doctrine-defined
- architecturally defined
- implementation scaffold present
- partially operational
- operational in current lane
- cross-lane operational
- acceptance-proven
- pilot-proven
- production-ready

And the checklist/readiness files must use that framework consistently.

## Files to Inspect First

- all files changed by Prompt 01
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- relevant Financial doctrine files under `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`
- any existing acceptance matrices, staging files, or release-readiness notes that describe Financial completion

## Tasks

### 1. Create one canonical Financial maturity model
Create a new markdown file at:
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FIN-PR1-Financial-Production-Readiness-Maturity-Model.md`

This file must define:
- each maturity stage
- exact meaning of the stage
- what evidence is required to classify a tool or module at that stage
- what is explicitly **not** enough to qualify for that stage
- how route/context, lane, runtime seam, operational flow, and acceptance proof affect stage classification

### 2. Add classification guidance at both module and tool level
The maturity model must support classification for:
- the Financial module as a whole
- each Financial tool individually
- route/context readiness
- lane readiness
- shared-spine readiness
- release-readiness evidence

### 3. Normalize H1 wording
Update `P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md` so Financial-related rows clearly distinguish between:
- architecture / record-model completion
- implementation presence
- operational behavior presence
- staging validation complete
- acceptance evidence complete

Do not allow H1 wording to imply production readiness when the repo only proves architecture or partial implementation.

### 4. Normalize supporting docs
Where useful and minimal, update supporting README / plan files so they reference the new maturity model instead of using loose or inconsistent maturity language.

### 5. Add anti-overclaiming guidance
In the new maturity-model file, include a section that explicitly states:
- rendered UI is not sufficient
- placeholder routes are not sufficient
- domain models alone are not sufficient
- package registration alone is not sufficient
- target-state doctrine is not sufficient
- operational proof requires end-to-end workflow evidence

## Edit Rules

- Keep changes focused on classification and readiness normalization.
- Do not turn this into a broad redesign of the Financial package.
- Avoid duplicating large blocks of content across files; create the canonical model once, then reference it.
- Preserve repo terminology where possible.

## Required Deliverables

### A. New maturity-model file
Create:
- `FIN-PR1-Financial-Production-Readiness-Maturity-Model.md`

### B. H1 normalization
Update Financial-related language in:
- `P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md`

### C. Cross-reference updates
Update any additional supporting files needed so the maturity model becomes the canonical classification reference.

### D. Summary file
Create a concise summary at:
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/_reconciliation/financial-maturity-model-normalization-summary.md`

Include:
- files changed
- maturity stages added
- H1 normalization highlights
- any checklist rows that still require later implementation evidence

## Acceptance Criteria

This prompt is complete only when:
- a canonical Financial production-readiness maturity model exists
- H1 no longer conflates architecture-complete with operationally proven
- Financial readiness language is materially more precise across the affected files
- the new maturity model can be used by future implementation prompts without reinterpretation

## Validation Before Commit

Before finalizing:
1. confirm that each maturity stage is evidence-based and non-overlapping
2. confirm that H1 wording matches the new model
3. confirm that no Financial row is overstated relative to actual repo truth
4. confirm that the maturity-model file is referenced where appropriate

## Final Response Format

Return:
1. the maturity stages created,
2. the files updated,
3. the most important H1 normalization changes,
4. and the remaining evidence gaps between current state and true production readiness.
