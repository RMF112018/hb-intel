# Prompt 04B-08 — Site Health Overview Card Removal and Metric Absorption

## Objective

Remove the redundant top-level **Site Health** overview bento card so the Site Health surface begins with operational health-check / diagnostics / drift / repair-posture content, not a duplicate page-summary card.

This prompt updates the earlier Site Health prompt to align with the current Phase 04B shell/navigation state and with the Approvals 4B-05 precedent.

Primary objective:

```text
Remove PccSiteHealthOverviewCard as the first bento card unless repo truth proves doing so would lose required metrics with no operational destination.
```

Preferred remediation pattern:

```text
Delete the duplicate Site Health overview card and absorb its useful metrics into the first operational Site Health card.
```

Fallback only if strictly required by repo truth:

```text
Transform the overview into a compact operational card that is not titled “Site Health,” does not restate the selected tab, and does not carry a card-level active-surface compatibility marker unless that marker is still intentionally required.
```

---

## Governing Corrective UX Rule

No PCC tab surface may begin with a bento card whose primary purpose is to restate the selected tab, explain the surface, or provide summary posture that belongs in the shell hero.

The first bento card on Site Health must be operational.

---

## Current Phase 04B Baseline

Expected current baseline includes the following already-landed Phase 04B work:

```text
4B-01 — Project Home: removed PccProjectIntelligenceCard, promoted Priority Actions, Project Home became shell-only.
4B-02 — Shell hero: replaced production-visible scaffold labels with heroHighlights + governanceMicrocopy.
4B-03 — Shell orientation: tabs render above hero; hero facts render before highlights/microcopy.
4B-05 — Approvals: removed Approvals home card, absorbed metrics into Approval queue, Approvals became shell-only.
4B-06 — Nested navigation: Team, External Platforms, Settings, and Site Health moved under Project Home dropdown.
4B-06A — Dropdown remediation: Project Home dropdown became click/keyboard-first with nav-local layering fix.
```

Expected recent validation baseline:

```text
3721ac9cc0f74e354caf947cd4327506b80e33ae
```

This commit cleared the Approvals work and full test suite, moving `approvals` from compatibility-card expectations to shell-only expectations.

Important current contracts:

```text
Shell order: Tabs → Hero → Bento
Hero order: identity → facts → heroHighlights → governanceMicrocopy
Site Health navigation path: Project Home dropdown child, not a top-level peer tab
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

This prompt may edit Site Health runtime, Site Health-specific tests, and shared shell/bento contract tests that need classification updates.

Expected runtime files:

```text
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
apps/project-control-center/src/surfaces/siteHealth/**
```

Expected test files:

```text
apps/project-control-center/src/tests/PccSiteHealth*.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/shellSurfaceSelection.ts
```

Use the current nested-navigation helper/path for shell/app tests:

```text
getSurfaceSelectionControl(container, 'site-health')
```

or the current equivalent helper. Do not reintroduce 8 peer-tab assumptions.

Do not edit:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/surfaces/approvals/**
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/teamAccess/**
apps/project-control-center/src/surfaces/externalSystems/**
apps/project-control-center/src/surfaces/controlCenterSettings/**
apps/project-control-center/src/layout/**
e2e/pcc-live/**
playwright.pcc-live.config.ts
docs/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

If edits outside the allowed Site Health/runtime-test scope appear necessary, stop and report.

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

Expected version/package files may already contain intentional deployment drift. Do not stage or alter package/manifest/lockfile files in this prompt.

Hard stop if the working tree is dirty in Site Health runtime files or shared tests unless the user has explicitly identified those files as intentional and in-scope.

---

## Required Reads

Inspect current repo truth before editing:

```text
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
apps/project-control-center/src/surfaces/siteHealth/
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts

apps/project-control-center/src/tests/PccSiteHealth*.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/shellSurfaceSelection.ts
```

Do not inspect or edit unrelated surfaces unless a shared contract test forces current classification confirmation.

---

## Required Searches

Run and classify results:

```bash
rg -n "PccSiteHealthOverviewCard|Site Health|Site health summary|Overall|Failing|Warnings|Last Run|dataActiveSurfacePanel=\"site-health\"|data-pcc-active-surface-panel=\"site-health\"" apps/project-control-center/src
rg -n "site-health|SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL|getSurfaceSelectionControl|data-pcc-surface-nav-child=\"site-health\"" apps/project-control-center/src/tests
rg -n "severity|failing|warning|last run|lastRun|scan|repair|drift|health check|site health" apps/project-control-center/src/surfaces/siteHealth apps/project-control-center/src/tests
rg -n "heroHighlights|governanceMicrocopy|Site Health|Repair Posture|Last Scan|Read-only preview|SharePoint admin tooling" apps/project-control-center/src/shell apps/project-control-center/src/tests
```

Classify each relevant result as:

```text
DUPLICATE TOP CARD
OVERVIEW METRIC SOURCE
OPERATIONAL DESTINATION CANDIDATE
ACTIVE-PANEL MARKER
SHELL-HERO CONTRACT
NESTED-NAV TEST PATH
COMPATIBILITY/SHELL-ONLY CONTRACT
HISTORICAL COMMENT ONLY
```

---

## Required Pre-Edit Metric Disposition Matrix

Before editing, produce a matrix mapping every current overview metric/cue to a retained destination.

| Current overview item | Must be preserved? | Target destination | Notes |
|---|---:|---|---|
| Overall severity | Yes | first operational health/checks card or existing operational diagnostics card | Must not disappear |
| Failing checks count | Yes | first operational health/checks card | Must remain visible in ready path |
| Warning count | Yes | first operational health/checks card | Must remain visible in ready path |
| Last Run timestamp | Yes | first operational health/checks card or diagnostics/status card | Must remain visible in ready path |
| Scan/repair admin-tooling cue | Yes | governanceMicrocopy if already present, or operational repair posture/status card | Do not restore old scaffold copy |
| Overview title “Site Health” | No | shell hero owns selected-tab identity | Remove from bento card |
| “Site health summary” duplicate description | No | shell hero / highlights / microcopy owns context | Remove from first bento card |

Do not edit until this disposition is clear.

---

## Preferred Implementation Pattern

Follow the Approvals 4B-05 shape where feasible:

```text
Remove duplicate first card.
Absorb its useful metrics into the first operational card.
Reclassify the surface as shell-only if no card-level active marker remains.
Preserve view-model/adapter data shape where possible.
```

### Preferred Site Health target

Remove `PccSiteHealthOverviewCard` from the first bento position and absorb its retained metrics into the first operational Site Health card, for example:

```text
Health checks
Site checks
Drift and scan status
Repair posture
Source diagnostics
```

Use repo truth for actual card/component names.

The new first card must not be titled:

```text
Site Health
Site health summary
Overview
```

unless “overview” is clearly operational and not duplicative. Prefer a title such as:

```text
Health checks summary
Drift and scan status
Repair posture
Site checks
```

### Acceptable fallback

If no operational card can safely absorb the metrics without broad refactor, transform `PccSiteHealthOverviewCard` into an operational summary card that:

- is not titled `Site Health`;
- does not restate the selected tab;
- is compact and operational;
- keeps the metrics visible;
- does not carry a card-level `dataActiveSurfacePanel="site-health"` unless repo truth proves a retained compatibility marker is still required.

### Prohibited pattern

Do not move dynamic metrics into shell hero metadata unless those metrics are already static/deterministic at the shell boundary.

Do not reintroduce the old 4B-02 scaffold labels or old long read-only copy.

Do not remove metrics without a retained operational destination.

---

## Hero Contract Requirements

After Prompt 4B-02, the shell hero carries production-oriented content through:

```text
heroHighlights
governanceMicrocopy
```

For Site Health, tests should reference the current hero contract, not old scaffold language.

Do not require or assert old production-visible labels such as:

```text
FOCUS
BOUNDARY
POSTURE
AUTHORITY
HBI
No repair acknowledgement from this header
```

Correct expectation language:

```text
Site Health heroHighlights + governanceMicrocopy remain available.
Site Health hero identity remains shell-owned.
Read-only / repair / SharePoint admin-tooling posture remains visible as demoted governance microcopy or operational repair posture.
```

If current tests still assert the old scaffold label/copy as visible hero content, update them to the current `heroHighlights` / `governanceMicrocopy` contract.

---

## Active-Panel Classification

Determine whether removing or transforming the Site Health overview card removes the only card-level active marker.

If, after the change, no Site Health card emits:

```text
data-pcc-active-surface-panel="site-health"
dataActiveSurfacePanel="site-health"
```

then move `site-health` from:

```text
SURFACES_WITH_COMPATIBILITY_CARD
```

to:

```text
SURFACES_WITH_SHELL_ONLY_PANEL
```

in the same commit.

Expected likely post-4B-08 sets if Site Health becomes shell-only:

```text
SURFACES_WITH_COMPATIBILITY_CARD:
- documents
- project-readiness

SURFACES_WITH_SHELL_ONLY_PANEL:
- project-home
- team-and-access
- external-systems
- control-center-settings
- approvals
- site-health
```

Only make this move after current repo truth confirms Site Health no longer emits card-level active-panel markers in all branches:

```text
ready
loading
error
source-unavailable / degraded, if applicable
```

If a retained operational Site Health card still legitimately emits the marker, keep Site Health in compatibility-card expectations and justify why.

---

## Nested Navigation Requirements

Site Health is now accessed through the Project Home dropdown.

Tests must not assume Site Health is a visible top-level peer tab.

Use current navigation helper/path:

```text
getSurfaceSelectionControl(container, 'site-health')
```

or the current equivalent helper used by post-4B-06 tests.

Do not reintroduce top-level `Site Health` tab expectations.

Do not modify the dropdown/navigation component in this prompt.

---

## Required Test Updates

Update tests to prove:

### 1. First bento card behavior

- Site Health no longer begins with a duplicate surface-title card.
- The first ready-path Site Health bento card is operational.
- The first operational card contains the retained overview metrics or metric summary.

### 2. Metrics preserved

Assert retained metrics remain visible in ready path:

```text
overall severity
failing count
warning count
last run timestamp
repair/admin-tooling posture
```

Use exact current labels/values from repo truth where possible. Do not hardcode values that are computed elsewhere unless that is the existing test style.

### 3. Degraded/loading/error behavior preserved

Assert:

- loading/error/source-unavailable branches still display appropriate state/degraded card(s);
- overview-card removal does not eliminate the only degraded-state representation;
- retained metrics are absent or appropriately replaced in degraded branches if data is unavailable.

### 4. Shell-only / compatibility classification

If Site Health becomes shell-only:

- move `site-health` to `SURFACES_WITH_SHELL_ONLY_PANEL` in all shared test sets;
- update loading/error state-branch tests to use state-card helpers rather than compatibility-card helpers, matching the Approvals 4B-05 pattern;
- assert shell `<main role="tabpanel">` remains the active-panel owner.

If Site Health remains compatibility-card:

- assert the retained operational card is the card-level compatibility owner;
- justify why this remains necessary.

### 5. Nested navigation path

For shell/app tests:

- select Site Health through the current nested navigation helper;
- assert the hero title changes to Site Health;
- assert active panel updates to `site-health`;
- assert bento content renders the new first operational card.

### 6. Direct-child bento invariant

Preserve or update tests proving each Site Health card remains a direct child of `PccBentoGrid`.

Do not weaken direct-child invariant coverage.

---

## Likely Test Files to Update

```text
apps/project-control-center/src/tests/PccSiteHealth*.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```

Only edit tests that current validation proves are impacted. Do not churn unrelated tests.

---

## Out-of-Scope

Do not:

- edit Site Health hero metadata;
- edit shell navigation/dropdown behavior;
- edit Project Home, Team, Documents, Readiness, Approvals, External Platforms, or Settings runtime files;
- edit package/manifest/lockfile;
- edit docs;
- edit Playwright;
- implement live SharePoint reads/writes;
- implement repair acknowledgements;
- implement command actions;
- introduce URL routing;
- introduce Phase 05 module launcher behavior.

---

## Required Verification Matrix

Before and after editing, produce:

| Area | Current behavior | Target behavior | Files changed | Test coverage |
|---|---|---|---|---|
| First Site Health card | `Site Health` overview/summary card | operational health/checks/diagnostics card | | |
| Overview title | duplicate tab title | removed from bento | | |
| Overall severity | in overview | retained in operational card | | |
| Failing count | in overview | retained in operational card | | |
| Warning count | in overview | retained in operational card | | |
| Last Run | in overview | retained in operational card/status | | |
| Repair/admin cue | in overview | retained as operational posture or microcopy | | |
| Active-panel marker | card-level compatibility? | shell-only if marker removed | | |
| Navigation path | nested Project Home dropdown | unchanged | | |
| Hero model | heroHighlights + governanceMicrocopy | unchanged | | |
| Bento composition | redundant top card present | top card removed or transformed | | |

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

Do not use Jest-only flags such as:

```bash
--runInBand
```

Do not run hosted Playwright unless explicitly authorized.

Because this changes visible Site Health composition, closeout must mark hosted/runtime evidence as operator-pending if not run.

---

## Hard Stops

Stop and report if:

- Site Health overview metrics would be lost;
- scan/repair governance cue would be lost;
- no operational Site Health card can safely receive the metrics;
- removing/transferring the overview card breaks loading/error/degraded state posture;
- Site Health shell-only reclassification would be inconsistent across ready/loading/error branches;
- nested navigation helper/path cannot select Site Health in tests;
- fix would require shell hero metadata changes;
- fix would require navigation/dropdown changes;
- fix would require unrelated surface runtime edits;
- package, manifest, lockfile, docs, or Playwright files would change;
- tests require deleting coverage without equivalent replacement.

---

## Closeout Requirements

Report:

- files changed;
- first Site Health bento card before/after;
- whether `PccSiteHealthOverviewCard` was deleted, transformed, or retained;
- metric disposition:
  - overall severity;
  - failing count;
  - warning count;
  - last run;
  - repair/admin cue;
- active-panel classification after change;
- whether `site-health` moved to shell-only;
- nested navigation test path used;
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
refactor(pcc): remove redundant Site Health overview card
```

Commit body should state:

- removed or transformed the duplicate Site Health overview top card;
- absorbed overview metrics into the first operational Site Health card or documented the retained operational destination;
- preserved severity/failing/warning/last-run/repair posture;
- reclassified Site Health as shell-only if card-level active marker was removed;
- preserved nested Project Home dropdown navigation path;
- preserved 4B-02 hero model and 4B-03 shell/hero order;
- preserved bento direct-child invariant;
- did not change package/manifest/lockfile;
- hosted/runtime evidence operator-pending if not run.
