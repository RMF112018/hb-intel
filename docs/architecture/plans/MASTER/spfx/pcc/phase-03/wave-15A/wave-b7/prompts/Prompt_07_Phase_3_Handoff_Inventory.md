# Updated Prompt 07 — Phase 3 / Phase 4 Handoff Inventory for Duplicate Header Cards

## Objective

Create a precise, repo-truth handoff inventory for the next PCC remediation phase: duplicate top-level bento header / command card removal and command-header content migration.

This prompt is **documentation-only**. Do not remove, demote, reorder, or modify runtime cards. Do not modify tests. The output must inventory the current card/content/test/e2e impacts so the next local-agent package can remove duplicate bento header cards in a controlled sequence without losing operational content, breaking bento direct-child invariants, or regressing the Phase 2 shell-owned active-panel contract.

## Mandatory Opening Instruction

Before making changes, confirm you are operating on the current repo state.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Why This Prompt Needs Current Repo Truth

Phase 2 is now closed out. Current baseline includes:

- shell `<main role="tabpanel">` as the semantic active-panel owner;
- card-level `data-pcc-active-surface-panel` retained as a deprecated compatibility marker;
- all-surface direct-child/no-nested-card tests;
- Playwright evidence posture that records shell-main ownership;
- committed live evidence package `surface-smoke-1778249836440`;
- intentional package/manifest baseline `1.0.0.18`.

The handoff inventory must align with that baseline and must not treat card-level active-panel markers as semantic ownership.

The existing Wave B8 package path also exists for:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/
```

That package is for `Phase 03 — Conditional Command Header Content`. Its README states that duplicate/header-like cards remain as later handoff/removal items. This Prompt 07 should create the standalone inventory that makes that later removal phase executable.

## Scope Control

This prompt is documentation-only.

Do not:

- edit `apps/project-control-center/src/**/*`;
- edit `e2e/pcc-live/**/*`;
- edit unit/component tests;
- edit package files, manifests, package-solution, or `pnpm-lock.yaml`;
- edit committed live evidence artifacts;
- remove or demote any bento card;
- remove or demote card-level `dataActiveSurfacePanel` markers;
- introduce command-header runtime behavior;
- introduce a Modules launcher;
- create a new Playwright evidence directory;
- update Wave B8 prompts, README, or manifest unless explicitly instructed by the user after this handoff is created;
- run broad formatting over the repo.

## Required Repo-Truth Checks Before Writing the Handoff

### 1. Confirm clean local baseline

Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Report:

- branch;
- HEAD SHA;
- dirty files;
- lockfile hash.

Hard stop if any unexpected dirty files exist in:

```text
apps/project-control-center/src/**/*
e2e/pcc-live/**/*
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/**/manifest.json
package.json
pnpm-lock.yaml
docs/architecture/evidence/pcc-live/**/*
playwright-report/**/*
test-results/**/*
**/.auth/**/*
**/.e2e-auth/**/*
**/*storage-state*
**/*trace*
**/*video*
**/*.har
```

### 2. Confirm Phase 2 closeout source of truth

Inspect:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b7/closeout/Phase_2_Shell_Header_Consolidation_Closeout.md
```

Confirm the closeout states:

- shell `<main role="tabpanel">` is semantic active-panel owner;
- card-level marker is a deprecated compatibility marker;
- duplicate bento header/top-level cards remain deferred;
- compatibility marker removal is deferred;
- package/manifest baseline is intentionally `1.0.0.18`;
- live evidence package is `surface-smoke-1778249836440`.

### 3. Confirm Wave B8 package path and phase boundary

Inspect:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/README.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/Implementation_Plan.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/PACKAGE_MANIFEST.md
```

Confirm whether Wave B8 already frames:

- Phase 03 as conditional command-header content;
- duplicate/header-card removal as a later handoff / Phase 04 item;
- `surfaceHeaderMetadata.ts` as the current metadata source of truth;
- no duplicate-card runtime removal in Phase 03.

Do not modify these files in Prompt 07.

### 4. Inventory current duplicate / header-like card candidates

Run targeted searches:

```bash
rg -n "dataActiveSurfacePanel|data-pcc-active-surface-panel|Project Intelligence|HeaderCard|OverviewCard|LaunchPadHeaderCard|PccDocumentsHeaderCard|PccTeamAccessHeaderCard|PccSiteHealthOverviewCard|PccControlCenterSettingsSurface|ReadinessHeroSlot|HomeCard" apps/project-control-center/src/surfaces apps/project-control-center/src/tests e2e/pcc-live --glob '!**/node_modules/**'
```

Then inspect all candidate production files:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx

apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx

apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessLaneShell.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx

apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx

apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx

apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx

apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx

apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
```

If a listed file is absent or renamed, report the actual repo-truth path/name. Do not invent a component.

### 5. Inventory test/e2e dependency impact

Inspect/search at least:

```text
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.hierarchy.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

For each candidate card, identify whether tests currently depend on:

- component existence;
- title text;
- `data-pcc-active-surface-panel` card-level compatibility marker;
- heading level;
- tier / region / footprint;
- card count;
- card order / first-fold composition;
- command-card posture;
- direct bento-child invariant;
- Playwright broad compatibility selector;
- Playwright shell-owner selector.

## Expected File

Create exactly one handoff document:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/handoff/Phase_04_Duplicate_Header_Card_Removal_Handoff_Inventory.md
```

Create the `handoff/` directory if it does not exist.

Expected source/test/e2e edits: **none**.

Do not edit:

```text
apps/project-control-center/src/**/*
e2e/pcc-live/**/*
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/**/manifest.json
package.json
pnpm-lock.yaml
docs/architecture/evidence/pcc-live/**/*
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/README.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/PACKAGE_MANIFEST.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/Implementation_Plan.md
```

## Handoff Document Required Structure

Create the document with these sections:

```markdown
# Phase 04 Duplicate Header Card Removal Handoff Inventory

## 1. Objective

## 2. Source Baseline

## 3. Phase Boundary

## 4. Duplicate / Header-Like Card Inventory

## 5. Content Relocation Map

## 6. Operational Content Preservation Matrix

## 7. Test Impact Inventory

## 8. Playwright / Evidence Impact Inventory

## 9. Recommended Removal / Migration Sequence

## 10. Hard Stops for Phase 04

## 11. Validation Requirements for Removal Phase

## 12. Deferred Questions / Follow-Up Checks
```

### 1. Objective

State that this document inventories duplicate/header-like bento cards and maps content/test/e2e impacts for a later removal/demotion phase. It does not authorize runtime removal by itself.

### 2. Source Baseline

Include:

- branch and HEAD;
- Phase 2 closeout path;
- Wave B8 package path;
- package/manifest baseline `1.0.0.18`;
- lockfile hash;
- note that no source/test/e2e files are changed by Prompt 07.

### 3. Phase Boundary

State:

- Phase 03 / Wave B8 may enrich conditional command-header metadata/content.
- Phase 04 removes or demotes duplicate bento header cards only after the header has absorbed equivalent content.
- Card-level `data-pcc-active-surface-panel` is still a compatibility marker until tests/e2e/evidence are updated.
- Broad marker count currently equals two in shell-rendered trees:
  - shell main;
  - one direct bento-child compatibility command card.
- Runtime removal must update tests/e2e/evidence in lockstep.

### 4. Duplicate / Header-Like Card Inventory

Provide one row per candidate card/component.

Required columns:

```text
Surface ID
Surface Label
Candidate Component
Source Path
Current Card Title
Current Eyebrow
Current Footprint
Current Hierarchy
Current Tier
Current Region
Heading Level
Current dataActiveSurfacePanel Value
First / Command Card?
Current Visible Content
Duplicate Classification
Operational Content Risk
Recommended Future Disposition
```

Use these duplicate classifications only:

```text
Pure shell-duplicate
Partial duplicate with operational summary
Operational card; not removal-ready
State/degraded branch carrier
Unknown — requires follow-up
```

Expected candidates to inventory at minimum:

```text
project-home — PccProjectIntelligenceCard
documents — PccDocumentsHeaderCard
team-and-access — PccTeamAccessHeaderCard
project-readiness — ReadinessHeroSlot / HeroCard plus loading/error variants
approvals — HomeCard plus loading/error variants
external-systems — PccExternalSystemsLaunchPadHeaderCard plus loading/error variants
control-center-settings — first command card in PccControlCenterSettingsSurface
site-health — PccSiteHealthOverviewCard
```

If repo truth reveals `PccExternalSystemsHeaderCard` is unused, document that explicitly as an unused/legacy candidate rather than treating it as active runtime inventory.

### 5. Content Relocation Map

For each candidate, map each visible content unit into one of these future destinations:

```text
Command header title/subtitle
Command header summary item
Command header cue/read-only cue
Command header status/fact
Retain as operational bento card
Move to existing operational bento card
Move to future module launcher / gateway
Move to source/evidence card
Drop after duplicate proof
Do not move — operational content
```

Required columns:

```text
Surface ID
Candidate Component
Content Unit
Current Source
Future Destination
Required Metadata Field / Target Component
Migration Precondition
Removal-Safe After?
Notes
```

### 6. Operational Content Preservation Matrix

This section must prevent destructive removal.

Required columns:

```text
Surface ID
Candidate Component
Operational Content Present?
Operational Content Description
Can Be Recreated from Existing Header Metadata?
Can Be Recreated from Existing Read Model / Fixture?
Must Remain as Bento Card Until...
Loss Risk
Recommended Protection Test
```

Examples:

- Project Home `Project Intelligence` includes project facts and command summary chips; do not classify it as purely duplicative unless the header or another card preserves those facts/chips.
- Site Health `Overview` includes severity/check metrics; do not remove until those metrics are represented in shell metadata/header or retained elsewhere.
- Approvals `HomeCard` includes approval counts and state/mode summaries; do not remove until those operational summaries are preserved.
- Project Readiness hero includes readiness posture/blocker/evidence summary content; do not remove until equivalent summary content is preserved.
- Documents and Team & Access header cards may be closer to pure duplicate, but verify read-model loading/error/source-unavailable behavior before marking removal-safe.

### 7. Test Impact Inventory

For each candidate card, list all known test impacts.

Required columns:

```text
Surface ID
Candidate Component
Impacted Test File
Current Assertion / Dependency
Why It Breaks If Removed
Required Test Update
Removal Prompt
```

At minimum, cover:

- `PccSurfaceCommandCardContract.test.tsx`;
- `PccCardTierContract.test.tsx`;
- `PccApp.bentoIntegration.test.tsx`;
- `PccShell.navigation.test.tsx`;
- `PccShell.surfaceSmoke.test.tsx`;
- Project Home tests;
- Project Readiness tests;
- any surface-specific tests found by search.

Also include the known cleanup item:

```text
PccCardTierContract.test.tsx has a stale top-of-file comment claiming project-readiness is excluded from the generic loop even though current IN_SCOPE_SURFACES includes project-readiness. Correct this only when that file is next touched.
```

### 8. Playwright / Evidence Impact Inventory

Document impact on:

```text
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
docs/architecture/evidence/pcc-live/surface-smoke-1778249836440/
```

Required conclusions:

- Current broad selector remains compatible because card marker exists.
- When card marker is removed, `activePanelCount` should fall from `2` to `1`.
- Shell-specific selector should remain stable.
- `passed` logic may continue using broad selector only if shell main remains broad selector match.
- Evidence markdown/JSON expectations must be updated to reflect the new post-removal count.
- A fresh live evidence package is required after runtime removal.
- Do not edit historical evidence; add a new evidence package for the removal phase.

### 9. Recommended Removal / Migration Sequence

Provide a sequenced plan with one prompt per logical tranche. Use this sequence unless repo truth proves a different order is safer:

1. **Phase 04 Prompt 00 — Repo baseline and inventory verification**
   - no edits;
   - re-validate this handoff against current main.
2. **Phase 04 Prompt 01 — Header metadata/content completion**
   - fill missing command-header metadata before removal.
3. **Phase 04 Prompt 02 — Documents + Team & Access pure duplicate removal**
   - likely lowest operational-content risk.
4. **Phase 04 Prompt 03 — External Systems header-card demotion/removal**
   - preserve launch/context copy and no-false-affordance posture.
5. **Phase 04 Prompt 04 — Settings + Site Health overview migration**
   - protect Site Health severity/check metrics.
6. **Phase 04 Prompt 05 — Project Readiness + Approvals command-card migration**
   - highest operational-content risk; preserve counts/posture/gate data.
7. **Phase 04 Prompt 06 — Project Home first-fold / Project Intelligence migration**
   - highest first-fold UX impact; preserve project facts and command-summary chips.
8. **Phase 04 Prompt 07 — Test/e2e/evidence posture update**
   - broad count expectations, card marker removal, Playwright evidence.
9. **Phase 04 Prompt 08 — Live tenant evidence and closeout**
   - fresh `.sppkg`/tenant run only when operator-approved.

For each prompt, include:

```text
Objective
Expected files
Tests to update
Hard stops
Validation
```

### 10. Hard Stops for Phase 04

List:

- no loss of operational content;
- no card removal before equivalent header metadata or retained card exists;
- no direct-child regression;
- no nested-card regression;
- no false affordances;
- no live writeback / tenant mutation;
- no package/lockfile/manifest drift unless explicitly authorized;
- no historical evidence edits;
- no Playwright/evidence count update without corresponding runtime change;
- no shell active-panel owner regression;
- no broad selector count-of-one assumption until card marker removal lands.

### 11. Validation Requirements for Removal Phase

Specify future validation gate for actual runtime removal prompts:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

For prompts that touch `e2e/pcc-live/**`, include targeted Playwright spec validation. For prompts that remove card markers or change runtime selector posture, require a fresh operator-approved live evidence package.

### 12. Deferred Questions / Follow-Up Checks

Include only items that cannot be closed from repo truth. Examples:

- Does the next phase want command header metadata to absorb operational counts, or should some cards be retained as operational summary cards?
- Should Project Home `Project Intelligence` be removed entirely or split into a slimmer operational facts card?
- Should Site Health overview metrics become header summary items or stay as first operational card?
- Should Approvals and Project Readiness command cards be deferred until their richer counts/posture are represented elsewhere?
- Should evidence artifact paths be made repo-relative before the next live evidence run?

Do not leave path/location, validation, or source-of-truth decisions open.

## Required Validation for Prompt 07

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/handoff/Phase_04_Duplicate_Header_Card_Removal_Handoff_Inventory.md
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Run app tests only if runtime/test/e2e files were changed. This prompt should normally be docs-only, so app tests should not be required.

Before commit, run:

```bash
git diff --cached --name-only
```

Confirm exactly one staged file:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/handoff/Phase_04_Duplicate_Header_Card_Removal_Handoff_Inventory.md
```

## Required Plan Response Format

Before execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Proposed

## Inventory Method

## Handoff Document Plan

## Validation Plan

## Package / Lockfile / Manifest Posture

## Risks / Open Items
```

## Required Following-Execution Response Format

After execution, respond with:

```markdown
## Objective

## Repo-Truth Checks Performed

## Files Changed

## Handoff File Created

## Duplicate Header Card Inventory Summary

## Test / E2E Impact Summary

## Recommended Phase 04 Prompt Sequence

## Validation Run

## Package / Lockfile / Manifest Posture

## Residual Risks

## Next Prompt Status
```

## Completion Standard for Prompt 07

Prompt 07 is complete only when:

- a single handoff document is created at the expected Wave B8 handoff path;
- all eight current PCC surfaces are inventoried;
- every current active-surface compatibility card candidate is classified;
- content relocation is mapped without losing operational content;
- test impacts are mapped by file;
- Playwright/evidence impacts are mapped;
- a sequenced Phase 04 prompt plan is included;
- hard stops and validation gates are included;
- no production source files are edited;
- no test/e2e files are edited;
- no package/manifest/package-solution/lockfile files are edited;
- no committed evidence artifacts are edited;
- validation passes or any skipped checks are explicitly explained.
