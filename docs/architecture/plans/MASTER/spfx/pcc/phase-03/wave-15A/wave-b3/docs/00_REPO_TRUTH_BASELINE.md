# 00 — Repo-Truth Baseline

## Objective

Record the audited baseline that the remediation agent must preserve and build from.

## Baseline Primitive Facts

### Shared Bento Grid

Current file:

- `apps/project-control-center/src/layout/PccBentoGrid.tsx`
- `apps/project-control-center/src/layout/PccBentoGrid.module.css`

Current baseline:

- Uses `useContainerBreakpoint`.
- Emits `[data-pcc-bento-grid]`.
- Provides bento context with mode, columns, row unit, and gap.
- Sets CSS variables for grid columns, row unit, gap, and safe minimum columns.
- Uses CSS Grid.
- Does not currently require `grid-auto-flow: dense`; this must remain prohibited.

### Shared Card Primitive

Current file:

- `apps/project-control-center/src/layout/PccDashboardCard.tsx`
- `apps/project-control-center/src/layout/PccDashboardCard.module.css`

Current baseline:

- Supports `footprint`, `hierarchy`, `tier`, `region`, `density`, `title`, `eyebrow`, `action`, `ariaLabel`, `ariaDescribedBy`, `headingLevel`, and `dataActiveSurfacePanel`.
- Resolves `hierarchy` into a fallback tier.
- Resolves tier into a fallback region.
- Emits card markers including `data-pcc-card`, `data-pcc-footprint`, `data-pcc-card-hierarchy`, `data-pcc-card-tier`, `data-pcc-card-region`, `data-pcc-card-density`, `data-pcc-mode`, `data-pcc-column-span`, `data-pcc-row-span`, `data-pcc-measured-height`, and `data-pcc-active-surface-panel`.
- Uses `aria-labelledby` when a title is present.

### Footprint Contract

Current file:

- `apps/project-control-center/src/layout/footprints.ts`

Current baseline:

- Footprints already include:
  - `hero`
  - `wide`
  - `standard`
  - `compact`
  - `tall`
  - `full`
  - `rail`
  - `detail`
- Responsive modes already include:
  - `phone`
  - `tabletPortrait`
  - `tabletLandscape`
  - `smallLaptop`
  - `standardLaptop`
  - `largeLaptop`
  - `desktop`
  - `ultrawide`
- Do not add a second breakpoint system unless a clear technical need is proven.

### Row-Span Contract

Current file:

- `apps/project-control-center/src/layout/useBentoRowSpan.ts`
- `apps/project-control-center/src/layout/useBentoRowSpan.test.tsx`

Current baseline:

- The hook uses `ResizeObserver`.
- It uses intrinsic `scrollHeight` to recover from constrained measurement.
- It floors at `initialMinRows`.
- Existing tests cover the prior 8px collapse failure.

Preserve this behavior.

## Baseline Route Surface Facts

### Project Home

Current primary files:

- `PccProjectHome.tsx`
- `PccProjectIntelligenceCard.tsx`
- `PccPriorityActionsCard.tsx`
- `PccMissingConfigurationsCard.tsx`
- remaining Project Home cards
- read-model-only Project Home unified lifecycle / Ask HBI / Procore cards

Current baseline:

- Fixture-only path renders 10 cards.
- Read-model path renders 16 cards.
- Project Intelligence is currently the strongest example: `footprint="hero"`, `hierarchy="primary"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, and `dataActiveSurfacePanel="project-home"`.
- Priority Actions is currently `footprint="wide"`, `tier="tier2"`, `region="operational"`.
- Missing Configurations is currently `tier="state"`, `region="state"`.

### Team & Access

Current primary files:

- `PccTeamAccessSurface.tsx`
- `PccTeamAccessLaneShell.tsx`
- `PccTeamAccessHeaderCard.tsx`
- `PccTeamViewerLaneCard.tsx`
- `PccPermissionRequestLaneCard.tsx`
- `PccAccessManagerLaneCard.tsx`

Current baseline concern:

- Header card carries active panel marker but relies on defaults and must become explicit Tier 1 command.
- Restricted access-manager card in `PccTeamAccessLaneShell` currently defaults to operational and must become an explicit state card.

### Documents

Current primary files:

- `PccDocumentsSurface.tsx`
- `PccDocumentsHeaderCard.tsx`
- `PccDocumentControlLaneCard.tsx`
- `PccDocumentControlPermissionsCard.tsx`
- `PccDocumentControlReviewsCard.tsx`

Current baseline:

- Documents header already uses `tier="tier1"`, `region="command"`, and active panel marker.
- Lane card maps are close to target:
  - Project Record: Tier 2 operational.
  - My Project Files: Tier 2 operational.
  - External Systems: Tier 3 deferred.

### Project Readiness

Current primary file:

- `PccProjectReadinessSurface.tsx`

Current baseline concern:

- Many nested cards are declared inline and rely on defaults or legacy `hierarchy`.
- Route hero/loading/error cards must become explicit command/state cards.
- Embedded regions under responsibility matrix, constraints log, and buyout must be audited and classified.

### Approvals

Current primary file:

- `PccApprovalsSurface.tsx`

Current baseline concern:

- Ready `HomeCard` uses legacy `hierarchy="primary"` but should be explicit Tier 1 command.
- Loading/error cards default to operational unless classified.
- Queue cards are operational.
- Policy/module/HBI/lineage/deferred seams need explicit reference/deferred classification.

### External Systems

Current primary files:

- `PccExternalSystemsSurface.tsx`
- `PccExternalSystemsLaunchPadHeaderCard.tsx`
- all Launch Pad cards

Current baseline concern:

- Header uses legacy primary hierarchy; make explicit.
- Loading/error cards default to operational unless classified.
- Registry, mapping, source health, audit, and HBI lineage cards must be explicit reference/detail/deferred as appropriate.

### Control Center Settings

Current primary file:

- `PccControlCenterSettingsSurface.tsx`

Current baseline:

- Header is already explicit Tier 1 command.
- Scope lanes are already `tier="tier2"`, `region="detail"`.
- Missing setup is already `tier="state"`, `region="state"`.

### Site Health

Current primary files:

- `PccSiteHealthSurface.tsx`
- `PccSiteHealthOverviewCard.tsx`
- `PccSiteHealthChecksCard.tsx`
- `PccSiteHealthDriftCard.tsx`
- `PccSiteHealthRepairRequestsCard.tsx`
- `PccSiteHealthProcoreSyncRepairCard.tsx`

Current baseline:

- Overview is already explicit Tier 1 command.
- Subcards require explicit audit/classification.

## Existing Test Baseline

Current useful tests:

- `apps/project-control-center/src/layout/useBentoRowSpan.test.tsx`
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`

Current gaps:

- No complete route-level card contract test.
- No test that every card has explicit tier/region source.
- No test that deferred/reference/state cards are not operational by default.
- No test that every route active-panel carrier is Tier 1 command or state.

## Worktree Guidance

The local agent must inspect current files before editing because recent commits may have changed exact source content.

Do not re-read files that are already in the agent’s current context unless the file may have changed or exact line-level editing context is needed.
