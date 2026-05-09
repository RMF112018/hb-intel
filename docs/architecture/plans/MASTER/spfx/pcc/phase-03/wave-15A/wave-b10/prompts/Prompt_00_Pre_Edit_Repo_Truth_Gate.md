# Prompt 00 — Pre-Edit Repo-Truth Gate for PCC Phase 05 Grouped Tab Module Navigation

## Objective

Perform a **pre-edit repo-truth gate only** for:

```text
Phase 05 — Grouped Tab Module Navigation
```

This prompt is an audit and baseline-capture task. Do **not** implement runtime code. Do **not** modify source files, tests, documentation, package files, lockfiles, manifests, generated artifacts, or Playwright evidence. Do **not** stage or commit anything.

Your job is to establish the current repo truth, compare it against the Phase 05 package, identify implementation risks before Prompt 01, and produce a concise but complete written baseline that the next prompt can rely on.

The Phase 05 target navigation model is:

```text
Primary Tab = Dashboard Surface
Dropdown / Child Module Link = Module Entry Point under that Dashboard Surface
```

This phase replaces the prior standalone Module Launcher concept. The module-launcher behavior must be implemented by extending the accessible tab bar/dropdown model, not by adding a separate command-header control, sidebar, SharePoint route, URL route, or browser-history state.

---

## Non-Negotiable Guardrails

- Audit only.
- Do not modify files.
- Do not create new files.
- Do not run formatters in write mode.
- Do not run code generators.
- Do not update snapshots.
- Do not update Playwright evidence.
- Do not change package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not change SPFx package or manifest versions.
- Do not add a standalone Module Launcher.
- Do not add a sidebar, rail, drawer, secondary permanent navigator, or SharePoint page route.
- Do not add URL routing, query-string routing, `localStorage`, `sessionStorage`, or tenant reads for navigation state.
- Do not add Procore, Sage, SharePoint, approval, HBI, integration, list, library, file, or external-system writeback.
- Do not allow developer-facing copy to render in product UI.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Required Start-of-Work Baseline Commands

Run and report the results of:

```bash
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If any command cannot run, record the failure plainly and continue with available repo truth.

The expected PCC package-solution path is:

```text
apps/project-control-center/config/package-solution.json
```

Root `config/package-solution.json` references are stale for PCC unless current repo truth proves otherwise.

---

## Required Package Review

Before inspecting implementation files, read the attached Phase 05 package materials and extract the controlling requirements from:

```text
README.md
00_Target_Architecture.md
01_Navigation_Registry_Contract.md
02_Implementation_Plan.md
03_Wireframes.md
04_Acceptance_Criteria_And_Validation.md
prompts/Prompt_00_Pre_Edit_Repo_Truth_Gate.md
prompts/Prompt_01_Primary_Tab_And_Module_Registry.md
```

If any package file is missing, renamed, or unreadable, record that explicitly.

Do not claim package-reviewed approval unless you actually reviewed the package contents.

---

## Required Governing Reference Review

Inspect these governing references if they exist in the repo:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Evidence_Taxonomy.md
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
```

Summarize only the items that materially affect Phase 05 navigation, shell ownership, accessibility, bento layout, copy, evidence, and no-writeback posture.

---

## Required Current Repo Files to Inspect

Inspect the current repo truth for these files and directories:

```text
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccCapabilities.ts
packages/models/src/pcc/index.ts

apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/state/usePccShellState.ts

apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts

apps/project-control-center/src/preview/projectShellViewModel.ts

apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts

apps/project-control-center/src/surfaces/

apps/project-control-center/src/tests/

playwright.pcc-live.config.ts
e2e/pcc-live/

package.json
apps/project-control-center/package.json
pnpm-lock.yaml
apps/project-control-center/config/package-solution.json
```

For directories, inspect enough files to establish current implementation/test/evidence posture. Do not perform broad, wasteful rereads after the relevant facts are established.

---

## Required Symbol and Selector Inventory

Run targeted searches and report current matches for these terms:

```text
PccPrimaryTabId
PccModuleId
PccModuleState
PccNavigationModule
PccPrimaryNavigationTab
PCC_PRIMARY_TAB_IDS
PCC_PRIMARY_NAVIGATION_TABS
PCC_NAVIGATION_MODULES
activeModuleId
selectPrimarySurface
selectModule
clearActiveModule

PccHorizontalTabs
PccSurfaceRouter
usePccShellState
PccProjectHeroBand
PccCommandSearch
surfaceHeaderMetadata
surfaceHeroCopy
projectShellViewModel

data-pcc-horizontal-tabs
data-pcc-tab-id
data-pcc-nav-toggle
data-pcc-module-menu
data-pcc-module-nav-item
data-pcc-active-surface-panel
main[role="tabpanel"]
data-pcc-bento-grid
data-pcc-card

documents
Documents
Document Control
Module Launcher
sidebar
localStorage
sessionStorage
window.location
history.pushState
URLSearchParams
```

The goal is to determine whether Phase 05 symbols already exist, whether stale terms remain, and where implementation prompts must be careful.

---

## Required Current Navigation Baseline

Report the current implementation truth for:

1. Current primary surface IDs.
2. Current visible tab labels.
3. Current top-level tab order.
4. Current dropdown / child item behavior.
5. Whether `PccHorizontalTabs` is registry-driven or hardcoded.
6. Whether every top-level tab currently has a dropdown.
7. Whether the current dropdown uses surface selection or module selection.
8. Whether current state has `activeModuleId`.
9. Whether primary selection currently clears module state.
10. Whether module selection currently exists.
11. Whether non-selectable module behavior currently exists.
12. Whether the visible `Documents` label still appears.
13. Whether `documents` remains the internal ID.
14. Whether the shell-owned `main[role="tabpanel"]` active-panel marker exists.
15. Whether bento direct-child invariants are currently protected.
16. Whether current hero metadata still keys against the old surface IDs.
17. Whether current live Playwright selectors still key against the old surface IDs.

---

## Locked Phase 05 Target to Compare Against

Use this target primary tab order and label set as the comparison baseline:

```text
1. Project Home
2. Core Tools
3. Document Control
4. Estimating & Preconstruction
5. Project Startup & Closeout
6. Project Controls
7. Cost & Time
8. Systems Administration
```

Use this target primary tab ID set:

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
]
```

`documents` may remain the internal ID for the visible `Document Control` tab during Phase 05 unless a full safe migration is explicitly implemented and validated later.

Use this locked module matrix:

```text
Project Home
- Action Center
- My Responsibilities
- Today / This Week

Core Tools
- HBI Assistant
- External Platforms
- Team & Access
- Project Directory
- Approvals & Checkpoints

Document Control
- Primary Documents Tool
- Document Control Center
- Drawing & Model Center
- SharePoint Project Record
- My Project Files / OneDrive
- Procore Documents
- Document Crunch
- Adobe Sign

Estimating & Preconstruction
- Future estimating modules
- Preconstruction Handoff
- Estimate Assumptions / Alternates / Exclusions

Project Startup & Closeout
- Startup Center
- Responsibility Matrix
- Closeout
- Closeout & Turnover Tracker
- Warranty
- Lessons Learned
- Subcontractor Performance

Project Controls
- Project Controls
- Permits & Inspections
- Contract & Compliance
- Risk / Issues / Decisions
- Constraints Log
- Field Operations
- Meeting & Communication

Cost & Time
- Financial Reporting
- Schedule Monitor
- Procurement & Buyout
- Commitment / Cost Exposure

Systems Administration
- Site Health
- Control Center Settings
- Integration Settings
- Procore Mapping / Sync Health
- Module Configuration
```

---

## Required Test Inventory

Identify the current tests that protect or assert:

- tab rendering/order;
- Project Home dropdown behavior;
- shell-owned active tabpanel;
- `aria-labelledby`;
- `aria-controls`;
- `aria-selected`;
- `role="tablist"`;
- `role="tab"`;
- `role="tabpanel"`;
- keyboard behavior for ArrowLeft / ArrowRight / Home / End;
- keyboard behavior for ArrowDown / ArrowUp / Escape in dropdowns;
- bento direct-child invariants;
- no nested cards;
- surface router coverage;
- document-control surface behavior;
- hero metadata and hero copy;
- no developer-facing rendered copy;
- false affordance controls;
- no anchors / no external writeback;
- no URL routing;
- Playwright live surface navigation;
- Playwright selector registry / evidence.

Also identify tests that will become stale or need replacement because they currently expect:

- four top-level tabs;
- Project Home as the only dropdown parent;
- `team-and-access`, `external-systems`, `control-center-settings`, and `site-health` as Project Home child surfaces;
- visible `Documents` rather than `Document Control`;
- old `PccMvpSurfaceId` values as the only shell navigation targets;
- old live surface selectors.

---

## Required Playwright / Hosted Evidence Inventory

Inspect current live evidence files under:

```text
e2e/pcc-live/
playwright.pcc-live.config.ts
```

Report:

1. Current live surface ID registry.
2. Current expected tab selectors.
3. Current expected active-panel selectors.
4. Current shell-specific active-panel selectors.
5. Current root marker selectors.
6. Current hero marker selectors.
7. Current evidence registry posture.
8. Which selectors will drift when Phase 05 changes navigation.
9. Whether Prompt 08 must update live evidence coverage for all eight target primary tabs and dropdown module menus.
10. Whether hosted validation is expected at closeout.

Do not run live Playwright in Prompt 00 unless explicitly instructed. This is a pre-edit baseline.

---

## Required Product-Copy Risk Inventory

Search current source/test/evidence-relevant UI copy for product-rendered risks involving:

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

Important distinction:

- These terms may appear in comments, documentation, prompts, test names, test assertions, and non-rendered developer context.
- These terms must not appear in product-rendered UI.

Report only product-rendered risk candidates and where the later prompts must add or update tests.

---

## Required Baseline Against Prompt 01

Prompt 01 will likely create the typed navigation registry. Before Prompt 01 executes, identify:

1. Best current location for the new registry.
2. Whether it should live in `packages/models/src/pcc/` or `apps/project-control-center/src/`.
3. Exports that would likely be required from `packages/models/src/pcc/index.ts`.
4. Existing model files that are likely to be changed or preserved.
5. Existing app files that are likely to consume the registry.
6. Existing tests that should be extended versus replaced.
7. Risks if `PccMvpSurfaceId` is directly replaced too early.
8. Safe compatibility posture for retaining `documents` internal ID.
9. Whether existing surfaces should be adapted, wrapped, or preserved behind new dashboard shells.
10. Whether Prompt 01 must avoid touching router/state/rendering and stay registry/test focused.

Do not implement the registry in Prompt 00.

---

## Required Validation Commands for Prompt 00

Because this is audit-only, run only safe read/check commands.

Required:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Optional if already available and useful:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- --runInBand
```

If optional commands are expensive or not necessary for the pre-edit gate, do not run them. State whether they were skipped and why.

Do not run write-mode formatters. Do not run `prettier --write`. Do not run package builds unless explicitly instructed.

---

## Required Output Format

Return the audit in this structure:

```markdown
## Prompt 00 Repo-Truth Gate — Phase 05 Grouped Tab Module Navigation

### Decision
Approved for Prompt 01 / Approved with required refinements before Prompt 01 / Blocked

### Branch / HEAD / Lockfile Baseline
- Branch:
- HEAD:
- Last commit:
- `git status --short`:
- `pnpm-lock.yaml` hash:
- Package-solution path:
- Package-solution version:
- Package-solution feature version:

### Package Materials Reviewed
- README:
- Target architecture:
- Registry contract:
- Implementation plan:
- Wireframes:
- Acceptance criteria:
- Prompt 00:
- Prompt 01:
- Missing or unreadable materials:

### Governing References Reviewed
- ...

### Current Repo-Truth Navigation Baseline
- Current primary surface IDs:
- Current model display names:
- Current visible tab labels:
- Current top-level tabs:
- Current dropdown behavior:
- Current `PccHorizontalTabs` posture:
- Current `PccShell.tsx` tabpanel posture:
- Current `data-pcc-active-surface-panel` owner:
- Current `usePccShellState` shape:
- Current `PccApp` wiring:
- Current `PccSurfaceRouter` cases:
- Current `documents` / `Documents` posture:
- Current hero/header metadata posture:
- Current `PccCommandSearch` posture:
- Current bento/card direct-child posture:

### Phase 05 Gap Analysis
- Primary tab ID gap:
- Primary tab label gap:
- Dropdown/module registry gap:
- State gap:
- Router/dashboard surface gap:
- Document Control compatibility gap:
- Hero/header metadata gap:
- Test gap:
- Playwright/evidence gap:
- Product-copy gap:

### Symbol / Selector Inventory
- Existing Phase 05 symbols:
- Missing Phase 05 symbols:
- Existing selectors:
- Missing target selectors:
- Risky stale selectors:

### Current Test Inventory
- Tests to preserve:
- Tests likely requiring update:
- Tests likely requiring replacement:
- Missing tests needed by Phase 05:

### Playwright / Hosted Evidence Inventory
- Current live surface registry:
- Current expected selectors:
- Drift risks:
- Prompt 08 evidence requirements:

### Product-Copy Risk Inventory
- Rendered-copy risks found:
- Non-rendered occurrences only:
- Test coverage needed:

### Prompt 01 Readiness
- Recommended registry location:
- Required exported types/constants:
- Required integrity tests:
- Files likely affected by Prompt 01:
- Files Prompt 01 should not touch:
- Risks Prompt 01 must avoid:

### Required Refinements Before Prompt 01
- ...

### Confirmation
- No files modified:
- No package/lockfile/manifest drift:
- No generated artifacts:
```

---

## Expected Decision Logic

Use:

```text
Approved for Prompt 01
```

only if the package is available, repo truth is verified, the current gaps are clearly documented, and no unresolved pre-edit blockers remain.

Use:

```text
Approved with required refinements before Prompt 01
```

if Prompt 01 can proceed only after specific instruction refinements are added.

Use:

```text
Blocked
```

if package materials are unavailable, repo access is unavailable, current repo truth contradicts the package in a way that requires package regeneration, or the working tree is dirty in a way that makes the baseline unsafe.

---

## Phase 05 Red Flags to Watch During the Audit

Flag any current or proposed posture that would lead to:

- standalone Module Launcher;
- separate command-header navigation control;
- sidebar or permanent secondary navigator;
- URL routing;
- query-string routing;
- SharePoint page routing;
- browser-history state;
- `localStorage` / `sessionStorage` navigation persistence;
- external-system writeback;
- approval decision controls;
- HBI decision authority;
- disabled modules acting as live links;
- internal IDs rendered as labels;
- `Documents` remaining as the visible primary tab label after Phase 05;
- blank dashboard surfaces;
- non-direct-child dashboard cards;
- nested `[data-pcc-card]`;
- broken `tablist` / `tab` / `tabpanel` semantics;
- product-rendered developer copy;
- stale root `config/package-solution.json` references;
- broad formatting or unrelated refactors.

---

## Final Instruction

Protect the Phase 05 objective:

```text
The PCC primary navigation must become a grouped tab/module navigation system where each primary tab renders a production-grade dashboard surface and exposes related module links through an accessible dropdown, while preserving shell-owned active panel semantics, bento direct-child layout, read-only/source-authority boundaries, no routing, no sidebar, no writeback, and production-grade end-user UI copy.
```

Prompt 00 must leave the repo unchanged and provide the clean factual baseline needed for Prompt 01.
