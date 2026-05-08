# Prompt 01 — Duplicate Header Card Inventory and Execution Plan

## Objective

Conduct the current repo-truth inventory for **Phase 04 — Remove Duplicate Top-Level Surface Header Cards** before any runtime edits. Produce a precise, evidence-backed execution plan that confirms exact removal, demotion, retention, and content-preservation sequencing for later Phase 04 prompts.

This prompt is a **planning / inventory / verification gate only**. Do **not** modify runtime code, tests, Playwright files, docs, package files, lockfiles, manifests, or evidence artifacts during Prompt 01.

---

## Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package, prior summaries, or old handoff notes where live files contradict them. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, tab/tabpanel accessibility, shell-owned active-panel semantics, and package/lockfile/manifest safety.

Do not implement any of the following during Prompt 01:

- runtime source edits;
- test edits;
- Playwright/evidence edits;
- duplicate-card removal;
- card demotion or reordering;
- Project Home `Project Intelligence` extraction;
- Phase 05 module launcher;
- Phase 06 Project Home bento composition realignment;
- URL routing;
- command routing;
- active module state;
- live integrations;
- writeback;
- broad visual redesign;
- package dependency changes;
- SPFx package/manifest version changes.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

---

## Governing Phase 04 Constraint

Protect this outcome:

```text
The PCC bento surfaces must no longer begin with duplicate title/description-only header cards, while shell-owned active-panel semantics, tab accessibility, bento direct-child layout, operational content, read-only/source-authority boundaries, and package/lockfile/manifest safety remain intact.
```

Prompt 01 exists to prove the repo is ready for the later implementation prompts. It must not itself implement those changes.

---

## Required Repo-Truth Baseline

Before producing the plan, run and record:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Then inspect and record the current PCC package posture from:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Record, at minimum:

- `solution.version`;
- `solution.features[0].version`;
- web part manifest `version`;
- whether `pnpm-lock.yaml` changed before this prompt began;
- whether the repo had unrelated dirty files before this prompt began.

Hard stop if the repo is dirty in files that overlap this Phase 04 package unless the dirty files are known, intentional, and called out in the plan.

---

## Required Reads

Inspect current files before producing the plan:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/surfaces/externalSystems/
apps/project-control-center/src/surfaces/controlCenterSettings/
apps/project-control-center/src/surfaces/siteHealth/
apps/project-control-center/src/tests/
e2e/pcc-live/
playwright.pcc-live.config.ts
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Evidence_Taxonomy.md
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/handoff/Phase_04_Duplicate_Header_Card_Removal_Handoff_Inventory.md
```

---

## Required Searches

Run targeted searches and include the exact matched files in the plan.

```text
HeaderCard
dataActiveSurfacePanel
data-pcc-active-surface-panel
[data-pcc-card][data-pcc-active-surface-panel
main[role="tabpanel"]
role="tabpanel"
aria-labelledby
aria-controls
tier="tier1"
region="command"
headingLevel={2}
Project Intelligence
Document Control Center
Team & Access Center
External Systems Launch Pad
Launch links open the source system in a new tab
Site Health Overview
PccProjectIntelligenceCard
PccDocumentsHeaderCard
PccTeamAccessHeaderCard
PccExternalSystemsLaunchPadHeaderCard
PccExternalSystemsHeaderCard
PccSiteHealthOverviewCard
PccSurfaceCommandCardContract
PccCardTierContract
PccApp.bentoIntegration
PccShell.navigation
PccShell.surfaceSmoke
pcc-live.surface-smoke
pcc-live.page-object
pcc-live.screenshot
pcc-live.content
pcc-live.workflow
pcc-live.surface-blocks
```

---

## Shell / Header Verification Requirements

Confirm the current shell/header contract before classifying cards.

Your output must state:

1. Whether shell `main[role="tabpanel"]` owns `data-pcc-active-surface-panel={activeSurfaceId}`.
2. Whether `main` has stable `id="pcc-active-surface-panel"`.
3. Whether `main[role="tabpanel"]` keeps `aria-labelledby={pcc-tab-${activeSurfaceId}}`.
4. Whether every `PccHorizontalTabs` tab has:
   - `role="tab"`;
   - `aria-selected`;
   - stable `id`;
   - `aria-controls` pointing to the panel id.
5. Whether `PccProjectHeroBand` renders:
   - active surface title;
   - active surface description;
   - `surfaceSummaryItems`;
   - `surfaceCues`;
   - `readOnlyCue`;
   - project facts;
   - command search.
6. Whether `deriveShellHeroViewModel` reads from `PCC_SHELL_SURFACE_HEADER_METADATA`.
7. Whether `PCC_SHELL_SURFACE_HEADER_METADATA` has exhaustive entries for all eight MVP surfaces.
8. Whether current header content is sufficient to absorb title/description-only duplicate cards.
9. Whether any surface still needs additional header content before card removal.

Hard stop if Phase 2/3 shell/header posture is not confirmed.

---

## Required Duplicate / Header-Like Card Inventory

Produce an inventory table for all eight MVP surfaces.

For each surface, include:

| Field                                  | Required Detail                                                      |
| -------------------------------------- | -------------------------------------------------------------------- |
| Surface ID                             | Exact `PccMvpSurfaceId`                                              |
| Surface label                          | Current display label                                                |
| First bento card component             | Exact component name                                                 |
| Source path                            | Exact file path                                                      |
| Render path                            | Fixture, read-model, loading, error, ready, or mixed                 |
| Current title                          | Visible card title                                                   |
| Current eyebrow                        | Visible eyebrow                                                      |
| Footprint                              | Current `footprint`                                                  |
| Hierarchy                              | Current `hierarchy`, if any                                          |
| Tier                                   | Current `tier`                                                       |
| Region                                 | Current `region`                                                     |
| Heading level                          | Current `headingLevel`                                               |
| Carries `dataActiveSurfacePanel`       | yes/no and value                                                     |
| Pure duplicate?                        | yes/no/partial                                                       |
| Operational content present?           | none/low/medium/high                                                 |
| Operational content details            | Exact facts, counts, cues, metrics, source context, degraded context |
| Proposed Phase 04 disposition          | remove / retain / demote / relocate / defer                          |
| Removal preconditions                  | Exact preconditions                                                  |
| Tests expected to change               | Exact test files                                                     |
| Playwright/evidence expected to change | Exact files, or `none confirmed`                                     |
| Phase 05/06 handoff note               | Any item deferred beyond Phase 04                                    |

Inventory must include, at minimum:

```text
PccProjectIntelligenceCard
PccTeamAccessHeaderCard
PccDocumentsHeaderCard
ReadinessHeroSlot / readiness state cards
Approvals HomeCard / approvals state cards
PccExternalSystemsLaunchPadHeaderCard
PccExternalSystemsHeaderCard if present
Control Center Settings first command card
PccSiteHealthOverviewCard
```

---

## Required Remove / Retain / Relocate Matrix

Produce a second matrix that classifies every candidate as one of:

```text
REMOVE IN PHASE 04
REMOVE ONLY AFTER CONTENT RELOCATION
RETAIN AS OPERATIONAL CARD
RETAIN STATE/DEGRADED CARD
DEFER TO PHASE 05
DEFER TO PHASE 06
DELETE UNUSED LEGACY FILE ONLY AFTER IMPORT PROOF
```

Use these binding starting assumptions unless current repo truth proves otherwise:

- `PccTeamAccessHeaderCard`: likely pure duplicate; removal candidate.
- `PccDocumentsHeaderCard`: likely duplicate but dynamic cue/state copy must be preserved.
- Control Center Settings first command card: likely pure duplicate; removal candidate.
- `PccProjectIntelligenceCard`: operational content; do not destructively remove unless facts/counts have a verified home.
- Project Readiness `ReadinessHeroSlot`: operational/state content; retain unless a replacement card/header content is explicitly implemented later.
- Approvals `HomeCard`: operational metrics/state/mode content; retain.
- `PccExternalSystemsLaunchPadHeaderCard`: partial duplicate; subtitle and launch cue must be relocated before removal.
- `PccSiteHealthOverviewCard`: operational metrics; retain or relocate metrics before removal.
- `PccExternalSystemsHeaderCard`: if unused, may be later deleted only after import proof.

---

## Operational Content Preservation Requirements

Your plan must explicitly protect the following content.

### Project Home

Do not approve later removal of `PccProjectIntelligenceCard` unless the plan identifies where each item remains visible:

- Project stage/status/type pills;
- high-priority action count;
- pending approvals count;
- blocking setup gaps count;
- source label;
- HBI advisory/no-writeback cue;
- client;
- location;
- estimated value;
- scheduled completion.

### Project Readiness

Do not approve destructive removal of readiness hero/state cards unless these remain visible:

- active gate;
- overall posture;
- blocker count;
- evidence confidence;
- source-health badges;
- read-only badge text;
- no-execution caption;
- loading/error `PccSurfaceContextHeader` posture context.

### Approvals

Do not approve destructive removal of approvals home/state cards unless these remain visible:

- total requests;
- pending/active count;
- terminal count;
- escalated count;
- state counts;
- mode counts;
- loading/error `PccSurfaceContextHeader` posture context.

### External Systems

Do not approve removal of the Launch Pad header until these remain visible:

- `header.subtitle`;
- launch cue: `Launch links open the source system in a new tab.`;
- loading/error state-card posture.

### Site Health

Do not approve destructive removal of `PccSiteHealthOverviewCard` unless these remain visible:

- overall severity;
- failing checks;
- warnings;
- last run timestamp;
- scan/repair admin-tooling cue.

---

## Test Impact Inventory Requirements

Produce a test impact table with exact current assertions and required future migration for, at minimum:

```text
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccApprovalsSurface*.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
```

For each test file, state:

- whether it currently depends on card-level `data-pcc-active-surface-panel`;
- whether it asserts compatibility card uniqueness;
- whether it asserts first-card text/title;
- whether it protects operational content;
- whether it protects direct-child bento layout;
- required future change;
- which later Phase 04 prompt should change it.

Also identify stale comments or assertions that should be corrected later, especially comments that still describe card-level ownership as the active-panel contract.

---

## Playwright / Evidence Selector Inventory Requirements

Prompt 01 must inspect Playwright and evidence files. Produce a table for files under:

```text
e2e/pcc-live/
```

and include any relevant config/script references from:

```text
playwright.pcc-live.config.ts
package.json
```

For each relevant Playwright/evidence file, state:

- whether it queries `data-pcc-active-surface-panel`;
- whether it scopes to `main[role="tabpanel"]`;
- whether it queries `[data-pcc-card][data-pcc-active-surface-panel]`;
- whether it assumes one compatibility command card per surface;
- whether it captures first-card/title evidence that will change after removal;
- whether Phase 04 should update it;
- whether live evidence must be rerun after the later implementation prompt.

If no e2e selectors are impacted, prove that with exact search results and state `none confirmed`.

---

## Direct-Child Bento Invariant Requirements

Confirm the current direct-child contract and state how later prompts must preserve it.

The Prompt 01 plan must explicitly prohibit:

- wrappers between `PccBentoGrid` and `PccDashboardCard`;
- nested `[data-pcc-card]`;
- replacing direct bento cards with a generic surface container;
- removing a first card in a way that leaves a surface with zero bento cards;
- changing `PccBentoGrid` or `PccDashboardCard` unless current repo truth proves it is necessary and tests are updated.

---

## Required Output Before Later Edits

Produce a structured plan using this exact format:

```markdown
# Prompt 01 Plan — Phase 04 Duplicate Header Card Inventory

## 1. Repo Baseline

- Branch:
- HEAD:
- git status:
- pnpm-lock hash before:
- package-solution path:
- solution.version:
- feature.version:
- webpart manifest version:
- Package/lockfile/manifest drift expected in Phase 04:

## 2. Shell / Header Contract Verification

- Shell active-panel owner:
- Active panel id:
- `aria-labelledby` posture:
- Tab `aria-controls` posture:
- Hero summary/cues/read-only rendering:
- View-model metadata source:
- Header metadata exhaustiveness:
- Phase 2/3 prerequisite status:

## 3. Current Broad Active-Panel Marker Expectation

- Expected shell marker count:
- Expected card-level compatibility marker count:
- Expected broad `[data-pcc-active-surface-panel]` count in shell-rendered trees:
- Surfaces currently carrying card-level compatibility markers:

## 4. Duplicate / Header-Like Card Inventory

<full table>

## 5. Remove / Retain / Relocate Matrix

<full table>

## 6. Operational Content Preservation Plan

- Project Home:
- Team & Access:
- Documents:
- Project Readiness:
- Approvals:
- External Systems:
- Control Center Settings:
- Site Health:

## 7. Unit / Component Test Impact Inventory

<full table>

## 8. Playwright / Evidence Selector Inventory

<full table>

## 9. Prompt-by-Prompt Execution Sequencing

- Prompt 02:
- Prompt 03:
- Prompt 04:
- Prompt 05:
- Prompt 06:

## 10. Validation Plan for Later Prompts

- Required commands:
- Conditional Playwright commands:
- Evidence output expectations:
- Package/lockfile/manifest checks:

## 11. Risks / Rollback Plan

- Primary risks:
- Rollback plan:
- Files not to touch:
- Hard stops for later prompts:

## 12. Recommendation

Approved to proceed to Prompt 02 / Approved with refinements / Do not proceed yet
```

---

## Required Validation Commands for Prompt 01

Because Prompt 01 is planning-only, run only non-mutating validation/search commands unless local repo policy requires otherwise.

Required:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Optional but recommended if quick:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- --runInBand
```

If the optional test command is invalid for Vitest or this workspace, do not invent a passing result. Record the attempted command, the failure reason, and the corrected command you recommend for later prompts.

Do not run Playwright during Prompt 01 unless specifically instructed by the user. This prompt inventories Playwright selector impact; later prompts rerun live evidence when runtime selectors/structure change.

---

## Hard Stops

Do not proceed to later prompts if:

- shell `main[role="tabpanel"]` does not own `data-pcc-active-surface-panel`;
- `PccProjectHeroBand` does not render Phase 3 surface summary/cues/read-only content;
- `deriveShellHeroViewModel` is not connected to `PCC_SHELL_SURFACE_HEADER_METADATA`;
- Phase 04 handoff inventory is missing and no replacement inventory is created;
- tests currently depending on card-level active-panel markers cannot be identified;
- Playwright/evidence selector impact cannot be determined;
- any candidate card’s operational content cannot be classified;
- Project Home `PccProjectIntelligenceCard` content cannot be preserved or deferred safely;
- package-solution path cannot be verified;
- repo has unexplained dirty files overlapping Phase 04 scope.

---

## Closeout Instructions for Prompt 01

At the end of Prompt 01:

1. Do not commit unless you created a planning artifact at the user’s explicit instruction.
2. Do not claim Phase 04 implementation completion.
3. Do not claim final scorecard pass.
4. Do not claim Playwright evidence completion.
5. State whether Prompt 02 is safe to execute as written or requires modification.
6. Include exact repo-truth evidence supporting the recommendation.
