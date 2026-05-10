# Prompt 02 — Project Home Choreography and Gateways — Updated

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

This prompt consumes the span override foundation introduced in Prompt 01.

## Objective

Apply Phase 06 Project Home first-fold choreography and card gateway actions to both Project Home render paths:

```text
1. Fixture/no-client path
2. Read-model/client path
```

The implementation must:

- render the canonical first nine operational Project Home cards in the target order;
- apply the approved span override matrix to those nine cards;
- keep read-model lifecycle/HBI/Procore/detail cards below the nine-card operational spine;
- add truthful card-level gateway actions;
- preserve shell-owned active-panel ownership;
- preserve direct bento child invariants;
- avoid analytics, ECharts, dependency changes, Playwright evidence, and SPFx version bumps.

## Current Repo-Truth Baseline

Before editing, verify these baseline facts:

```text
Expected HEAD ancestry:
- Phase 5 closeout commit present:
  d06d614a02f16123d8c8252f71cebc22f348bc51
- Prompt 01 commit present:
  6e6454aafc4c9a6ca04e58611139eddab9616ae7

Expected current SPFx version:
- apps/project-control-center/config/package-solution.json = 1.0.0.216
- Do not bump again in Prompt 02.

Expected Prompt 01 source seam:
- PccDashboardCard supports spanOverrides?: PccCardSpanOverrides.
- PccDashboardCard emits data-pcc-span-source and data-pcc-span-override-mode.
- resolveDashboardCardColumnSpan exists in footprints.ts.
- Override wins below footprint minimums.
```

Run this preflight before editing:

```bash
git status --short
git rev-parse HEAD
git merge-base --is-ancestor d06d614a02f16123d8c8252f71cebc22f348bc51 HEAD && echo "phase-5-closeout-present" || echo "phase-5-closeout-missing"
git merge-base --is-ancestor 6e6454aafc4c9a6ca04e58611139eddab9616ae7 HEAD && echo "prompt-01-present" || echo "prompt-01-missing"
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Stop if either closeout ancestry check is missing. Do not edit files.

If the working tree is dirty, report the dirty paths and do not overwrite unrelated user changes.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts`.
- Do not add `echarts-for-react`.
- Do not add analytics, ECharts wrappers, chart data, or chart components.
- Do not bump `apps/project-control-center/config/package-solution.json`; Prompt 01 already bumped PCC to `1.0.0.216`.
- Do not edit `tools/spfx-shell/config/package-solution.json`.
- Do not run broad repo scans when targeted reads are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, URL routing, SharePoint mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Keep every bento card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense`.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not add card-level active-panel ownership.
- Do not remove the legacy `dataActiveSurfacePanel` prop from `PccDashboardCard`; just do not use it in new Phase 06 Project Home cards.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.
- Keep changes narrow and test-driven.

## Scope

Implement Project Home choreography and gateway actions only.

Do **not** implement analytics in this prompt.

Do **not** create:

```text
apps/project-control-center/src/analytics/
```

Do **not** add or modify package dependencies.

## Required Files

Likely modify:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/shared.ts
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccSiteHealthSummaryCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectReadinessCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccTeamSnapshotCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccRecentActivityCard.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
```

Likely create:

```text
apps/project-control-center/src/surfaces/projectHome/projectHomeChoreography.ts
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeGatewayAction.tsx
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHomeGatewayActions.test.tsx
```

Optional targeted CSS edit if required for product-grade action presentation:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
```

Avoid creating broader layout helpers in `src/layout` unless the current implementation proves it is necessary. This prompt is Project Home scoped.

## Current Source Facts To Preserve

Current fixture path order is:

```text
Priority Actions
Approvals & Checkpoints
Project Readiness
Document Control Center
Site Health Summary
Missing Configurations
External Platforms
Team Snapshot
Recent Activity
```

Current read-model path order is:

```text
Priority Actions
Approvals & Checkpoints
Project Readiness
Document Control Center
Site Health Summary
Missing Configurations
Lifecycle Timeline
Ask HBI — Grounded Project Answers
Procore snapshot
External Platforms
Team Snapshot
Recent Activity
Project Memory
Project Lens
Related Records
```

Current `PccProjectHome` only receives:

```ts
readModelClient?: IPccProjectHomeReadModelClient;
```

Current `PccSurfaceRouter` does not pass `onSelectModule` to Project Home.

Current `PccApp` has `shell.selectModule` and passes it to `PccShell`, but not to `PccSurfaceRouter`.

Current `usePccShellState.selectModule(id)` already:

- normalizes the module id;
- ignores invalid ids;
- ignores non-selectable modules;
- sets `activePrimaryTabId` to the selected module’s parent tab;
- sets `activeModuleId` to the selected module id.

Do not change `usePccShellState` unless absolutely necessary. It should not be necessary for Prompt 02.

## Target Project Home Order

Both fixture and read-model paths must begin with exactly these nine direct-child bento cards:

```text
Priority Actions
Site Health Summary
Document Control Center
Project Readiness
Approvals & Checkpoints
Missing Configurations
External Platforms
Team Snapshot
Recent Activity
```

Read-model path must then render the existing read-model-only lifecycle/detail content **after** those nine cards:

```text
Lifecycle Timeline
Ask HBI — Grounded Project Answers
Procore snapshot
Project Memory
Project Lens
Related Records
```

Do not delete Unified Lifecycle / Ask HBI / Procore / Project Memory / Project Lens / Related Records. Reposition them below the nine-card operational spine.

Implementation note:

- `PccProjectHomeUnifiedLifecycleSection` currently renders:
  - Lifecycle Timeline
  - optional `renderAfterTimeline`
  - Project Memory
  - Project Lens
  - Related Records
- To place External Platforms / Team Snapshot / Recent Activity inside the first nine, do **not** pass those three cards through `renderAfterTimeline`.
- In the read-model path, render External Platforms / Team Snapshot / Recent Activity before `PccProjectHomeUnifiedLifecycleSection`.
- Use `renderAfterTimeline` only for Ask HBI and Procore Snapshot, so those remain after Lifecycle Timeline and before the lower-detail lifecycle cards.

Target read-model full order:

```text
Priority Actions
Site Health Summary
Document Control Center
Project Readiness
Approvals & Checkpoints
Missing Configurations
External Platforms
Team Snapshot
Recent Activity
Lifecycle Timeline
Ask HBI — Grounded Project Answers
Procore snapshot
Project Memory
Project Lens
Related Records
```

## Span Override Matrix

Apply span overrides to the nine operational Project Home cards using Prompt 01’s `spanOverrides` prop.

Map 12-column modes to:

```text
largeLaptop
desktop
ultrawide
```

Use the same 12-column value for all three 12-column modes.

Map standard laptop to:

```text
standardLaptop
```

Do not override tablet/phone modes in this prompt unless necessary for a failing test. Let footprint/default safe stacking behavior handle smaller modes.

| Card | 12-col modes | standardLaptop 10-col |
|---|---:|---:|
| Priority Actions | 5 | 4 |
| Site Health Summary | 3 | 3 |
| Document Control Center | 4 | 3 |
| Project Readiness | 4 | 4 |
| Approvals & Checkpoints | 4 | 3 |
| Missing Configurations | 4 | 3 |
| External Platforms | 4 | 3 |
| Team Snapshot | 3 | 3 |
| Recent Activity | 5 | 4 |

Recommended helper:

```ts
import type { PccCardSpanOverrides } from '../../layout/footprints';

const projectHomeSpan = (
  twelveColumnSpan: number,
  standardLaptopSpan: number,
): PccCardSpanOverrides => ({
  largeLaptop: twelveColumnSpan,
  desktop: twelveColumnSpan,
  ultrawide: twelveColumnSpan,
  standardLaptop: standardLaptopSpan,
});
```

Recommended export names in `projectHomeChoreography.ts`:

```ts
export const PROJECT_HOME_OPERATIONAL_CARD_TITLES = [...]
export const PROJECT_HOME_OPERATIONAL_SPAN_OVERRIDES = {
  priorityActions: projectHomeSpan(5, 4),
  siteHealthSummary: projectHomeSpan(3, 3),
  documentControl: projectHomeSpan(4, 3),
  projectReadiness: projectHomeSpan(4, 4),
  approvalsCheckpoints: projectHomeSpan(4, 3),
  missingConfigurations: projectHomeSpan(4, 3),
  externalPlatforms: projectHomeSpan(4, 3),
  teamSnapshot: projectHomeSpan(3, 3),
  recentActivity: projectHomeSpan(5, 4),
} satisfies Record<string, PccCardSpanOverrides>;
```

Use a typed key union instead of `Record<string, ...>` if it improves local type safety.

## Gateway Action Contract

### Gateway prop model

Add a narrow shared prop contract in `shared.ts`:

```ts
import type { PccModuleId } from '@hbc/models/pcc';
import type { ReactNode } from 'react';
import type { PccCardSpanOverrides } from '../../layout/footprints';

export interface PccProjectHomeGatewayConfig {
  readonly label: string;
  readonly moduleId?: PccModuleId;
  readonly disabledReason?: string;
}

export interface PccProjectHomeCardProps {
  state?: PccCardState;
  spanOverrides?: PccCardSpanOverrides;
  gateway?: PccProjectHomeGatewayConfig;
  onSelectModule?: (moduleId: PccModuleId) => void;
}
```

Do not add broad shell state to every card. Keep the card contract narrow.

### Gateway component

Create a small PCC-owned component:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeGatewayAction.tsx
```

Requirements:

- Uses a native `<button type="button">`.
- For enabled gateways:
  - button is enabled only when `gateway.moduleId` and `onSelectModule` both exist;
  - click calls `onSelectModule(gateway.moduleId)`;
  - no URL routing;
  - no anchors;
  - no source mutation or writeback.
- For disabled/preview-only gateways:
  - button is disabled;
  - visible reason copy is rendered near the button;
  - button exposes accessible context via `aria-describedby` or equivalent;
  - reason copy is product-grade.
- Emits stable test markers:
  - `data-pcc-project-home-gateway-action="<module id or preview>"`
  - `data-pcc-project-home-gateway-label="<label>"`
  - `data-pcc-project-home-gateway-state="enabled" | "disabled"`
- Does not use developer copy.

If an enabled gateway is missing `onSelectModule`, treat it as disabled and render product-grade visible copy such as:

```text
Gateway action is unavailable in this preview context.
```

Only use that fallback in isolated card render contexts. In `PccApp`, `onSelectModule` must be wired.

### Gateway mapping

Use this mapping:

| Card | Label | Module ID / Behavior |
|---|---|---|
| Priority Actions | Open Action Center | `action-center` |
| Site Health Summary | Open Site Health | `site-health` |
| Document Control Center | Open Document Control | `document-control-center` |
| Project Readiness | Open Startup Center | `startup-center` |
| Approvals & Checkpoints | Open Approvals | `approvals-checkpoints` |
| Missing Configurations | Open Settings | `control-center-settings` |
| External Platforms | Open External Platforms | `external-platforms` |
| Team Snapshot | Open Team & Access | `team-access` |
| Recent Activity | View Activity Context | disabled/preview-only |

Important repo-truth note:

- There is no current `project-readiness` module id in `PccPrimaryNavigation.ts`.
- For this MVP, `Project Readiness` routes to `startup-center`.
- Add a non-UI TODO comment near the mapping:
  - future development may introduce or retarget a dedicated readiness module if the navigation registry changes.

Recent Activity disabled reason:

```text
Activity context is preview-only in this release.
```

Do not use:

```text
not implemented
TODO
coming soon because dev work remains
```

## Gateway Wiring

Thread only what is needed:

### PccApp

Pass `shell.selectModule` into `PccSurfaceRouter`:

```tsx
<PccSurfaceRouter
  activePrimaryTabId={shell.activePrimaryTabId}
  activeModuleId={shell.activeModuleId}
  readModelClient={readModelClient}
  onSelectModule={shell.selectModule}
/>
```

### PccSurfaceRouter

Add optional prop:

```ts
onSelectModule?: (id: PccModuleId) => void;
```

For `project-home`, pass it into `PccProjectHome`.

Do not pass it to unrelated surfaces in this prompt unless already needed.

### PccProjectHome

Add optional prop:

```ts
onSelectModule?: (id: PccModuleId) => void;
```

Pass it to both:

```tsx
<PccProjectHomeReadModelContent client={readModelClient} onSelectModule={onSelectModule} />
```

and the fixture cards.

### PccProjectHomeReadModelContent

Add optional prop:

```ts
onSelectModule?: (id: PccModuleId) => void;
```

Pass it to the nine operational cards.

Do not pass gateway props to read-model-only lifecycle/detail cards in this prompt.

## TODO Documentation

Add this TODO in `projectHomeChoreography.ts` near the card order / gateway mapping, not visible UI:

```ts
// TODO(post-mvp): Implement stage/lifecycle-aware Project Home context using
// the PCC Product Architecture and User Journey Blueprint as the governing
// reference. Project Home should adjust card priority, analytics emphasis,
// gateway recommendations, and command context based on project stage,
// lifecycle signals, role/persona, and source-backed project readiness.
// This must remain read-model driven until a future command-model contract
// authorizes workflow execution or source-system writeback.
```

Also add a focused non-UI TODO near the Project Readiness gateway mapping:

```ts
// TODO(post-mvp): Retarget Project Readiness to a dedicated readiness module
// if the Phase 05 navigation registry adds one. The MVP gateway opens
// Startup Center because no `project-readiness` module id currently exists.
```

## Implementation Requirements By Card

For each of the nine Project Home operational cards:

- accept inherited `spanOverrides`, `gateway`, and `onSelectModule` props through `PccProjectHomeCardProps`;
- pass `spanOverrides` to `PccDashboardCard`;
- pass `action={<PccProjectHomeGatewayAction ... />}` to `PccDashboardCard`;
- preserve current state/read-model behavior;
- preserve current fixture fallback behavior;
- preserve existing body test markers;
- do not introduce wrapper elements between the bento grid and the card.

Example pattern:

```tsx
export const PccPriorityActionsCard: FC<PccPriorityActionsCardProps> = ({
  state = 'preview',
  actions,
  spanOverrides,
  gateway,
  onSelectModule,
}) => (
  <PccDashboardCard
    footprint="wide"
    tier="tier2"
    region="operational"
    eyebrow="Today"
    title="Priority Actions"
    spanOverrides={spanOverrides}
    action={
      gateway ? (
        <PccProjectHomeGatewayAction gateway={gateway} onSelectModule={onSelectModule} />
      ) : undefined
    }
  >
    ...
  </PccDashboardCard>
);
```

## Required Tests

Update:

```text
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
```

Create:

```text
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHomeGatewayActions.test.tsx
```

### Composition tests

Tests must prove:

- fixture path direct-card order starts exactly with the nine-card operational sequence;
- fixture path has exactly nine direct cards;
- read-model path first nine direct cards exactly match the nine-card operational sequence;
- read-model path full order equals:

```text
Priority Actions
Site Health Summary
Document Control Center
Project Readiness
Approvals & Checkpoints
Missing Configurations
External Platforms
Team Snapshot
Recent Activity
Lifecycle Timeline
Ask HBI — Grounded Project Answers
Procore snapshot
Project Memory
Project Lens
Related Records
```

- `Project Intelligence` is absent from Project Home text;
- zero direct bento cards carry `data-pcc-active-surface-panel="project-home"`;
- shell `main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]` remains the marker owner.

### Span override tests

Use `PccApp forceMode` render tests to assert card-level spans.

For `desktop`, `largeLaptop`, and `ultrawide`, assert:

```text
Priority Actions = 5
Site Health Summary = 3
Document Control Center = 4
Project Readiness = 4
Approvals & Checkpoints = 4
Missing Configurations = 4
External Platforms = 4
Team Snapshot = 3
Recent Activity = 5
```

For `standardLaptop`, assert:

```text
Priority Actions = 4
Site Health Summary = 3
Document Control Center = 3
Project Readiness = 4
Approvals & Checkpoints = 3
Missing Configurations = 3
External Platforms = 3
Team Snapshot = 3
Recent Activity = 4
```

Also assert for the nine operational cards:

```text
data-pcc-span-source="override"
```

At a smaller mode such as `tabletLandscape`, assert no unnecessary mode override:

```text
data-pcc-span-source="footprint"
```

### Gateway action tests

Tests must prove:

- all nine gateway labels render;
- eight enabled gateway buttons render with `data-pcc-project-home-gateway-state="enabled"`;
- Recent Activity gateway renders disabled with visible reason:
  - `Activity context is preview-only in this release.`
- disabled Recent Activity click does not change active tab or panel;
- clicking `Open Document Control` changes active panel to `documents`;
- clicking `Open Team & Access` changes active panel to `core-tools` and selected module context to `Team & Access`;
- clicking `Open Site Health` changes active panel to `systems-administration` and selected module context to `Site Health`;
- clicking `Open Action Center` remains on `project-home` and does not break the panel;
- clicking `Open Settings` changes active panel to `systems-administration` and selected module context to `Control Center Settings`.

Use `@testing-library/user-event` only if it is already available in the repo. If it is not already a dependency, use Testing Library `fireEvent` and do not install anything.

### Direct-child invariant test

Assert:

```text
Array.from(grid.children).every(child =>
  child instanceof HTMLElement && child.hasAttribute('data-pcc-card')
)
```

for fixture path and read-model path after async hooks settle.

## Acceptance Criteria

- Project Home fixture path starts with the canonical nine operational cards.
- Project Home read-model path starts with the canonical nine operational cards.
- Read-model lifecycle/HBI/Procore/detail cards remain present but below the nine-card spine.
- The nine operational cards use approved span overrides at 12-column and 10-column modes.
- Smaller modes retain footprint behavior unless targeted tests prove otherwise.
- Gateways are visible, truthful, accessible, and callback-driven.
- Enabled gateways invoke `selectModule` and respect module parent-tab routing.
- Disabled Recent Activity is visibly disabled with reason copy.
- No analytics added.
- No dependency changes.
- No SPFx version bump.
- No `grid-auto-flow: dense`.
- No Project Intelligence bento card.
- No card-level active-panel ownership.
- Direct-child bento invariant remains intact.
- Existing Project Home state/read-model behavior remains intact.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Do not run Playwright for Prompt 02 unless the user explicitly requests it. Prompt 02 is still covered by component tests; hosted visual evidence belongs to later evidence prompts.

If `pnpm exec prettier` cannot resolve the binary, stop and report. Do not use `npx`, do not install prettier, and do not modify dependency files.

## Closeout Report

Report in this structure:

```text
HB: Phase 06 Prompt 02 Closeout — Project Home Choreography and Gateways

Summary:
- ...

Files Changed:
- ...

Version:
- SPFx solution version before:
- SPFx solution version after:
- SPFx feature version before:
- SPFx feature version after:
- Version changed in this prompt: No

Dependency / Lockfile:
- Dependencies installed by agent: No
- echarts added by agent: No
- echarts-for-react added to PCC: No
- pnpm-lock md5 before:
- pnpm-lock md5 after:

Implementation Notes:
- fixture order:
- read-model order:
- span overrides:
- gateway wiring:
- Recent Activity disabled state:
- read-model lifecycle/HBI/Procore placement:
- active-panel ownership:
- direct-child invariant:

Validation:
- ...

Risks / Follow-Up:
- ...

Commit Guidance:
- Suggested summary:
  feat(pcc): choreograph Project Home cards and gateways
- Suggested description bullets:
  - reorder Project Home fixture and read-model paths to the Phase 06 nine-card operational spine;
  - apply Prompt 01 spanOverrides for 12-column and standard-laptop Project Home layouts;
  - add PCC-owned Project Home gateway action component and thread selectModule narrowly through PccApp/PccSurfaceRouter/ProjectHome;
  - keep read-model lifecycle/HBI/Procore/detail cards below the first operational fold;
  - preserve shell-owned active-panel marker and direct bento child invariant;
  - no analytics, no dependency install, no SPFx version bump, no echarts-for-react.
```

## Non-Goals

Do not do any of the following in Prompt 02:

- Analytics card creation.
- ECharts import/use.
- `apps/project-control-center/src/analytics/` creation.
- Cross-surface dashboard analytics insertion.
- `PccPrimaryDashboardSurface` analytics modification.
- Dependency installation.
- SPFx package version bump.
- SPFx package build/deploy.
- Playwright evidence generation.
- Tenant-hosted validation.
- URL routing.
- SharePoint / Procore / Sage writeback.
