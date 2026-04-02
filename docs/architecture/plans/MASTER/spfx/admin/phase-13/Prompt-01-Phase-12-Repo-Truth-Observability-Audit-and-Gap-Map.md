# Prompt-01 — Phase 12 Repo-Truth Observability Audit and Gap Map

## Objective

Verify the current observability state of the Admin SPFx IT Control Center and produce a durable Phase 12 gap map grounded in repo truth.

This prompt is an **audit and evidence prompt**, not the implementation prompt for the whole phase.

## Important execution rules

- Read the **smallest authoritative set** needed.
- Do **not** re-read files that are already in current agent context unless they changed, context is stale, or the task scope widened.
- Do not jump into code changes beyond the minimum needed to record a clearly scoped documentation artifact if none exists yet.
- Distinguish clearly between:
  - confirmed repo fact,
  - confirmed governing-plan fact,
  - inferred recommendation,
  - unresolved issue.

## Governing context for this prompt

Treat the following as already true for Phase 12 planning:
- The frontend is the **operator console**, not the persistence or privileged execution layer.
- The backend/control plane is the right home for durable observability execution and storage.
- `@hbc/features-admin` is the reusable observability/admin-intelligence package.
- This phase is about replacing deferred or in-memory observability scaffolding with durable, production-grade behavior.

## Read this authority set first

1. governing end-state plan for the Admin SPFx IT Control Center
2. `docs/architecture/blueprint/current-state-map.md`
3. `docs/architecture/plans/MASTER/spfx/admin/**`
4. `apps/admin/package.json`
5. `apps/admin/src/router/routes.ts`
6. `apps/admin/src/pages/SystemSettingsPage.tsx`
7. `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
8. `apps/admin/src/pages/ErrorLogPage.tsx`
9. `packages/features/admin/README.md`
10. `packages/features/admin/**` source files related to:
    - alerts
    - probes
    - monitor registry
    - admin APIs
    - hooks
    - dashboard components
11. `packages/models/**` files related to admin alerts, probes, provisioning status, and audit/error domain models
12. `backend/functions/src/services/service-factory.ts`
13. `backend/functions/src/**` areas related to:
    - provisioning saga
    - logging
    - telemetry
    - admin/provisioning query APIs
    - persistence adapters
14. relevant test files already covering admin observability behavior

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-observability-gap-map.md`

## Required sections in the new file

1. **Purpose**
2. **Authority set actually used**
3. **Confirmed repo facts**
4. **Current observability assets already present**
5. **Current observability limitations**
6. **Phase 12 required closures**
7. **Non-gaps / do-not-rebuild items**
8. **Dependencies on prior phases that appear already satisfied vs still partial**
9. **Unresolved implementation issues with recommended direction**
10. **Recommended internal breakdown for Phase 12 execution**

## Minimum facts to verify and record if still true

- `apps/admin` already exists as a real SPFx app package.
- Current admin routing still does not expose a true standalone error-log surface.
- `ProvisioningFailuresPage` already contains real retry / escalate operator actions.
- `ErrorLogPage` is still explicitly deferred / empty-state based.
- `@hbc/features-admin` already documents in-memory observability limitations.
- Alert store and probe snapshot store are not yet production-grade durable stores.
- Some monitors and probes remain deferred or stubbed.
- `backend/functions` already contains useful persistence / telemetry / retry foundations.
- The browser is not yet the right place to solve durability gaps.

## Quality bar

The gap map must separate:
- what already exists,
- what is partial,
- what is missing,
- and what should explicitly be preserved.

Do not collapse these categories.

## Validation

Before finishing:
- verify all named paths still exist,
- verify the gap map does not present intended-state claims as repo truth,
- verify the recommended breakdown remains Phase 12 only.

## Completion condition

Stop after the gap map is complete and internally consistent.
Do not start shared-model or backend implementation in this prompt.
