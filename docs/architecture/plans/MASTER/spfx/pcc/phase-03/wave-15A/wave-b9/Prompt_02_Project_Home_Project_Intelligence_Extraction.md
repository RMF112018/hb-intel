# Prompt 02 — Metadata Content Decision Gate and External Systems Orphan Audit

## Objective

Execute the Phase 04 Prompt 02 gate created by Prompt 01 closeout.

This prompt is **not** Project Home extraction / demotion. Project Home `PccProjectIntelligenceCard` is retained for now because Prompt 01 classified it as operational/header-hybrid content that must be deferred to Phase 06 Project Home bento composition realignment unless a verified replacement exists.

Prompt 02 must decide how Phase 04 will preserve duplicate-card copy for the surfaces that may be safely removed later, without casually converting the shell header into a read-model-state consumer.

Primary objectives:

1. Verify whether static shell metadata already preserves the copy currently carried by the duplicate / header-like cards targeted for safe removal.
2. Make an explicit content-preservation decision for:
   - Documents;
   - External Systems / External Platforms;
   - Control Center Settings.
3. If static metadata is missing required non-dynamic copy, apply a narrow metadata-only extension in `surfaceHeaderMetadata.ts`.
4. Prove whether `PccExternalSystemsHeaderCard.tsx` is unused legacy code and can be deleted later.
5. Produce a concise execution report that tells the auditor whether Prompt 03 / Prompt 04 can proceed.

---

## Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, tab/tabpanel accessibility, shell-owned active-panel semantics, read-only/no-writeback posture, and package/lockfile/manifest safety.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

---

## Scope Correction from Original Prompt 02

The previous Prompt 02 title/scope was:

```text
Project Home Project Intelligence Extraction / Demotion
```

That scope is **not approved for immediate execution** based on Prompt 01 closeout.

Do **not** remove, demote, rename, restructure, or restyle:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
```

Do **not** remove `Project Intelligence` from Project Home tests during this prompt.

Do **not** remove the Project Home `Document Control Center` operational-card assertion unless repo truth proves it is incorrectly coupled to a removed Documents-surface header card. The expected default posture is that Project Home’s `Document Control Center` is an operational card and remains in scope.

---

## Authorized Work

Prompt 02 may perform only these actions:

1. Current repo-truth verification.
2. Static metadata/copy comparison.
3. Workspace-wide import/use audit for `PccExternalSystemsHeaderCard`.
4. Narrow metadata-only changes in `apps/project-control-center/src/shell/surfaceHeaderMetadata.ts`, **only if** required to preserve static copy before later duplicate-card removal.
5. Targeted tests for shell metadata / hero rendering, **only if** metadata is changed.
6. Prettier / typecheck / unit test validation as applicable.
7. A concise execution report.

Prompt 02 must not remove any duplicate/header card. Runtime duplicate-card removal belongs to a later prompt.

---

## Prohibited Work

Do not implement:

- Project Home `Project Intelligence` extraction or demotion;
- Documents header card removal;
- Team & Access header card removal;
- External Systems Launch Pad header card removal;
- Control Center Settings first-card removal;
- Site Health Overview demotion;
- Readiness Hero demotion;
- Approvals Home demotion;
- Phase 05 module launcher;
- Phase 06 Project Home bento composition realignment;
- URL routing;
- command routing;
- active module state;
- read-model-state-aware shell header behavior, unless explicitly authorized by a future prompt;
- live integrations;
- writeback;
- broad visual redesign;
- global footprint changes;
- package/manifest/version bumps;
- dependency changes;
- lockfile changes;
- Playwright/evidence file edits.

---

## Required Baseline Commands

Run and record:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Inspect and record current PCC package posture:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Record:

- branch;
- HEAD;
- working tree status;
- lockfile MD5;
- `solution.version`;
- `solution.features[0].version`;
- webpart manifest `version`;
- whether any package/manifest/lockfile drift is expected.

Expected baseline from Prompt 01 closeout:

```text
Branch: main
HEAD: 15626428d4fad02194e3ed56a120f5883eab86b7
PCC solution.version: 1.0.0.19
PCC feature.version: 1.0.0.19
PCC webpart manifest version: 1.0.0.19
pnpm-lock.yaml MD5: 00570e10e3dc9015188ba503ea996943
```

If current repo truth differs, record the difference and continue only if it does not invalidate Phase 04 scope.

---

## Required Reads

Inspect current files before deciding:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/launchPadViewModel.ts
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell*.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/handoff/Phase_04_Duplicate_Header_Card_Removal_Handoff_Inventory.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/closeout/Phase_03_Conditional_Command_Header_Content_Closeout_And_Phase_04_Handoff.md
docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md
```

Do not edit Project Home files during this prompt.

---

## Required Searches

Run and record relevant results:

```bash
rg -n "PccExternalSystemsHeaderCard" .
rg -n "PccDocumentsHeaderCard|cueFor\\(|Document control is temporarily unavailable|No document control sources are available|Document control shows three lanes|Loading document control content" apps/project-control-center/src
rg -n "PccExternalSystemsLaunchPadHeaderCard|Launch links open the source system in a new tab|header\\.subtitle|External Systems|External Platforms|Launch Pad" apps/project-control-center/src
rg -n "Saving, updating, and tenant changes are managed by your PCC administrator|Control Center Settings|settings-boundary|settings-posture" apps/project-control-center/src
rg -n "deriveShellHeroViewModel|surfaceSummaryItems|surfaceCues|readOnlyCue|PCC_SHELL_SURFACE_HEADER_METADATA" apps/project-control-center/src
rg -n "data-pcc-active-surface-panel|dataActiveSurfacePanel|\\[data-pcc-card\\]\\[data-pcc-active-surface-panel" apps/project-control-center/src e2e/pcc-live
```

The `PccExternalSystemsHeaderCard` audit must distinguish self-reference from actual imports/usage.

---

## Required Content-Decision Gate

For each surface below, choose exactly one decision path and explain why.

### Decision Path A — Static shell metadata is sufficient

Use when the doomed duplicate/header card only contains static copy that already exists in:

```text
PCC_SHELL_SURFACE_HEADER_METADATA
PCC_SURFACE_HERO_DESCRIPTIONS
PccProjectHeroBand rendered summary/cue/read-only regions
```

Requirements:

- identify exact duplicate-card copy;
- identify exact metadata/header destination;
- identify current test coverage proving the copy renders;
- no code change required.

### Decision Path B — Add narrow static metadata

Use when the card carries static copy that should remain visible after later removal, but the copy is missing from metadata.

Requirements:

- edit only `apps/project-control-center/src/shell/surfaceHeaderMetadata.ts`;
- add or adjust static summary/cue/read-only content only;
- update or add targeted unit tests only if needed;
- do not introduce read-model-state-driven header behavior;
- do not change surface runtime composition.

### Decision Path C — Preserve through retained state/operational card

Use when the card carries dynamic read-model state, operational metrics, loading/error branch copy, or view-model-specific content that should not be flattened into static shell metadata.

Requirements:

- do not move this content to static metadata as if it were state-aware;
- identify the retained surface card or future replacement home;
- mark later removal as blocked until the replacement exists;
- do not implement the replacement in Prompt 02.

### Decision Path D — Explicitly defer to later phase

Use when the content is operational/header-hybrid and Prompt 01 deferred it to Phase 06.

Requirements:

- no code change;
- record the defer reason;
- identify the future phase/prompt.

---

## Surface-Specific Requirements

### 1. Documents

Inspect:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
```

Classify each current `cueFor(...)` branch:

```text
Loading document control content.
Document control is temporarily unavailable. Try again later.
No document control sources are available for this project.
Document control shows three lanes for this project.
```

Decision rule:

- Do not claim `deriveShellHeroViewModel` is state-aware. It is static-by-active-surface unless you find current repo truth proving otherwise.
- Do not implement state-aware shell behavior.
- If the loading/error/source-unavailable text is dynamic state copy, use Decision Path C unless a retained state/operational card already preserves it.
- If the default static posture copy is missing from shell metadata, use Decision Path B.

Output must state whether later `PccDocumentsHeaderCard` removal is:

```text
SAFE AFTER STATIC METADATA CONFIRMATION
SAFE ONLY IF STATE COPY IS NOT REQUIRED
BLOCKED UNTIL STATE COPY HAS A NON-HEADER HOME
```

### 2. External Systems / External Platforms

Inspect:

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/launchPadViewModel.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
```

Classify:

```text
header.subtitle
Launch links open the source system in a new tab.
loading/error PccPreviewState header-card branches
```

Decision rule:

- `header.subtitle` is view-model content. Do not flatten it into static metadata unless repo truth proves it is effectively constant and non-state-specific.
- The launch cue may be static and may belong in metadata if missing.
- Loading/error branches are state content and should remain in a retained state/operational branch unless a tested replacement exists.
- Do not remove `PccExternalSystemsLaunchPadHeaderCard` in Prompt 02.

Output must state whether later `PccExternalSystemsLaunchPadHeaderCard` removal is:

```text
SAFE AFTER LAUNCH CUE METADATA CONFIRMATION
SAFE ONLY AFTER SUBTITLE HAS A RETAINED HOME
BLOCKED UNTIL VIEW-MODEL CONTENT HAS A NON-HEADER HOME
```

### 3. Control Center Settings

Inspect:

```text
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
```

Classify:

```text
Saving, updating, and tenant changes are managed by your PCC administrator.
Settings overview
Control Center Settings
```

Decision rule:

- This is likely static duplicate/advisory copy.
- If shell metadata already includes equivalent settings governance/read-only copy, use Decision Path A.
- If not, use Decision Path B.
- Do not remove the inline settings overview card in Prompt 02.

Output must state whether later removal is:

```text
SAFE AFTER STATIC METADATA CONFIRMATION
BLOCKED UNTIL ADMIN/GOVERNANCE COPY IS IN SHELL METADATA
```

### 4. External Systems Legacy Header Orphan

Inspect:

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx
```

Run workspace-wide usage search:

```bash
rg -n "PccExternalSystemsHeaderCard" .
```

Output:

- all hits;
- whether hits are self-file only;
- whether any tests import it;
- whether any barrel export references it;
- whether later deletion is safe.

Do not delete it in Prompt 02. Deletion belongs to the later runtime removal prompt after audit approval.

---

## Metadata Edit Rules

If metadata edits are required:

1. Edit only:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```

2. Preserve existing types:

```text
IPccShellSurfaceHeaderMetadata
IPccShellSurfaceSummaryItem
IPccShellSurfaceCue
PccShellSurfaceSummaryTone
```

3. Do not add dynamic/read-model-state fields.
4. Do not import surface view-models into shell metadata.
5. Do not create a dependency from shell to surface read-models.
6. Keep cues concise and non-operational.
7. Preserve HBI/no-authority/read-only language.
8. Preserve no live URL/no writeback/no approval/no sync/no repair posture.
9. If metadata labels or IDs change, update targeted hero/metadata tests in the same prompt.
10. Do not touch shell layout, hero structure, tabs, router, bento grid, or dashboard card primitives.

---

## Required Output

Produce this execution report:

```markdown
# Prompt 02 Execution Report — Metadata Content Decision Gate and Orphan Audit

## 1. Repo Baseline
- Branch:
- HEAD:
- git status before:
- pnpm-lock hash before:
- package-solution path:
- solution.version:
- feature.version:
- webpart manifest version:
- Drift expected:

## 2. Prompt 01 Refinement Compliance
- Project Home extraction/demotion avoided:
- Static-by-active-surface shell contract preserved:
- No read-model-state-aware shell conversion:
- Vitest validation command corrected:
- No Playwright/evidence edits:
- No package/manifest/lockfile edits:

## 3. Documents Content Decision
- Current duplicate-card copy:
- Current shell metadata/header coverage:
- Decision path:
- Metadata edits made:
- Later removal status:
- Remaining risks:

## 4. External Systems Content Decision
- Current Launch Pad header copy:
- Current shell metadata/header coverage:
- `header.subtitle` classification:
- Launch cue classification:
- Loading/error classification:
- Decision path:
- Metadata edits made:
- Later removal status:
- Remaining risks:

## 5. Control Center Settings Content Decision
- Current overview-card copy:
- Current shell metadata/header coverage:
- Decision path:
- Metadata edits made:
- Later removal status:
- Remaining risks:

## 6. External Systems Legacy Header Orphan Audit
- Search command:
- Hits:
- Non-self imports:
- Test imports:
- Barrel exports:
- Later deletion status:

## 7. Files Changed
- Runtime files:
- Test files:
- Docs:
- Package/manifest/lockfile:

## 8. Validation
- Commands run:
- Results:
- pnpm-lock hash after:
- git status after:

## 9. Prompt 03 / Prompt 04 Readiness
- Prompt 03 readiness:
- Prompt 04 readiness:
- Required refinements before runtime removal:
- Hard stops:
```

---

## Required Validation

Always run after any edits:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If no files are edited, at minimum run and record:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Optional targeted commands if metadata changed and repo time allows:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand
pnpm --filter @hbc/spfx-project-control-center test -- PccShell
```

Do **not** use Jest-only flags such as `--runInBand`.

Do **not** run Playwright during Prompt 02 unless explicitly instructed by the user. Prompt 02 decides metadata/content and orphan status; later prompts rerun live evidence after runtime structure changes.

---

## Hard Stops

Stop and report if:

- repo is dirty before execution in files overlapping Phase 04 scope;
- shell `main[role="tabpanel"]` no longer owns `data-pcc-active-surface-panel`;
- `deriveShellHeroViewModel` is no longer static-by-active-surface;
- `PccProjectHeroBand` no longer renders surface summary/cues/read-only content;
- Documents dynamic cue copy has no retained state/operational home and metadata cannot honestly preserve it;
- External Systems `header.subtitle` is dynamic view-model content with no retained home;
- Control Center Settings governance/admin cue is absent from shell metadata and cannot be added narrowly;
- `PccExternalSystemsHeaderCard` has non-self imports that contradict orphan deletion;
- any validation command changes `pnpm-lock.yaml`;
- package-solution or webpart manifest version drifts;
- Prompt 02 would require runtime surface-card removal to satisfy its objective.

---

## Completion Criteria

Prompt 02 is complete when:

- Documents, External Systems, and Control Center Settings each have an explicit content decision path;
- any required static metadata preservation is complete and tested;
- no read-model-state-aware shell behavior was introduced;
- `PccExternalSystemsHeaderCard` orphan status is proven or blocked;
- no duplicate/header card was removed;
- no Project Home extraction/demotion occurred;
- package/manifest/lockfile posture remains unchanged;
- validation results are recorded;
- the report states whether Prompt 03 / Prompt 04 can proceed and with what refinements.
