# Prompt-03 — Hybrid Identity Action Catalog, Source-of-Authority, Risk Taxonomy, and Permission Matrix

## Objective

Define the action catalog, source-of-authority matrix, risk taxonomy, permission/access matrix, connection-dependency model, and operator-safety classification for the Hybrid Identity control lane before implementing the workflows.

This prompt creates the execution blueprint that later backend and UI prompts must follow.


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

- Do not re-read files still in active context unless needed.
- Use official Microsoft guidance principles:
  - least privilege,
  - role-aware operations,
  - sensitivity distinctions for privileged actions,
  - stable API preference.
- Keep the matrix practical and implementation-facing.
- Do not assume that every action should be implemented just because it is technically conceivable.

## Inputs

Use:

- the completed Phase 9 baseline docs,
- current `graph-service.ts`,
- any repo docs affecting app permissions or admin auth posture,
- and any repo-truth evidence from Prompt-01 about existing or missing AD DS / on-prem execution patterns.

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-identity-action-catalog.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-source-of-authority-matrix.md`
3. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-risk-taxonomy.md`
4. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-permission-access-role-and-consent-matrix.md`
5. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-connection-dependency-matrix.md`
6. `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-ui-configurability-matrix.md`

## Required action-catalog rows

At minimum define actions for:

- create user
- read / lookup / search user
- update user profile basics
- enable / disable account
- reset password / unlock only if phase-appropriate
- delete user
- create group
- read / lookup / search group
- update group properties
- add members
- remove members
- delete group
- grant or normalize rollout-critical group memberships
- rollout-critical access setup actions
- sync-state / visibility-only actions
- dangerous / constrained actions that require explicit handling or deferral

## Required fields per action

At minimum:

- action name
- domain (user / group / access-setup / sync / cloud-side / etc.)
- source of authority:
  - AD DS authoritative
  - Entra / Graph authoritative
  - coordinated / dual-step
  - visibility-only
- rollout-critical or broader-admin classification
- risk tier
- destructive or non-destructive
- checkpoint / preview requirement
- required execution boundary (AD DS adapter / Graph / both / manual)
- least-privileged Graph permission target if applicable
- least-privileged on-prem access / executor requirement if applicable
- additional role requirement notes
- audit requirement
- required connection dependency or connector class
- preflight / connection-health requirement
- phase disposition (implement now / visibility only / defer)

## Required source-of-authority-matrix sections

Include clear tables or equivalent for:

- synced users
- cloud-only users if any
- AD-synced security groups
- cloud-only groups where relevant
- rollout-critical access / membership setup
- sync-status checks and post-action verification

## Required risk-taxonomy sections

Include:

- routine actions
- elevated actions
- destructive actions
- privileged-admin / role-assignable edge cases
- sync-sensitive actions
- preview-only / defer-until-safer cases
- operator UX consequences by risk tier

## Required permission / access matrix sections

Include:

- action-to-Graph-permission mapping
- action-to-on-prem executor requirement mapping
- delegated vs app-only implications if relevant to the repo’s architecture
- Entra role requirements / notes where material
- permissions the phase should avoid unless no narrower option exists
- explicit note on any areas where the repo should document manual IT approval prerequisites
- explicit note on any areas where the repo should document connector / line-of-sight / environment dependencies
- explicit note on any connector settings that must be operator-configurable through the UI rather than code-bound

## Implementation rule

The output of this prompt becomes the control document for Prompts 04–09 and for the connection-management work in Prompt-08.
Do not proceed with ambiguous action scope.

## Validation

Before finishing:

- ensure every implement-now action has a source-of-authority assignment, a risk tier, an access target, and a connector dependency,
- ensure the phase does not casually include high-risk identity operations without rationale,
- ensure the permission/access matrix is narrower than “just use Directory.ReadWrite.All everywhere” unless a documented necessity truly forces it,
- ensure the connection-dependency matrix does not silently assume code-bound configuration,
- and ensure the matrix does not silently assume direct domain-admin execution without justification.

## Completion condition

Stop after the five docs are complete and internally consistent.


## Required connection-dependency-matrix sections

Include:
- action-to-connector mapping,
- required backend service boundary per action,
- whether the connector must support credential entry, certificate reference, secret reference, or endpoint-only configuration,
- whether the action can run when a connector is degraded, unverified, or disconnected,
- operator-visible preflight requirements before action submission,
- and which connector properties must be UI-configurable versus fixed by deployment architecture.


## Required ui-configurability-matrix content

For every implement-now action and connector dependency, state:

- what IT must be able to configure through the UI,
- whether the value is editable, rotatable, testable, or read-only after bootstrap,
- whether the value may be shown again after save,
- whether the value must be masked / write-only,
- what admin role can manage it,
- and whether any external admin-page or infrastructure prerequisite remains.

No action may be marked “implement now” if its normal setup still depends on post-deployment code edits.
