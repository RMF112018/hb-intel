# Prompt 04B-04 — Project Readiness MVP Redundancy Remediation and Future Conditional Readiness TODOs

## Objective

Correct the **Project Readiness** MVP surface so the first bento card no longer duplicates the shell hero, while preserving the current MVP readiness data and adding targeted TODO markers for future project-context-derived readiness signals.

This is **not** a data-model implementation prompt. It is an MVP UX correction plus future-development marker prompt.

The prompt must address both requirements:

1. **MVP hero / first-bento-card redundancy correction**
   - The first Project Readiness bento card should stop behaving like a duplicate surface header.
   - It should read as operational readiness content, not another page title / summary block.
   - The current MVP readiness data must remain visible.

2. **Future conditional readiness TODO markers**
   - Add TODO markers that define future project-context logic for startup checklist completion, constraints, evidence/source-health, and approvals/checkpoints readiness signals.

---

## Current Visual Defect

The Project Readiness shell hero already displays selected-tab context:

```text
Project Readiness
Readiness posture, blockers, evidence, and startup-to-closeout controls.
Mode: Readiness preview
Source: Readiness framework and module signals
Authority: Evidence context only
Focus: Blockers, evidence, and startup-to-closeout controls
Boundary: No checklist completion from this header
Posture: No checklist completion or evidence execution from this header
Read-only preview — readiness actions remain governed by source modules.
```

But the first bento card repeats the selected-tab identity and summary framing:

```text
PROJECT READINESS
Project readiness
Project readiness
Workflow execution and approvals are managed by your PCC administrator.
Project Readiness Module Framework shell aggregating readiness posture, blockers, evidence references, and source-health signals...
```

Then it shows useful MVP data:

```text
Active Gate: Preconstruction
Overall Posture: Blocked
Blockers: 7
Evidence Confidence: Low
Source-health chips
```

The duplicate title/summary framing is the problem. The MVP data itself is not the problem.

---

## Required MVP Outcome

After this prompt, the first Project Readiness bento card must still show the current MVP readiness data, but it must not visually read as a duplicate page header.

Target direction:

```text
Readiness Gate & Blockers
Active Gate: Preconstruction
Overall Posture: Blocked
Blockers: 7
Evidence Confidence: Low
Source-health chips
```

Exact title may vary, but it must be operational and not a duplicate of:

```text
Project Readiness
Project readiness
```

Acceptable operational titles include:

```text
Readiness Gate & Blockers
Readiness Posture
Gate, Blockers & Evidence
Startup Readiness Signals
```

Do **not** change the underlying MVP values.

---

## Common Local-Agent Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement Phase 05 module launcher, URL routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

---

## Strict Scope

Authorized runtime edits:

```text
apps/project-control-center/src/surfaces/projectReadiness/**
```

Authorized test edits:

```text
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
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
apps/project-control-center/src/surfaces/approvals/**
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

If fixing the redundancy requires shell/layout/shared runtime edits, stop and report.

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

Expected package version may be `1.0.0.20` if the tenant publish/version bump has landed. Treat package/version-only movement as acceptable if already reviewed and out of scope.

Hard stop if the tree is dirty in Project Readiness files or shared Project Readiness test files unless the user explicitly identifies those files as intentional and in-scope.

---

## Required Reads

Inspect current Project Readiness files before editing:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

Only inspect shell metadata if needed to verify current Project Readiness shell hero posture. Do not edit shell files.

---

## Required Searches

Run and record:

```bash
rg -n "Project readiness|ReadinessHeroSlot|Active gate|Overall posture|Blockers|Evidence confidence|source-health|startup|checklist|constraints|dataActiveSurfacePanel=\"project-readiness\"" apps/project-control-center/src/surfaces/projectReadiness apps/project-control-center/src/tests
rg -n "project-readiness|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL" apps/project-control-center/src/tests
```

Classify relevant results as:

```text
DUPLICATE HEADER FRAMING
CURRENT MVP DATA
CURRENT TEST CONTRACT
TODO TARGET
OUT OF SCOPE
```

---

## Implementation Requirements

### 1. Preserve Current MVP Data

Do not change the current displayed values for:

```text
Active Gate
Overall Posture
Blockers
Evidence Confidence
Source-health chips
```

Do not change mock/fixture data.

Do not add new calculated values.

Do not add backend/read-model calls.

### 2. Remove Duplicate Header Framing from the First Bento Card

Modify only the Project Readiness first-card framing so it no longer duplicates the shell hero.

Remove or replace visible redundant content such as:

```text
PROJECT READINESS
Project readiness
Project readiness
Workflow execution and approvals are managed by your PCC administrator.
Project Readiness Module Framework shell aggregating readiness posture...
```

Do not remove the card itself unless the same MVP data remains in an operational first bento card.

Preferred implementation:

- Keep the existing card structure and data.
- Change the card’s visible title to an operational title such as:

```text
Readiness Gate & Blockers
```

- Remove duplicate explanatory paragraphs that restate the shell hero.
- Preserve the stat grid and source-health chips.
- Preserve accessibility semantics and heading level.
- Preserve direct-child bento placement.

### 3. Compatibility-Card Classification

For this MVP pass, Project Readiness may remain in:

```text
SURFACES_WITH_COMPATIBILITY_CARD
```

Do not move Project Readiness to shell-only unless the card-level `dataActiveSurfacePanel="project-readiness"` is intentionally removed and all affected tests are updated in the same commit.

Default posture for this prompt:

```text
Keep project-readiness in SURFACES_WITH_COMPATIBILITY_CARD.
```

### 4. Add Future TODO Markers

Add targeted TODO markers close to the current readiness summary/stat mapping.

Recommended maximum:

```text
2 to 4 TODO comments total
```

The TODO markers must cover:

- future hero vs bento ownership split;
- startup checklist completion percentage;
- constraints overdue / due-this-week status;
- evidence/source-health readiness signals;
- approvals/checkpoints readiness blockers.

---

## Required TODO Marker Categories

### TODO Category 1 — Future Hero / Bento Ownership Split

Add a TODO near the first Project Readiness card summary/rendering logic.

The TODO must state:

```ts
// TODO(PCC-ProjectReadiness): This MVP card now keeps readiness data visible while avoiding duplicate page-title framing.
// Future implementation should split summary ownership so the shell hero can show selected-project readiness posture
// and the bento grid can begin with operational readiness work items, gates, blockers, evidence, or source modules.
// Do not remove the MVP readiness data until project-context-derived readiness signals are available.
```

### TODO Category 2 — Startup / Job Startup Checklist Conditional Signal

Add a TODO near readiness stat mapping.

Required future behavior:

```text
If the selected project has started the Job Startup Checklist but it is not fully complete, render:
Startup Checklist {n}% Complete
```

Implementation intent:

- derive `{n}` from completed checklist items divided by required checklist items;
- use the current project ID/context;
- do not compute from static fixture text once backend/read-model support exists;
- preserve read-only/no-writeback posture.

### TODO Category 3 — Constraints Log Conditional Signal

Add a TODO near blockers/constraints/readiness-risk mapping.

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

- derive overdue constraints from selected project constraints where due date is before the current business date and status is not resolved/closed;
- derive this-week constraints from selected project constraints due on or before the current business week end and not resolved/closed;
- define business-week calculation consistently with scheduling/lookahead standards when that model exists;
- do not add date/business-week logic in this MVP prompt.

### TODO Category 4 — Evidence / Source Health / Approvals Relationship

Add a TODO near evidence confidence, source-health, approval/checkpoint blocker mapping.

Future examples:

```text
Evidence Confidence {Low | Medium | High}
{n} Source Modules Available
{n} Source Modules Stale
{n} Readiness Approvals Pending
{n} Checkpoints Blocking Startup
```

Implementation intent:

- derive source-health from readiness source registry/read-model state;
- preserve unavailable/stale states instead of hiding them;
- derive approvals/checkpoints from the approvals/checkpoints read model when the readiness module consumes that source;
- do not introduce approval execution/writeback from the Project Readiness card.

---

## Prohibited Work

Do not:

- remove current MVP readiness values;
- remove `ReadinessHeroSlot` unless an operational replacement preserves identical MVP data;
- remove or change `dataActiveSurfacePanel="project-readiness"` by default;
- move `project-readiness` between compatibility-card and shell-only surface sets by default;
- change mock data values;
- add new calculated fields;
- implement startup checklist percentage logic;
- implement constraints overdue/due-this-week logic;
- implement business-week date logic;
- add backend/read-model calls;
- edit shell files;
- edit docs;
- edit Playwright/evidence files;
- edit package/manifest/lockfile files.

---

## Required Tests

Update or add tests to prove:

1. The first Project Readiness bento card no longer renders duplicate surface-header framing:
   - no duplicate visible `Project readiness` card title beneath the shell hero;
   - no duplicate explanatory paragraph that restates the Project Readiness module shell.
2. The current MVP readiness data still renders:
   - Active Gate;
   - Preconstruction;
   - Overall Posture;
   - Blocked;
   - Blockers;
   - 7;
   - Evidence Confidence;
   - Low;
   - source-health chips.
3. Project Readiness remains in the correct active-panel expectation set.
4. Direct-child bento invariant remains intact.

Do not weaken existing tests by deleting coverage without replacement.

---

## Validation

After edits, run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed Project Readiness source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as:

```bash
--runInBand
```

Do not run hosted Playwright unless explicitly authorized. Because this prompt changes visible runtime copy/framing, hosted evidence should be marked operator-pending if not run.

---

## Hard Stops

Stop and report if:

- current Project Readiness runtime behavior differs materially from the MVP display described above;
- the duplicate header framing cannot be removed without losing MVP data;
- TODO placement cannot be done without touching shell/layout/shared runtime files;
- changes would require package, manifest, or lockfile edits;
- tests require deleting coverage without replacement;
- unrelated surfaces require runtime edits.

---

## Required Closeout Report

Report:

```markdown
# Prompt 04B-04 Execution Report — Project Readiness MVP Redundancy Remediation

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
- First card title before:
- First card title after:
- Duplicate shell-hero framing removed:
- MVP data preserved:
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
refactor(pcc): make Project Readiness first card operational for MVP
```

Commit body should state:

- current MVP readiness data remains visible;
- duplicate surface-header framing was removed from the first bento card;
- TODO markers were added for future project-context-derived readiness signals;
- Project Readiness active-panel classification remains unchanged unless repo truth required otherwise;
- no package/manifest/lockfile drift;
- hosted/runtime evidence operator-pending if not run.
