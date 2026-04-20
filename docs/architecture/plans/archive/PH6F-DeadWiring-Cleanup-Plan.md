# PH6F — Dead-Wiring Cleanup: Master Summary Plan

**Version:** 2.0 (refactored from monolithic v1.0 — task details moved to individual files)
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Classification:** Cross-cutting infrastructure — parallel to active phase work.
**Trigger:** Systematic audit revealed that a significant portion of PH5 deliverables (auth, shell,
connectivity, feature registration, provisioning) are fully implemented in `packages/` but never
connected to consuming applications.

---

## Background

During PH5 and PH6 implementation, packages were built as self-contained libraries with complete
implementations, tests, and exports. The applications (`apps/pwa`, `apps/dev-harness`, `apps/spfx`)
consumed the *presentational* surface of these packages but did not wire the *orchestration* surface
(`ShellCore`, feature gates, connectivity status, sign-out cleanup, redirect restoration, startup timing).

The first confirmed instance — `DevToolbar` (persona/role switcher) — was found unwired and fixed
(PH6F-0, completed 2026-03-07). A subsequent codebase audit revealed 10+ additional unwired features
across three priority tiers.

---

## PH6F-0 — Vite Subpath Alias Convention (COMPLETE)

**Status:** IMPLEMENTED — 2026-03-07

The DevToolbar wiring fix established a standing rule: whenever a new subpath export is added to
any `@hbc/*` package, add a corresponding more-specific alias entry **before** the root alias in
**all Vite configs** (`apps/pwa/vite.config.ts`, `apps/dev-harness/vite.config.ts`,
`apps/spfx/vite.config.ts`).

```typescript
// Correct order — more specific alias first:
'@hbc/shell/dev-toolbar': path.resolve(__dirname, '../../packages/shell/src/devToolbar/index.ts'),
'@hbc/shell': path.resolve(__dirname, '../../packages/shell/src'),
```

---

## Scope Summary

| Task | Priority | Status | Description |
|------|----------|--------|-------------|
| [PH6F-0](#ph6f-0) | — | ✅ COMPLETE | Vite subpath alias convention + DevToolbar wired |
| [PH6F-1](PH6F-1-Cleanup-ConnectivityBar.md) | HIGH | ⏳ Pending | Mount `HbcConnectivityBar` in PWA shell |
| [PH6F-2](PH6F-2-Cleanup-SignOutOrchestration.md) | HIGH | ⏳ Pending | Wire `runShellSignOutCleanup` orchestrated sign-out |
| [PH6F-3](PH6F-3-Cleanup-FeatureRegistration.md) | HIGH | ⏳ Pending | Initialize Feature Registration System |
| [PH6F-4](PH6F-4-Cleanup-RedirectMemory.md) | MEDIUM | ⏳ Pending | Wire redirect memory (post-login destination restore) |
| [PH6F-5](PH6F-5-Cleanup-RoleLandingPath.md) | MEDIUM | ⏳ Pending | Wire `resolveRoleLandingPath` for role-based navigation |
| [PH6F-6](PH6F-6-Cleanup-ProvisioningSignalR.md) | MEDIUM | ⏳ Blocked | Wire `useProvisioningSignalR` in provisioning UI |
| [PH6F-7](PH6F-7-Cleanup-StartupTiming.md) | MEDIUM | ⏳ Pending | Wire startup timing instrumentation (4 phases) |
| [PH6F-8](PH6F-8-Cleanup-FilterFormStores.md) | MEDIUM | ⏳ Pending | Wire `useFilterStore` + `useFormDraft` (progressive) |
| [PH6F-9](PH6F-9-Cleanup-SPFxBridge.md) | LOW | 🚫 Blocked | Wire SPFx host bridge (blocked on PH8) |
| [PH6F-10](PH6F-10-Cleanup-ComponentExportDocs.md) | LOW | ⏳ Pending | Shell component export audit + docs |

**Also see:** `PH6F-DeadWiring-DevAuth-Cleanup-Plan.md` and task files `PH6F.1` through `PH6F.5`
for the related Dev Auth Role Switcher dead-wiring cleanup (separate plan, same umbrella phase).

---

## Implementation Sequence

Execute tasks in this order to minimize rework and dependency issues:

```
PH6F-3   ← Feature Registration (HIGH — prerequisite: FeatureGate needed for all routes)
   ↓
PH6F-2   ← Sign-Out Orchestration (HIGH — prerequisite: PH6F-1 sign-in-again action needs it)
   ↓
PH6F-1   ← ConnectivityBar (HIGH — depends on PH6F-2 sign-out utility)
   ↓
PH6F-4   ← Redirect Memory (MEDIUM — post-auth navigation)
   ↓
PH6F-5   ← Role Landing Path (MEDIUM — combine handler with PH6F-4)
   ↓
PH6F-7   ← Startup Timing (MEDIUM — instrumentation, independent)
   ↓
PH6F-6   ← SignalR (MEDIUM — BLOCKED until provisioning route exists)
   ↓
PH6F-8   ← Filter/Form Stores (MEDIUM — progressive, applied per page)
   ↓
PH6F-9   ← SPFx Bridge (LOW — BLOCKED until PH8)
   ↓
PH6F-10  ← Component Export Docs (LOW — documentation only)
```

**Rationale:**
- PH6F-3 first because `FeatureGate` initialization affects every subsequent route's access control behavior.
- PH6F-2 before PH6F-1 because the connectivity bar's `sign-in-again` action calls the sign-out pathway — implementing in reverse would require updating PH6F-1 again after PH6F-2 is applied.
- PH6F-4 and PH6F-5 together because they share the same `useEffect` in `root-route.tsx`.
- PH6F-6 and PH6F-9 are blocked on external prerequisites and can be deferred without affecting other tasks.

---

## Files Affected (Summary)

```
apps/
  pwa/
    src/
      main.tsx                              ← PH6F-3 (feature reg), PH6F-7 (timing)
      router/root-route.tsx                 ← PH6F-1, PH6F-4, PH6F-5
      auth/signOut.ts                       ← PH6F-2 (new file)
      features/
        featureRegistry.ts                  ← PH6F-3 (new file)
        filterKeys.ts                       ← PH6F-8 (new file)
      routes/
        [workspace-routes].tsx              ← PH6F-3 (FeatureGate, progressive)
        [list-pages].tsx                    ← PH6F-8 (filter hooks, progressive)
        [form-pages].tsx                    ← PH6F-8 (form draft hooks, progressive)
        provisioning/ProvisioningProgressView.tsx  ← PH6F-6 (new file, blocked)
      .env.development                      ← PH6F-6 (VITE_API_BASE_URL)

  spfx/ (when it exists)
    src/webparts/hbIntel/HbIntelWebPart.ts  ← PH6F-9 (blocked)

packages/
  shell/
    src/
      index.ts                              ← PH6F-10 (JSDoc annotations)
      stores/navStore.ts                    ← PH6F-2 (add reset() if missing)
      stores/projectStore.ts                ← PH6F-2 (add reset() if missing)

docs/
  reference/shell/component-exports.md     ← PH6F-10 (new file)
```

---

## Definition of Done

A task is complete when:
1. The feature renders or executes correctly in a running `pnpm dev` session
2. `pnpm turbo run build` passes with zero TypeScript errors
3. All success criteria checkboxes in the task file are checked
4. No regressions in existing tests (`pnpm turbo run test`)
5. Progress noted in this file's Implementation Progress block below

---

## Phase 2 Enhancement: Full ShellCore Adoption (Deferred to PH8)

The complete long-term fix for many items in this plan is to replace the `HbcAppShell`
mounting in `root-route.tsx` with `ShellCore`. This is intentionally deferred because:

1. `ShellCore` requires a `PwaShellEnvironmentAdapter` that doesn't exist yet
2. The PWA's auth flow is managed by `MsalGuard` (MSAL-specific), not through the adapter pattern
3. The adapter pattern becomes relevant in PH8 (multi-environment: PWA + SPFx)

When `ShellCore` is adopted in PH8, the following PH6F items will be replaced by ShellCore's
built-in handling:
- PH6F-1 (connectivity bar → ShellCore `renderStatusRail` prop)
- PH6F-4 (redirect memory → ShellCore adapter handles natively)
- PH6F-5 (role landing → ShellCore adapter handles natively)
- Part of PH6F-2 (sign-out → ShellCore lifecycle includes cleanup)

---

## Master Success Criteria Checklist

**PH6F-0 (Vite Alias + DevToolbar — COMPLETE):**
- [x] PH6F-0.1 `@hbc/shell/dev-toolbar` Vite alias added to PWA vite config
- [x] PH6F-0.2 `@hbc/shell/dev-toolbar` Vite alias added to dev-harness vite config
- [x] PH6F-0.3 `DevToolbar` rendered in PWA `App.tsx`
- [x] PH6F-0.4 `DevToolbar` rendered in dev-harness `App.tsx`
- [x] PH6F-0.5 Vite subpath alias convention documented

**PH6F-1 (HbcConnectivityBar):**
- [ ] PH6F-1.1 through PH6F-1.8 — see [PH6F-1-Cleanup-ConnectivityBar.md](PH6F-1-Cleanup-ConnectivityBar.md)

**PH6F-2 (Sign-Out Orchestration):**
- [ ] PH6F-2.1 through PH6F-2.8 — see [PH6F-2-Cleanup-SignOutOrchestration.md](PH6F-2-Cleanup-SignOutOrchestration.md)

**PH6F-3 (Feature Registration):**
- [ ] PH6F-3.1 through PH6F-3.7 — see [PH6F-3-Cleanup-FeatureRegistration.md](PH6F-3-Cleanup-FeatureRegistration.md)

**PH6F-4 (Redirect Memory):**
- [ ] PH6F-4.1 through PH6F-4.7 — see [PH6F-4-Cleanup-RedirectMemory.md](PH6F-4-Cleanup-RedirectMemory.md)

**PH6F-5 (Role Landing Path):**
- [ ] PH6F-5.1 through PH6F-5.7 — see [PH6F-5-Cleanup-RoleLandingPath.md](PH6F-5-Cleanup-RoleLandingPath.md)

**PH6F-6 (SignalR — BLOCKED):**
- [ ] PH6F-6.1 through PH6F-6.7 — see [PH6F-6-Cleanup-ProvisioningSignalR.md](PH6F-6-Cleanup-ProvisioningSignalR.md)

**PH6F-7 (Startup Timing):**
- [ ] PH6F-7.1 through PH6F-7.8 — see [PH6F-7-Cleanup-StartupTiming.md](PH6F-7-Cleanup-StartupTiming.md)

**PH6F-8 (Filter/Form Stores):**
- [ ] PH6F-8.1 through PH6F-8.7 — see [PH6F-8-Cleanup-FilterFormStores.md](PH6F-8-Cleanup-FilterFormStores.md)

**PH6F-9 (SPFx Bridge — BLOCKED on PH8):**
- [ ] PH6F-9.1 through PH6F-9.7 — see [PH6F-9-Cleanup-SPFxBridge.md](PH6F-9-Cleanup-SPFxBridge.md)

**PH6F-10 (Component Export Docs):**
- [ ] PH6F-10.1 through PH6F-10.5 — see [PH6F-10-Cleanup-ComponentExportDocs.md](PH6F-10-Cleanup-ComponentExportDocs.md)

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
v2.0 refactor: 2026-03-07 — split monolithic plan into individual task files
PH6F-0: COMPLETE (DevToolbar wired in PWA + dev-harness, Vite aliases fixed)
PH6F.1–PH6F.5 (DevAuth): See PH6F-DeadWiring-DevAuth-Cleanup-Plan.md
Status: PH6F-1 through PH6F-10 task files created; ready for implementation
Sequence: PH6F-3 → PH6F-2 → PH6F-1 → PH6F-4+5 → PH6F-7 → PH6F-6 (blocked) → PH6F-8 (progressive) → PH6F-9 (blocked) → PH6F-10
-->
