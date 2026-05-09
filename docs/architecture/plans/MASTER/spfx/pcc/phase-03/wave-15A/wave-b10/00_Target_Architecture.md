# Phase 05 Target Architecture — Grouped Tab Module Navigation

## 1. Purpose

Phase 05 establishes the Project Control Center navigation model for dashboard surfaces and module entry points.

The navigation system must make the PCC feel like a structured project operating layer:

```text
Project Control Center
  └─ Primary tabs = dashboard surfaces
      └─ Dropdown child links = modules/tools/work centers
```

The implementation must extend the current tab bar accessibility pattern rather than creating a separate hero/header module launcher.

## 2. Architecture Decision

The standalone "Module Launcher" concept is replaced by **Grouped Tab Module Navigation**.

### Final Decision

```text
Primary Tab = Dashboard Surface
Dropdown / Child Module Link = Module Entry Point
```

### Consequences

- Do not add a separate `PccModuleLauncher` in the hero band.
- Do not add a persistent PCC sidebar.
- Do not create URL routes.
- Do not create SharePoint page routes.
- Do not create a second navigation control outside the primary tab bar.
- Do not remove existing surface implementations prematurely.
- Do generalize the existing `PccHorizontalTabs` dropdown model.

## 3. Current Repo Anchors

The implementation must audit and build from these current repo anchors:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/surfaces/
apps/project-control-center/src/tests/
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccCapabilities.ts
```

Current implementation facts that must be verified before editing:

- `PccHorizontalTabs.tsx` already contains a hardcoded Project Home dropdown pattern.
- `usePccShellState.ts` currently tracks `activeSurfaceId`, `previewMode`, and `selectedProjectId`.
- `PccApp.tsx` currently derives hero state from `activeSurfaceId`.
- `PccSurfaceRouter.tsx` currently routes by existing MVP surface IDs.
- Current existing surface IDs are likely still:
  - `project-home`
  - `team-and-access`
  - `documents`
  - `project-readiness`
  - `approvals`
  - `external-systems`
  - `control-center-settings`
  - `site-health`

## 4. Locked Primary Tab Model

Phase 05 shall implement the following primary tabs in this visible order:

1. Project Home
2. Core Tools
3. Document Control
4. Estimating & Preconstruction
5. Project Startup & Closeout
6. Project Controls
7. Cost & Time
8. Systems Administration

## 5. Locked Primary Tab IDs

Use the following target IDs.

```ts
export const PCC_PRIMARY_TAB_IDS = [
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

### ID Notes

- Use `documents` internally for the Document Control tab in Phase 05 to preserve compatibility with the existing router and tests.
- The visible label for `documents` must be `Document Control`.
- Do not rename `documents` to `document-control` in this phase unless all type exports, router cases, tests, and read-model seams are updated safely in the same prompt and validation remains green.
- `core-tools`, `estimating-preconstruction`, `startup-closeout`, `project-controls`, `cost-time`, and `systems-administration` are new primary tab IDs for this target architecture.
- New IDs may initially render production-grade preview dashboard shells if full module surfaces are not yet implemented.

## 6. Locked Module Registry

### 6.1 Module State Vocabulary

```ts
export const PCC_MODULE_STATES = [
  'available',
  'preview',
  'read-only',
  'launch-only',
  'configuration-required',
  'source-unavailable',
  'deferred',
] as const;
```

### 6.2 State Semantics

| State | User-Facing Meaning | Click Behavior |
|---|---|---|
| available | Module is active for the selected project. | Sets parent tab and active module. |
| preview | Module content is visible as a safe preview. | Sets parent tab and active module. |
| read-only | Module can be reviewed but not changed. | Sets parent tab and active module. |
| launch-only | PCC can open or reference the source system but does not write back. | Sets parent tab and active module only if an internal section exists; external launch remains separately governed. |
| configuration-required | Configuration is needed before use. | No state change. |
| source-unavailable | Source data is unavailable for this project. | No state change. |
| deferred | Planned for a future release. | No state change. |

### 6.3 Production-Grade State Copy

Use these approved user-facing copy strings.

| State | State Label | Reason / Cue Copy |
|---|---|---|
| available | Available | `Open this module to review current project information.` |
| preview | Preview | `Preview only. Review source records before taking action.` |
| read-only | Read-only | `Read-only view. No approvals, decisions, or writeback are performed here.` |
| launch-only | Launch-only | `Opens or references the source system. PCC does not write back to that system.` |
| configuration-required | Configuration required | `Configuration is required before this module can open for the selected project.` |
| source-unavailable | Source unavailable | `Source data is not available for the selected project.` |
| deferred | Future release | `Planned for a future release. This module is not active for the selected project.` |

Forbidden UI copy:

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
coming soon
lorem
developer
code agent
prompt
repo
test selector
internal only
```

If the local agent needs comments in code, comments may contain implementation details, but those strings must never render into user-facing UI.

## 7. Locked Primary Tabs and Child Modules

### 7.1 Project Home

```ts
{
  id: 'project-home',
  label: 'Project Home',
  dashboardDescription: 'Daily project command dashboard for priorities, responsibilities, and near-term work.',
  modules: [
    'action-center',
    'my-responsibilities',
    'today-this-week'
  ]
}
```

| Module ID | Label | State | Notes |
|---|---|---|---|
| action-center | Action Center | preview | Cross-module action and decision queue. |
| my-responsibilities | My Responsibilities | preview | Role-aware responsibility view. |
| today-this-week | Today / This Week | preview | Near-term task, decision, meeting, and due-date focus. |

### 7.2 Core Tools

```ts
{
  id: 'core-tools',
  label: 'Core Tools',
  dashboardDescription: 'Cross-cutting project operating tools used across stages and roles.',
  modules: [
    'hbi-assistant',
    'external-platforms',
    'team-access',
    'project-directory',
    'approvals-checkpoints'
  ]
}
```

| Module ID | Label | State | Notes |
|---|---|---|---|
| hbi-assistant | HBI Assistant | preview | Advisory only. Must preserve no decision/writeback authority. |
| external-platforms | External Platforms | launch-only | Launch/reference posture. No external writeback. |
| team-access | Team & Access | preview | Governed team and access posture. |
| project-directory | Project Directory | preview | Project people, roles, and contact context. |
| approvals-checkpoints | Approvals & Checkpoints | preview | Governance and checkpoint posture. |

### 7.3 Document Control

```ts
{
  id: 'documents',
  label: 'Document Control',
  dashboardDescription: 'Primary project document, drawing, model, and source-file control surface.',
  modules: [
    'primary-documents',
    'document-control-center',
    'drawing-model-center',
    'sharepoint-project-record',
    'my-project-files',
    'procore-documents',
    'document-crunch',
    'adobe-sign'
  ]
}
```

| Module ID | Label | State | Notes |
|---|---|---|---|
| primary-documents | Primary Documents Tool | preview | Primary document access experience. |
| document-control-center | Document Control Center | available | Existing Documents surface content maps here. |
| drawing-model-center | Drawing & Model Center | deferred | Drawing/model coordination, CAD/Revit/BIM, design files. |
| sharepoint-project-record | SharePoint Project Record | preview | Formal project file source. |
| my-project-files | My Project Files / OneDrive | preview | User working-file path. |
| procore-documents | Procore Documents | launch-only | Procore remains source of truth. |
| document-crunch | Document Crunch | launch-only | External tool reference/launch only. |
| adobe-sign | Adobe Sign | launch-only | External signature workflow reference/launch only. |

### 7.4 Estimating & Preconstruction

```ts
{
  id: 'estimating-preconstruction',
  label: 'Estimating & Preconstruction',
  dashboardDescription: 'Continuity dashboard for preconstruction handoff, estimating assumptions, alternates, and exclusions.',
  modules: [
    'future-estimating-modules',
    'preconstruction-handoff',
    'estimate-assumptions-alternates-exclusions'
  ]
}
```

| Module ID | Label | State | Notes |
|---|---|---|---|
| future-estimating-modules | Future estimating modules | deferred | Reserved for later estimating integration. |
| preconstruction-handoff | Preconstruction Handoff | deferred | Handoff readiness and transition context. |
| estimate-assumptions-alternates-exclusions | Estimate Assumptions / Alternates / Exclusions | deferred | Continuity records from estimating/preconstruction. |

### 7.5 Project Startup & Closeout

```ts
{
  id: 'startup-closeout',
  label: 'Project Startup & Closeout',
  dashboardDescription: 'Startup, responsibility, closeout, turnover, warranty, lessons learned, and subcontractor performance dashboard.',
  modules: [
    'startup-center',
    'responsibility-matrix',
    'closeout',
    'closeout-turnover-tracker',
    'warranty',
    'lessons-learned',
    'subcontractor-performance'
  ]
}
```

| Module ID | Label | State | Notes |
|---|---|---|---|
| startup-center | Startup Center | preview | Startup checklist and readiness controls. |
| responsibility-matrix | Responsibility Matrix | preview | Responsibility and owner-contract mapping. |
| closeout | Closeout | preview | Closeout posture and task overview. |
| closeout-turnover-tracker | Closeout & Turnover Tracker | deferred | Turnover deliverable tracker. |
| warranty | Warranty | deferred | Warranty transition and claim context. |
| lessons-learned | Lessons Learned | deferred | Knowledge capture and reuse. |
| subcontractor-performance | Subcontractor Performance | deferred | Scorecards, evaluations, and history. |

### 7.6 Project Controls

```ts
{
  id: 'project-controls',
  label: 'Project Controls',
  dashboardDescription: 'Active project controls, field coordination, compliance, risks, constraints, and communication dashboard.',
  modules: [
    'project-controls-center',
    'permits-inspections',
    'contract-compliance',
    'risk-issues-decisions',
    'constraints-log',
    'field-operations',
    'meeting-communication'
  ]
}
```

| Module ID | Label | State | Notes |
|---|---|---|---|
| project-controls-center | Project Controls | deferred | Broad controls dashboard. |
| permits-inspections | Permits & Inspections | preview | UI label combines Permit & AHJ Center plus Inspection Readiness Center. |
| contract-compliance | Contract & Compliance | deferred | Contract obligations, notices, compliance. |
| risk-issues-decisions | Risk / Issues / Decisions | deferred | Risk and decision register. |
| constraints-log | Constraints Log | preview | Make-ready constraints and blockers. |
| field-operations | Field Operations | deferred | Field execution, daily logs, observations, safety acknowledgements. |
| meeting-communication | Meeting & Communication | deferred | Meeting register, minutes, action items, communications. |

### 7.7 Cost & Time

```ts
{
  id: 'cost-time',
  label: 'Cost & Time',
  dashboardDescription: 'Financial, schedule, procurement, buyout, commitment, and time-risk dashboard.',
  modules: [
    'financial-reporting',
    'schedule-monitor',
    'procurement-buyout',
    'commitment-cost-exposure'
  ]
}
```

| Module ID | Label | State | Notes |
|---|---|---|---|
| financial-reporting | Financial Reporting | deferred | Future Sage/Power BI-linked reporting. |
| schedule-monitor | Schedule Monitor | deferred | Future schedule quality, milestone, and drift view. |
| procurement-buyout | Procurement & Buyout | preview | Broader than Buyout Log. Includes buyout/procurement posture. |
| commitment-cost-exposure | Commitment / Cost Exposure | deferred | Future commitment, change, and exposure signals. |

### 7.8 Systems Administration

```ts
{
  id: 'systems-administration',
  label: 'Systems Administration',
  dashboardDescription: 'Governance, configuration, integration, site health, and template administration dashboard.',
  modules: [
    'site-health',
    'control-center-settings',
    'integration-settings',
    'procore-mapping-sync-health',
    'module-configuration'
  ]
}
```

| Module ID | Label | State | Notes |
|---|---|---|---|
| site-health | Site Health | preview | Drift, health, and repair posture. |
| control-center-settings | Control Center Settings | preview | Project/site/module settings. |
| integration-settings | Integration Settings | deferred | External integration configuration. |
| procore-mapping-sync-health | Procore Mapping / Sync Health | preview | Mapping and sync-health posture. |
| module-configuration | Module Configuration | preview | Module visibility and configuration posture. |

## 8. Dashboard Surface Content Contract

Every primary tab must render a production-grade dashboard surface.

If a full data-backed dashboard is not yet implemented, render a production-grade preview dashboard with:

- surface title;
- short surface purpose;
- 3 to 6 cards;
- module status summaries;
- source/read-only/future-release cues where appropriate;
- no developer copy;
- no generic placeholder text;
- no empty skeleton surfaces on ready path.

### Dashboard Copy Pattern

Use language like:

```text
This dashboard organizes project controls, field coordination, compliance, and communication signals for the selected project.
```

Do not use language like:

```text
This module is not implemented yet.
TODO: build this later.
Developer placeholder.
Mock content.
```

## 9. Accessibility Contract

### 9.1 Primary Tabs

- Primary tabs use `role="tab"`.
- The primary tab container uses `role="tablist"`.
- The active dashboard surface remains shell `main[role="tabpanel"]`.
- Each primary tab stamps a stable `data-pcc-primary-tab-id`.

### 9.2 Dropdown Toggles

Every primary tab with child modules must have a dropdown toggle.

Toggle requirements:

- `type="button"`
- `aria-label="Open {Primary Tab} modules"`
- `aria-haspopup="menu"`
- `aria-expanded`
- `aria-controls`
- stable marker: `data-pcc-nav-toggle="{primaryTabId}"`

### 9.3 Module Menu

- The menu may use `role="menu"` and module items may use `role="menuitem"`, or it may use button semantics with explicit labels.
- If using `role="menu"`, follow menu keyboard rules.
- If using button semantics, preserve tested keyboard behavior equivalent to menu operation.
- Disabled module items must remain understandable by assistive technology.

### 9.4 Keyboard Rules

| Key | Behavior |
|---|---|
| ArrowLeft | Move to previous primary tab and select it. |
| ArrowRight | Move to next primary tab and select it. |
| Home | Move to first primary tab and select it. |
| End | Move to last primary tab and select it. |
| ArrowDown on primary tab | Open module dropdown and focus first enabled or first visible module item. |
| ArrowDown in menu | Move to next visible module item. |
| ArrowUp in menu | Move to previous visible module item; return to parent tab if on first item. |
| Enter / Space on primary tab | Select primary tab dashboard and clear active module. |
| Enter / Space on enabled module item | Select parent surface and active module. |
| Enter / Space on disabled module item | Do not select; keep reason copy visible/announced. |
| Escape | Close dropdown and return focus to parent tab. |
| Blur outside nav | Close dropdown. |

## 10. State Contract

### 10.1 Target State Shape

```ts
export interface PccShellState {
  readonly activeSurfaceId: PccPrimaryTabId;
  readonly activeModuleId?: PccModuleId;
  readonly previewMode: true;
  readonly selectedProjectId?: PccProjectId;
}
```

### 10.2 Target Actions

```ts
export interface PccShellStateActions {
  selectPrimarySurface(id: PccPrimaryTabId): void;
  selectModule(id: PccModuleId): void;
  clearActiveModule(): void;
  setSelectedProject(id: PccProjectId | undefined): void;
}
```

### 10.3 Behavior

- `selectPrimarySurface(id)`:
  - validates/normalizes `id`;
  - sets `activeSurfaceId`;
  - clears `activeModuleId`.

- `selectModule(id)`:
  - validates/normalizes `id`;
  - finds module in registry;
  - if module is selectable, sets `activeSurfaceId` to module parent and sets `activeModuleId`;
  - if module is not selectable, leaves state unchanged.

- `clearActiveModule()`:
  - clears `activeModuleId`.

- `setSelectedProject(id)`:
  - preserves current `activeSurfaceId`;
  - clears `activeModuleId`;
  - sets selected project.

## 11. Router Contract

The router must accept:

```ts
activeSurfaceId: PccPrimaryTabId;
activeModuleId?: PccModuleId;
```

For Phase 05, it may map new primary tabs to preview dashboard components. It must not fail when a new tab has no full feature implementation.

### Router Mapping

| Primary Tab ID | Phase 05 Render Strategy |
|---|---|
| project-home | Existing `PccProjectHome`; optionally expose active module summary. |
| core-tools | New production-grade preview dashboard composed from existing Core Tools modules/cards where possible. |
| documents | Existing `PccDocumentsSurface`, visibly treated as Document Control. |
| estimating-preconstruction | New production-grade preview dashboard. |
| startup-closeout | New production-grade dashboard or adapter using current Project Readiness modules where appropriate. |
| project-controls | New production-grade dashboard or adapter using Project Readiness/Constraints/Permit/Inspection content where appropriate. |
| cost-time | New production-grade preview dashboard. |
| systems-administration | New production-grade dashboard or adapter using existing Site Health and Settings surfaces where appropriate. |

## 12. Surface Header / Hero Contract

The shell hero should update by active primary tab.

Minimum hero data per new primary tab:

- secondary title;
- surface description;
- hero highlights;
- governance microcopy.

The hero may show an active-module chip when `activeModuleId` is defined.

Example chip copy:

```text
Module: Constraints Log
```

Do not show internal IDs in UI.

## 13. Stage and Role Visibility

Phase 05 must include typed metadata fields for future stage/role visibility, but it does not need to fully enforce them at runtime.

### Stage Values

```ts
type PccProjectStage =
  | 'lead'
  | 'estimating'
  | 'preconstruction'
  | 'active_construction'
  | 'closeout'
  | 'warranty';
```

### Status Values

```ts
type PccProjectStatus = 'Active' | 'On Hold' | 'Closed' | 'Archived';
```

### Metadata Fields

```ts
readonly stageVisibility?: readonly PccProjectStage[];
readonly roleVisibility?: readonly PccPersona[];
readonly hiddenWhenArchived?: boolean;
readonly archivedState?: PccModuleState;
```

Do not make up live role permissions in Phase 05.

## 14. HBI / Search / Memory Guardrails

- HBI Assistant is advisory only.
- HBI must not make decisions.
- HBI must not approve, reject, waive, or write back.
- Search/HBI modules must preserve source lineage and insufficient-evidence behavior.
- Project Memory and Lifecycle Spine remain cross-cutting future architecture in Phase 05; do not create ordinary user navigation destinations for them unless the dashboard uses professional, deferred preview cards.

## 15. Forbidden Implementation Patterns

- Separate hero module launcher.
- Persistent sidebar.
- URL routing.
- SharePoint page routing.
- External-system writeback.
- Native SharePoint admin UI dependency.
- Raw internal field names in user-facing UI.
- Developer-only copy in user-facing UI.
- Empty "not implemented" surfaces.
- Hardcoded one-off dropdown logic per tab when a registry-driven pattern is practical.
- Tests that pass by querying strings that should not be user-facing.

## 16. Completion Definition

Phase 05 is complete when:

1. Primary navigation renders the eight locked tabs.
2. `Document Control` replaces visible `Documents` wording.
3. Each primary tab exposes its child module dropdown.
4. Dropdowns are registry-driven.
5. State supports `activeModuleId`.
6. Enabled modules set active surface and active module.
7. Non-selectable modules do not mutate state.
8. Non-selectable modules expose production-grade reason copy.
9. Dashboard surfaces render for all eight primary tabs.
10. No developer copy renders in UI.
11. Component tests pass.
12. Baseline validation commands pass.
13. Live evidence is captured if hosted navigation behavior changes.
