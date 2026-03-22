# @hbc/shell

Shell orchestration, shell-status, degraded-mode, and host-boundary foundation package for Phase 5.

## Purpose Summary

`@hbc/shell` is the canonical owner of shell composition, shell-state/status arbitration,
navigation shell orchestration, and runtime host boundary enforcement. It consumes
`@hbc/auth` contracts and never re-implements auth truth.

## Architecture Responsibilities

`@hbc/shell` owns:

- Shell core orchestration and shell experience-state resolution.
- Shell layout composition and workspace navigation shell boundaries.
- Shell-status hierarchy and action priority arbitration.
- Degraded-mode and safe recovery shell policy surfaces.
- Redirect-memory orchestration and sign-out cleanup policy.
- Startup timing budgets and release diagnostics surfaces.
- SPFx host boundary validation and normalized host signal seam handling.
- SPFx-to-PWA cross-lane escalation deep-link construction (Phase 3).
- Protected feature registration contract validation/enforcement.

`@hbc/shell` does not own:

- Provider adapter internals or auth identity acquisition.
- Role mapping and permission source-of-truth computation.
- Access override governance workflow decisions.

These concerns are owned by `@hbc/auth`.

## Major Public Contracts

- Shell orchestration: `ShellCore`, `ShellEnvironmentAdapter`, `ShellModeRules`.
- Shell status: `ShellStatusSnapshot`, `SHELL_STATUS_PRIORITY`.
- Degraded/recovery policies: degraded section metadata + recovery contracts.
- SPFx boundary contracts: `SpfxHostBridge`, host signal handlers.
- Protected feature contracts: registration/validation/registry interfaces.
- Startup diagnostics: startup phase, budget, and snapshot contracts.
- Landing resolver: `resolveLandingDecision`, `LandingDecision`, `LandingDecisionInput`, `LandingMode`, `TeamMode`.
- Cohort gate: `isMyWorkCohortEnabled`.

## Landing Resolver (Phase 2)

`resolveLandingDecision()` is the **sole policy authority** for landing path decisions (P2-B1 §11.1).
All landing-path consumers must call this shared resolver — no parallel role/cohort branching is permitted.

### Exports

| Export | Kind | Purpose |
|--------|------|---------|
| `resolveLandingDecision` | Function | Pure function: role + cohort → landing path. No store access. |
| `LandingDecisionInput` | Type | Input: `resolvedRoles`, `runtimeMode`, `redirectTarget?`, `cohortEnabled` |
| `LandingDecision` | Type | Output: `pathname`, `landingMode` (`'legacy'` or `'phase-2'`), `teamMode?` |
| `LandingMode` | Type | `'legacy' \| 'phase-2'` |
| `TeamMode` | Type | `'personal' \| 'delegated-by-me' \| 'my-team'` |

### Landing Precedence

1. **Redirect memory** (Priority 1) — caller passes validated `redirectTarget`
2. **Administrator** → `/admin` (always, regardless of cohort)
3. **Executive + cohort** → `/my-work` with `teamMode: 'personal'`
4. **Executive + no cohort** → `/leadership`
5. **Standard role + cohort** → `/my-work` with `teamMode: 'personal'`
6. **Standard role + no cohort** → `/project-hub`

### Consumers

- `apps/pwa/src/router/workspace-routes.ts` — index route `beforeLoad`
- `apps/pwa/src/router/root-route.tsx` — post-auth Priority 2 landing
- `packages/shell/src/ShellCore.tsx` — via deprecated `resolveRoleLandingPath()` (delegates with `cohortEnabled: false`)

### Anti-Pattern

Do NOT create a second landing resolver or duplicate role/cohort branching in route files.
`resolveRoleLandingPath()` is deprecated — it delegates to the shared resolver with `cohortEnabled: false`.

## Cohort Gate (Phase 2)

`isMyWorkCohortEnabled()` is the **single source of truth** for `/my-work` pilot cohort enablement (P2-B1 §6).

| Export | Kind | Purpose |
|--------|------|---------|
| `isMyWorkCohortEnabled` | Function | Returns `true` when the current user is in the `/my-work` pilot cohort |

- Reads `usePermissionStore.getState().hasFeatureFlag('my-work-hub')` from `@hbc/auth`
- Feature flag key: **`my-work-hub`**
- Called imperatively via `.getState()` — safe for `beforeLoad` route guards
- Replaceable with a real cohort service without changing consumers

### Consumers

- `apps/pwa/src/router/workspace-routes.ts` — index route cohort check
- `apps/pwa/src/router/root-route.tsx` — post-auth landing cohort check
- `apps/pwa/src/utils/shell-bridge.ts` — "My Work" nav item visibility

### Anti-Pattern

Do NOT read `hasFeatureFlag('my-work-hub')` directly from `usePermissionStore` in app code.
Always use `isMyWorkCohortEnabled()` so the gate can be replaced in one place.

## Component Export Tiers

Not all exports from `@hbc/shell` are designed for direct app use.
See [docs/reference/shell/component-exports.md](../../docs/reference/shell/component-exports.md)
for the full export tier reference.

## Runtime Boundaries

- PWA/SPFx/HB Site Control/dev-override are all host environments for one shell.
- Shell composition authority always remains inside shell rules/adapters.
- SPFx host input is constrained to approved seams (container metadata, identity reference, host signals).

## Integration Rules (Locked Option C)

- Per-feature organization remains required:
  - one file per major item
  - local `types.ts`
  - local `constants.ts`
  - local `index.ts`
- JSDoc is required on public exports.
- Consumers must import through package public barrels.
- Feature modules must not bypass protected feature registration + shell/auth contracts.
- SPFx-specific integrations must remain in documented boundary seams.

## Internal Architecture (PH7.3)

`ShellCore.tsx` is a thin coordinator that delegates orchestration to 7 internal hooks:

| Layer | Owns | Does Not Own |
|-------|------|-------------|
| `ShellCore.tsx` | Thin coordination, experience rendering branches, slot composition | Inline orchestration logic |
| `useRouteEnforcement` | Route evaluation, access decisions | Rendering, store mutations |
| `useShellDegradedRecovery` | Degraded eligibility, experience state, recovery state, `wasDegraded` tracking | Store sync, status rail |
| `useShellStatusRail` | Status snapshot, action mediation, rail rendering | Auth lifecycle, degraded policies |
| `useRedirectRestore` | Redirect memory restore with double-call semantics | Route enforcement |
| `useStartupTimingCompletion` | First protected render timing, monotonic clock | Phase recording (delegates to `startupTiming.ts`) |
| `useShellBootstrapSync` | Lifecycle→bootstrap mapping, store sync | State computation |
| `useSpfxHostAdapter` | SPFx bridge validation, signal normalization | Auth lifecycle |

Supporting pure-function modules: `degradedMode.ts`, `shellStatus.ts`, `redirectMemory.ts`, `startupTiming.ts`, `spfxHostBridge.ts`, `shellModeRules.ts`, `signOutCleanup.ts`, `shellExperience.ts`.

## Documentation and Traceability

- Phase plan: `docs/architecture/plans/PH5-Auth-Shell-Plan.md`
- Task plans: `docs/architecture/plans/PH5.5-Auth-Shell-Plan.md` through `PH5.18-Auth-Shell-Plan.md`
- Architecture overview: `docs/architecture/auth-shell-phase5-documentation-overview.md`
- Contracts/reference set: `docs/reference/auth-shell-*.md`
- ADR chain: `docs/architecture/adr/ADR-0054-*.md` through `ADR-0071-*.md`
- Blueprint anchors: `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Auth integration is guided by alignment markers in `packages/shell/src/ShellCore.tsx` (`D-PH5C-08`).
- Alignment marker standard/reference: `docs/reference/auth/alignment-markers.md`.

## Running Tests

Use the package-local scripts:

- `pnpm test`
- `pnpm test:watch`
- `pnpm test:coverage`

These scripts run through the root Vitest workspace (`vitest.workspace.ts`) and target the
`@hbc/shell` workspace project.

Fallback runner from repo root:

- `bash scripts/test-auth-shell.sh`
- `bash scripts/test-auth-shell.sh --coverage`
