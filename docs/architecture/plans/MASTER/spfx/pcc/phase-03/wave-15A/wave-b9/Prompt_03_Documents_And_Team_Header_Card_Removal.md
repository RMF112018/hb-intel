# Prompt 03 — Transitional Test and Selector Contract Preparation

## Objective

Prepare the PCC Phase 04 test and selector contract for later duplicate/header-card removal **without** removing runtime cards yet.

This prompt replaces the prior Prompt 03 scope titled:

```text
Documents and Team Header Card Removal
```

That runtime-removal scope is not approved for Prompt 03. Runtime removal belongs to the next implementation prompt after this transitional test/selector preparation is complete and after the Documents / External Systems gates from Prompt 02 remain visible in the instructions.

Prompt 03 must make the test suite ready for Phase 04 runtime removals while preserving current protections:

- shell `main[role="tabpanel"]` remains the semantic active-surface owner;
- card-level `data-pcc-active-surface-panel` remains a compatibility marker until the relevant runtime card is actually removed;
- bento direct-child invariants remain enforced;
- Documents and Team & Access shell hero content is proven before their duplicate cards are removed;
- Project Home operational card expectations are not weakened;
- no Playwright selector code is edited unless current repo truth proves it is already broken.

---

## Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, tab/tabpanel accessibility, shell-owned active-panel semantics, static-by-active-surface shell metadata, and package/lockfile/manifest safety.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

---

## Current Baseline Assumptions

Prompt 03 starts after Prompt 02 commit:

```text
b4ffa8f76bc89f002ba5d9a8b5d9d2fa8e07a410
```

Known Prompt 02 outcomes:

- Control Center Settings admin attribution is preserved in shell metadata.
- Documents remains Path C:
  - dynamic `cueFor()` loading / error / source-unavailable copy stays off static shell metadata;
  - runtime removal of `PccDocumentsHeaderCard` remains blocked until later prompt proves equivalent state copy is preserved, unreachable, or moved to a retained state card.
- External Systems remains:
  - Path A for static launch cue already in metadata;
  - Path C for `header.subtitle` and loading/error preview-state;
  - Launch Pad header removal remains gated by subtitle/state preservation proof.
- `PccExternalSystemsHeaderCard` is an orphan candidate, but it must not be deleted in Prompt 03.
- Project Home `PccProjectIntelligenceCard` remains deferred to Phase 06 composition realignment.
- No runtime duplicate/header card has been removed yet.

---

## Scope Correction from Original Prompt 03

The previous Prompt 03 directed runtime removal of:

```text
PccDocumentsHeaderCard
PccTeamAccessHeaderCard
```

That is now deferred to Prompt 04.

Prompt 03 may update tests and test helpers, but must not remove or delete runtime files.

---

## Authorized Work

Prompt 03 may perform only these actions:

1. Inspect the current test and Playwright selector posture.
2. Refactor test helpers to distinguish:
   - shell-owned active panel;
   - card-level compatibility marker;
   - direct bento children;
   - current first card;
   - future operational first card after removal.
3. Add or update tests proving shell hero content for Documents and Team & Access is already represented before removal.
4. Add transitional tests that preserve current compatibility-card assertions until runtime removal occurs.
5. Add explicit TODO/removal-readiness comments only where they are directly tied to a later Prompt 04 assertion change.
6. Correct stale comments that describe card-level `data-pcc-active-surface-panel` as the semantic active-panel owner.
7. Verify Project Home’s `Document Control Center` assertion refers to `PccDocumentControlCard` and must not be removed.
8. Produce a report identifying exact Prompt 04 test edits that must happen alongside runtime removal.

Prompt 03 may edit test files only. Runtime source edits are prohibited.

---

## Prohibited Work

Do not:

- remove `PccDocumentsHeaderCard`;
- remove `PccTeamAccessHeaderCard`;
- delete `PccDocumentsHeaderCard.tsx`;
- delete `PccTeamAccessHeaderCard.tsx`;
- delete `PccExternalSystemsHeaderCard.tsx`;
- remove or demote `PccProjectIntelligenceCard`;
- remove `Document Control Center` from Project Home tests unless repo truth proves it is not the Project Home operational card;
- remove compatibility-card uniqueness assertions before runtime removals are made in the same later prompt;
- weaken direct-child bento assertions;
- remove `data-pcc-card` tier/region/footprint/span assertions;
- change `PccShell.tsx`;
- change `PccProjectHeroBand.tsx`;
- change `surfaceHeaderMetadata.ts`;
- change any surface runtime composition file;
- edit Playwright/evidence files unless current repo truth proves a selector is already wrong;
- run Playwright unless explicitly instructed;
- change package, manifest, version, or lockfile files.

---

## Required Baseline Commands

Run and record:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Inspect and record PCC package posture:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Expected baseline:

```text
Branch: main
HEAD: b4ffa8f76bc89f002ba5d9a8b5d9d2fa8e07a410
PCC solution.version: 1.0.0.19
PCC feature.version: 1.0.0.19
PCC webpart manifest version: 1.0.0.19
pnpm-lock.yaml MD5: 00570e10e3dc9015188ba503ea996943
```

If current repo truth differs, record the difference and proceed only if it does not invalidate Phase 04 scope.

---

## Required Reads

Inspect current files before editing:

```text
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.content-capture.ts
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.workflow-capture.ts
```

If `apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx` does not exist, find the current Project Home Document Control card path and report the actual file path.

---

## Required Searches

Run and record relevant results:

```bash
rg -n "data-pcc-active-surface-panel|dataActiveSurfacePanel|\\[data-pcc-card\\]\\[data-pcc-active-surface-panel" apps/project-control-center/src/tests apps/project-control-center/src e2e/pcc-live
rg -n "compatibility command card|compatibility active-panel|active-panel marker|semantic active-panel|shell active panel|main\\[role=\\\"tabpanel\\\"\\]" apps/project-control-center/src/tests
rg -n "Project Intelligence|Document Control Center|PccDocumentControlCard|PccDocumentsHeaderCard|PccTeamAccessHeaderCard" apps/project-control-center/src/tests apps/project-control-center/src/surfaces
rg -n "Documents|Team & Access|data-pcc-hero-surface-summary|data-pcc-hero-surface-cues|data-pcc-hero-read-only-cue" apps/project-control-center/src/tests apps/project-control-center/src/shell
rg -n "PccExternalSystemsHeaderCard|PccExternalSystemsLaunchPadHeaderCard|PccDocumentsHeaderCard|PccTeamAccessHeaderCard" apps/project-control-center/src/tests apps/project-control-center/src
```

---

## Required Test-Posture Decisions

For each file below, choose one of these actions:

```text
NO CHANGE
COMMENT-ONLY CLARIFICATION
HELPER REFACTOR ONLY
ADD TRANSITIONAL ASSERTION
DEFER TO PROMPT 04 RUNTIME-REMOVAL TEST UPDATE
```

### Required test file decisions

```text
PccSurfaceCommandCardContract.test.tsx
PccCardTierContract.test.tsx
PccApp.bentoIntegration.test.tsx
PccShell.navigation.test.tsx
PccShell.surfaceSmoke.test.tsx
PccProjectHome.test.tsx
PccProjectHome.composition.test.tsx
PccProjectReadinessSurface.test.tsx
PccSurfaceContextHeader.contract.test.tsx
PccProjectHeroBand.test.tsx
PccShell.responsive.test.tsx
```

For each file, report:

- current dependency on card-level `data-pcc-active-surface-panel`;
- current shell `main[role="tabpanel"]` assertion coverage;
- current direct-child bento coverage;
- current first-card/title coverage;
- whether editing now would weaken the current runtime contract;
- action selected;
- exact later Prompt 04 change needed.

---

## Required Current-State Protections

Prompt 03 must keep these protections true until runtime removal occurs:

### 1. Shell-owned semantic active panel

Tests must continue to assert:

```text
main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]
id="pcc-active-surface-panel"
aria-labelledby="pcc-tab-<surfaceId>"
```

### 2. Current compatibility-card marker still exists where runtime has not changed

Do **not** delete assertions that require a direct bento-child compatibility card while the relevant runtime card still exists.

If refactoring helpers, preserve the current assertion behavior under a clearer name such as:

```text
getCurrentCompatibilityCommandCard(...)
expectCurrentCompatibilityMarker(...)
```

This is transitional. Prompt 04 will change this only in the same commit as runtime removal.

### 3. Direct-child bento invariant

Tests must continue to assert:

- every `[data-pcc-card]` is a direct child of `[data-pcc-bento-grid]`;
- no nested `[data-pcc-card]`;
- every card has tier/region/footprint/span markers;
- every titled card has `aria-labelledby`.

### 4. Project Home operational card assertions

Prompt 03 must not remove these expectations unless repo truth proves they are wrong:

```text
Project Intelligence
Document Control Center
Priority Actions
Project Readiness
Approvals & Checkpoints
Site Health
Missing Configurations
External Systems
Team Snapshot
Recent Activity
```

Especially verify and report that `Document Control Center` in Project Home refers to the Project Home operational document-control card, not the Documents-surface header card.

### 5. Documents and Team shell hero coverage

Add or verify assertions that selecting `documents` and `team-and-access` shows shell hero content for:

```text
active surface title / secondary title
surface description
surface summary items
surface cues
readOnlyCue
```

This proves header context is already shell-owned before runtime duplicate-card removal.

### 6. No Playwright selector edit unless broken

Based on Prompt 01/02, no Playwright selector edit is expected because live selectors either scope to shell `main` or use broad selectors that still match shell `main`.

Prompt 03 must only edit Playwright files if current repo truth proves a selector is already broken or is explicitly card-scoped in a way that will fail Prompt 04. If edited, explain why this was unavoidable.

---

## Suggested Implementation Shape

Prefer minimal, additive test changes:

### A. Rename/refactor test helper names for clarity if needed

Example:

```ts
getSoleActivePanel(...)
```

may be split conceptually into:

```ts
getShellActivePanel(...)
getCurrentCompatibilityCommandCard(...)
```

Only do this if it improves clarity without weakening assertions.

### B. Add a shell hero coverage test for Documents and Team

The test may live in the most appropriate existing file, such as:

```text
PccProjectHeroBand.test.tsx
PccShell.navigation.test.tsx
PccShell.responsive.test.tsx
```

It should click/select `documents` and `team-and-access` and assert the shell hero has:

```text
data-pcc-hero-secondary-title
data-pcc-hero-surface-description
data-pcc-hero-surface-summary
data-pcc-hero-surface-cues
data-pcc-hero-read-only-cue
```

Do not assert exact long prose unless existing test style already does so. Prefer non-empty content plus known cue IDs where stable.

### C. Preserve existing compatibility-card checks

If a helper currently asserts:

```text
one direct bento-child [data-pcc-card][data-pcc-active-surface-panel="<surfaceId>"]
```

keep that assertion for now. Rename/comment it as a **current compatibility marker** assertion, not the semantic active-panel assertion.

### D. Produce a Prompt 04 test-edit handoff table

This is required even if Prompt 03 only makes small test edits.

The handoff table must identify exactly what Prompt 04 should change once runtime removal happens, especially for:

```text
Documents
Team & Access
Control Center Settings
External Systems Launch Pad
PccExternalSystemsHeaderCard orphan deletion
```

---

## Files Prompt 03 May Edit

Only test files under:

```text
apps/project-control-center/src/tests/
```

Possibly no source files.

Prompt 03 must not edit:

```text
apps/project-control-center/src/shell/**
apps/project-control-center/src/surfaces/**
apps/project-control-center/src/layout/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
pnpm-lock.yaml
package.json
apps/project-control-center/package.json
e2e/pcc-live/**
docs/**
```

Exception: if a test file imports stale symbols from a source file and the test edit requires no source change, proceed. If source changes are required, stop and report.

---

## Required Output

Produce this report:

```markdown
# Prompt 03 Execution Report — Transitional Test and Selector Contract Preparation

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

## 2. Scope Compliance
- No runtime surface card removal:
- No Project Home extraction/demotion:
- No shell/source/layout edits:
- No Playwright/evidence edits:
- No package/manifest/lockfile edits:
- Static-by-active-surface shell contract preserved:

## 3. Test-Posture Decision Table
<table or bullets for each required test file>

## 4. Changes Made
- Files changed:
- Helper refactors:
- New/updated assertions:
- Comment-only clarifications:

## 5. Documents and Team Shell Hero Coverage
- Documents assertions:
- Team & Access assertions:
- Exact files / tests:

## 6. Project Home Operational Assertions
- `Project Intelligence` status:
- `Document Control Center` status:
- Actual Project Home document-control component path:
- Any test changes:

## 7. Playwright Selector Review
- Files inspected:
- Card-scoped selectors found:
- Playwright edits made:
- Prompt 04 evidence rerun requirement:

## 8. Prompt 04 Test-Edit Handoff
- Documents:
- Team & Access:
- Control Center Settings:
- External Systems Launch Pad:
- External Systems orphan header:
- Remaining retained operational/header-hybrid cards:

## 9. Validation
- Commands run:
- Results:
- pnpm-lock hash after:
- git status after:

## 10. Prompt 04 Readiness
- Ready / Not ready:
- Required gates before runtime card removal:
- Hard stops:
```

---

## Required Validation

After any test edit, run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If no files are edited, at minimum run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Do not use Jest-only flags such as:

```bash
--runInBand
```

Do not run Playwright during Prompt 03 unless explicitly authorized. Prompt 04 / closeout will rerun live evidence after runtime structure changes.

---

## Hard Stops

Stop and report if:

- repo is dirty before execution in files overlapping Phase 04 scope;
- shell `main[role="tabpanel"]` no longer owns active-panel semantics;
- tests cannot distinguish shell active panel from compatibility card marker;
- adding transitional assertions would require runtime source changes;
- Project Home `Document Control Center` cannot be proven to be the Project Home operational card;
- a proposed test edit would weaken current duplicate-card protections before runtime removal;
- Playwright files contain unavoidable card-scoped selectors that cannot be safely updated without runtime changes;
- `pnpm-lock.yaml` changes;
- package-solution or webpart manifest versions drift;
- any duplicate/header card removal is required to make tests pass.

---

## Completion Criteria

Prompt 03 is complete when:

- current test semantics distinguish shell active-panel ownership from card-level compatibility markers;
- current compatibility-card assertions remain in place until runtime removal;
- Documents and Team & Access shell hero content is proven by tests or explicitly identified as already covered;
- Project Home operational card assertions remain intact;
- Prompt 04 has an exact test-edit handoff for runtime removal;
- no runtime/source/shell/layout/surface/Playwright/doc/package/manifest/lockfile changes were made;
- validation passes;
- the report states whether Prompt 04 can proceed and what gates remain.
