# Admin SPFx IT Control Center — Phase 9 Summary Plan

## Purpose

Phase 9 delivers the **Hybrid Identity Administration foundation** for the Admin SPFx IT Control Center.

This phase **redirects** the prior Phase 9 “broad Entra administration” target into a model that better fits a hybrid environment where **AD DS is the likely source of authority for core user lifecycle** and **Microsoft Entra ID / Graph remains the cloud-side identity, access, sync-visibility, and follow-on control surface**.

At this phase, the Admin app stops being limited to provisioning-era identity helpers and gains a real **Hybrid Identity control lane** for identity operations through the privileged backend/control plane. The intent is not to finish every identity-governance feature in Microsoft 365. The intent is to establish a serious, production-directed **hybrid identity administration substrate** that supports:

- authoritative user lifecycle administration in the correct system of record,
- group and access administration with explicit source-of-authority handling,
- rollout-critical identity operations,
- cloud-side visibility and follow-on actions where appropriate,
- audit-backed execution,
- risk-aware workflow handling,
- sync-aware operator feedback,
- full UI configurability of the backend connections required to make the feature functional,
- and a clean frontend/backend boundary.

## Hard gate — no-code IT handoff and setup

This phase is governed by a **hard gate**:

After the final `.sppkg` is delivered, authorized IT administrators must be able to install the app and complete required operational setup **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

The intended operating model is:

- the developer hands off the packaged app,
- IT installs it in SharePoint,
- IT completes operational setup and ongoing maintenance through:
  - governed UI surfaces inside the app, and
  - standard Microsoft admin approval pages where unavoidable,
- and the feature becomes functional without developer code intervention.

This hard gate allows **standard tenant-admin or platform-admin actions** where the product cannot legally or safely replace them, such as:

- SharePoint / Microsoft 365 admin-center approvals,
- Graph / API consent,
- tenant-level permission grants,
- pre-existing hybrid infrastructure requirements that are outside SPFx itself.

This hard gate does **not** allow:

- asking IT to edit code,
- asking IT to edit `.env` files,
- asking IT to patch backend config by hand in source,
- asking IT to change package manifests,
- asking IT to open the repo and “set one value,”
- or hiding required connection setup in undocumented deployment-time engineering steps.

Secrets, credentials, keys, certificates, and other sensitive values may be **entered through the UI** only if they are handled, stored, and resolved securely by the privileged backend. They must not be stored in SPFx/browser code.


## Governing basis

### End-state-plan facts driving this phase

The current end-state plan names Phase 9 as **Broad Entra administration foundation** and states that early identity administration must be a real workstream, not a later enhancement.

This redirected package preserves that intent, while correcting the target execution model:

- **Identity administration remains early scope.**
- **The SPFx app remains the operator console.**
- **The backend remains the privileged executor.**
- **Existing provisioning/orchestration patterns remain reusable foundations.**
- **The user/group lifecycle source of authority must match the actual environment rather than being assumed to be cloud-only Entra.**

### Repo-truth facts shaping the phase

Current repo truth, as already identified in the original Phase 9 package, indicates:

- `apps/admin/` exists and is a real SPFx app shell, but it is currently routed only around a small admin surface area rather than a dedicated identity lane.
- `apps/admin/src/pages/` currently contains only:
  - `SystemSettingsPage.tsx`
  - `ProvisioningFailuresPage.tsx`
  - `ErrorLogPage.tsx`
- `SystemSettingsPage.tsx` is centered on `@hbc/auth` admin access-control UI, not broad identity administration.
- `packages/features/admin/` is a reusable admin-intelligence package with monitors, probes, APIs, hooks, integrations, and components. It is not the privileged executor.
- `backend/functions/src/services/graph-service.ts` already exists, but its implemented responsibilities are still narrow and provisioning-oriented.
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` shows the repo already has a meaningful privileged execution pattern with retry, audit writes, and durable status progression.
- The current repo truth must be re-checked for any existing on-prem or hybrid identity patterns before implementation begins.

## Redirected Phase 9 thesis

The original package correctly assumed that identity administration belongs behind the privileged backend and not in SPFx. The correction is **not** to abandon identity administration. The correction is to stop treating **Graph-backed Entra administration as the authoritative user-management substrate** in an environment that appears to depend on **AD DS / hybrid join realities**.

Phase 9 should therefore become:

- **AD DS authoritative** for synced user lifecycle actions where the environment requires it,
- **source-of-authority-aware** for groups and membership,
- **Entra / Graph aware** for cloud-side identity state, sync visibility, cloud-only objects, and follow-on access actions,
- **operator-safe and audit-backed** through the same control-plane doctrine already established for the Admin app.

## Major objectives

1. Define the **Hybrid Identity control lane** boundary clearly.
2. Define a canonical **source-of-authority model** for users, groups, and access actions.
3. Add or formalize a **privileged AD DS / on-prem identity execution boundary** in the backend where repo truth shows it is missing.
4. Refine the **Graph / Entra boundary** so cloud-side actions are handled cleanly without pretending they replace AD DS authority.
5. Separate:
   - authoritative user lifecycle actions,
   - group / membership actions by authority type,
   - rollout-critical access setup,
   - cloud visibility and sync-state actions.
6. Introduce a phase-appropriate **action catalog**, **risk model**, **source-of-authority matrix**, and **permission/access matrix**.
7. Implement audit-backed hybrid identity workflows through the privileged backend.
8. Add a **Hybrid Identity lane** to the Admin SPFx application.
9. Keep dangerous or privileged logic out of SPFx.
10. Deliver a **no-code connection-management model** so IT can configure, test, rotate, and maintain required backend connections entirely through the UI.
11. Make the no-code IT handoff requirement a **hard release gate** for the phase.
12. Document backend, environment, connectivity, admin-approval, and operator prerequisites clearly.
13. Add tests, validation, and reconciliation so the lane can be trusted.

## In-scope repo / doc / code areas

### Frontend
- `apps/admin/**`

### Reusable admin intelligence
- `packages/features/admin/**` only where phase-appropriate reusable UI/state primitives are needed

### Backend / control plane
- `backend/functions/**`

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `docs/reference/**` where new hybrid identity operational references or environment guidance are needed
- local READMEs for touched areas if warranted

## Expected deliverables

### Documentation / architecture outputs
- Phase 9 repo-truth, prerequisite, topology, and gap map
- Phase 9 hybrid identity architecture baseline
- source-of-authority and scope map
- connection topology, authority, and configuration model
- identity action catalog and risk taxonomy
- permission / access / role matrix
- environment and prerequisite guide
- operator runbook notes
- validation and exit reconciliation report

### Backend outputs
- AD DS / on-prem identity execution boundary or equivalent hybrid-identity adapter pattern
- refined Graph / Entra service boundary
- governed connection registry / connection settings substrate for hybrid identity connectors
- secure backend handling for connection details, secrets, credential references, and connection health checks
- governed backend persistence/resolution for UI-managed connection settings without code edits
- phase-appropriate hybrid identity action models / request models
- AD DS-authoritative user workflows
- group / membership workflows with explicit authority routing
- cloud-side sync / evidence / status behavior
- tests for hybrid identity services, connectors, and workflows

### Frontend outputs
- Hybrid Identity control lane in admin navigation
- route / page structure for hybrid identity administration
- dedicated connection-management pages / flows for required hybrid identity connectors
- setup-completion UX that makes the app installable and operable by IT without code interaction
- risk-aware forms and execution UX
- source-of-authority visibility
- connection health / status / last-verified visibility
- preview / impact / confirmation patterns where phase-appropriate
- operator visibility into results, failures, sync state, and audit / history surfaces

## Risks Phase 9 is addressing

- building a broad Entra admin lane that conflicts with the company’s actual identity authority model
- assuming Graph user administration is a drop-in replacement for AD DS-backed lifecycle management
- putting AD DS or other privileged identity execution in SPFx
- over-permissioning Graph because authority routing was not modeled
- treating AD-synced groups, cloud-only groups, and rollout-critical access groups as one generic group domain
- ignoring sync timing / propagation realities and therefore misleading operators
- adding UI pages that do not correspond to real privileged backend capability
- leaving connection setup dependent on code edits, environment-file edits, deployment-template edits, or developer intervention
- storing connection details unsafely in the frontend or scattering them across ad hoc config paths
- treating `@hbc/features-admin` as the control plane instead of keeping it reusable

## Why Phase 9 must exist as a discrete phase

The end-state plan makes early identity administration a real workstream, not a late enhancement. The current repo already has Graph and orchestration foundations, but they remain narrow and provisioning-centric. Without a discrete redirected Phase 9 implementation wave:

- identity capabilities will remain scattered,
- the Admin app will continue to lack a true identity lane,
- lifecycle authority will remain mis-modeled,
- group and access administration will be improvised instead of modeled,
- and permission / backend / audit concerns will drift into ad hoc implementation.

## Recommended implementation sequence inside the phase

1. Verify phase prerequisites, repo truth, hybrid-identity environment assumptions, and current connection/config handling reality.
2. Write the Phase 9 hybrid identity architecture, authority, connection, and gap baseline docs.
3. Define the action catalog, source-of-authority matrix, risk tiers, connection dependencies, and permission/access matrix.
4. Add the AD DS / hybrid identity adapter boundary, refine the Graph service boundary, and introduce a governed connection-management substrate.
5. Add backend hybrid identity run / action models, connection models, and supporting workflow primitives.
6. Implement AD DS-authoritative user-administration flows.
7. Implement group / membership / cloud-access workflows with explicit authority routing.
8. Add the Hybrid Identity control lane and connection-management UI in the Admin SPFx app.
9. Add operator safety, source-of-authority visibility, connection health visibility, sync-state visibility, and evidence/history behavior.
10. Update docs, env guidance, runbooks, and handoff guidance with zero-code setup instructions.
11. Reconcile, validate, and close the phase against the hard no-code handoff gate.

## Acceptance criteria

Phase 9 is complete when all of the following are true:

- the repo has a canonical Phase 9 hybrid identity baseline and gap map,
- the source-of-authority model is documented explicitly,
- authoritative user lifecycle actions are modeled explicitly,
- the backend no longer assumes Graph is the authority for all identity operations,
- AD DS / on-prem execution requirements are handled through the privileged backend rather than SPFx,
- the Admin app contains a dedicated Hybrid Identity control lane,
- rollout-critical, authoritative, and cloud-side identity operations are separated clearly,
- Graph permissions, on-prem execution requirements, and connector dependencies are documented action-by-action,
- the required backend connections can be configured, tested, updated, re-verified, and rotated entirely through the UI without code edits,
- the feature does not require normal post-deployment code edits, `.env` edits, backend config-file edits, or manifest edits for IT setup and use,
- any unavoidable external admin approvals are surfaced explicitly as admin-page steps rather than hidden engineering work,
- identity operations write durable audit/evidence records or phase-appropriate audit artifacts,
- tests cover the new hybrid identity services, connectors, governed connection handling, and workflow preflight behavior,
- docs and README surfaces are updated and no material contradiction remains.

## Explicit non-goals

Do not let this phase drift into:

- a broad rewrite of all admin architecture docs outside what is needed for Phase 9 redirection,
- full tenant-wide M365 administration outside the hybrid identity boundary,
- full device-join / workstation-management implementation,
- full password writeback / SSPR / federation redesign unless repo truth and approved scope explicitly require it,
- Phase 10 live standards/config governance work beyond minimal compatibility,
- Phase 11 full high-risk-action safety maturity beyond what is needed for clean hybrid identity foundations,
- Phase 12 observability completion,
- or broad SharePoint control work outside the identity boundary.
