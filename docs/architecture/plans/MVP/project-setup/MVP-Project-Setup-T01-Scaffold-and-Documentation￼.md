# MVP-Project-Setup-T01 — Scaffold and Documentation Alignment

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** D-01, D-02, D-10, D-12, D-15 + R-01 through R-08
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** master plan only; ADR-0091 must exist on disk before this task begins
> **Doc Classification:** Canonical Normative Plan — scaffold/documentation task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Fix known codebase defects, add missing package dependencies, create the implementation scaffolding, and update documentation and ownership boundaries required to execute the remaining MVP tasks without architectural drift.

---

## Required File / Path Scope

```text
packages/models/src/provisioning/*
packages/provisioning/src/*
apps/estimating/package.json
apps/estimating/src/pages/*
apps/accounting/package.json
apps/accounting/src/pages/*
apps/accounting/src/router/routes.ts
apps/admin/package.json
apps/admin/src/pages/*
apps/admin/src/router/routes.ts
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/provisioningSaga/*
packages/ui-kit/*
packages/bic-next-move/*
packages/field-annotations/*
packages/notification-intelligence/*
packages/step-wizard/*
docs/architecture/plans/*
docs/architecture/adr/*
```

---

## Known Defects to Fix in T01

These are existing codebase issues that must be corrected before any later task builds on them.

### 1. Admin router bug

`apps/admin/src/router/routes.ts` maps `/provisioning-failures` to `SystemSettingsPage` instead of `ProvisioningFailuresPage`.

**Fix:** Update the `provisioningRoute` component to render `ProvisioningFailuresPage` directly:

```ts
component: lazyRouteComponent(() =>
  import('../pages/ProvisioningFailuresPage.js').then((m) => ({ default: m.ProvisioningFailuresPage }))
),
```

### 2. Admin undeclared dependency

`apps/admin/src/pages/ProvisioningFailuresPage.tsx` imports `createProvisioningApiClient` from `@hbc/provisioning`, but `@hbc/provisioning` is not declared in `apps/admin/package.json`.

**Fix:** Add `"@hbc/provisioning": "workspace:*"` to `apps/admin/package.json` dependencies.

### 3. State machine duplication

`packages/provisioning/src/state-machine.ts` and `backend/functions/src/state-machine.ts` are near-identical implementations of the same state transition table. **Any state or transition changes in T02 must be applied to both files.** Document this constraint in both READMEs now. Do not attempt to consolidate or merge them in T01 — note the duplication and defer consolidation to a follow-on task if desired.

---

## Required Package.json Dependency Additions

The following dependencies must be added before downstream tasks can build. Add each entry under `"dependencies"` in the listed `package.json` file.

| App | Add Dependencies |
|-----|-----------------|
| `apps/admin/package.json` | `@hbc/provisioning` |
| `apps/accounting/package.json` | `@hbc/provisioning`, `@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/step-wizard`, `@hbc/notification-intelligence` |
| `apps/estimating/package.json` | `@hbc/bic-next-move`, `@hbc/field-annotations`, `@hbc/step-wizard` |

All additions use the workspace protocol: `"workspace:*"`

**Important:** `@hbc/versioned-record` is Scaffold-only (v0.0.1) and must **not** be added to any MVP app or package.

---

## ProvisioningChecklist Disposition Decision

`apps/estimating/src/components/ProvisioningChecklist.tsx` is an existing app-local component. Decide and record which option applies before T04 is executed:

- **Option A (preferred for MVP):** Replace with `@hbc/step-wizard` composition — remove `ProvisioningChecklist` entirely and render progress via `@hbc/step-wizard` within `RequestDetailPage`.
- **Option B:** Promote the rendering logic to `@hbc/ui-kit` as a reusable `ProvisioningStepList` component — then both Estimating and Accounting can consume it. Requires an ADR exception if it introduces a new standalone visual primitive.

Record the decision as a comment or note in `apps/estimating/src/components/ProvisioningChecklist.tsx` and in `apps/estimating/README.md` before T04 begins.

---

## Scaffold and Documentation Requirements

1. **Create / update one README or implementation note per touched runtime owner**
   - `packages/provisioning/README.md` — must note state machine duplication constraint
   - `apps/estimating/README.md` — must note ProvisioningChecklist disposition decision
   - `apps/accounting/README.md` — must note Controller surface is being built from scratch in T03
   - `apps/admin/README.md` — must note T01 router fix and takeover semantics TBD in T07
   - `backend/functions/README.md` — must note state machine duplication and existing notifications pipeline

2. **Document research-informed non-negotiables**
   - idempotent provisioning steps (R-02)
   - SignalR + status-resource dual path (R-03)
   - `Retry-After`/throttling backoff handling (R-05)
   - Graph-first preference where feasible (R-04)
   - one-template strategy (D-06)
   - least-privilege post-create site access strategy (R-06)

3. **State ownership explicitly in each README**
   - `@hbc/provisioning` = headless logic only; no visual components
   - `@hbc/ui-kit` = reusable visuals only
   - `@hbc/step-wizard` = mandatory for multi-step progress rendering (not optional)
   - app workspaces = role-specific composition shells
   - `backend/functions` = orchestration + persistence + integration side effects

---

## README Minimum Content

Each touched owner must document:

1. purpose within the MVP workflow
2. role ownership and next-move semantics
3. upstream/downstream dependencies
4. status and recovery semantics where relevant
5. verification commands
6. known MVP exclusions (especially: `@hbc/versioned-record` excluded; external access excluded per D-14)

---

## Research Alignment Rules to Capture in Docs

- Site-template/site-script actions are the baseline for repeatable site-scoped configuration.
- Custom provisioning steps exist only where native site-template actions are insufficient or where the repo's bifurcated engine already provides a stronger fit.
- SignalR tokens are ephemeral; client reconnect and renegotiation behavior must be documented.
- Pollable status is required even when SignalR is enabled.
- Least-privilege automation posture must be documented separately from SharePoint end-user permissions.
- The backend notifications pipeline (`backend/functions/src/functions/notifications/`) is already scaffolded and must be integrated with, not duplicated.

---

## Verification Commands

```bash
# Confirm admin router fix
grep -n "ProvisioningFailuresPage" apps/admin/src/router/routes.ts

# Confirm @hbc/provisioning declared in admin
grep '"@hbc/provisioning"' apps/admin/package.json

# Confirm accounting has all required new deps
grep -E '"@hbc/provisioning"|"@hbc/bic-next-move"|"@hbc/field-annotations"|"@hbc/step-wizard"|"@hbc/notification-intelligence"' apps/accounting/package.json

# Confirm estimating has new deps
grep -E '"@hbc/bic-next-move"|"@hbc/field-annotations"|"@hbc/step-wizard"' apps/estimating/package.json

# Confirm @hbc/versioned-record is NOT declared in any MVP app
grep -rn "@hbc/versioned-record" apps/estimating/package.json apps/accounting/package.json apps/admin/package.json && echo "ERROR: versioned-record must not be added" || echo "OK: versioned-record correctly absent"

# Confirm state machine duplication is documented
test -f packages/provisioning/README.md && grep -n "state machine\|state-machine\|duplication" packages/provisioning/README.md
test -f backend/functions/README.md && grep -n "state machine\|state-machine\|duplication" backend/functions/README.md

# Confirm all READMEs exist
test -f packages/provisioning/README.md && echo "OK: provisioning README" || echo "MISSING: provisioning README"
test -f apps/estimating/README.md && echo "OK: estimating README" || echo "MISSING: estimating README"
test -f apps/accounting/README.md && echo "OK: accounting README" || echo "MISSING: accounting README"
test -f apps/admin/README.md && echo "OK: admin README" || echo "MISSING: admin README"

# Confirm research non-negotiables are documented somewhere
rg -n "idempotent|Retry-After|SignalR|status endpoint|Sites.Selected|site template" packages/provisioning/README.md backend/functions/README.md
```
