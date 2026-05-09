# Prompt 01 — Primary Tab and Module Registry

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation**.

This prompt creates the **typed model-layer registry contract only**. It must not wire the registry into the UI, shell state, router, surfaces, Playwright evidence, or hosted package behavior.

---

## Objective

Create the Phase 05 primary-tab/module navigation registry in the shared PCC model package so later prompts can safely consume it.

The registry must define:

```text
Primary Tab = Dashboard Surface
Dropdown / Child Module Link = Module Entry Point under that Dashboard Surface
```

This prompt is intentionally limited to a model contract and model-level tests.

---

## Current Repo-Truth Baseline to Respect

Prompt 00 established this current baseline:

- Current app navigation still uses the old `PccMvpSurfaceId` surface model.
- Current top-level tab UI is still hardcoded in `PccHorizontalTabs.tsx`.
- Current shell state has no `activeModuleId`.
- Current router still routes the legacy eight surface IDs.
- Current visible `Documents` label still exists in app UI and will be changed by later prompts.
- Current shell-owned active panel semantics must be preserved later:
  - `main[role="tabpanel"]`
  - `id="pcc-active-surface-panel"`
  - `data-pcc-active-surface-panel={activeSurfaceId}`
- Current bento direct-child invariants must be preserved later.
- Prompt 01 must not implement app wiring.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Non-Negotiable Scope Boundary

### You may change exactly these files

Create:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
packages/models/src/pcc/PccPrimaryNavigation.test.ts
```

Edit:

```text
packages/models/src/pcc/index.ts
```

Use the existing package test-file convention: co-located `*.test.ts` files in `packages/models/src/pcc/`.

### You must not touch these files or paths

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/surfaces/**
apps/project-control-center/src/tests/**
e2e/pcc-live/**
playwright.pcc-live.config.ts
apps/project-control-center/config/package-solution.json
package.json
apps/project-control-center/package.json
packages/models/package.json
pnpm-lock.yaml
```

If you believe any file outside the allowed list must change, stop and report the conflict. Do not broaden scope.

---

## Guardrails

- Work against current `main`.
- Inspect current repo truth before editing.
- Do not add a standalone Module Launcher.
- Do not add a sidebar, rail, drawer, or secondary permanent navigator.
- Do not add URL routing, query-string routing, SharePoint page routing, browser-history state, `localStorage`, or `sessionStorage`.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, file, HBI, integration, or external-system writeback.
- Do not modify runtime UI.
- Do not modify existing surfaces.
- Do not delete existing surfaces.
- Do not replace existing `PccMvpSurfaceId` consumers in this prompt.
- Do not rename the internal `documents` ID.
- Do not change package versions, SPFx manifest versions, package-solution versions, or feature versions.
- Do not run `pnpm install`.
- Do not run formatters in write mode over the repo.
- Do not generate Playwright evidence.

---

## Required Registry Location

Implement the registry here:

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
```

Do **not** use the app-local fallback path. The registry belongs in `@hbc/models/pcc` and must be exported through:

```text
packages/models/src/pcc/index.ts
```

---

## Required Types and Constants

Add these exports from `PccPrimaryNavigation.ts`:

```ts
export const PCC_PRIMARY_TAB_IDS = [...] as const;
export type PccPrimaryTabId = (typeof PCC_PRIMARY_TAB_IDS)[number];

export const PCC_MODULE_STATES = [...] as const;
export type PccModuleState = (typeof PCC_MODULE_STATES)[number];

export const PCC_MODULE_IDS = [...] as const;
export type PccModuleId = (typeof PCC_MODULE_IDS)[number];

export type PccModuleSourceSystem =
  | 'PCC'
  | 'SharePoint'
  | 'Procore'
  | 'Sage'
  | 'Power BI'
  | 'Document Crunch'
  | 'Adobe Sign'
  | 'OneDrive'
  | 'External'
  | 'Future';

export interface PccModuleStateCopy {
  readonly stateLabel: string;
  readonly reason: string;
}

export interface PccNavigationModule {
  readonly id: PccModuleId;
  readonly label: string;
  readonly parentTabId: PccPrimaryTabId;
  readonly state: PccModuleState;
  readonly stateLabel: string;
  readonly summary: string;
  readonly disabledReason?: string;
  readonly authorityCue: string;
  readonly sourceSystem: PccModuleSourceSystem;
  readonly selectable: boolean;
  readonly dashboardSectionId?: string;
  readonly stageVisibility?: readonly string[];
  readonly roleVisibility?: readonly string[];
}

export interface PccPrimaryNavigationTab {
  readonly id: PccPrimaryTabId;
  readonly label: string;
  readonly dashboardTitle: string;
  readonly dashboardDescription: string;
  readonly modules: readonly PccModuleId[];
}

export const PCC_MODULE_STATE_COPY: Readonly<Record<PccModuleState, PccModuleStateCopy>>;
export const PCC_PRIMARY_NAVIGATION_TABS: readonly PccPrimaryNavigationTab[];
export const PCC_NAVIGATION_MODULES: readonly PccNavigationModule[];
```

You may add internal helper maps if useful, but all exported constants must be deterministic, side-effect-free, pure TypeScript data.

---

## Exact Primary Tab IDs and Labels

`PCC_PRIMARY_TAB_IDS` must be exactly:

```ts
[
  'project-home',
  'core-tools',
  'documents',
  'estimating-preconstruction',
  'startup-closeout',
  'project-controls',
  'cost-time',
  'systems-administration',
] as const;
```

Visible labels must be exactly:

```text
Project Home
Core Tools
Document Control
Estimating & Preconstruction
Project Startup & Closeout
Project Controls
Cost & Time
Systems Administration
```

Compatibility rule:

- Keep internal ID `documents`.
- Its visible label must be `Document Control`.
- Do not rename `documents` to `document-control` in this prompt.

---

## Exact Module State Vocabulary

`PCC_MODULE_STATES` must be exactly:

```ts
[
  'available',
  'preview',
  'read-only',
  'launch-only',
  'configuration-required',
  'source-unavailable',
  'deferred',
] as const;
```

`PCC_MODULE_STATE_COPY` must be exactly equivalent to:

```ts
export const PCC_MODULE_STATE_COPY: Readonly<Record<PccModuleState, PccModuleStateCopy>> = {
  available: {
    stateLabel: 'Available',
    reason: 'Open this module to review current project information.',
  },
  preview: {
    stateLabel: 'Preview',
    reason: 'Preview only. Review source records before taking action.',
  },
  'read-only': {
    stateLabel: 'Read-only',
    reason: 'Read-only view. No approvals, decisions, or writeback are performed here.',
  },
  'launch-only': {
    stateLabel: 'Launch-only',
    reason: 'Opens or references the source system. PCC does not write back to that system.',
  },
  'configuration-required': {
    stateLabel: 'Configuration required',
    reason: 'Configuration is required before this module can open for the selected project.',
  },
  'source-unavailable': {
    stateLabel: 'Source unavailable',
    reason: 'Source data is not available for the selected project.',
  },
  deferred: {
    stateLabel: 'Future release',
    reason: 'Planned for a future release. This module is not active for the selected project.',
  },
};
```

---

## Exact Module IDs

`PCC_MODULE_IDS` must be exactly this 42-item tuple, in this order:

```ts
[
  'action-center',
  'my-responsibilities',
  'today-this-week',
  'hbi-assistant',
  'external-platforms',
  'team-access',
  'project-directory',
  'approvals-checkpoints',
  'primary-documents',
  'document-control-center',
  'drawing-model-center',
  'sharepoint-project-record',
  'my-project-files',
  'procore-documents',
  'document-crunch',
  'adobe-sign',
  'future-estimating-modules',
  'preconstruction-handoff',
  'estimate-assumptions-alternates-exclusions',
  'startup-center',
  'responsibility-matrix',
  'closeout',
  'closeout-turnover-tracker',
  'warranty',
  'lessons-learned',
  'subcontractor-performance',
  'project-controls-center',
  'permits-inspections',
  'contract-compliance',
  'risk-issues-decisions',
  'constraints-log',
  'field-operations',
  'meeting-communication',
  'financial-reporting',
  'schedule-monitor',
  'procurement-buyout',
  'commitment-cost-exposure',
  'site-health',
  'control-center-settings',
  'integration-settings',
  'procore-mapping-sync-health',
  'module-configuration',
] as const;
```

Do not claim 43 modules unless the source package has changed and now contains 43 explicit IDs. If the package contract conflicts with this 42-item tuple, stop and report the contradiction before editing.

---

## Exact Primary Tab Records

`PCC_PRIMARY_NAVIGATION_TABS` must contain exactly:

```ts
[
  {
    id: 'project-home',
    label: 'Project Home',
    dashboardTitle: 'Project Home',
    dashboardDescription:
      'Daily project command dashboard for priorities, responsibilities, and near-term work.',
    modules: ['action-center', 'my-responsibilities', 'today-this-week'],
  },
  {
    id: 'core-tools',
    label: 'Core Tools',
    dashboardTitle: 'Core Tools',
    dashboardDescription:
      'Cross-cutting project operating tools used across stages and roles.',
    modules: [
      'hbi-assistant',
      'external-platforms',
      'team-access',
      'project-directory',
      'approvals-checkpoints',
    ],
  },
  {
    id: 'documents',
    label: 'Document Control',
    dashboardTitle: 'Document Control',
    dashboardDescription:
      'Primary project document, drawing, model, and source-file control surface.',
    modules: [
      'primary-documents',
      'document-control-center',
      'drawing-model-center',
      'sharepoint-project-record',
      'my-project-files',
      'procore-documents',
      'document-crunch',
      'adobe-sign',
    ],
  },
  {
    id: 'estimating-preconstruction',
    label: 'Estimating & Preconstruction',
    dashboardTitle: 'Estimating & Preconstruction',
    dashboardDescription:
      'Continuity dashboard for preconstruction handoff, estimating assumptions, alternates, and exclusions.',
    modules: [
      'future-estimating-modules',
      'preconstruction-handoff',
      'estimate-assumptions-alternates-exclusions',
    ],
  },
  {
    id: 'startup-closeout',
    label: 'Project Startup & Closeout',
    dashboardTitle: 'Project Startup & Closeout',
    dashboardDescription:
      'Startup, responsibility, closeout, turnover, warranty, lessons learned, and subcontractor performance dashboard.',
    modules: [
      'startup-center',
      'responsibility-matrix',
      'closeout',
      'closeout-turnover-tracker',
      'warranty',
      'lessons-learned',
      'subcontractor-performance',
    ],
  },
  {
    id: 'project-controls',
    label: 'Project Controls',
    dashboardTitle: 'Project Controls',
    dashboardDescription:
      'Active project controls, field coordination, compliance, risks, constraints, and communication dashboard.',
    modules: [
      'project-controls-center',
      'permits-inspections',
      'contract-compliance',
      'risk-issues-decisions',
      'constraints-log',
      'field-operations',
      'meeting-communication',
    ],
  },
  {
    id: 'cost-time',
    label: 'Cost & Time',
    dashboardTitle: 'Cost & Time',
    dashboardDescription:
      'Financial, schedule, procurement, buyout, commitment, and time-risk dashboard.',
    modules: [
      'financial-reporting',
      'schedule-monitor',
      'procurement-buyout',
      'commitment-cost-exposure',
    ],
  },
  {
    id: 'systems-administration',
    label: 'Systems Administration',
    dashboardTitle: 'Systems Administration',
    dashboardDescription:
      'Governance, configuration, integration, site health, and template administration dashboard.',
    modules: [
      'site-health',
      'control-center-settings',
      'integration-settings',
      'procore-mapping-sync-health',
      'module-configuration',
    ],
  },
] as const;
```

---

## Exact Module Records

Create one `PccNavigationModule` record for each row below.

For every module:

- `stateLabel` must match `PCC_MODULE_STATE_COPY[state].stateLabel`.
- If `selectable === false`, `disabledReason` must be present and must equal `PCC_MODULE_STATE_COPY[state].reason`.
- If `selectable === true`, omit `disabledReason` or keep it `undefined`.
- `authorityCue` must be product-grade, concise, and truthful.
- Launch-only modules must include the no-writeback concept in `authorityCue`.
- HBI Assistant must not imply autonomous decisions, approvals, legal conclusions, source-of-truth ownership, or writeback.
- Approvals & Checkpoints must not imply approve/reject/waive authority in this phase.

| Module ID | Label | Parent Tab | State | Selectable | Source |
|---|---|---|---|---:|---|
| action-center | Action Center | project-home | preview | true | PCC |
| my-responsibilities | My Responsibilities | project-home | preview | true | PCC |
| today-this-week | Today / This Week | project-home | preview | true | PCC |
| hbi-assistant | HBI Assistant | core-tools | preview | true | PCC |
| external-platforms | External Platforms | core-tools | launch-only | true | External |
| team-access | Team & Access | core-tools | preview | true | PCC |
| project-directory | Project Directory | core-tools | preview | true | PCC |
| approvals-checkpoints | Approvals & Checkpoints | core-tools | preview | true | PCC |
| primary-documents | Primary Documents Tool | documents | preview | true | SharePoint |
| document-control-center | Document Control Center | documents | available | true | SharePoint |
| drawing-model-center | Drawing & Model Center | documents | deferred | false | Future |
| sharepoint-project-record | SharePoint Project Record | documents | preview | true | SharePoint |
| my-project-files | My Project Files / OneDrive | documents | preview | true | OneDrive |
| procore-documents | Procore Documents | documents | launch-only | true | Procore |
| document-crunch | Document Crunch | documents | launch-only | true | Document Crunch |
| adobe-sign | Adobe Sign | documents | launch-only | true | Adobe Sign |
| future-estimating-modules | Future estimating modules | estimating-preconstruction | deferred | false | Future |
| preconstruction-handoff | Preconstruction Handoff | estimating-preconstruction | deferred | false | Future |
| estimate-assumptions-alternates-exclusions | Estimate Assumptions / Alternates / Exclusions | estimating-preconstruction | deferred | false | Future |
| startup-center | Startup Center | startup-closeout | preview | true | PCC |
| responsibility-matrix | Responsibility Matrix | startup-closeout | preview | true | PCC |
| closeout | Closeout | startup-closeout | preview | true | PCC |
| closeout-turnover-tracker | Closeout & Turnover Tracker | startup-closeout | deferred | false | Future |
| warranty | Warranty | startup-closeout | deferred | false | Future |
| lessons-learned | Lessons Learned | startup-closeout | deferred | false | Future |
| subcontractor-performance | Subcontractor Performance | startup-closeout | deferred | false | Future |
| project-controls-center | Project Controls | project-controls | deferred | false | Future |
| permits-inspections | Permits & Inspections | project-controls | preview | true | PCC |
| contract-compliance | Contract & Compliance | project-controls | deferred | false | Future |
| risk-issues-decisions | Risk / Issues / Decisions | project-controls | deferred | false | Future |
| constraints-log | Constraints Log | project-controls | preview | true | PCC |
| field-operations | Field Operations | project-controls | deferred | false | Future |
| meeting-communication | Meeting & Communication | project-controls | deferred | false | Future |
| financial-reporting | Financial Reporting | cost-time | deferred | false | Future |
| schedule-monitor | Schedule Monitor | cost-time | deferred | false | Future |
| procurement-buyout | Procurement & Buyout | cost-time | preview | true | PCC |
| commitment-cost-exposure | Commitment / Cost Exposure | cost-time | deferred | false | Future |
| site-health | Site Health | systems-administration | preview | true | PCC |
| control-center-settings | Control Center Settings | systems-administration | preview | true | PCC |
| integration-settings | Integration Settings | systems-administration | deferred | false | Future |
| procore-mapping-sync-health | Procore Mapping / Sync Health | systems-administration | preview | true | Procore |
| module-configuration | Module Configuration | systems-administration | preview | true | PCC |

Suggested authority cue posture:

- PCC preview/read-only modules: context/review only; no decisions or writeback.
- Launch-only modules: opens or references the source system; PCC does not write back.
- Future/deferred modules: not active for selected project / future release.
- HBI Assistant: advisory only; no decisions, approvals, or writeback.
- Approvals & Checkpoints: checkpoint context only; no approval decision controls in this phase.
- Procore Mapping / Sync Health: mapping and sync-health context only; no Procore writeback.

Do not use developer-facing terms in any copy field.

---

## Required Helper Functions

Export these helpers:

```ts
export function getPrimaryNavigationTab(id: PccPrimaryTabId): PccPrimaryNavigationTab;
export function getModule(id: PccModuleId): PccNavigationModule;
export function getModulesForPrimaryTab(id: PccPrimaryTabId): readonly PccNavigationModule[];
export function isSelectableModule(module: PccNavigationModule): boolean;
export function getParentTabForModule(id: PccModuleId): PccPrimaryTabId;
export function normalizePrimaryTabId(id: unknown): PccPrimaryTabId;
export function normalizeModuleId(id: unknown): PccModuleId | undefined;
```

Required behavior:

- `normalizePrimaryTabId` returns `'project-home'` for invalid input.
- `normalizeModuleId` returns `undefined` for invalid input.
- Helper maps may be built internally, but exported registry arrays remain the source of truth.
- Avoid runtime side effects.

---

## Required Barrel Export

Update `packages/models/src/pcc/index.ts` to export the new registry types/constants/helpers.

Add a concise section near the existing MVP surfaces / work-center exports, for example:

```ts
// Phase 05 — Grouped primary tab / module navigation registry
export {
  PCC_PRIMARY_TAB_IDS,
  PCC_MODULE_IDS,
  PCC_MODULE_STATES,
  PCC_MODULE_STATE_COPY,
  PCC_PRIMARY_NAVIGATION_TABS,
  PCC_NAVIGATION_MODULES,
  getPrimaryNavigationTab,
  getModule,
  getModulesForPrimaryTab,
  isSelectableModule,
  getParentTabForModule,
  normalizePrimaryTabId,
  normalizeModuleId,
  type PccPrimaryTabId,
  type PccModuleId,
  type PccModuleState,
  type PccModuleStateCopy,
  type PccModuleSourceSystem,
  type PccNavigationModule,
  type PccPrimaryNavigationTab,
} from './PccPrimaryNavigation.js';
```

Do not remove or alter existing `PccMvpSurfaces` exports in this prompt.

---

## Required Tests

Create `packages/models/src/pcc/PccPrimaryNavigation.test.ts`.

Use `vitest`.

### Test discipline

- Use tuple-based iteration from `PCC_PRIMARY_TAB_IDS` and `PCC_MODULE_IDS`.
- Do not rely on `Object.keys` for coverage assertions.
- Avoid tests that can silently pass with missing registry entries.
- Keep forbidden-term constants in test code only; assert that they do not appear in registry visible copy.

### Required test coverage

Add tests proving:

1. `PCC_PRIMARY_TAB_IDS` is exactly the locked eight-item tuple in order.
2. `PCC_MODULE_STATES` is exactly the locked seven-item tuple in order.
3. `PCC_MODULE_IDS` is exactly the locked 42-item tuple in order.
4. `PCC_PRIMARY_NAVIGATION_TABS` has exactly one record per primary tab ID.
5. Primary tab labels exactly match:
   - Project Home
   - Core Tools
   - Document Control
   - Estimating & Preconstruction
   - Project Startup & Closeout
   - Project Controls
   - Cost & Time
   - Systems Administration
6. The `documents` primary tab visible label is exactly `Document Control`.
7. No primary tab visible label is `Documents`.
8. Every primary tab has at least one module.
9. Every module ID appears exactly once in `PCC_NAVIGATION_MODULES`.
10. Every module parent tab exists in `PCC_PRIMARY_TAB_IDS`.
11. Every module listed under a primary tab exists in `PCC_MODULE_IDS`.
12. Every module appears under exactly one primary tab.
13. Every module state is in `PCC_MODULE_STATES`.
14. Every module `stateLabel` matches `PCC_MODULE_STATE_COPY[module.state].stateLabel`.
15. Every non-selectable module has `disabledReason`.
16. Every non-selectable module `disabledReason` equals `PCC_MODULE_STATE_COPY[module.state].reason`.
17. Every selectable module has no `disabledReason`.
18. Every module has non-empty `summary`, `authorityCue`, `stateLabel`, and `label`.
19. Launch-only modules include no-writeback meaning in `authorityCue`.
20. HBI Assistant authority copy is advisory and includes no decision/no approval/no writeback meaning.
21. Approvals & Checkpoints does not expose approve/reject/waive authority in copy.
22. Helper functions return expected records.
23. `normalizePrimaryTabId` returns valid input as-is and invalid input as `'project-home'`.
24. `normalizeModuleId` returns valid input as-is and invalid input as `undefined`.
25. Registry visible copy contains no forbidden developer terms.

### Registry-visible copy fields to scan

Scan these fields case-insensitively:

- primary tab `label`
- primary tab `dashboardTitle`
- primary tab `dashboardDescription`
- module `label`
- module `summary`
- module `disabledReason`
- module `authorityCue`
- module `stateLabel`
- every `PCC_MODULE_STATE_COPY[*].stateLabel`
- every `PCC_MODULE_STATE_COPY[*].reason`

Forbidden terms:

```text
TODO
TBD
placeholder
stub
mock
fixture
debug
dev-only
not implemented
lorem
developer
code agent
prompt
repo
test selector
internal only
```

Comments and identifiers are out of scope. Product-visible string fields are in scope.

---

## Validation

Before editing:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

After editing:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm exec prettier --check packages/models/src/pcc/PccPrimaryNavigation.ts packages/models/src/pcc/PccPrimaryNavigation.test.ts packages/models/src/pcc/index.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not run Playwright in this prompt.

Do not run package builds unless required by a type/test failure investigation.

Do not change `pnpm-lock.yaml`. The before/after hash must remain unchanged.

---

## Required Closeout Response

Report:

```markdown
## Prompt 01 Closeout — Primary Tab and Module Registry

### Files Changed
- ...

### Registry Location
- ...

### Export Summary
- ...

### Test Summary
- ...

### Validation Results
- `git status --short` before:
- `pnpm-lock.yaml` MD5 before:
- `pnpm --filter @hbc/models check-types`:
- `pnpm --filter @hbc/models test`:
- `pnpm --filter @hbc/spfx-project-control-center check-types`:
- `pnpm exec prettier --check ...`:
- `git diff --check`:
- `pnpm-lock.yaml` MD5 after:
- `git status --short` after:

### Scope Confirmation
- Shell/router/state/UI files untouched:
- Surface files untouched:
- Playwright/evidence files untouched:
- Package/manifest/lockfile untouched:
- No runtime navigation wiring introduced:
- No standalone Module Launcher/sidebar/routing/writeback introduced:

### Notes / Risks for Prompt 02
- ...
```

Do not create a closeout markdown file unless explicitly instructed. A chat closeout is sufficient.

---

## Hard Stop Conditions

Stop and report instead of editing if:

- `packages/models/src/pcc/index.ts` cannot safely export the new registry.
- The Phase 05 package currently in the repo conflicts with the exact 42 module IDs listed above.
- Current `main` already contains `PccPrimaryNavigation.ts` with materially different content.
- The working tree is not clean before editing.
- Implementing this would require touching app shell/state/router/surfaces.
- Validation would require a dependency install or lockfile change.
