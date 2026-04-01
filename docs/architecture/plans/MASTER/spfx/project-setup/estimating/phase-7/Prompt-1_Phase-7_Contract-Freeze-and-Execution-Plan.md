# Prompt 1 — Phase 7 Contract Freeze and Execution Plan

## Title
Phase 7 — Contract freeze, scope confirmation, and execution-plan establishment for Project Setup production alignment

## Objective
Conduct a repo-truth-first Phase 7 contract freeze for the Project Setup SPFx package and connected backend. Establish the exact production target contract that the remaining Phase 7 prompts will implement, and create the Phase 7 cumulative remediation report.

## Repository context
Authoritative repo:
`https://github.com/RMF112018/hb-intel.git`

Primary concern area:
- Project Setup standalone SPFx package / shell / runtime config posture
- Azure Functions backend contract for Project Setup
- frontend ↔ backend route parity
- auth and token-handling contract
- SharePoint `Projects` list persistence contract

## Required inputs to evaluate
Audit repo truth with emphasis on:
- the current Project Setup SPFx entrypoint / shell mount path,
- runtime config injection and backend mode resolution,
- all frontend API client surfaces used by the Project Setup app,
- all backend handlers relevant to Project Setup,
- auth middleware and token validation,
- the SharePoint Projects-list contract and field mapping,
- any Phase 1–6 docs that appear to define the current intended contract.

## Critical instructions
- Treat the live repo as authoritative.
- Do not re-read files already in active context unless needed to resolve a contradiction or collect exact evidence.
- Do not implement broad fixes yet beyond light documentation scaffolding needed for Phase 7 management.
- This prompt is for freezing the exact implementation target and reducing ambiguity before deeper changes land.

## Required work
1. Audit the current repo truth and confirm the exact production target surface for Project Setup.
2. Create or update:
   `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md`
3. In that report, add the following sections at minimum:
   - Executive summary
   - Confirmed current frontend contract
   - Confirmed current backend contract
   - Confirmed current auth / token contract
   - Confirmed SharePoint persistence contract
   - Phase 7 implementation scope
   - Ordered execution plan
   - Deferred / unresolved items
4. Create a clear Phase 7 contract freeze subsection that explicitly states:
   - whether the Project Setup package is intended to ship in true backend mode,
   - which backend routes are authoritative for production,
   - which frontend callers are authoritative,
   - which auth path is authoritative for SPFx production calls,
   - and whether any current paths are deprecated and must be removed or redirected.
5. Identify all frontend/backend contract mismatches still present in repo truth and convert them into a Phase 7 tracked item list.
6. Define the exact target paths for Prompts 2–7 so that later prompts do not drift.

## Deliverables
- Updated or created cumulative report:
  `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md`

## Required report content for this prompt
At the end of the report update, add a section named:
`Prompt 1 completion notes`

That section must include:
- files reviewed,
- files created or changed,
- exact contract decisions frozen for Phase 7,
- items intentionally deferred to later prompts,
- and a concise “ready for Prompt 2” statement.

## Acceptance criteria
- A Phase 7 cumulative report exists.
- The production contract target is explicitly frozen in writing.
- The report removes ambiguity about what later prompts should implement.
- The report is grounded in repo truth, not assumptions.
- No broad unrelated code changes are introduced.
