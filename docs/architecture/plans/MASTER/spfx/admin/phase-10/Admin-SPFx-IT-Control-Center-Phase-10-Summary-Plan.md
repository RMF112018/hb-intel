# Admin SPFx IT Control Center — Phase 10 Summary Plan

## Purpose

Phase 10 implements the **hybrid source-of-truth model** for standards and configuration in the Admin SPFx IT Control Center.

The phase exists to move the platform from:
- code-only defaults,
- environment-only operational settings,
- and scattered reference docs,

into a governed model where:
- repo-defined defaults still exist,
- approved settings can be maintained live by an authorized admin,
- secrets and infrastructure-controlled values remain outside the live-admin surface,
- every effective value is versioned, auditable, explainable, and traceable to the runs that used it.

## Major objectives

1. Introduce a canonical standards/configuration taxonomy.
2. Freeze the hybrid source-of-truth boundary:
   - code defaults,
   - live admin-maintained overrides,
   - infrastructure / secret settings that remain outside live admin editing.
3. Add a real live configuration registry/store for admin-maintainable values.
4. Add versioning, history, diffing, provenance, and auditability.
5. Add config resolution rules so the backend can compute:
   - effective values,
   - source/provenance,
   - version identity,
   - and run-time snapshots.
6. Add admin API and SPFx operator-console surfaces for governed config management.
7. Capture run-to-config traceability so future rollout, SharePoint-control, and Entra-control actions can record exactly which standards/config version they used.
8. Reconcile existing wave-0 config docs and code so the repo has one coherent baseline.

## Governing constraints carried into this phase

### Locked by the end-state plan
- The system must support **code-defined defaults**.
- It must support **live admin-maintained governed config where appropriate**.
- It must support **config versioning**, **config audit trail**, and **config-to-run traceability**.
- Standards/configuration governance is a **first-class capability**.
- The hybrid repo/live model is required; this is not an optional enhancement.
- The frontend remains the operator console, not the privileged execution layer.
- High-risk safety hardening continues in Phase 11; Phase 10 should not try to fully consume that scope.

### Repo-truth implications
- There is already a typed environment registry in `backend/functions/src/config/wave0-env-registry.ts`.
- There is already a config-validation path in `backend/functions/src/utils/validate-config.ts`.
- There is already a configuration reference doc at `docs/reference/configuration/wave-0-config-registry.md`.
- There are already wave-0 contract/configuration plans under `docs/architecture/plans/MVP/G1/`.
- The admin app still does not appear to have a dedicated standards/configuration lane; current admin routing still points mainly to access-control and provisioning-oriented sections.
- Existing repo truth strongly suggests that **secrets/infrastructure configuration and live admin-governed standards should remain separate concerns**.

## Recommended Phase 10 implementation posture

### Recommended storage strategy for this phase
Use a **repo-native hybrid model**:

1. **Code registry / schema layer**
   - Canonical definitions of every governed config/standard item
   - Type, validation, scope, allowed editor role, default value source, mutability, risk tier

2. **Live override/version store**
   - Backed by the existing app-data persistence pattern (prefer the current Azure Table / Cosmos Table API foundation behind an abstraction)
   - Stores only admin-maintainable non-secret values and version metadata
   - Does not store secrets

3. **Resolution engine**
   - Computes effective config from:
     - code defaults
     - live overrides
     - environment / protected infrastructure settings where applicable
   - Returns provenance and effective version identity

4. **Audit/history store**
   - Durable record of create/update/publish/revert events
   - Diff payloads, actor, timestamp, reason, version identifiers
   - Links to downstream runs

### Why this posture is recommended
It preserves current repo foundations, avoids forcing a new platform dependency into the middle of implementation, and still leaves room for future Azure App Configuration integration behind an abstraction if later desired.

## In-scope repo/doc/code areas

### Docs
- `docs/architecture/plans/MASTER/spfx/admin/**`
- `docs/architecture/blueprint/current-state-map.md` only if present-truth alignment is needed
- `docs/reference/configuration/**`
- `docs/architecture/plans/MVP/G1/**` where phase-10 reconciliation requires it

### Backend
- `backend/functions/src/config/**`
- `backend/functions/src/utils/**`
- `backend/functions/src/services/**`
- `backend/functions/src/functions/**`
- `backend/functions/src/types/**` or equivalent contract/model locations
- any existing admin API host/routing surfaces already used by the admin control plane

### Frontend / shared packages
- `apps/admin/**`
- `packages/features/admin/**`
- `@hbc/ui-kit` usage where new reusable surfaces belong
- any shared contracts package if config/version/audit types need a reusable home

## Deliverables this phase must produce

1. Phase 10 architecture baseline for hybrid config governance
2. Source-of-truth boundary matrix
3. Standards/config taxonomy and config item catalog model
4. Live config registry/store implementation
5. Version and audit model
6. Resolution engine with provenance
7. Run-to-config snapshot integration
8. Admin API surfaces for config reads/writes/publish/revert/history
9. Admin SPFx standards/config lane
10. Seed/migration/backfill for existing business-controlled config where appropriate
11. Documentation, runbooks, and validation artifacts

## Risks Phase 10 is addressing

- Business-editable settings remaining scattered across env vars and docs
- Secrets accidentally entering a live-admin-maintained store
- No reliable way to tell which config version a run used
- Drift between code registry and documentation
- No audit trail for admin changes
- Admin UI being added before backend governance exists
- Future SharePoint/Entra control actions operating against ambiguous standards state
- Phase 11 safety work being pulled too far forward into this phase

## Why Phase 10 must come before fuller standards/repair maturity

Phase 8 SharePoint control and repair depends on stable governed standards.
Future admin actions need to know:
- what the standard is,
- whether it came from code default or live override,
- who changed it,
- when it changed,
- and which run consumed it.

Without Phase 10, standards enforcement and repair remain partially opaque and hard to defend.

## Recommended internal implementation sequence

1. Audit repo truth and reconcile existing config docs vs code.
2. Freeze the hybrid source-of-truth boundary.
3. Define the standards/config taxonomy and canonical config item catalog.
4. Implement backend provider abstractions and live override/version store.
5. Implement version history, diff, publish/revert, and audit contracts.
6. Implement resolution/provenance services and run-to-config snapshots.
7. Expose admin APIs with proper non-secret / protected-setting boundaries.
8. Build the Admin SPFx standards/config lane.
9. Seed/backfill admin-maintainable config from current wave-0 baselines where justified.
10. Align docs, runbooks, and perform exit reconciliation.

## Acceptance criteria for Phase 10 completion

Phase 10 is complete when all of the following are true:

- There is one authoritative Phase 10 architecture baseline for hybrid config governance.
- The repo has an explicit boundary between:
  - code defaults,
  - live admin-maintainable values,
  - and infrastructure/secret settings.
- A live config registry/store exists for non-secret admin-maintainable values.
- Effective config resolution returns provenance and version identity.
- Changes are versioned, diffable, auditable, and revertable through governed flows.
- At least the targeted first-wave standards/config domains can be viewed and managed from the Admin app.
- Downstream runs can capture or reference the exact effective config snapshot/version used.
- Existing wave-0 config docs are reconciled so they no longer materially contradict code.
- Validation confirms no secret/infrastructure-only setting is exposed as live-editable by the admin surface.

## Explicit non-goals for Phase 10

Do **not** let this phase drift into:
- full high-risk action safety framework completion (Phase 11),
- broad observability completion (Phase 12),
- broad tenant-wide SharePoint active governance outside the first-wave boundary,
- broad new install/bootstrap scope,
- or a forced migration of all environment settings into a new configuration platform.

Phase 10 is about **governed live admin-maintained standards/configuration**, not a full re-platform of every setting in the system.
