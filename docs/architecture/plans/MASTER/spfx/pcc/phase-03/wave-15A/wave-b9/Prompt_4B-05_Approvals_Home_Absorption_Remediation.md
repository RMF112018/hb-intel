# Prompt 04B-05 — Approvals Home Redundancy Removal and Hero Data Preservation

## Objective

Remove the redundant **Approvals home** top-level bento card while preserving any real approvals availability/degraded-state posture and ensuring the Approvals bento grid begins with operational approval workflow content.

The current screenshot shows that the shell hero already carries the Approvals summary context:

```text
Approvals
Approval checkpoints, routing posture, and pending decision context.

Client
Location
Estimated Value
Scheduled Completion
Project Stage

Approval Status
Pending decisions require review

Routing
Checkpoint context only

Escalations
Overdue items in queue

Read-only preview
Approval actions remain in governed approval workflows.
```

But the first bento card still renders as a duplicate/top-level home card:

```text
APPROVALS
Approvals home
UNAVAILABLE
Not available for this project
This area is part of the Project Control Center, but no content is available for the selected project.
```

This card no longer adds meaningful first-position value. It repeats selected-surface identity and creates a confusing state because operational cards such as `Approval queue` and `My approvals` are visible below it.

The target is for the Approvals bento area to begin with operational content, such as:

```text
Approval queue
My approvals
Pending decisions
Checkpoint routing
Escalations
```

---

## Common Local-Agent Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement Phase 05 module launcher, URL routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

---

## Governing Corrective UX Rule

No PCC tab surface may begin with a bento card whose primary purpose is to restate the selected tab, explain the surface, or provide summary posture that belongs in the shell hero.

For Approvals:

```text
Shell hero = approval status, routing, escalation context, read-only/governance cues
Bento grid = operational approval queue, my approvals, checkpoint/routing work, and degraded-state workflow content
```

---

## Strict Scope

Authorized runtime edits:

```text
apps/project-control-center/src/surfaces/approvals/**
```

Authorized test edits:

```text
apps/project-control-center/src/tests/PccApprovalsSurface*.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Do not edit:

```text
apps/project-control-center/src/shell/**
apps/project-control-center/src/layout/**
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/state/**
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/teamAccess/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/externalSystems/**
apps/project-control-center/src/surfaces/controlCenterSettings/**
apps/project-control-center/src/surfaces/siteHealth/**
e2e/pcc-live/**
playwright.pcc-live.config.ts
docs/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

If fixing Approvals requires shell/layout/shared runtime edits, stop and report.

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

Expected package version may be `1.0.0.20` or later if the tenant publish/version bump has landed. Treat package/version-only movement as acceptable if already reviewed and out of scope.

Hard stop if the tree is dirty in Approvals files or shared Approvals-touching test files unless the user explicitly identifies those files as intentional and in-scope.

---

## Required Reads

Inspect current Approvals files before editing:

```text
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/tests/PccApprovalsSurface*.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Only inspect shell metadata to verify current Approvals hero data and cues. Do not edit shell files.

---

## Required Searches

Run and record:

```bash
rg -n "Approvals home|APPROVALS|Not available for this project|This area is part of the Project Control Center|Approval queue|My approvals|Pending decisions|Checkpoint|Escalations|dataActiveSurfacePanel=\"approvals\"" apps/project-control-center/src/surfaces/approvals apps/project-control-center/src/tests
rg -n "approvals|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL" apps/project-control-center/src/tests
rg -n "Approval Status|Pending decisions require review|Routing|Checkpoint context only|Escalations|Overdue items in queue|Approval actions remain in governed approval workflows" apps/project-control-center/src/shell apps/project-control-center/src/tests
```

Classify relevant results as:

```text
DUPLICATE HEADER FRAMING
HERO-OWNED SUMMARY DATA
OPERATIONAL APPROVAL CONTENT
DEGRADED / UNAVAILABLE STATE
CURRENT TEST CONTRACT
OUT OF SCOPE
```

---

## Required Pre-Edit Decision Matrix

Before editing, produce this matrix:

| Check | Expected / Question | Actual | Action |
|---|---|---|---|
| Top card title | `Approvals home` currently appears | | remove / refactor |
| Top card role | duplicate header or real degraded-state card? | | remove / preserve state elsewhere |
| Hero approval status | hero already shows approval status | | preserve |
| Hero routing | hero already shows routing context | | preserve |
| Hero escalations | hero already shows escalation context | | preserve |
| Queue card | operational approval content exists | | preserve |
| My approvals card | operational approval content exists | | preserve |
| Unavailable state | real surface state or stale placeholder? | | remove / relocate |
| Card-level active marker | does removed top card own `dataActiveSurfacePanel="approvals"`? | | update split sets if needed |
| Direct-child bento cards | cards remain after removal | | preserve |

---

## Implementation Requirements

### 1. Remove the Top-Level `Approvals home` Card

Remove or refactor the first card so the Approvals bento area no longer begins with:

```text
Approvals home
Not available for this project
This area is part of the Project Control Center...
```

Preferred implementation:

- Remove the `Approvals home` card entirely.
- Promote `Approval queue` to the first visible bento card.
- Preserve `My approvals` and any other operational approval cards.
- Do not add a replacement summary/header card.

Allowed fallback:

- If current repo truth proves the unavailable state is a real necessary state, preserve it as a compact operational state notice **inside** the relevant queue/checkpoint workflow area, not as a top-level `Approvals home` card.
- The fallback card must not be titled `Approvals home`.
- It must not restate the selected tab.

### 2. Preserve Hero-Owned Summary Data

Do not move or duplicate the following into the bento grid:

```text
Approval Status: Pending decisions require review
Routing: Checkpoint context only
Escalations: Overdue items in queue
Read-only preview: Approval actions remain in governed approval workflows.
```

These are already appropriate shell hero summary facts/cues for Approvals.

Do not edit shell metadata unless tests prove the current hero data is missing or broken. If shell metadata is missing or broken, stop and report instead of broadening scope.

### 3. Preserve Operational Approval Content

The following content must remain visible if currently present:

```text
Approval queue
My approvals
Pending decisions
Checkpoint / routing items
Escalation or overdue queue state
Unavailable/degraded workflow state, if real
```

Do not remove operational cards just to satisfy the first-card rule.

### 4. Active-Panel Classification

If removing `Approvals home` removes the only card-level `dataActiveSurfacePanel="approvals"` marker, move `approvals` from:

```text
SURFACES_WITH_COMPATIBILITY_CARD
```

to:

```text
SURFACES_WITH_SHELL_ONLY_PANEL
```

in the same commit.

If a retained operational/degraded Approvals card still legitimately emits `dataActiveSurfacePanel="approvals"`, keep Approvals in compatibility-card expectations and justify why.

Do not leave tests inconsistent with runtime behavior.

### 5. Tests

Update or add tests to prove:

1. `Approvals home` no longer appears as the first bento card.
2. The first bento card is operational, preferably `Approval queue`.
3. `My approvals` remains visible if currently present.
4. Unavailable/degraded state remains visible only if it is real and now appears in an operational location.
5. The shell hero still carries Approvals summary data:
   - Approval Status
   - Pending decisions require review
   - Routing
   - Checkpoint context only
   - Escalations
   - Overdue items in queue
   - Approval actions remain in governed approval workflows
6. Active-panel split sets match runtime reality.
7. Direct-child bento invariant remains intact.

Do not weaken existing tests by deleting coverage without replacement.

---

## Prohibited Work

Do not:

- edit shell files;
- remove `Approval queue`;
- remove `My approvals`;
- remove real approval counts/state/mode data;
- remove degraded/unavailable state without proving it is stale/redundant;
- add new approval execution/writeback behavior;
- implement approval routing;
- implement checkpoint actions;
- implement live backend/read-model calls;
- change mock data values unless a test fixture is internally contradictory and must be corrected to preserve current intended behavior;
- edit docs;
- edit Playwright/evidence files;
- edit package/manifest/lockfile files;
- touch unrelated surfaces.

---

## Validation

After edits, run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed Approvals source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as:

```bash
--runInBand
```

Do not run hosted Playwright unless explicitly authorized. Because this prompt changes visible runtime composition, hosted evidence should be marked operator-pending if not run.

---

## Hard Stops

Stop and report if:

- removing `Approvals home` would remove the only representation of a real degraded/unavailable state;
- queue/my approvals content cannot safely become first bento content;
- active-panel split sets cannot be reconciled with runtime behavior;
- tests require deleting coverage without replacement;
- shell metadata must be edited to preserve approval summary data;
- unrelated surfaces require runtime edits;
- package, manifest, or lockfile edits are required.

---

## Required Closeout Report

Report:

```markdown
# Prompt 04B-05 Execution Report — Approvals Home Redundancy Removal

## 1. Repo Baseline
- Branch:
- HEAD:
- git status before:
- pnpm-lock hash before:
- package-solution path:
- solution.version:
- feature.version:
- webpart manifest version:

## 2. Pre-Edit Decision Matrix
- Top card role:
- Hero-owned summary data:
- Operational approval cards:
- Unavailable/degraded state disposition:
- Active-panel classification decision:

## 3. Runtime Changes
- First card before:
- First card after:
- `Approvals home` removed:
- Approval queue preserved:
- My approvals preserved:
- Unavailable/degraded state preserved or removed:
- Active-panel classification:

## 4. Tests
- Files changed:
- Redundancy assertions:
- Operational content preservation assertions:
- Hero summary assertions:
- Active-panel assertions:
- Direct-child bento assertions:

## 5. Validation
- Commands run:
- Results:
- pnpm-lock hash after:
- git status after:

## 6. Follow-Up
- Hosted/runtime evidence status:
- Remaining approvals implementation gaps:
- Future approval/checkpoint read-model work:
```

Commit summary draft:

```text
refactor(pcc): remove redundant Approvals home card
```

Commit body should state:

- `Approvals home` top card removed or refactored;
- hero already preserves approval status/routing/escalation summary;
- queue/my approvals operational content preserved;
- active-panel classification updated or retained according to runtime truth;
- no package/manifest/lockfile drift;
- hosted/runtime evidence operator-pending if not run.
