# Financial Acceptance / Staging / Release-Readiness — Prompt 02
## Objective
Complete the second acceptance/readiness workstream for the Financial module by defining the concrete staging scenarios, pilot/parallel-run criteria, cutover gates, and workbook-retirement sequence required for a real production release.

## Context
Prompt 01 should already be complete.
Use the updated Financial acceptance/readiness model as the governing posture for this pass.

This prompt is still not a broad runtime implementation prompt.
It is a release-readiness and operational-proof design pass.

## Critical Guardrails
- Stay grounded in repo truth and actual implementation posture.
- Do not invent “passed” evidence where none exists.
- Do not treat placeholder UI rendering as operational scenario completion.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not create bloated testing documents. Prefer concise, operationally usable readiness artifacts.
- Be explicit about dependencies and evidence required before a go/no-go decision.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Acceptance and release files
- updated `P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md`
- any Financial acceptance/readiness control doc created in Prompt 01
- any existing staging, release, checklist, pilot, or rollout docs

### Financial doctrine and implementation references
- Financial doctrine control/index files
- Financial route/context/lane doctrine
- runtime-governance doctrine
- SoR/entity/action-boundary doctrine
- shared-spine doctrine
- UI / shell / workspace doctrine
- operational workflow doctrine
- current Financial pages, surfaces, service seams, tests, and mocks that can provide evidence

## Required Actions
1. Define tool-by-tool staging scenarios for the Financial module.
   - Cover, at minimum:
     - Budget Import
     - Forecast Summary
     - Forecast Checklist
     - GC-GR Forecast
     - Cash Flow Forecast
     - Buyout Log
     - Review / PER
     - Publication / Export
     - History / Audit
   - For each, define:
     - entry state
     - actors
     - governed actions
     - success criteria
     - blocking conditions
     - evidence required
     - downstream impacts
     - failure / recovery expectations

2. Define cross-tool staging scenarios.
   - Include end-to-end monthly workflow scenarios such as:
     - budget import to working state
     - working state to review
     - review return / revise / re-submit
     - confirmed state to publication/export
     - history/audit verification
     - stale-source invalidation and recovery
     - project switch / re-entry / resume continuity where relevant

3. Define pilot / parallel-run requirements.
   - Specify:
     - how many projects or project types are needed
     - what evidence must be collected during the pilot
     - what parity must be demonstrated against the current workbook/process
     - what failure thresholds block release
     - what manual fallbacks are allowed during pilot
     - what criteria constitute pilot success

4. Define workbook-retirement / cutover sequence.
   - Explicitly define:
     - which workbook/process classes can be retired first
     - which must remain during pilot
     - what evidence is required before each retirement step
     - rollback triggers
     - post-cutover verification requirements

5. Create or update concise readiness artifacts.
   - Create or refine files such as:
     - Financial staging scenario matrix
     - pilot / parallel-run checklist
     - workbook-retirement checklist
     - release go/no-go checklist
   - Keep them concrete and operational.

6. Tighten `P3-H1` and related references as needed.
   - Ensure scenario completion, pilot completion, and release-readiness criteria align with the new artifacts.

## Deliverables
1. Tool-by-tool staging scenario matrix.
2. Cross-tool / monthly operational scenario coverage.
3. Pilot / parallel-run criteria.
4. Workbook-retirement / cutover sequence.
5. Updated readiness references and changed-files summary.

## Definition of Done
This prompt is complete only when:
- each major Financial tool has executable staging scenarios,
- monthly end-to-end operational scenarios are defined,
- pilot / parallel-run expectations are explicit,
- workbook-retirement is sequenced and gated,
- and release-readiness no longer depends on vague or implied evidence.

## Output Format
Return:
1. objective completed
2. files changed
3. staging-scenario findings
4. pilot / parallel-run model summary
5. cutover / retirement summary
6. remaining readiness gaps / follow-ups
