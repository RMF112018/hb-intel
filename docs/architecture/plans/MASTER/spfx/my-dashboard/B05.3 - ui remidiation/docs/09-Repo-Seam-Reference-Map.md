# 09 — Repo Seam Reference Map

## Purpose

This file gives the local code agent a compact, high-value inspection map so it can execute with minimal rediscovery.

---

# 1. App Entry and Shell

```text
apps/my-dashboard/src/MyDashboardApp.tsx
apps/my-dashboard/src/mount.tsx
apps/my-dashboard/src/runtime/MyWorkReadModelClientProvider.tsx
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkShell.module.css
```

## Why relevant
- app ownership;
- shell composition;
- where to replace current command-surface rendering;
- context provider boundaries to preserve.

---

# 2. Rejected Visible Navigation / Focused Route Architecture

```text
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.module.css
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
apps/my-dashboard/src/state/useMyWorkShellState.ts
packages/models/src/myWork/MyWorkNavigation.ts
```

## Why relevant
- current visible tab/dropdown path;
- active module selection;
- focused Adobe route model;
- removal/reconciliation decisions.

---

# 3. Rejected Telemetry Hero Architecture

```text
apps/my-dashboard/src/shell/MyWorkHeroBand.tsx
apps/my-dashboard/src/shell/MyWorkHeroBand.module.css
apps/my-dashboard/src/state/myWorkHeroViewModel.ts
apps/my-dashboard/src/preview/myWorkHeroPreview.ts
```

## Why relevant
- current telemetry-heavy header;
- route-dependent hero identity;
- governance microcopy lane;
- replacement with compact production header.

---

# 4. Home Surface Composition

```text
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx
apps/my-dashboard/src/surfaces/home/WorkSummaryCard.tsx
apps/my-dashboard/src/surfaces/home/SourceReadinessCard.tsx
```

## Why relevant
- current ready/non-ready composition;
- removal of standalone summary/readiness cards;
- final two-card primary page composition.

---

# 5. Adobe Sign Runtime UI

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueHomeCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueStateCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueSummaryCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignAgreementActionListCard.tsx
apps/my-dashboard/src/modules/adobeSign/**/*.test.tsx
```

## Why relevant
- current fragmentation;
- required consolidation into one module card;
- preservation of truthful read-model fields.

---

# 6. My Projects Runtime UI

```text
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx
```

## Why relevant
- current full-width footprint;
- current metrics/banner/list structure;
- target compressed empty/unavailable states.

---

# 7. Layout and Card Primitives

```text
apps/my-dashboard/src/layout/MyWorkBentoGrid.tsx
apps/my-dashboard/src/layout/MyWorkBentoGrid.module.css
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/layout/myWorkFootprints.ts
apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts
```

## Why relevant
- preserve the grid system;
- apply locked span overrides;
- maintain responsive layout contracts.

---

# 8. State/View-Model Logic

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/state/myWorkSurfaceReadiness.ts
apps/my-dashboard/src/shell/MyWorkActiveEnvelopeContext.tsx
packages/models/src/myWork/MyWorkReadModels.ts
packages/models/src/myWork/AdobeSignActionQueue.ts
```

## Why relevant
- source-status truth;
- view-model consolidation;
- preservation of existing data boundaries;
- no backend contract invention.

---

# 9. Build and Package Validation

```text
apps/my-dashboard/package.json
tools/build-spfx-package.ts
tools/build-spfx-package-production-runtime-config.ts
```

## Why relevant
- final validation commands;
- domain packaging path;
- production runtime config gates.

---

# 10. Documentation to Reconcile

```text
apps/my-dashboard/README.md
docs/reference/spfx-surfaces/my-dashboard/
docs/architecture/plans/MASTER/spfx/my-dashboard/
```

## Why relevant
- current README is materially stale;
- docs that codify the old tab/focused-route posture may require correction or historical framing.
