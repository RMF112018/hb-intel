# Prompt 04B-09 — Documents Header Card Removal and State-Aware Seam Remediation

## Objective

Remove the redundant top-level **Documents** header bento card while preserving all Documents loading / error / source-unavailable / ready-state posture copy.

The Documents surface must no longer begin with a card whose primary function is to restate the selected tab or explain the Documents surface. The ready-state first bento card must be operational document-control content.

Primary objective:

```text
Remove PccDocumentsHeaderCard from the Documents bento grid after creating or identifying a non-header state seam for non-ready branches.
```

Preferred final outcome:

```text
Documents ready path begins with operational document-control lane content.
Documents loading / error / source-unavailable states still render clear state posture.
Documents becomes shell-only if no card-level active-surface marker remains in any branch.
```

---

## Governing Corrective UX Rule

No PCC tab surface may begin with a bento card whose primary purpose is to restate the selected tab, explain the surface, or provide summary posture that belongs in the shell hero.

The first Documents bento card must be operational.

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
```

Expected recent validation baseline:

```text
c10b9bf1624b0914259a869a23e4613b5cca1a12
```

Important current contracts:

```text
Shell order: Tabs → Hero → Bento
Hero order: identity → facts → heroHighlights → governanceMicrocopy
Documents navigation path: top-level tab
Current likely compatibility-card surfaces: documents, project-readiness
Current likely shell-only surfaces: project-home, team-and-access, external-systems, control-center-settings, approvals, site-health
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

This prompt may edit Documents runtime, Documents-specific tests, and shared shell/bento contract tests that need classification updates.

Expected Documents runtime files:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts
apps/project-control-center/src/surfaces/documents/**
```

Expected test files:

```text
apps/project-control-center/src/tests/PccDocumentsSurface*.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Do not edit shell, navigation, hero, non-Documents surfaces, layout, Playwright, docs, package, manifest, package.json files, app package file, or `pnpm-lock.yaml`.

If edits outside Documents/runtime-test scope appear necessary, stop and report.

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

Hard stop if the working tree is dirty in Documents runtime files or shared Documents-touching tests unless the user has explicitly identified those files as intentional and in-scope.

---

## Required Reads

Inspect current repo truth before editing:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts
apps/project-control-center/src/surfaces/documents/

apps/project-control-center/src/tests/PccDocumentsSurface*.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Do not inspect unrelated surfaces unless a shared contract test forces current classification confirmation.

---

## Required Searches

Run and classify results:

```bash
rg -n "PccDocumentsHeaderCard|HB Document Control Center|Document control shows three lanes|Loading document control content|Document control is temporarily unavailable|No document control sources are available|dataActiveSurfacePanel=\"documents\"|data-pcc-active-surface-panel=\"documents\"" apps/project-control-center/src
rg -n "sourceStatus|readModelStatus|source-unavailable|backend-unavailable|loading|error|PccPreviewState|PccSurfaceContextHeader|sourceStateMessaging|cueFor" apps/project-control-center/src/surfaces/documents apps/project-control-center/src/tests
rg -n "documents|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL|getSurfaceSelectionControl|data-pcc-tab-id=\"documents\"" apps/project-control-center/src/tests
rg -n "heroHighlights|governanceMicrocopy|Documents|Document Sources|Project Record|My Project Files|External References|Read-only preview" apps/project-control-center/src/shell apps/project-control-center/src/tests
```

Classify each relevant result as:

```text
DUPLICATE HEADER CARD
STATE COPY SOURCE
OPERATIONAL LANE CANDIDATE
ACTIVE-PANEL MARKER
SHELL-HERO CONTRACT
TOP-LEVEL NAV TEST PATH
COMPATIBILITY/SHELL-ONLY CONTRACT
HISTORICAL COMMENT ONLY
```

---

## Required Pre-Edit State Disposition Matrix

Before editing, produce a matrix mapping every current Documents header branch/cue to a retained destination.

| Current header item / branch | Must be preserved? | Target destination | Notes |
|---|---:|---|---|
| Header title: HB Document Control Center | No | shell hero owns Documents identity | Remove from bento |
| Ready copy: Document control shows three lanes for this project. | No, if lanes self-evidence | operational lane cards | Ready path can begin directly with operational cards |
| Loading copy: Loading document control content. | Yes | dedicated non-header state card | Must remain visible in loading branch |
| Error/backend copy: Document control is temporarily unavailable. Try again later. | Yes | dedicated non-header state card | Must remain visible in error branch |
| Source-unavailable copy: No document control sources are available for this project. | Yes | dedicated non-header state card | Must remain visible in source-unavailable branch |
| Source/no-move/no-writeback cue | Yes | shell hero governanceMicrocopy or non-header state card if branch-specific | Do not restore old scaffold row |
| Card-level marker dataActiveSurfacePanel="documents" | Prefer remove | shell <main role="tabpanel"> | Remove only if all branches become shell-only |

Do not edit until this disposition is clear.

---

## Preferred Implementation Pattern

Follow the current Phase 04B pattern:

```text
Remove duplicate first card.
Preserve useful state/posture in a non-header operational/state destination.
Reclassify the surface as shell-only if no card-level active marker remains in any branch.
```

### Preferred Documents target

1. Add or identify a state-only component, for example:

```text
PccDocumentsStateCard
PccDocumentControlStateCard
PccDocumentsSourceStateCard
```

2. Use that component only for non-ready states:

```text
loading
error / backend unavailable
source-unavailable
```

3. Ready path should not render the header card. It should begin with the first operational document-control lane card.

4. The state card must not be titled:

```text
HB Document Control Center
Documents
Document Control Center
```

unless repo truth proves a non-duplicative title is necessary. Prefer operational state titles such as:

```text
Document sources loading
Document sources unavailable
Document control temporarily unavailable
Source connection status
```

5. The state card should not emit a card-level `dataActiveSurfacePanel="documents"` marker if the target is uniform shell-only behavior.

### Acceptable fallback

If a state-only seam already exists outside `PccDocumentsHeaderCard`, reuse it and delete `PccDocumentsHeaderCard`.

If current Documents architecture requires the header component to render state copy temporarily, transform it into a state-only component and rename it so it no longer acts as the ready-path header card. Do not leave a ready-state duplicate header.

### Prohibited pattern

Do not make the shell hero read-model-state-aware.

Do not remove loading/error/source-unavailable copy.

Do not leave `HB Document Control Center` as the first ready-path bento card.

Do not reintroduce old scaffold labels or long no-writeback copy as primary hero content.

---

## Active-Panel Classification

Determine whether removing `PccDocumentsHeaderCard` removes all card-level active markers.

If, after the change, no Documents card emits:

```text
data-pcc-active-surface-panel="documents"
dataActiveSurfacePanel="documents"
```

in any branch:

```text
ready
loading
error
source-unavailable / degraded
```

then move `documents` from:

```text
SURFACES_WITH_COMPATIBILITY_CARD
```

to:

```text
SURFACES_WITH_SHELL_ONLY_PANEL
```

in the same commit.

Expected likely post-4B-09 sets if Documents becomes shell-only:

```text
SURFACES_WITH_COMPATIBILITY_CARD:
- project-readiness
```

```text
SURFACES_WITH_SHELL_ONLY_PANEL:
- project-home
- team-and-access
- external-systems
- control-center-settings
- approvals
- site-health
- documents
```

Only make this move after current repo truth confirms Documents no longer emits card-level active-panel markers in every branch.

If a retained state or operational card still legitimately emits the marker, keep Documents in compatibility-card expectations and justify why.

---

## Navigation and Shell Requirements

Documents remains a top-level visible tab after Prompt 4B-06.

Tests should not use 8-peer-tab assumptions, but Documents selection may still be direct through its top-level tab.

Use the current navigation helper/path where tests already rely on it:

```text
getSurfaceSelectionControl(container, 'documents')
```

or direct `data-pcc-tab-id="documents"` only where the test is explicitly about the top-level tab.

Do not modify the dropdown/navigation component in this prompt.

---

## Required Test Updates

Update tests to prove:

1. Documents no longer begins with `PccDocumentsHeaderCard`.
2. `HB Document Control Center` no longer appears as a first ready-path bento header card.
3. Ready state starts with operational document-control lane content.
4. Loading, error/backend, and source-unavailable copy still render in the proper non-ready branches.
5. The non-ready state seam is not the ready-path header card.
6. Documents shell hero still carries Documents identity and current 4B-02 `heroHighlights` / `governanceMicrocopy`.
7. If Documents becomes shell-only, shell `<main role="tabpanel">` remains the active-panel owner.
8. Each Documents card/state card remains a direct child of `PccBentoGrid`.

Do not weaken direct-child invariant coverage.

---

## Out-of-Scope

Do not:

- edit Documents shell hero metadata;
- edit shell navigation/dropdown behavior;
- edit Project Home, Team, Readiness, Approvals, External Platforms, Settings, or Site Health runtime files;
- edit package/manifest/lockfile;
- edit docs;
- edit Playwright;
- implement live SharePoint reads/writes;
- implement document movement, synchronization, or writeback;
- implement command actions;
- introduce URL routing;
- introduce Phase 05 module launcher behavior.

---

## Required Verification Matrix

Before and after editing, produce:

| Area | Current behavior | Target behavior | Files changed | Test coverage |
|---|---|---|---|---|
| First Documents ready card | Header card | operational document lane | | |
| Ready title | HB Document Control Center | removed from bento ready path | | |
| Loading state | header carries copy | state seam carries copy | | |
| Error/backend state | header carries copy | state seam carries copy | | |
| Source unavailable | header carries copy | state seam carries copy | | |
| Source/no-writeback cue | header/shell | shell microcopy and/or state seam | | |
| Active-panel marker | card-level compatibility? | shell-only if marker removed | | |
| Navigation path | top-level Documents tab | unchanged | | |
| Hero model | heroHighlights + governanceMicrocopy | unchanged | | |
| Bento composition | redundant header present | header removed, operational/state seam retained | | |

---

## Validation

Run after edits:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as `--runInBand`.

Do not run hosted Playwright unless explicitly authorized.

Because this changes visible Documents composition, closeout must mark hosted/runtime evidence as operator-pending if not run.

---

## Hard Stops

Stop and report if:

- Documents loading/error/source-unavailable copy would be lost;
- no operational Documents ready card exists after header removal;
- no safe non-header state seam can be created without shell read-model-state plumbing;
- Documents shell-only reclassification would be inconsistent across ready/loading/error/source-unavailable branches;
- fix would require shell hero metadata changes;
- fix would require navigation/dropdown changes;
- fix would require unrelated surface runtime edits;
- package, manifest, lockfile, docs, or Playwright files would change;
- tests require deleting coverage without equivalent replacement.

---

## Closeout Requirements

Report:

- files changed;
- first Documents ready bento card before/after;
- whether `PccDocumentsHeaderCard` was deleted, transformed, or retained only as a renamed state seam;
- state-copy disposition:
  - loading;
  - error/backend unavailable;
  - source unavailable;
  - ready/default;
- active-panel classification after change;
- whether `documents` moved to shell-only;
- navigation test path used;
- hero contract preservation;
- bento direct-child invariant preservation;
- tests changed;
- validation results;
- lockfile hash before/after;
- package/manifest status;
- hosted runtime evidence status;
- follow-up prompts still required.

Commit summary draft if preferred deletion path is implemented:

```text
refactor(pcc): remove redundant Documents header card
```

Commit body should state:

- removed the duplicate Documents header card from the ready path;
- preserved loading/error/source-unavailable copy through a non-header state seam;
- reclassified Documents as shell-only if card-level active markers were removed in every branch;
- preserved Documents top-level navigation;
- preserved 4B-02 hero model and 4B-03 shell/hero order;
- preserved bento direct-child invariant;
- did not change package/manifest/lockfile;
- hosted/runtime evidence operator-pending if not run.
