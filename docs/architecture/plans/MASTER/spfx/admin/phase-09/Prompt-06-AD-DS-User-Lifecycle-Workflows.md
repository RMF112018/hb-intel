# Prompt-06 — AD DS User Lifecycle Workflows

## Objective

Implement the Phase 9 backend workflows for **authoritative user lifecycle administration** through the privileged backend, using the source-of-authority, risk taxonomy, and service boundaries established by Prompts 03–05.


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

- Do not re-read files still in active context unless necessary.
- Implement only the user actions approved as “implement now” by Prompt-03.
- Keep risky or highly privileged edge cases explicitly constrained rather than silently half-supporting them.
- Ensure workflow code uses the contract/model layer from Prompt-05 instead of bypassing it.
- Do not quietly fall back to Graph if the action catalog says the authoritative boundary is AD DS / on-prem.
- Do not quietly rely on hidden env/config assumptions if the required connector is not configured or verified.

## Scope

Implement backend user workflows for the approved subset of actions, expected to include some combination of:

- lookup / search / read user
- create user
- update approved user properties
- enable / disable user
- reset password / unlock if phase-approved
- delete / deprovision if phase-approved
- cloud-side verification or rollout-critical follow-on tasks only if approved

## Required implementation outcomes

### A. Backend route / entry integration

Add the phase-appropriate backend entry points for user actions following the repo’s existing backend/function pattern.

### B. Request validation + routing

Wire incoming requests through the Phase 9 models / validators, connector preflight, and explicit source-of-authority routing.

### C. Authoritative execution

Use the AD DS / on-prem execution boundary from Prompt-04 for authoritative user lifecycle work rather than re-implementing raw calls inside handlers.

Fail clearly if the required connector is unconfigured, unverified, disconnected, or otherwise not usable.

### D. Cloud-side verification or follow-on handling

If the action catalog approves post-authoritative cloud checks or follow-on actions:

- run them through the Graph service / backend boundary,
- keep them explicitly secondary to the authoritative action,
- capture their status separately from the authoritative result.

### E. Audit / evidence behavior

Each user workflow must capture phase-appropriate audit metadata and result/evidence fields, including:

- actor
- requested action
- target
- source of authority
- authoritative result
- any downstream cloud verification/follow-on state
- failure category if applicable

### F. Constrained handling for sensitive cases

Where role/permission limits, target sensitivity, or environment constraints make an operation unsafe or under-specified:

- fail clearly,
- return actionable operator-facing error metadata,
- and do not silently downgrade or improvise behavior.

## Documentation requirement

Update:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-identity-action-catalog.md`

if any action dispositions need precise implementation notes after real code work.

Create if helpful:

- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-user-workflow-notes.md`

## Validation

Run focused backend tests covering:

- happy path
- validation failures
- authority-mismatch failures
- executor / connectivity failures
- permission / unsupported-target failures
- audit payload generation
- deterministic error mapping
- downstream verification or sync-status capture where implemented
- connector-preflight / missing-configuration failures

## Completion condition

Stop when the approved AD DS-authoritative user-administration backend workflows are working and tested.
Do not implement group workflows or frontend UI here.


## No-code setup rule

If a workflow cannot run because required connection details are missing, stale, or invalid, it must fail with actionable operator-facing metadata that directs the operator to the governed connection-management UI or the specific external admin prerequisite. It must not direct IT to edit code or environment files.
