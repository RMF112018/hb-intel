# PH4 Shell Consolidation — Removal of `@hbc/app-shell`

> **Doc Classification:** Historical Foundational — Phase 4 is complete; this plan is sealed and retained for audit trail. Do not modify for current work.

**Date:** 2026-03-05
**Phase:** 4 (Shell Consolidation)
**Base Commit:** e26faa719e3edcd3ae997c1973b6ce5fca34416d
**Related ADR:** [ADR-0033: UI-Kit App Shell Wiring Strategy](../adr/ADR-0033-ui-kit-app-wiring.md)

## Summary

The redundant package `@hbc/app-shell` (located at `packages/app-shell`) has been removed from the
monorepo. This package was a thin re-export wrapper that forwarded all exports from
`@hbc/ui-kit/app-shell` without adding any logic, components, or value.

## Verification Results

Before deletion, the following four-point verification was performed:

1. **Import analysis:** `@hbc/app-shell` had exactly one consumer — `packages/spfx`
   (`HbIntelHeaderApplicationCustomizer.ts`). No apps in `apps/` imported from it.
2. **Dependency analysis:** Only `@hbc/spfx` listed `@hbc/app-shell` in its `package.json`.
   No consumer app (PWA, dev-harness, hb-site-control, or any SPFx webpart) depended on it.
3. **UI-Kit subpath export:** `@hbc/ui-kit/app-shell` exports `HbcAppShell`,
   `HbcConnectivityBar`, and all associated types — the exact same surface area as
   `@hbc/app-shell`. The re-export was fully redundant.
4. **`@hbc/shell` package:** Confirmed as the sole core-logic package providing Zustand stores
   (`useNavStore`, `useProjectStore`), `ShellLayout`, types, and constants. Depended upon by
   all consumer apps and `@hbc/ui-kit`.

## Changes Made

| Action | File/Folder |
|--------|-------------|
| **Deleted** | `packages/app-shell/` (entire directory) |
| **Migrated import** | `packages/spfx/…/HbIntelHeaderApplicationCustomizer.ts` — changed `@hbc/app-shell` → `@hbc/ui-kit/app-shell` |
| **Updated dependency** | `packages/spfx/package.json` — replaced `@hbc/app-shell` with `@hbc/ui-kit` |
| **Cleaned lockfile** | `pnpm-lock.yaml` regenerated via `pnpm install` |
| **Updated ADR** | `docs/architecture/adr/ADR-0033-ui-kit-app-wiring.md` |

## Architecture Decision

`@hbc/ui-kit` is the **single authoritative source of truth** for all shell-related UI components:

- `@hbc/ui-kit/app-shell` — `HbcAppShell`, `HbcConnectivityBar`, and types (for SPFx bundles)
- `@hbc/ui-kit` (main export) — full UI component library

`@hbc/shell` remains the core-logic package for stores, layout primitives, and types.

There is no longer any intermediate re-export layer between `@hbc/ui-kit` and consumers.

## Rollback Instructions

```bash
git checkout main && git branch -D chore/remove-redundant-app-shell
```

Or revert the specific commit containing these changes.
