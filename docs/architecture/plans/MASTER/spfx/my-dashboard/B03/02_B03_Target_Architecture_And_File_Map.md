# B03 Target Architecture and File Map

## 1. Target architecture

```text
packages/models/src/myWork/
└── MyWorkNavigation.ts
    ├── typed primary-surface registry
    ├── typed module registry
    ├── state vocabulary
    ├── normalization helpers
    └── module/surface lookup helpers

apps/my-dashboard/src/
├── MyDashboardApp.tsx
├── state/
│   └── useMyWorkShellState.ts
├── shell/
│   ├── MyWorkShell.tsx
│   ├── MyWorkShell.module.css
│   ├── MyWorkPrimaryNavigation.tsx
│   ├── MyWorkPrimaryNavigation.module.css
│   ├── MyWorkHeroBand.tsx
│   ├── MyWorkHeroBand.module.css
│   └── MyWorkSurfaceRouter.tsx
├── layout/
│   ├── MyWorkBentoGrid.tsx
│   ├── myWorkFootprints.ts
│   └── useMyWorkContainerBreakpoint.ts
├── surfaces/
│   └── home/
│       ├── MyWorkHomeSurface.tsx
│       ├── WorkSummaryCard.tsx
│       └── SourceReadinessCard.tsx
└── modules/
    └── adobeSign/
        ├── AdobeSignActionQueueHomeCard.tsx
        ├── AdobeSignActionQueueModuleSurface.tsx
        ├── AdobeSignQueueSummaryCard.tsx
        ├── AdobeSignAgreementActionListCard.tsx
        ├── AdobeSignQueueStateCard.tsx
        └── AdobeSignConnectionGuidanceCard.tsx
```

## 2. Models package target

### 2.1 Primary surface vocabulary

```ts
export const MY_WORK_PRIMARY_SURFACE_IDS = ['my-work-home'] as const;
export type MyWorkPrimarySurfaceId =
  (typeof MY_WORK_PRIMARY_SURFACE_IDS)[number];
```

### 2.2 Module vocabulary

```ts
export const MY_WORK_MODULE_IDS = ['adobe-sign-action-queue'] as const;
export type MyWorkModuleId = (typeof MY_WORK_MODULE_IDS)[number];
```

### 2.3 Module states

```ts
export const MY_WORK_MODULE_STATES = [
  'available',
  'preview',
  'read-only',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'deferred',
] as const;
```

### 2.4 Canonical Adobe module record

```ts
{
  id: 'adobe-sign-action-queue',
  label: 'Adobe Sign Action Queue',
  parentSurfaceId: 'my-work-home',
  state: 'read-only',
  stateLabel: 'Read-only',
  selectable: true,
  sourceSystem: 'Adobe Sign',
  summary:
    'Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.',
  authorityCue:
    'Queue visibility only. Agreement actions remain in Adobe Sign.'
}
```

## 3. Shell state target

```ts
interface MyWorkShellState {
  readonly activePrimarySurfaceId: 'my-work-home';
  readonly activeModuleId?: 'adobe-sign-action-queue';
}

interface MyWorkShellActions {
  selectPrimarySurface(id: 'my-work-home'): void;
  selectModule(id: 'adobe-sign-action-queue'): void;
  clearActiveModule(): void;
}
```

### State rules

- Selecting the primary surface clears `activeModuleId`.
- Selecting the Adobe module keeps the parent surface as `my-work-home`.
- Invalid module IDs normalize away.
- No localStorage and no URL state.

## 4. Shell component responsibilities

### `MyWorkShell.tsx`

Owns:
- shell root and theme variable envelope,
- command surface,
- navigation component,
- hero component,
- shell main panel,
- bento grid placement,
- stable shell data attributes.

Required panel contract:

```tsx
<main
  id="my-work-active-surface-panel"
  role="tabpanel"
  aria-labelledby="my-work-tab-my-work-home"
  data-my-work-active-surface-panel="my-work-home"
>
```

### `MyWorkPrimaryNavigation.tsx`

Owns:
- tablist semantics,
- one primary tab,
- attached module launcher toggle,
- one Adobe queue menu item,
- keyboard behavior and menu focus management.

### `MyWorkHeroBand.tsx`

Owns:
- home/focused-module title and description switch,
- high-level summary highlight slots,
- governance microcopy,
- no project facts and no search.

### `MyWorkSurfaceRouter.tsx`

Owns:
- `home` output when `activeModuleId` is undefined,
- `focused-module` output when Adobe module is active,
- safe fallback to home on invalid module state.

## 5. Layout target

### Responsive modes

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

### Columns

| Mode | Columns |
|---|---:|
| phone | 1 |
| tabletPortrait | 2 |
| tabletLandscape | 6 |
| smallLaptop | 8 |
| standardLaptop | 10 |
| largeLaptop | 12 |
| desktop | 12 |
| ultrawide | 12 |

### Required choreography

#### Home ready / partial

| Mode family | Work Summary | Adobe Queue |
|---|---:|---:|
| 12-column | 4 | 8 |
| 10-column | 3 | 7 |

#### Home non-ready

| Mode family | Work Summary | Queue State | Source Readiness |
|---|---:|---:|---:|
| 12-column | 3 | 6 | 3 |
| 10-column | 3 | 4 | 3 |

#### Focused module ready / partial

| Mode family | Queue Summary | Action List |
|---|---:|---:|
| 12-column | 4 | 8 |
| 10-column | 3 | 7 |

#### Focused module non-ready

| Mode family | Queue State | Guidance |
|---|---:|---:|
| 12-column | 8 | 4 |
| 10-column | 6 | 4 |

## 6. Data-attribute target

Required shell selectors:

```text
data-my-work-shell
data-my-work-shell-mode
data-my-work-view-state
data-my-work-command-surface
data-my-work-primary-navigation
data-my-work-tab-id
data-my-work-tab-active
data-my-work-module-launcher
data-my-work-module-menu
data-my-work-module-menu-item
data-my-work-module-active
data-my-work-hero
data-my-work-hero-primary-title
data-my-work-hero-secondary-title
data-my-work-hero-description
data-my-work-hero-highlight
data-my-work-hero-governance-copy
data-my-work-canvas
data-my-work-active-surface-panel
data-my-work-bento-grid
data-my-work-card
data-my-work-card-role
data-my-work-module
data-my-work-adobe-sign-queue
```

## 7. Structural card role taxonomy

| Card | Role marker recommendation |
|---|---|
| Work Summary | `work-summary` |
| Adobe Sign Action Queue Home | `adobe-sign-action-queue-home` |
| Source Readiness | `source-readiness` |
| Adobe Sign Queue Summary | `adobe-sign-queue-summary` |
| Adobe Sign Agreement Action List | `adobe-sign-agreement-action-list` |
| Adobe Sign Queue State | `adobe-sign-queue-state` |
| Adobe Sign Connection Guidance | `adobe-sign-connection-guidance` |

## 8. B04/B05 compatibility boundary

The architecture should make it easy for later batches to inject read-model data without rewriting the shell:

- cards should accept view-model-like props or consume narrow structural selectors from a dedicated surface VM module,
- data ownership must not move into the shell,
- the router should remain concerned with shell state, not business-source state.
