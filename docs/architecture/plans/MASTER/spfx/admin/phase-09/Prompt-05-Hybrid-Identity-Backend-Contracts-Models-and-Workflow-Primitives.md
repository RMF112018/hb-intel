# Prompt-05 — Hybrid Identity Backend Contracts, Models, and Workflow Primitives

## Objective

Create the minimum clean backend substrate needed for Phase 9 hybrid identity workflows so lifecycle, group, and cloud-side actions do not become ad hoc endpoint code.


## Hard gate

Treat the following as mandatory for this prompt and all later prompts:

After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

This prompt must therefore drive the repo toward:

- UI-managed setup, testing, rotation, and maintenance of required backend connections,
- secure backend custody/resolution of secrets and credentials,
- explicit operator-visible preflight checks for any external prerequisite the app cannot create itself,
- and documentation that distinguishes allowed admin-page approvals from prohibited code-edit setup.

Standard Microsoft admin approval pages are allowed where unavoidable. Code interaction is not.


## Important execution rules

- Do not re-read files already in current context unless needed.
- Reuse repo patterns where possible.
- If earlier generalized admin-run contracts do not yet exist in repo truth, create the smallest clean Phase 9-local version rather than pretending the broader platform phase is already complete.
- Keep this prompt phase-bounded.

## Primary scope

Create or update the backend models / contracts / primitives necessary for:

- typed hybrid identity admin actions,
- source-of-authority routing,
- connection-definition and connection-status models,
- request validation,
- risk-tier metadata,
- operator identity attribution,
- audit payload shaping,
- action result normalization,
- workflow routing for:
  - AD DS-authoritative user actions,
  - group actions by authority,
  - cloud-side follow-on actions,
  - connector-aware preflight behavior.

Place new files in the most pattern-consistent backend location. Prefer:

- existing backend/functions model/contract areas if present,
- otherwise a clean, explicit Phase 9-aligned location under `backend/functions/src/`.

## Required implementation outcomes

### A. Define Phase 9 hybrid identity action types

Model at minimum:

- action identifier
- domain (user / group / access / sync)
- source of authority
- risk tier
- destructive flag
- checkpoint / preview requirement
- actor metadata
- request payload shape
- response / result shape
- audit / evidence shape
- downstream sync or verification state if relevant
- connector / connection reference metadata if relevant

### B. Add validation primitives

Introduce input validation for:

- user identifiers
- group identifiers
- allowed property mutations
- source-of-authority-compatible requests
- supported member object types
- connector-aware requests that require a verified backend connection before execution
- destructive-action confirmation payloads where required by the action catalog
- cloud-follow-on requests that depend on an authoritative action already succeeding

### C. Add workflow routing primitives

Create the minimal routing/model structure needed so later prompts can implement:

- AD DS user-admin workflows
- group-admin workflows by authority
- cloud follow-on / visibility workflows
- connection preflight / verification flows

without collapsing into one giant function body.

### D. Add connection / configuration contract primitives

Model the smallest clean substrate needed for Phase 9 connection management, including:

- connector identifier / class,
- operator-manageable settings shape,
- secure / write-only secret fields,
- masked-display fields where appropriate,
- connection test request/response shape,
- last-verified / last-failed metadata,
- rotation / update semantics,
- readiness / missing-prerequisite status,
- and explicit distinction between UI-configurable values versus external infrastructure prerequisites.

### E. Add audit payload normalization

Shape the metadata needed for:

- who triggered the action
- what target was changed
- what action ran
- what source of authority applied
- what risk tier applied
- what configuration or policy context applied if relevant
- what connection or connector context applied if relevant
- what downstream verification / sync state applied if relevant
- success / failure and evidence summary

## Documentation requirement

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-backend-contract-notes.md`

This doc should explain what minimal backend substrate was added and why it is the smallest clean fit for Phase 9, including the connector/connection contract layer.

## Validation

Run targeted tests for any new validators/models, connector contracts, and ensure no major TypeScript breakage exists in touched backend areas.

## Completion condition

Stop when a clean backend contract/model layer exists for the hybrid identity workflows and UI-driven connector setup that follow.
Do not implement the UI in this prompt.


### E. Add connector / connection contract primitives

Model the smallest clean backend substrate needed for:
- named connector definitions,
- connector type / authority classification,
- operator-editable non-secret settings,
- operator-entered sensitive material that must be stored or resolved securely in the backend,
- last-verified status,
- connection health / failure state,
- and permission-scoped update / rotate / disconnect operations.

These contracts must support a UI-driven setup flow without requiring code edits.
