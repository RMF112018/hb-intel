# Prompt 04B-10 — Project Readiness Top Card Removal, Metric Absorption, and Future Readiness TODOs

## Objective

Remove the redundant top-level **Project Readiness** bento card while preserving current MVP readiness data and adding targeted TODO markers for future project-context-derived readiness signals.

This prompt replaces the earlier softer “rename/reframe” Project Readiness prompt. The current direction is decisive:

```text
Remove the duplicate Project Readiness first bento card unless repo truth proves doing so would lose required MVP data with no operational destination.
```

Preferred remediation pattern:

```text
Delete the duplicate first card.
Absorb current readiness MVP metrics into the first operational Project Readiness card.
Move project-readiness to shell-only if no card-level active marker remains.
```

This is **not** a data-model implementation prompt. It is an MVP UX correction plus future-development marker prompt.

---

## Governing Corrective UX Rule

No PCC tab surface may begin with a bento card whose primary purpose is to restate the selected tab, explain the surface, or provide summary posture that belongs in the shell hero.

The first Project Readiness bento card must be operational readiness content.

---

## Current Phase 04B Baseline

Expected current baseline includes these already-landed corrective passes:

```text
4B-01 — Project Home: removed PccProjectIntelligenceCard, promoted Priority Actions, Project Home became shell-only.
4B-02 — Shell hero: replaced production-visible scaffold labels with heroHighlights + governanceMicrocopy.
4B-03 — Shell orientation: tabs render above hero; hero facts render before highlights/microcopy.
4B-05 — Approvals: removed Approvals home card, absorbed metrics into Approval queue, Approvals became shell-only.
4B-06 — Nested navigation: Team, External Platforms, Settings, and Site Health moved under Project Home dropdown.
4B-06A — Dropdown remediation: Project Home dropdown became click/keyboard-first with nav-local layering fix.
4B-08 — Site Health: removed PccSiteHealthOverviewCard, absorbed metrics into Checks card, Site Health became shell-only.
4B-09 — Documents: expected to remove Documents header/state seam before or near this prompt if executed in sequence.
```

Expected recent Site Health validation baseline if 4B-09 has not yet run:

```text
c10b9bf1624b0914259a869a23e4613b5cca1a12
```

If 4B-09 has already run, use current repo truth and record the latest HEAD.

Important current contracts:

```text
Shell order: Tabs → Hero → Bento
Hero order: identity → facts → heroHighlights → governanceMicrocopy
Project Readiness navigation path: top-level tab
```

Do not regress these contracts.

---

## Common Local-Agent Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement Phase 05 module launcher, URL routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

---

## Strict Scope

This prompt may edit Project Readiness runtime, Project Readiness-specific tests, and shared shell/bento contract tests that need classification updates.

Expected runtime files:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/**
```

Expected test files:

```text
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Do not edit shell, layout, preview, state, other surfaces, Playwright, docs, package, manifest, package.json files, app package file, or `pnpm-lock.yaml`.

If edits outside Project Readiness/runtime-test scope appear necessary, stop and report.

---

## Required Baseline Commands

Run and record before editing:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Inspect and record current package posture:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Expected package/manifest files may contain intentional deployment drift. Do not stage or alter package/manifest/lockfile files in this prompt.

Hard stop if the tree is dirty in Project Readiness runtime files or shared Project Readiness-touching tests unless the user explicitly identifies those files as intentional and in-scope.

---

## Required Reads

Inspect current repo truth before editing:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts

apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Only inspect shell metadata to verify current Project Readiness shell hero posture. Do not edit shell files.

---

## Required Searches

Run and classify results:

```bash
rg -n "Project readiness|Project Readiness|ReadinessHeroSlot|Active gate|Active Gate|Overall posture|Overall Posture|Blockers|Evidence confidence|Evidence Confidence|source-health|source health|dataActiveSurfacePanel=\"project-readiness\"|data-pcc-active-surface-panel=\"project-readiness\"|hierarchy=\"primary\"|data-pcc-card-hierarchy=\"primary\"" apps/project-control-center/src/surfaces/projectReadiness apps/project-control-center/src/tests
rg -n "project-readiness|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL|getSurfaceSelectionControl|data-pcc-tab-id=\"project-readiness\"" apps/project-control-center/src/tests
rg -n "heroHighlights|governanceMicrocopy|Project Readiness|Readiness Status|Blockers|Evidence|Read-only preview|readiness actions remain governed" apps/project-control-center/src/shell apps/project-control-center/src/tests
```

Classify each relevant result as:

```text
DUPLICATE TOP CARD
CURRENT MVP DATA SOURCE
OPERATIONAL DESTINATION CANDIDATE
FUTURE TODO TARGET
ACTIVE-PANEL MARKER
SHELL-HERO CONTRACT
TOP-LEVEL NAV TEST PATH
COMPATIBILITY/SHELL-ONLY CONTRACT
HISTORICAL COMMENT ONLY
```

---

## Required Pre-Edit Metric Disposition Matrix

Before editing, produce a matrix mapping every current first-card readiness item to a retained destination.

| Current first-card item | Must be preserved? | Target destination | Notes |
|---|---:|---|---|
| Card eyebrow / duplicate Project Readiness label | No | shell hero owns selected-tab identity | Remove from bento |
| Card title: Project readiness / Project Readiness | No | shell hero owns selected-tab identity | Remove from bento |
| Duplicate explanatory paragraph | No | shell hero + heroHighlights/governanceMicrocopy | Remove from bento |
| Active Gate | Yes | first operational readiness card | Must remain visible |
| Preconstruction | Yes | first operational readiness card | Must remain visible |
| Overall Posture | Yes | first operational readiness card | Must remain visible |
| Blocked | Yes | first operational readiness card | Must remain visible |
| Blockers | Yes | first operational readiness card | Must remain visible |
| 7 | Yes | first operational readiness card | Must remain visible |
| Evidence Confidence | Yes | first operational readiness card | Must remain visible |
| Low | Yes | first operational readiness card | Must remain visible |
| Source-health chips | Yes | first operational readiness card or source-health operational card | Must remain visible |
| Card-level marker dataActiveSurfacePanel="project-readiness" | Prefer remove | shell <main role="tabpanel"> | Remove only if all branches become shell-only |

Do not edit until this disposition is clear.

---

## Preferred Implementation Pattern

Follow the current Phase 04B pattern:

```text
Remove duplicate first card.
Absorb its useful metrics into the first operational readiness card.
Reclassify the surface as shell-only if no card-level active marker remains in any branch.
Add future TODO markers near the retained readiness metric mapping.
```

### Preferred Project Readiness target

Remove the current duplicate top card / hero slot and absorb retained MVP data into the first operational readiness card.

Use repo truth for actual component names, but the target first card should read like operational readiness work, for example:

```text
Readiness Gate & Blockers
Gate, Blockers & Evidence
Startup Readiness Signals
Readiness Work Queue
```

The first card must not be titled:

```text
Project Readiness
Project readiness
```

The first card must preserve:

```text
Active Gate: Preconstruction
Overall Posture: Blocked
Blockers: 7
Evidence Confidence: Low
Source-health chips
```

### Acceptable fallback

If there is no existing operational readiness card that can safely receive the metrics without broad refactor, transform the current top card into an operational readiness card only if all of these are true:

- it is not titled `Project Readiness` or `Project readiness`;
- duplicate explanatory page-summary copy is removed;
- it no longer behaves like a page header;
- it preserves all MVP readiness values;
- it keeps or removes the card-level active marker according to current repo truth and test classification.

This fallback is acceptable only if deletion would otherwise lose MVP readiness data.

### Prohibited pattern

Do not simply rename the card while leaving page-header structure intact.

Do not remove MVP readiness values.

Do not compute new readiness values.

Do not add backend/read-model calls.

Do not move readiness values into shell hero metadata unless those values are already static/deterministic at the shell boundary and approved by current repo architecture.

Do not reintroduce old scaffold labels or long read-only copy as primary hero content.

---

## Future TODO Marker Requirements

Add targeted TODO markers near the current readiness metric mapping or the operational card where metrics are retained.

Use **2 to 4 TODO comments total**. Avoid noisy TODO sprawl.

The TODOs must cover these future phases:

### TODO Category 1 — Future Hero / Bento Ownership Split

Required intent:

```ts
// TODO(PCC-ProjectReadiness): This MVP card keeps readiness data visible while removing duplicate page-title framing.
// Future implementation should split summary ownership so the shell hero can show selected-project readiness posture
// while the bento grid begins with operational readiness work items, gates, blockers, evidence, or source modules.
// Do not remove the MVP readiness data until project-context-derived readiness signals are available.
```

### TODO Category 2 — Startup / Job Startup Checklist Conditional Signal

Required future behavior:

```text
If the selected project has started the Job Startup Checklist but it is not fully complete, render:
Startup Checklist {n}% Complete
```

Implementation intent:

```text
derive {n} from completed checklist items / required checklist items
use the current project ID/context
do not compute from static fixture text once backend/read-model support exists
preserve read-only/no-writeback posture
```

### TODO Category 3 — Constraints Log Conditional Signal

Required future behavior:

```text
If the selected project has overdue constraints:
{n} Constraints Overdue
```

or:

```text
If the selected project has constraints due by the end of the current business week:
{n} Constraints to be Resolved this week
```

Implementation intent:

```text
derive overdue constraints from selected project constraints where due date is before current business date and status is not resolved/closed
derive this-week constraints from selected project constraints due on or before the current business week end and not resolved/closed
define business-week calculation consistently with scheduling/lookahead standards when that model exists
do not add date/business-week logic in this MVP prompt
```

### TODO Category 4 — Evidence / Source Health / Approvals Relationship

Required future examples:

```text
Evidence Confidence {Low | Medium | High}
{n} Source Modules Available
{n} Source Modules Stale
{n} Readiness Approvals Pending
{n} Checkpoints Blocking Startup
```

Implementation intent:

```text
derive source-health from readiness source registry/read-model state
preserve unavailable/stale states instead of hiding them
derive approvals/checkpoints from the approvals/checkpoints read model when readiness consumes that source
do not introduce approval execution/writeback from the Project Readiness card
```

---

## Active-Panel Classification

Determine whether removing or transforming the top Project Readiness card removes all card-level active markers.

If, after the change, no Project Readiness card emits:

```text
data-pcc-active-surface-panel="project-readiness"
dataActiveSurfacePanel="project-readiness"
```

in any branch:

```text
ready
loading
error
source-unavailable / degraded, if applicable
```

then move `project-readiness` from:

```text
SURFACES_WITH_COMPATIBILITY_CARD
```

to:

```text
SURFACES_WITH_SHELL_ONLY_PANEL
```

in the same commit.

Expected likely post-4B-10 sets if Project Readiness becomes shell-only and 4B-09 already moved Documents:

```text
SURFACES_WITH_COMPATIBILITY_CARD:
- none
```

Expected likely shell-only set:

```text
SURFACES_WITH_SHELL_ONLY_PANEL:
- project-home
- team-and-access
- external-systems
- control-center-settings
- approvals
- site-health
- documents
- project-readiness
```

Only make this move after current repo truth confirms Project Readiness no longer emits card-level active-panel markers in every branch.

If a retained operational Project Readiness card still legitimately emits the marker, keep Project Readiness in compatibility-card expectations and justify why.

---

## Navigation and Shell Requirements

Project Readiness remains a top-level visible tab after Prompt 4B-06.

Tests should not use 8-peer-tab assumptions, but Project Readiness selection may still be direct through its top-level tab.

Use the current navigation helper/path where tests already rely on it:

```text
getSurfaceSelectionControl(container, 'project-readiness')
```

or direct `data-pcc-tab-id="project-readiness"` only where the test is explicitly about the top-level tab.

Do not modify the dropdown/navigation component in this prompt.

---

## Required Test Updates

Update tests to prove:

1. Project Readiness no longer begins with a duplicate surface-title card.
2. The first ready-path Project Readiness bento card is operational.
3. The first operational card contains the retained readiness MVP metrics or metric summary.
4. Retained MVP values remain visible in ready path:
   - Active Gate
   - Preconstruction
   - Overall Posture
   - Blocked
   - Blockers
   - 7
   - Evidence Confidence
   - Low
   - source-health chips
5. TODO markers were added for:
   - Startup Checklist {n}% Complete
   - constraints overdue / due this week
   - evidence/source-health/approvals/checkpoints signals
6. Project Readiness shell hero still carries Project Readiness identity and current 4B-02 `heroHighlights` / `governanceMicrocopy`.
7. If Project Readiness becomes shell-only, shell `<main role="tabpanel">` remains the active-panel owner.
8. Each Project Readiness card remains a direct child of `PccBentoGrid`.

If the repo does not test source comments, record grep evidence for TODO markers in closeout rather than adding brittle comment tests.

---

## Out-of-Scope

Do not:

- edit Project Readiness shell hero metadata;
- edit shell navigation/dropdown behavior;
- edit Project Home, Team, Documents, Approvals, External Platforms, Settings, or Site Health runtime files;
- edit package/manifest/lockfile;
- edit docs;
- edit Playwright;
- implement live SharePoint reads/writes;
- implement checklist completion;
- implement constraints calculations;
- implement business-week logic;
- implement approval/checkpoint execution;
- implement command actions;
- introduce URL routing;
- introduce Phase 05 module launcher behavior.

---

## Required Verification Matrix

Before and after editing, produce:

| Area | Current behavior | Target behavior | Files changed | Test coverage |
|---|---|---|---|---|
| First Project Readiness card | duplicate title/summary card | operational readiness card | | |
| Duplicate title | Project Readiness / Project readiness | removed from bento | | |
| Active Gate | in top card | retained in operational card | | |
| Overall Posture | in top card | retained in operational card | | |
| Blockers | in top card | retained in operational card | | |
| Evidence Confidence | in top card | retained in operational card | | |
| Source-health chips | in top card | retained in operational card | | |
| Future TODO markers | absent/incomplete | added near metric mapping | | |
| Active-panel marker | card-level compatibility? | shell-only if marker removed | | |
| Navigation path | top-level Project Readiness tab | unchanged | | |
| Hero model | heroHighlights + governanceMicrocopy | unchanged | | |
| Bento composition | redundant top card present | top card removed/transformed operationally | | |

---

## Validation

Run after edits:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed Project Readiness source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as `--runInBand`.

Do not run hosted Playwright unless explicitly authorized.

Because this changes visible Project Readiness composition, closeout must mark hosted/runtime evidence as operator-pending if not run.

---

## Hard Stops

Stop and report if:

- current Project Readiness MVP data would be lost;
- no operational Project Readiness card can safely receive the MVP metrics;
- shell-only reclassification would be inconsistent across ready/loading/error branches;
- TODO placement cannot be done without touching shell/layout/shared runtime files;
- fix would require shell hero metadata changes;
- fix would require navigation/dropdown changes;
- fix would require unrelated surface runtime edits;
- package, manifest, lockfile, docs, or Playwright files would change;
- tests require deleting coverage without equivalent replacement.

---

## Closeout Requirements

Report:

```markdown
# Prompt 04B-10 Execution Report — Project Readiness Top Card Removal and Metric Absorption

## 1. Repo Baseline
- Branch:
- HEAD:
- git status before:
- pnpm-lock hash before:
- package-solution path:
- solution.version:
- feature.version:
- webpart manifest version:

## 2. Runtime Changes
- First card before:
- First card after:
- Duplicate shell-hero framing removed:
- MVP data preserved:
- Where metrics were absorbed:
- Layout changed:
- Active-panel classification:

## 3. TODO Markers Added
- Hero / bento ownership split:
- Startup Checklist:
- Constraints:
- Evidence / source health:
- Approvals / checkpoints:

## 4. Preserved MVP Display
- Active gate:
- Overall posture:
- Blockers:
- Evidence confidence:
- Source-health badges:
- Current compatibility-card status:

## 5. Tests
- Files changed:
- Redundancy assertions:
- MVP data preservation assertions:
- Active-panel assertions:
- TODO grep evidence, if not tested:

## 6. Validation
- Commands run:
- Results:
- pnpm-lock hash after:
- git status after:

## 7. Follow-Up
- Future development phase:
- Required backend/read-model sources:
- Startup Checklist conditional rendering:
- Constraints conditional rendering:
- Evidence/source-health conditional rendering:
- Approvals/checkpoints conditional rendering:
- Future shell-hero vs bento operational split:
- Hosted evidence status:
```

Commit summary draft:

```text
refactor(pcc): remove redundant Project Readiness top card
```

Commit body should state:

- current MVP readiness data remains visible;
- duplicate surface-header framing was removed from the first bento card;
- readiness metrics were absorbed into the first operational readiness card or a justified operational fallback;
- TODO markers were added for future project-context-derived readiness signals;
- Project Readiness active-panel classification changed to shell-only if marker ownership was removed;
- no package/manifest/lockfile drift;
- hosted/runtime evidence operator-pending if not run.
