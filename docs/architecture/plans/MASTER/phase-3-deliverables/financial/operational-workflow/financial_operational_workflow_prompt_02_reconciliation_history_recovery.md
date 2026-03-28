# Financial Operational Workflow — Prompt 02
## Objective
Complete the second operational-workflow workstream for the Financial module by implementing governed reconciliation, session history, rollback/recovery, and re-entry workflows so users can operate safely through failed, partial, or revised financial processes.

## Context
Prompt 01 should already be completed.
Use the runtime-honesty work from Prompt 01 as the operational baseline for this pass.

This is an operational workflow implementation pass.
This is not a broad architectural rewrite.

The purpose of this pass is to make sure the Financial module handles real operating conditions safely, including:
- import and mutation sessions
- reconciliation outcomes
- review returns and reopen flows
- revision lineage
- history and audit retrieval
- restart / re-entry after interruption
- rollback, supersession, or recovery where doctrine allows

## Critical Guardrails
- Stay grounded in repo truth, Financial doctrine, runtime-governance rules, source-of-truth rules, and actual implementation seams.
- Do not invent rollback or recovery semantics that violate the versioned-record or action-boundary model.
- Do not implement destructive recovery actions without explicit governance.
- Do not hide failed or partial operations behind generic error messages.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- All UI changes must be governed by `@hbc/ui-kit` and the doctrine in `docs/reference/ui-kit/UI-Kit-*.md`.
- Preserve auditability and explainability.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Core doctrine / runtime / SoR files
- Financial runtime-governance files
- Financial source-of-truth / entity / action-boundary files
- Financial review / publication / history / audit doctrine
- Budget Import doctrine and readiness files
- versioned-record and audit-related package contracts
- acceptance/readiness files defining recovery, review return, or history expectations

### Implementation surfaces and services
- Financial module pages and components
- repositories / services / mutation handlers
- import session logic
- review / publication flows
- history / audit retrieval logic
- notification / acknowledgment / workflow-handoff integrations where present
- relevant tests

## Required Actions
1. Identify operational workflows that require governed recovery or history behavior.
   - At minimum evaluate:
     - budget import session lifecycle
     - forecast revision and confirmation flow
     - checklist reopen / return / completion flow
     - review / PER return and revise flow
     - publication eligibility / publish / supersede flow
     - history / audit lookup and artifact retrieval
     - any mutation session that can fail partially or be resumed safely

2. Implement reconciliation/session history surfaces where missing.
   - Users must be able to inspect meaningful history for important operational events.
   - History should expose what happened, when, to what scope, by whom if governed, and what the current standing result is.
   - This should not degrade into raw log dumping.

3. Implement governed recovery / re-entry behavior.
   - Support safe resume / restart / revisit behavior where doctrine allows.
   - Where rollback is not allowed, explain the sanctioned recovery path clearly.
   - Where supersession or re-import is the correct mechanism, surface that clearly.

4. Strengthen reconciliation workflows.
   - Budget import and other high-risk processes should expose reconciliation outcomes, unresolved discrepancies, and required next actions clearly.
   - Failed or partially applied sessions should not leave the user guessing about system state.

5. Strengthen review and publication recovery.
   - Make return/revise/reopen/resubmit flows explicit where governed.
   - Make confirmed / published / superseded boundaries clear.
   - Ensure history and lineage are visible enough to support operational trust.

6. Strengthen audit-oriented retrieval and traceability.
   - Ensure users can navigate operational history meaningfully.
   - Provide access to prior sessions, revisions, decisions, or artifacts where doctrine requires.
   - Keep the experience actionable and investigation-oriented.

7. Add or strengthen tests.
   - Add targeted tests for interrupted, failed, partial, returned, reopened, superseded, and resumed workflows where applicable.
   - Ensure critical recovery paths are explicitly covered.

## Deliverables
1. Implemented reconciliation/history/recovery workflow improvements.
2. Any new shared components or workflow helpers needed for safe operational recovery.
3. Tests validating critical failure/re-entry/recovery behaviors.
4. A concise changed-files summary.
5. A brief list of remaining operational workflow gaps.

## Definition of Done
This prompt is complete only when:
- important Financial operations expose meaningful session history or reconciliation outcomes,
- failed or partial processes have explicit recovery/re-entry paths,
- review/publication/history behaviors are operationally trustworthy,
- users can investigate and resume work without relying on hidden system knowledge,
- and critical recovery behaviors are covered by tests.

## Output Format
Return:
1. objective completed
2. files changed
3. operational workflow implementations made
4. tests added or updated
5. remaining gaps / follow-ups
