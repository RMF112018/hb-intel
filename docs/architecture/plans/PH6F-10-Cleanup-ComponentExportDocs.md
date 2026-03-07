# PH6F-10 — Shell Component Export Audit & Documentation

**Plan ID:** PH6F-10-Cleanup-ComponentExportDocs
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §3a (Shell component contract), §4 (Documentation strategy)
**Foundation Plan Reference:** Phase 5A (ShellCore, shell component exports), CLAUDE.md §4 (Diátaxis docs)
**Priority:** LOW
**Execution Order:** 10th — after all other PH6F tasks; documentation-only task
**Estimated Effort:** 1–2 hours
**Risk:** NONE — documentation only; no code behavior changes

---

## Problem Statement

`@hbc/shell` exports five shell layout components directly from its package root:
- `HeaderBar`
- `AppLauncher`
- `ProjectPicker`
- `BackToProjectHub`
- `ContextualSidebar`

These components are designed for use *inside `ShellCore`'s internal composition* — they are
not independently usable by apps because they assume `ShellCore`-managed state (auth lifecycle,
experience state, shell status, startup timing context).

A developer importing `@hbc/shell` and using `HeaderBar` directly in an app component would
get a component that either crashes (missing context) or silently renders in an incorrect state.
There is no documentation warning against this, and no `@internal` annotation in the JSDoc.

This task adds protective JSDoc annotations and creates a reference document explaining which
shell exports are public API vs. internal composition.

---

## Step 1 — Audit Shell Exports

First, identify all components exported from `packages/shell/src/index.ts`:

```bash
grep "^export" packages/shell/src/index.ts | grep -v "type"
```

Categorize each export into one of three tiers:

**Tier 1 — Public API (safe for direct app use):**
- `ShellCore` — canonical integration surface for app mounting
- `DevToolbar` (via subpath `@hbc/shell/dev-toolbar`) — dev-only

**Tier 2 — Internal Composition (ShellCore only):**
- `HeaderBar`
- `AppLauncher`
- `ProjectPicker`
- `BackToProjectHub`
- `ContextualSidebar`
- `ShellLayout`

**Tier 3 — Utility/Hook API (safe for direct app use):**
- `resolveRoleLandingPath`
- `captureIntendedDestination`, `resolvePostGuardRedirect`, `clearRedirectMemory`, `isSafeRedirectPath`
- `runShellSignOutCleanup`, `createDefaultShellSignOutCleanupDependencies`
- `resolveShellStatusSnapshot`
- `startPhase`, `endPhase`, `getSnapshot`, `validateBudgets`
- `createProtectedFeatureRegistry`, `defineProtectedFeatureRegistration`, etc.

---

## Step 2 — Add JSDoc Guard Annotations to Shell `index.ts`

**File:** `packages/shell/src/index.ts`

Add JSDoc comments to the Tier 2 (internal composition) exports:

```typescript
/**
 * @internal Shell layout components — designed for use inside ShellCore only.
 *
 * These components are exported for ShellCore's internal composition.
 * Direct app usage outside of ShellCore is NOT supported and may result in:
 * - Missing React context (shell state, auth lifecycle, startup timing)
 * - Rendering in incorrect auth/permission state
 * - Silent failures in experience state management
 *
 * Use `ShellCore` as the integration surface instead.
 *
 * @see ShellCore
 * @see docs/reference/shell/component-exports.md
 */
export { HeaderBar } from './components/HeaderBar/index.js';
export { AppLauncher } from './components/AppLauncher/index.js';
export { ProjectPicker } from './components/ProjectPicker/index.js';
export { BackToProjectHub } from './components/BackToProjectHub/index.js';
export { ContextualSidebar } from './components/ContextualSidebar/index.js';
export { ShellLayout } from './components/ShellLayout/index.js';
```

**Note:** Verify the exact import paths within the shell package — they may differ from the
above. Use the existing import paths already in `index.ts`.

---

## Step 3 — Create Reference Documentation

**New file:** `docs/reference/shell/component-exports.md`

```markdown
# Shell Package — Component Export Reference

## Overview

`@hbc/shell` exports components at three tiers. Understanding which tier a component belongs
to prevents subtle integration errors.

## Tier 1 — Public API (App Integration Surface)

These exports are designed for direct use in consuming apps (`apps/pwa`, `apps/dev-harness`,
`apps/spfx`).

| Export | Purpose |
|--------|---------|
| `ShellCore` | Primary integration surface. Mounts the full shell including auth lifecycle, connectivity bar, feature gates, and all layout components. Requires a `ShellEnvironmentAdapter`. |
| `useAuthStore` | (re-exported via `@hbc/auth`) Central auth state store. |

### ShellCore Integration

```tsx
import { ShellCore } from '@hbc/shell';

// In app root:
<ShellCore adapter={myAdapter} />
```

## Tier 2 — Internal Composition (ShellCore Only)

These components are exported for type compatibility and testing but are **not designed for
direct app use**. They require context provided by `ShellCore` and will behave incorrectly
when mounted outside of it.

| Component | Reason for restriction |
|-----------|----------------------|
| `HeaderBar` | Reads shell status snapshot and auth state from ShellCore-managed context |
| `AppLauncher` | Requires feature registration context to render workspace list |
| `ProjectPicker` | Reads project store state managed by ShellCore's lifecycle |
| `BackToProjectHub` | Navigation semantics tied to ShellCore's router integration |
| `ContextualSidebar` | Receives sidebar groups from ShellCore's nav composition |
| `ShellLayout` | Pure layout wrapper for ShellCore's render tree |

**Do not import these directly into app components.** If you need to customize their
behavior, extend `ShellCore` via its props (`renderStatusRail`, `sidebarSlot`, etc.) or
file an architectural discussion.

## Tier 3 — Utility & Hook API

These exports are designed for direct app use, typically during the transition period before
`ShellCore` is fully adopted.

| Export | Usage context |
|--------|--------------|
| `resolveRoleLandingPath` | Post-auth navigation: get the correct landing path for a user's roles |
| `captureIntendedDestination` | Pre-auth navigation: save the user's intended path before redirect |
| `resolvePostGuardRedirect` | Post-auth: restore the saved intended destination |
| `clearRedirectMemory` | Clear stored redirect target after use or on sign-out |
| `isSafeRedirectPath` | Validate paths before storing as redirect targets |
| `runShellSignOutCleanup` | Orchestrated sign-out with store teardown and cleanup |
| `createDefaultShellSignOutCleanupDependencies` | Create default cleanup dependency set |
| `resolveShellStatusSnapshot` | Derive `ShellStatusSnapshot` from auth and connectivity state |
| `startPhase`, `endPhase` | Startup timing instrumentation |
| `getSnapshot`, `validateBudgets` | Startup timing reporting and budget validation |
| `defineProtectedFeatureRegistration` | Define a feature's access control contract |
| `createProtectedFeatureRegistry` | Build a registry from an array of contracts |
| `validateProtectedFeatureRegistration` | Validate a contract at startup |

## Phase 2 Note (PH8)

Once `ShellCore` is adopted as the primary mounting strategy:
- All Tier 3 utility calls from `root-route.tsx` (redirect memory, role landing, connectivity bar, sign-out) will be removed from the app layer
- `ShellCore` handles these natively via its adapter interface
- The Tier 3 exports will remain available for edge cases and testing
```

---

## Step 4 — Add to Shell Package `README.md` (Optional)

If `packages/shell/README.md` exists, add a brief note pointing to the reference doc:

```markdown
## Component Export Tiers

Not all exports from `@hbc/shell` are designed for direct app use.
See [docs/reference/shell/component-exports.md](../../docs/reference/shell/component-exports.md)
for the full export tier reference.
```

---

## Files Modified / Created

| Action | File |
|--------|------|
| Modify | `packages/shell/src/index.ts` (add JSDoc to Tier 2 exports) |
| Create | `docs/reference/shell/component-exports.md` |
| Modify (optional) | `packages/shell/README.md` |

---

## Verification Commands

```bash
# 1. Build check (JSDoc changes are TypeScript-compatible — no behavioral impact)
pnpm turbo run type-check

# 2. Verify the reference doc is in the correct Diátaxis location
ls docs/reference/shell/
# Expected: component-exports.md

# 3. Verify JSDoc appears in IDE tooling
# Open any app component file → type "import { HeaderBar } from '@hbc/shell'"
# Verify: IDE tooltip shows the @internal warning and links to ShellCore
```

---

## Success Criteria

- [ ] PH6F-10.1 `HeaderBar`, `AppLauncher`, `ProjectPicker`, `BackToProjectHub`, `ContextualSidebar`, `ShellLayout` annotated with `@internal` JSDoc
- [ ] PH6F-10.2 JSDoc includes reference to `ShellCore` as the correct integration surface
- [ ] PH6F-10.3 `docs/reference/shell/component-exports.md` created in correct Diátaxis location
- [ ] PH6F-10.4 Reference doc covers all three export tiers with examples
- [ ] PH6F-10.5 Build passes with zero TypeScript errors

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Status: Pending implementation
Execution: Last in sequence; documentation-only, no code behavior changes
Diátaxis classification: Reference (technical facts about the shell package API)
-->
