# Financial Operational Workflow — Prompt 01
## Objective
Complete the first operational-workflow workstream for the Financial module by implementing visible runtime honesty and operational-state disclosure across all governed Financial surfaces.

## Context
You are working inside the HB Intel repo. Your task is limited to operational workflow implementation for the Financial module, focused on making runtime truth, actionability, and operational posture explicit to users.

This prompt is not a doctrine-only pass.
This prompt is not a cosmetic UI-polish pass.
This prompt is not a generic analytics/dashboard pass.

The purpose of this pass is to ensure that Financial surfaces truthfully communicate:
- whether data is live, cached, stale, partial, queued, blocked, or failed
- whether a surface is editable, read-only, locked, or awaiting approval
- what the authoritative current period/version/artifact context is
- what the next valid action is
- who owns that action
- what is preventing forward progress

## Critical Guardrails
- Follow repo-truth order strictly:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. authoritative target-architecture / blueprint files
  3. master plans
  4. phase deliverables
  5. local file comments / inferred intent
- Stay grounded in actual Financial doctrine and actual implementation seams.
- Do not implement fake status indicators that are not wired to real runtime state.
- Do not reduce operational truth to passive badges; the result must drive actionability.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- All UI changes must be governed by `@hbc/ui-kit` and the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`.
- Do not treat rendering a page as evidence of operational completeness.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Core repo-truth and planning files
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`
- any Financial doctrine control/index files already created
- any acceptance/readiness files that define runtime honesty or operational readiness

### UI / route / shell / Financial implementation surfaces
- `apps/pwa`
- Financial module routes, pages, loaders, shells, and supporting components
- `packages/features-project-hub`
- `packages/shell`
- `packages/project-canvas`
- `packages/ui-kit`
- relevant query/data-access/versioned-record/notification/work-queue packages
- current tests encoding Financial surface behavior

## Required Actions
1. Identify all user-facing Financial surfaces that must expose runtime truth.
   - At minimum include:
     - Financial home / module landing
     - Budget Import
     - Forecast Summary
     - Forecast Checklist
     - GC-GR Forecast
     - Cash Flow Forecast
     - Buyout Log
     - Review / PER
     - Publication / Export
     - History / Audit
   - Determine where each surface currently hides, weakly expresses, or misrepresents runtime state.

2. Implement a canonical runtime-honesty contract for Financial surfaces.
   - Ensure users can clearly see, where applicable:
     - current project
     - current reporting month / version / artifact context
     - live vs cached vs stale vs failed state
     - editable vs read-only vs locked vs blocked state
     - readiness / review / publish posture
     - action owner
     - next valid action
     - blocking conditions / missing prerequisites
     - important warnings and exceptions
   - Prefer shared reusable UI primitives and patterns instead of one-off indicators.

3. Ensure operational posture is actionable, not descriptive only.
   - Where a user is blocked, the surface should explain why.
   - Where a user can proceed, the surface should expose the next-step action clearly.
   - Where another actor owns the next action, the surface should disclose that ownership clearly.

4. Wire runtime honesty to real underlying state.
   - Use actual repositories, queries, route context, lifecycle status, review state, version state, or mutation state.
   - Avoid placeholder language such as “up to date” or “healthy” if not backed by real conditions.

5. Standardize degraded / partial / failed-state treatment.
   - Normalize empty states, loading states, stale states, partial-data states, failed-fetch states, blocked-edit states, and approval-pending states across the module.
   - Keep the language precise and operational.

6. Ensure shell and workspace framing supports operational use.
   - Financial surfaces should read like governed workspaces, not passive logs or spreadsheet viewers.
   - Upgrade headers, state rails, summary regions, command zones, and action disclosures where necessary to match the intended operating posture.

7. Add or strengthen tests.
   - Add targeted tests that prove runtime honesty is shown correctly for critical Financial states.
   - Cover at minimum: stale, blocked, editable, review-pending, publish-eligible, and failed-fetch or failed-mutation conditions where applicable.

## Deliverables
1. Implemented runtime-honesty patterns across Financial surfaces.
2. Any shared UI/state primitives needed to support truthful operational-state disclosure.
3. Tests validating critical operational state treatment.
4. A concise changed-files summary.
5. A brief list of remaining operational-state gaps.

## Definition of Done
This prompt is complete only when:
- Financial surfaces visibly and truthfully disclose operational state,
- users can tell what is live, stale, blocked, editable, or pending,
- next-step ownership and blockers are explicit,
- the module no longer reads like a passive dashboard or log viewer,
- and critical runtime-honesty behaviors are covered by tests.

## Output Format
Return:
1. objective completed
2. files changed
3. runtime-honesty implementations made
4. tests added or updated
5. remaining gaps / follow-ups
