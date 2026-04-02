# Prompt-10 — Testing, Docs, Runbooks, and Config Guidance

## Objective

Close the documentation, testing, and operational-usage gaps so Phase 12 is understandable, supportable, and not dependent on tribal knowledge.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Align local READMEs and admin docs to the new observability reality.
- Keep present-truth docs factual.
- Do not claim production-grade behavior that the code does not actually implement.

## Inputs

Use:
- all implemented outputs from Prompts 01–09
- current admin/package/backend README files
- current developer verification command docs
- current architecture docs and state maps

## Required work

### A. Update docs/READMEs
Update only where needed:
- `packages/features/admin/README.md`
- `apps/admin/README.md` if present or create if absent
- `backend/functions/README.md`
- relevant admin phase docs/navigation docs

Remove or revise outdated limitation notes that Phase 12 has now closed.
Keep any still-open limitations explicit.

### B. Add operational guidance
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-operator-runbook-notes.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-config-and-retention-guide.md`

These docs must explain:
- what operators can now see and do
- where alert/probe/error data comes from
- what the retention/config assumptions are
- how to interpret severity/status
- what still requires escalation or later-phase work

### C. Improve verification coverage
Add or update the targeted test coverage necessary for:
- shared models
- persistence adapters
- query APIs
- probe/alert runtime
- SPFx routes/pages/hooks
- operator actions

### D. Present-truth map update only if justified
Inspect whether `docs/architecture/blueprint/current-state-map.md` now materially omits the real observability surfaces/foundations after this work.

If yes:
- make the **smallest present-truth update** necessary.

If no:
- do not touch it.

## Validation

Before finishing:
- verify every documentation link/path resolves,
- verify README language matches actual code behavior,
- verify still-open limitations remain explicit,
- run the targeted validation set justified by the touched code.

## Completion condition

Stop after docs/tests/runbook/config guidance are complete.
Do not perform the final exit reconciliation in this prompt.
