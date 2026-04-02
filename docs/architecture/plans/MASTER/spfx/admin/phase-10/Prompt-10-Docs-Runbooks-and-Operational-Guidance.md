# Prompt-10 — Docs, Runbooks, and Operational Guidance

## Objective

Bring the repo documentation and runbook guidance into alignment with the new Phase 10 standards/configuration governance capability.

## Important execution rules

- Update only what is needed to eliminate contradiction and major omission.
- Keep canonical guidance centralized and cross-linked.
- Do not restate the same doctrine in six places.

## Inputs

Use:
- all prior Phase 10 outputs
- existing admin docs
- existing configuration docs
- backend/local README material where touched by implementation

## Required work

### A. Create or update phase-10 canonical docs
Ensure the following are present and cross-linked:
- phase-10 baseline
- taxonomy/catalog doc
- version/audit model doc
- resolution/traceability doc
- seeding/reconciliation doc
- API/authz boundary doc

### B. Update admin docs navigation
Update the admin docs README/folder navigation to include Phase 10.

### C. Update backend/local guidance
Update touched backend/config README material so operators/developers can understand:
- what is live-governed
- what remains env/infra-controlled
- how to seed
- how to inspect history
- how to revert
- how to trace config used by a run

### D. Add operational runbook guidance
Create a concise runbook or how-to for:
- adding a new live-governed config item
- publishing a change
- reverting a bad change
- determining what config version a run used
- handling invalid config or stale-write conflicts

## Suggested artifact

Create:
- `docs/how-to/admin/phase-10-standards-and-config-governance-guide.md`
or another repo-truth-consistent path if a better runbook location already exists.

## Validation requirement

Verify all paths/links resolve and that docs do not claim features not actually implemented.

## Completion condition

Stop when docs and runbooks are aligned with the implemented Phase 10 behavior.
