# Prompt 06 — Phase 05 Hero/Header Metadata Migration and Final Visible-Copy Cleanup

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation** inside `apps/project-control-center`.

This prompt migrates the shell hero/header metadata from the legacy `PccMvpSurfaceId` axis to the Phase 05 `PccPrimaryTabId` axis and performs final visible-copy cleanup for the primary-tab model.

---

## Objective

Complete the deferred Prompt 04/05 hero/header migration.

After this prompt:

- `PccApp` must derive the shell hero from `shell.activePrimaryTabId`, not `shell.activeSurfaceId`.
- `deriveShellHeroViewModel(...)` must accept and normalize `PccPrimaryTabId`.
- Shell hero metadata and hero description copy must be keyed to the eight Phase 05 primary tabs.
- The hero secondary title, surface description, highlights, and governance microcopy must update when each primary tab is selected.
- `Document Control` must be the visible primary-tab and hero label for internal id `documents`.
- The old Prompt 04 stable-hero-on-Project-Home test contract must be removed.
- Existing router, module-selection, dashboard, selected-module, bento, and no-writeback behavior must remain intact.
- Do not change live Playwright evidence. Prompt 08 owns live evidence.

---

## Current Repo-Truth Baseline to Respect

Prompts 01–05 have already landed:

- Prompt 01: `packages/models/src/pcc/PccPrimaryNavigation.ts` defines the Phase 05 primary-tab/module registry.
- Prompt 02: `usePccShellState` added `activePrimaryTabId` and `activeModuleId`.
- Prompt 03: `PccHorizontalTabs` became registry-driven.
- Prompt 04: runtime routing moved to `activePrimaryTabId`; the Prompt 03 legacy bridge was removed.
- Prompt 05: module-selection UX/copy hardening landed and package-solution versions were bumped to `1.0.0.215`.

Current known repo state:

- `PccApp.tsx` still calls:

```ts
deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, shell.activeSurfaceId)
```

This is the open Prompt 06 gap. The hero still follows legacy `activeSurfaceId`, while the shell panel/router follows `activePrimaryTabId`.

- `projectShellViewModel.ts` still imports `PccMvpSurfaceId` / `PCC_MVP_SURFACES` and keys `deriveShellHeroViewModel` by `PccMvpSurfaceId`.
- `surfaceHeaderMetadata.ts` is still keyed by `Record<PccMvpSurfaceId, IPccShellSurfaceHeaderMetadata>`.
- `surfaceHeroCopy.ts` is still keyed by `Record<PccMvpSurfaceId, string>`.
- `PccShell.responsive.test.tsx` still contains the Prompt 04 temporary stable-hero contract. That contract must now be replaced with Phase 05 per-primary-tab hero parity.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Non-Negotiable Guardrails

- Work against current `main`.
- Inspect repo truth before editing.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve `Primary Tab = Dashboard Surface` and `Module = child entry point`.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not add a standalone hero/header Module Launcher.
- Do not add a sidebar, rail, drawer, or persistent secondary navigator.
- Do not introduce URL routing, query-string routing, SharePoint page routing, browser-history state, `localStorage`, or `sessionStorage`.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, HBI, integration, or external-system writeback.
- Do not delete existing surfaces.
- Do not change module IDs, primary-tab IDs, parent mappings, states, or selectability.
- Do not change package versions, SPFx manifest versions, package-solution versions, feature versions, package files, or `pnpm-lock.yaml`.
- Do not run Playwright.
- Do not generate live evidence.
- Do not render developer copy in product UI.

Forbidden product-rendered strings:

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

Comments and test names may describe implementation context when necessary, but product-rendered text must stay clean.

---

## Allowed Files

Expected runtime files:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
```

Expected tests:

```text
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.phase05.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
```

You may update other `apps/project-control-center/src/tests/**` files only if they directly assert legacy hero metadata keyed to `PccMvpSurfaceId`. Keep such updates narrow and explain them in closeout.

---

## Files and Paths You Must Not Touch

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
packages/models/src/pcc/PccPrimaryNavigation.test.ts
packages/models/src/pcc/index.ts

apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.module.css

apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/approvals/**
apps/project-control-center/src/surfaces/externalSystems/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/teamAccess/**
apps/project-control-center/src/surfaces/siteHealth/**
apps/project-control-center/src/surfaces/controlCenterSettings/**
apps/project-control-center/src/surfaces/buyoutLog/**
apps/project-control-center/src/surfaces/constraintsLog/**
apps/project-control-center/src/surfaces/responsibilityMatrix/**
apps/project-control-center/src/surfaces/unifiedLifecycle/**

apps/project-control-center/config/package-solution.json
e2e/pcc-live/**
playwright.pcc-live.config.ts
package.json
apps/project-control-center/package.json
packages/models/package.json
pnpm-lock.yaml
```

If implementation requires changing router, shell, tabs, state, dashboard surfaces, legacy surfaces, package files, live evidence, or lockfile, stop and report.

---

## Required Runtime Changes

### `PccApp.tsx`

Change hero derivation from the legacy axis:

```ts
deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, shell.activeSurfaceId)
```

to the Phase 05 axis:

```ts
deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, shell.activePrimaryTabId)
```

Do not pass `activeModuleId` into the hero unless an existing type/test requires it. Selected-module context belongs in the dashboard card, not the shell hero, for Prompt 06.

Do not remove `activeSurfaceId` from `usePccShellState`; the hook retains it for compatibility until a later cleanup phase.

### `projectShellViewModel.ts`

Migrate imports:

- Remove `PccMvpSurfaceId` and `PCC_MVP_SURFACES` if no longer used.
- Import:
  - `getPrimaryNavigationTab`
  - `normalizePrimaryTabId`
  - `type PccPrimaryTabId`

Update function signature:

```ts
export function deriveShellHeroViewModel(
  profile: IProjectProfile,
  activePrimaryTabId: PccPrimaryTabId,
): IPccShellHeroViewModel
```

Implementation:

```ts
const tabId = normalizePrimaryTabId(activePrimaryTabId);
const tab = getPrimaryNavigationTab(tabId);
const headerMetadata = PCC_SHELL_SURFACE_HEADER_METADATA[tabId];

return {
  primaryTitle: 'Project Control Center',
  secondaryTitle: tab.label,
  surfaceDescription: PCC_SURFACE_HERO_DESCRIPTIONS[tabId],
  ...
}
```

Keep project facts unchanged:

- project name;
- location;
- client;
- estimated value;
- scheduled completion;
- project stage.

Keep `IPccShellHeroViewModel` shape stable unless a type error proves it must change.

### `surfaceHeroCopy.ts`

Migrate from legacy `PccMvpSurfaceId` to Phase 05 `PccPrimaryTabId`.

Recommended minimal approach:

- Keep export name `PCC_SURFACE_HERO_DESCRIPTIONS` to reduce import churn.
- Change type to:

```ts
Record<PccPrimaryTabId, string>
```

Required keys:

```text
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Remove legacy-only keys from this hero copy map:

```text
team-and-access
project-readiness
approvals
external-systems
control-center-settings
site-health
```

Required copy posture:

- `documents` description must be Document Control language, not “Documents” as primary surface label.
- `cost-time` description must respect review/no-writeback/Sage posture without implying Sage integration.
- No description may imply action, writeback, approval authority, or external-system mutation.

Suggested copy:

```ts
{
  'project-home': 'Daily project command view for priority actions and near-term operating focus.',
  'core-tools': 'Cross-cutting project tools for assistance, access, directory, platforms, and checkpoints.',
  documents: 'Document Control view for project records, files, drawings, and external document references.',
  'estimating-preconstruction': 'Preconstruction continuity view for handoff context, assumptions, alternates, and exclusions.',
  'startup-closeout': 'Startup and closeout continuity view for readiness, responsibilities, turnover, and warranty posture.',
  'project-controls': 'Project Controls view for permits, inspections, constraints, compliance, field operations, and communication.',
  'cost-time': 'Cost and time view for financial review, schedule posture, procurement, buyout, and exposure context.',
  'systems-administration': 'Systems Administration view for site health, settings, integration posture, and module configuration.'
}
```

### `surfaceHeaderMetadata.ts`

Migrate from `Record<PccMvpSurfaceId, IPccShellSurfaceHeaderMetadata>` to:

```ts
Record<PccPrimaryTabId, IPccShellSurfaceHeaderMetadata>
```

Required keys:

```text
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

Remove legacy-only top-level entries from this metadata map:

```text
team-and-access
project-readiness
approvals
external-systems
control-center-settings
site-health
```

Do not delete legacy surface components. This only migrates the shell hero metadata map.

### Required metadata content posture

Each primary tab must include:

- `surfaceSummaryItems`
- `surfaceCues`
- `readOnlyCue`
- `heroHighlights`
- `governanceMicrocopy`

Each primary tab must have at least:

- three hero highlights;
- two governance microcopy items.

Copy must be concise, product-grade, and end-user-facing.

### Suggested primary-tab metadata themes

Use the existing style, but update to Phase 05 primary-tab semantics:

#### `project-home`

- Priority Actions
- Today / This Week
- Responsibility Focus
- Read-only preview / review priorities before coordination

#### `core-tools`

- HBI Assistant
- Team & Access
- Approvals & Checkpoints
- HBI advisory only / no decisions, no approvals, no writeback

#### `documents`

Visible label must be `Document Control`.

- Project Record
- My Project Files
- External Document References
- Project Record remains the formal source for project files
- Launch-only external references do not write back

#### `estimating-preconstruction`

- Handoff Context
- Assumptions / Alternates / Exclusions
- Future estimating modules
- Preconstruction continuity is reference-only in this phase

#### `startup-closeout`

- Startup Center
- Responsibility Matrix
- Closeout / Warranty
- Readiness and closeout signals are context only

#### `project-controls`

- Permits & Inspections
- Constraints Log
- Risk / Field / Communications
- Controls context is read-only; source workflows own actions

#### `cost-time`

- Financial Review
- Schedule Monitor
- Procurement & Buyout
- Sage remains the accounting book of record
- PCC does not write back to Sage

#### `systems-administration`

- Site Health
- Control Center Settings
- Integration / Procore Mapping
- Administrative context only; settings changes remain governed

Avoid direct action verbs that imply runtime capability. Do not render approval actions such as approve, reject, waive, or override as UI affordances.

---

## Required Final Visible-Copy Cleanup

### Document Control

Ensure:

- Primary tab visible label remains `Document Control`.
- Hero secondary title for `documents` is `Document Control`.
- Hero description for `documents` uses Document Control language.
- Internal ID remains `documents`.

Do **not** attempt to remove all occurrences of the word “Documents” from the UI. Valid module labels include:

- `Primary Documents Tool`
- `Procore Documents`

What must be absent:

- primary tab label exactly `Documents`;
- hero secondary title exactly `Documents`;
- fallback copy that treats `Documents` as the primary dashboard label.

### Legacy hero copy

After Prompt 06, product-rendered hero must not display old legacy surface labels as primary hero secondary titles when navigating Phase 05 primary tabs:

```text
Team & Access
Project Readiness
Approvals
External Systems
Control Center Settings
Site Health
```

Those labels may still appear as module labels or inside direct legacy surface tests. They must not be the shell hero secondary title for a Phase 05 primary tab.

---

## Required Test Migration

### `PccShell.responsive.test.tsx`

Remove the Prompt 04 stable-hero contract.

Replace:

```text
hero stays on Project Home after every Phase 05 primary tab click
```

with per-primary-tab hero parity.

Required assertions:

1. Default render hero secondary title is `Project Home`.
2. For every `PCC_PRIMARY_TAB_IDS` value:
   - click the primary tab;
   - shell panel marker equals the tab id;
   - hero secondary title equals `getPrimaryNavigationTab(tabId).label`;
   - hero description equals `PCC_SURFACE_HERO_DESCRIPTIONS[tabId]`;
   - hero highlights render in the same order as `PCC_SHELL_SURFACE_HEADER_METADATA[tabId].heroHighlights`;
   - governance microcopy renders in the same order as `PCC_SHELL_SURFACE_HEADER_METADATA[tabId].governanceMicrocopy`.
3. `documents` hero secondary title is `Document Control`.
4. `documents` hero secondary title is not `Documents`.
5. Client/global project fact still renders.
6. Hero remains stable across responsive modes in terms of structure and global facts.

### `projectShellViewModel` unit coverage

If there is an existing test file for `projectShellViewModel`, update it. If not, add one under:

```text
apps/project-control-center/src/tests/projectShellViewModel.test.ts
```

Required assertions:

1. `deriveShellHeroViewModel(profile, tabId)` works for every `PCC_PRIMARY_TAB_IDS` value.
2. `secondaryTitle` equals `getPrimaryNavigationTab(tabId).label`.
3. `surfaceDescription` equals `PCC_SURFACE_HERO_DESCRIPTIONS[tabId]`.
4. `surfaceSummaryItems`, `surfaceCues`, `readOnlyCue`, `heroHighlights`, and `governanceMicrocopy` match `PCC_SHELL_SURFACE_HEADER_METADATA[tabId]`.
5. Invalid input passed through an unsafe cast normalizes to `project-home`.
6. Project fact formatting remains unchanged:
   - estimated value;
   - scheduled completion;
   - project stage;
   - missing value fallback.

### Header metadata contract tests

Add or update tests proving:

1. `PCC_SHELL_SURFACE_HEADER_METADATA` has exactly the eight `PCC_PRIMARY_TAB_IDS` keys.
2. `PCC_SURFACE_HERO_DESCRIPTIONS` has exactly the eight `PCC_PRIMARY_TAB_IDS` keys.
3. Every primary tab has at least three hero highlights.
4. Every primary tab has at least two governance microcopy items.
5. No metadata / hero-description product string contains forbidden developer-copy terms.
6. `documents` metadata uses Document Control label/posture.
7. `cost-time` metadata includes Sage/accounting book-of-record/no-writeback posture.
8. `core-tools` metadata includes HBI advisory/no-decision/no-approval/no-writeback posture.

### Existing collateral tests

Search for and update stale expectations involving:

```text
PCC_MVP_SURFACES
PCC_MVP_SURFACE_IDS
PccMvpSurfaceId
deriveShellHeroViewModel(
PCC_SHELL_SURFACE_HEADER_METADATA['project-home']
hero stays on the Project Home view-model
Prompt 06 will migrate
```

Replace stale hero tests with Phase 05 primary-tab assertions. Do not weaken router, module, bento, or no-writeback coverage.

---

## Product-Copy Guard

Add or preserve a visible-text guard over the shell hero after selecting each primary tab.

Forbidden product-rendered terms:

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

Visible test assertions should inspect rendered text under:

```css
[data-pcc-project-hero-band]
```

Do not fail on source comments or test names. This is a product-rendered text check.

---

## Required Validation

Before editing:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/models build
```

After editing:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccShell.responsive.test.tsx
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/projectShellViewModel.test.ts
pnpm --filter @hbc/spfx-project-control-center test -- src/tests/PccShell.navigation.test.tsx
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If no `projectShellViewModel.test.ts` is created because equivalent coverage already exists elsewhere, replace the targeted command with the actual updated test file.

If Prettier fails, run `pnpm exec prettier --write` only on changed files, then rerun targeted tests and the full SPFx package test.

Do not run Playwright.

Do not run package builds beyond `@hbc/models build` unless required by type/test failure investigation.

Do not change `pnpm-lock.yaml`.

---

## Required Source Grep Guard

After implementation, run:

```bash
grep -rE "hero stays on the Project Home view-model|Prompt 06 will migrate|stable hero|activeSurfaceId\\)" apps/project-control-center/src/PccApp.tsx apps/project-control-center/src/tests apps/project-control-center/src/preview apps/project-control-center/src/shell/surfaceHeaderMetadata.ts apps/project-control-center/src/shell/surfaceHeroCopy.ts
```

Expected: zero stale Prompt 04 stable-hero contract matches.

Also run:

```bash
grep -rE "onSelectLegacySurface|PRIMARY_TAB_LEGACY_SURFACE_MAP|MODULE_LEGACY_SURFACE_MAP|LEGACY_COMPAT_TAB_IDS|data-pcc-legacy-compat|legacyCompatMarker|getSurfaceSelectionControl" apps/project-control-center/src/
```

Expected: no bridge code. Existing test absence assertions for `data-pcc-legacy-compat` are acceptable if they remain.

---

## Closeout

Return a chat closeout only. Do not create a closeout markdown file unless explicitly instructed.

Include:

```markdown
## Prompt 06 Closeout — Hero/Header Metadata Migration

### Files Changed
- ...

### Runtime Summary
- PccApp:
- projectShellViewModel:
- surfaceHeroCopy:
- surfaceHeaderMetadata:

### Hero Axis Migration
- Previous:
- New:
- activeSurfaceId compatibility posture:

### Primary Tab Hero Coverage
- project-home:
- core-tools:
- documents / Document Control:
- estimating-preconstruction:
- startup-closeout:
- project-controls:
- cost-time:
- systems-administration:

### Final Visible-Copy Cleanup
- Document Control visible label:
- Internal `documents` ID:
- Legacy hero labels removed from primary hero path:
- Product-copy guard:

### Tests Added / Updated
- ...

### Validation Results
- `git status --short` before:
- `pnpm-lock.yaml` MD5 before:
- `pnpm --filter @hbc/models build`:
- SPFx typecheck:
- targeted tests:
- full SPFx test:
- Prettier:
- `git diff --check`:
- grep guards:
- `pnpm-lock.yaml` MD5 after:
- `git status --short` after:

### Scope Confirmation
- Router/app panel migration from Prompt 04 preserved:
- Module-selection UX from Prompt 05 preserved:
- `PccSurfaceRouter` untouched:
- `PccHorizontalTabs` untouched:
- `usePccShellState` untouched:
- Legacy surfaces untouched:
- e2e/live evidence untouched:
- Package/manifest/lockfile untouched:
- No standalone Module Launcher/sidebar/routing/persistence/writeback introduced:

### Notes / Risks for Prompt 07
- ...
```

---

## Hard Stop Conditions

Stop and report instead of editing if:

- Current repo is not post-Prompt-05.
- `PccApp` cannot derive hero state from `activePrimaryTabId` without changing router, shell, tabs, or state.
- Migrating hero metadata requires changing registry IDs, primary-tab IDs, module IDs, states, or parent mappings.
- Tests require reintroducing legacy surface navigation or Prompt 03 bridge code.
- Typecheck requires changing `PccSurfaceRouter`, `PccShell`, `PccHorizontalTabs`, `usePccShellState`, dashboard surfaces, or legacy surfaces.
- Validation requires `pnpm install` or lockfile changes.
- Any product UI would need to render routing, persistence, writeback, approval action, or developer-copy affordances.
