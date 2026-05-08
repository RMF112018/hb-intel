# Phase 2 Repo-Truth Snapshot — PCC Shell Header Consolidation

**Generated:** 2026-05-08  
**Repo:** `RMF112018/hb-intel`  
**Branch verified:** `main`  
**Purpose:** Seed the implementation package with the current audit baseline. Local agent must still re-confirm before editing.

---

## 1. Current Verified Facts

### 1.1 `PccShell.tsx` main markup

Current `apps/project-control-center/src/shell/PccShell.tsx` still renders:

```tsx
<main
  id={ACTIVE_PANEL_ID}
  role="tabpanel"
  aria-labelledby={`pcc-tab-${activeSurfaceId}`}
  className={styles.canvas}
  data-pcc-canvas=""
>
  <PccBentoGrid forceMode={forceMode}>{children}</PccBentoGrid>
</main>
```

Current `main` **does not** carry:

```tsx
data-pcc-active-surface-panel={activeSurfaceId}
```

This confirms the audited gap remains present.

### 1.2 Current active-panel ownership

Active surface panel markers are currently card-owned through `PccDashboardCard` prop:

```tsx
dataActiveSurfacePanel?: PccMvpSurfaceId;
```

`PccDashboardCard` emits:

```tsx
data-pcc-active-surface-panel={dataActiveSurfacePanel}
```

This must be treated as a deprecated/compatibility pattern during Phase 2.

### 1.3 Current Playwright surface smoke behavior

The current Playwright live page object defines:

```ts
panel: '[data-pcc-active-surface-panel]'
```

and checks:

```ts
const panelCount = await this.page.locator(surface.expectedActivePanelSelector).count();
const passed = tabActive && panelCount > 0 && gridCount > 0 && cardCount > 0;
```

It verifies presence, not ownership by `main[role="tabpanel"]`.

### 1.4 Current `config/package-solution.json` posture

A direct fetch for `config/package-solution.json` returned not found during audit. Repo search shows package-solution references in docs/tooling and PCC packaging review material, but not a current root `config/package-solution.json` file in the expected path. Phase 2 must verify this again and treat package/manifest/SPPKG files as out of scope unless repo truth proves otherwise.

### 1.5 Current main drift

At package generation time, repo `main` still matches the audit premise:
- shell tabpanel exists;
- active marker is not on `main`;
- card-level marker compatibility remains;
- Playwright presence checks remain broad.

The local code agent must still re-confirm before editing because `main` may drift after this package is generated.

---

## 2. Mandatory Local-Agent Pre-Edit Verification

Before any runtime edit, the local agent must verify and report:

1. Current `main` markup in `PccShell.tsx`.
2. All live uses of `dataActiveSurfacePanel`.
3. All live string uses of `data-pcc-active-surface-panel`.
4. Whether Playwright selectors only check presence or depend on card-level ownership.
5. Whether `config/package-solution.json` has moved, is absent, or is irrelevant.
6. Current git base / `main` drift posture.

No implementation prompt in this package should be executed without that gate.
