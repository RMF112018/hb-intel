# Prompt-05 — Entra Backend Contracts, Models, and Workflow Primitives

## Objective

Create the minimum clean backend substrate needed for Phase 9 Entra workflows so user/group actions do not become ad hoc endpoint code.

## Important execution rules

- Do not re-read files already in current context unless needed.
- Reuse repo patterns where possible.
- If earlier generalized admin-run contracts do not yet exist in repo truth, create the smallest clean Phase 9-local version rather than pretending the broader platform phase is already complete.
- Keep this prompt phase-bounded.

## Primary scope

Create or update the backend models/contracts/primitives necessary for:
- typed Entra admin actions,
- request validation,
- risk-tier metadata,
- operator identity attribution,
- audit payload shaping,
- action result normalization,
- workflow routing for user vs group actions.

Place new files in the most pattern-consistent backend location. Prefer:
- existing backend/functions model/contract areas if present,
- otherwise a clean, explicit Phase 9-aligned location under `backend/functions/src/`.

## Required implementation outcomes

### A. Define Phase 9 Entra action types
Model at minimum:
- action identifier
- domain (user/group)
- risk tier
- destructive flag
- checkpoint/preview requirement
- actor metadata
- request payload shape
- response/result shape
- audit/evidence shape

### B. Add validation primitives
Introduce input validation for:
- user identifiers
- group identifiers
- allowed property mutations
- supported member object types
- destructive-action confirmation payloads where required by the action catalog

### C. Add workflow routing primitives
Create the minimal routing/model structure needed so later prompts can implement:
- user-admin workflows
- group-admin workflows
without collapsing into one giant function body.

### D. Add audit payload normalization
Shape the metadata needed for:
- who triggered the action
- what target was changed
- what action ran
- what risk tier applied
- what configuration or policy context applied if relevant
- success/failure and evidence summary

## Documentation requirement

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-backend-contract-notes.md`

This doc should explain what minimal backend substrate was added and why it is the smallest clean fit for Phase 9.

## Validation

Run targeted tests for any new validators/models and ensure no major TypeScript breakage exists in touched backend areas.

## Completion condition

Stop when a clean backend contract/model layer exists for the Entra workflows that follow.
Do not implement the UI in this prompt.
