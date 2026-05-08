# Prompt 04 — Gated Runtime Duplicate/Header-Card Removal and Test Migration

## Objective

Execute the first real Phase 04 runtime duplicate/header-card removal pass after Prompts 01–03.

This prompt must remove only the duplicate/header-card candidates that are safe under the Prompt 01 inventory, Prompt 02 content-decision gate, and Prompt 03 transitional test-prep handoff. It must pair every runtime removal with the least-destructive test migration in the same change.

Primary objective:

```text
Remove pure or safely gated duplicate/header cards from selected surfaces while preserving operational content, shell-owned active-panel semantics, bento direct-child invariants, read-only/source-authority cues, package/lockfile/manifest stability, and clear Prompt 05/06 handoff for deferred operational/header-hybrid cards.
```

---

## Current Baseline

Prompt 04 starts after Prompt 03 commit:

```text
fb7a23871bad117a1bcacb3c1ef17a31c62f9f92
```

Known current outcomes:

- Prompt 02 landed static metadata preservation for Control Center Settings admin attribution.
- Prompt 02 kept Documents as Path C:
  - dynamic `cueFor()` loading / error / source-unavailable copy stays off static shell metadata;
  - removal of `PccDocumentsHeaderCard` is blocked unless this prompt proves one of the authorized state-preservation paths below.
- Prompt 02 kept External Systems as:
  - Path A for static launch cue already in metadata;
  - Path C for `header.subtitle` and loading/error preview-state;
  - removal of `PccExternalSystemsLaunchPadHeaderCard` is blocked unless this prompt proves subtitle/state preservation or authorized non-operational drop.
- Prompt 03 added Team & Access shell-hero metadata coverage and made the Prompt 04 test migration rule explicit:
  - bifurcate compatibility-card and shell-only surface expectations;
  - move a surface to shell-only only in the same change as its runtime card removal;
  - keep compatibility-card assertions for retained operational/header-hybrid cards;
  - keep direct-child bento invariants for all surfaces.

---

## Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, tab/tabpanel accessibility, shell-owned active-panel semantics, static-by-active-surface shell metadata, and package/lockfile/manifest safety.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

---

## Authorized Runtime Scope

Prompt 04 may remove or modify only the runtime candidates listed in this section.

### A. Team & Access — Authorized removal

Remove:

```text
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
```

and remove its usage/import from the Team & Access surface composition.

Reason:

- Prompt 01 classified it as a pure duplicate.
- Prompt 03 added per-surface Team & Access shell hero coverage.
- It has no operational content.

Expected post-removal posture:

- Team & Access still renders at least one direct-child `[data-pcc-card]`.
- Shell hero continues to show Team & Access title, summary, cue, and read-only/governance posture.
- Team & Access no longer has a direct bento-child compatibility card unless another retained card legitimately emits one. If no retained card does, Team & Access moves to `SURFACES_WITH_SHELL_ONLY_PANEL`.

### B. Control Center Settings — Authorized removal

Remove the first inline duplicate/overview `PccDashboardCard` in:

```text
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
```

Reason:

- Prompt 01 classified it as pure duplicate/advisory.
- Prompt 02 merged the admin attribution sentence into the shell `readOnlyCue`.
- Operational/settings state cards remain below.

Expected post-removal posture:

- Control Center Settings still renders at least one direct-child `[data-pcc-card]`.
- Shell hero read-only cue includes:
  - `saving, updating, and tenant changes`;
  - `governed settings workflows`;
  - `PCC administrator`.
- Control Center Settings no longer has a direct bento-child compatibility card unless another retained card legitimately emits one. If no retained card does, Control Center Settings moves to `SURFACES_WITH_SHELL_ONLY_PANEL`.

### C. Documents — Gated removal

Do not remove `PccDocumentsHeaderCard` unless this prompt first proves one of:

```text
D1. Equivalent loading/error/source-unavailable/default copy already renders elsewhere on the Documents surface.
D2. The dynamic loading/error/source-unavailable branches are not reachable in the post-removal composition.
D3. A retained state card is introduced before the header card is removed.
```

If none of D1/D2/D3 is proven, leave `PccDocumentsHeaderCard` in place and report it as blocked.

If removal is authorized, remove:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
```

and remove its usage/import from the Documents surface composition.

Minimum proof required before Documents removal:

- Identify current Documents loading branch.
- Identify current Documents error branch.
- Identify current Documents source-unavailable branch, if present.
- Identify where equivalent copy/posture remains after removal.
- Run or update tests that prove the retained state/posture remains visible.
- Confirm Documents still renders at least one direct-child operational card after removal.

### D. External Systems Launch Pad — Gated removal

Do not remove `PccExternalSystemsLaunchPadHeaderCard` unless this prompt first proves one of:

```text
E1. `header.subtitle` is duplicative, non-operational, and not used as a unique project/system context cue, and dropping it is explicitly documented.
E2. `header.subtitle` is preserved on a retained Launch Pad state/operational card before the header card is removed.
```

Also prove loading/error preview-state posture remains visible or is not reachable after removal.

If neither E1 nor E2 is proven, leave `PccExternalSystemsLaunchPadHeaderCard` in place and report it as blocked.

If removal is authorized, remove:

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
```

and remove its usage/import from the External Systems surface composition.

Minimum proof required before External Systems Launch Pad removal:

- Identify where `header.subtitle` currently comes from.
- Identify whether it is constant, project-specific, or derived from the read model/view model.
- Identify whether the static launch cue remains in shell metadata.
- Identify loading/error branch behavior after removal.
- Confirm External Systems still renders at least one direct-child operational card after removal.

### E. External Systems legacy orphan — Authorized deletion after proof

Delete:

```text
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx
```

only after a fresh workspace-wide search proves it has zero non-self code/test imports.

Required proof:

```bash
rg -n "PccExternalSystemsHeaderCard" .
```

Classify hits as:

- self-file;
- runtime code import;
- test import;
- barrel export;
- docs / historical references.

If any runtime/test/barrel import exists, do not delete.

---

## Explicitly Deferred / Prohibited Runtime Scope

Do **not** remove, demote, rename, restyle, or restructure these operational/header-hybrid cards in Prompt 04:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
```

Retained cards:

- Project Home `PccProjectIntelligenceCard`;
- Project Readiness Hero / `ReadinessHeroSlot` ready/loading/error state posture;
- Approvals `HomeCard` ready/loading/error/degraded state posture;
- Site Health `PccSiteHealthOverviewCard`.

These remain compatibility-card surfaces unless a later Phase 06 composition prompt explicitly changes them.

Do **not** implement:

- Phase 05 module launcher;
- Phase 06 Project Home bento composition realignment;
- URL routing;
- command routing;
- active module state;
- read-model-state-aware shell header behavior;
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

Expected baseline:

```text
Branch: main
HEAD: fb7a23871bad117a1bcacb3c1ef17a31c62f9f92
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
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts

apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/surfaces/teamAccess/

apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx

apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/

apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/launchPadViewModel.ts
apps/project-control-center/src/surfaces/externalSystems/

apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx

apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/tests/PccControlCenterSettingsSurface.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface*.test.tsx
apps/project-control-center/src/tests/PccTeamAccessSurface*.test.tsx
apps/project-control-center/src/tests/PccExternalSystems*.test.tsx
```

---

## Required Searches

Run and record relevant results:

```bash
rg -n "PccTeamAccessHeaderCard|TeamAccessHeaderCard" apps/project-control-center/src
rg -n "PccDocumentsHeaderCard|DocumentsHeaderCard|cueFor\\(|Document control is temporarily unavailable|No document control sources are available|Document control shows three lanes|Loading document control content" apps/project-control-center/src
rg -n "PccExternalSystemsLaunchPadHeaderCard|PccExternalSystemsHeaderCard|header\\.subtitle|Launch links open the source system in a new tab" apps/project-control-center/src
rg -n "Control Center Settings|Settings overview|saving, updating, and tenant changes|dataActiveSurfacePanel" apps/project-control-center/src/surfaces/controlCenterSettings apps/project-control-center/src/shell apps/project-control-center/src/tests
rg -n "data-pcc-active-surface-panel|dataActiveSurfacePanel|\\[data-pcc-card\\]\\[data-pcc-active-surface-panel" apps/project-control-center/src apps/project-control-center/src/tests e2e/pcc-live
rg -n "Project Intelligence|ReadinessHeroSlot|Approvals home|Site Health" apps/project-control-center/src/surfaces apps/project-control-center/src/tests
```

---

## Runtime Removal / Preservation Decision Table

Before editing runtime files, produce this table in the execution report and then follow it.

| Surface / Candidate | Decision | Required proof | Runtime action |
|---|---|---|---|
| Team & Access / `PccTeamAccessHeaderCard` | REMOVE | pure duplicate + shell hero coverage | remove usage/import + delete file if no imports remain |
| Control Center Settings / first inline command card | REMOVE | Prompt 02 metadata copy preserved + downstream cards remain | remove inline first card |
| Documents / `PccDocumentsHeaderCard` | REMOVE or BLOCKED | D1/D2/D3 proof | remove only if proof passes |
| External Systems / `PccExternalSystemsLaunchPadHeaderCard` | REMOVE or BLOCKED | E1/E2 + loading/error proof | remove only if proof passes |
| External Systems / `PccExternalSystemsHeaderCard` | DELETE or BLOCKED | zero non-self code/test/barrel imports | delete only if proof passes |
| Project Home / `PccProjectIntelligenceCard` | RETAIN | Phase 06 deferred | no runtime edit |
| Project Readiness Hero | RETAIN | operational metrics/state | no runtime edit |
| Approvals Home | RETAIN | operational metrics/state | no runtime edit |
| Site Health Overview | RETAIN | operational metrics | no runtime edit |

---

## Test Migration Requirements

Prompt 04 must pair runtime removal with test migration in the same change.

### Required pattern

Introduce or use explicit surface sets in affected tests:

```ts
const SURFACES_WITH_COMPATIBILITY_CARD = [
  // surfaces whose active rendered bento still legitimately has a
  // direct child [data-pcc-card][data-pcc-active-surface-panel="<surfaceId>"]
] as const;

const SURFACES_WITH_SHELL_ONLY_PANEL = [
  // surfaces whose duplicate/header card was removed and whose shell
  // main[role="tabpanel"] is the only active-surface marker
] as const;
```

The exact names may vary, but the behavior must match.

### Required migration rules

1. Move a surface to shell-only only if its runtime card was removed in this same prompt.
2. Keep retained operational/header-hybrid surfaces in compatibility-card expectations.
3. Add shell-only assertions for removed-card surfaces:
   - exactly one shell `main[role="tabpanel"][data-pcc-active-surface-panel="<surfaceId>"]`;
   - no direct bento-child `[data-pcc-card][data-pcc-active-surface-panel="<surfaceId>"]`;
   - bento grid exists;
   - at least one direct-child `[data-pcc-card]` remains;
   - remaining cards are direct bento children.
4. Keep compatibility-card assertions for retained surfaces:
   - one direct bento-child compatibility card;
   - explicit tier/region/heading/source markers where applicable.
5. Keep direct-child bento invariant for every surface.

### Required affected test files

Inspect and update only as needed:

```text
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccControlCenterSettingsSurface.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface*.test.tsx
apps/project-control-center/src/tests/PccTeamAccessSurface*.test.tsx
apps/project-control-center/src/tests/PccExternalSystems*.test.tsx
```

Do not alter Project Home tests unless runtime Project Home changed, which is prohibited in this prompt.

---

## Surface-Specific Test Requirements

### Team & Access

If `PccTeamAccessHeaderCard` is removed:

- assert shell hero still switches to Team & Access (existing Prompt 03 test should cover this);
- assert Team & Access surface still renders operational cards/lanes;
- assert no Team & Access direct-child compatibility marker remains if no retained card emits one;
- keep direct-child bento invariant.

### Control Center Settings

If first inline card is removed:

- assert shell hero read-only cue includes:
  - `saving, updating, and tenant changes`;
  - `governed settings workflows`;
  - `PCC administrator`;
- assert operational/settings cards remain;
- assert no Control Center Settings direct-child compatibility marker remains if no retained card emits one;
- keep direct-child bento invariant.

### Documents

If `PccDocumentsHeaderCard` is removed:

- assert shell hero Documents metadata still renders;
- assert dynamic loading/error/source-unavailable/default copy remains visible elsewhere, is unreachable, or has a retained state-card replacement;
- assert Documents still renders operational/source cards;
- assert no Documents direct-child compatibility marker remains if no retained card emits one;
- keep direct-child bento invariant.

If the D1/D2/D3 proof is not available, do not remove `PccDocumentsHeaderCard` and keep Documents in compatibility-card expectations.

### External Systems

If `PccExternalSystemsLaunchPadHeaderCard` is removed:

- assert shell hero External Systems launch cue remains visible;
- assert `header.subtitle` is preserved or explicitly proven safe to drop;
- assert loading/error preview-state posture remains visible or is unreachable;
- assert External Systems still renders operational/source cards;
- assert no External Systems direct-child compatibility marker remains if no retained card emits one;
- keep direct-child bento invariant.

If E1/E2 + loading/error proof is not available, do not remove `PccExternalSystemsLaunchPadHeaderCard` and keep External Systems in compatibility-card expectations.

---

## Files Prompt 04 May Edit

Prompt 04 may edit only files necessary for the approved runtime removal and paired tests.

Expected possible runtime files:

```text
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx
```

Expected possible test files:

```text
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccControlCenterSettingsSurface.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface*.test.tsx
apps/project-control-center/src/tests/PccTeamAccessSurface*.test.tsx
apps/project-control-center/src/tests/PccExternalSystems*.test.tsx
```

Prompt 04 must not edit:

```text
apps/project-control-center/src/shell/**
apps/project-control-center/src/layout/**
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/approvals/**
apps/project-control-center/src/surfaces/siteHealth/**
e2e/pcc-live/**
docs/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

If a prohibited file appears necessary, stop and report.

---

## Required Output

Produce this execution report:

```markdown
# Prompt 04 Execution Report — Gated Runtime Duplicate/Header-Card Removal

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

## 2. Runtime Removal / Preservation Decisions
<table or bullets for each candidate>

## 3. Documents Gate
- D1/D2/D3 proof:
- Decision:
- Runtime action:
- Tests added/updated:
- Remaining risk:

## 4. External Systems Gate
- E1/E2 proof:
- Loading/error proof:
- Decision:
- Runtime action:
- Tests added/updated:
- Remaining risk:

## 5. Runtime Changes Made
- Team & Access:
- Control Center Settings:
- Documents:
- External Systems:
- Orphan header:

## 6. Test Migration
- Compatibility-card surfaces after this prompt:
- Shell-only surfaces after this prompt:
- Files changed:
- Assertions added:
- Assertions removed:
- Direct-child invariant status:

## 7. Deferred / Retained Cards
- Project Intelligence:
- Project Readiness Hero:
- Approvals Home:
- Site Health Overview:
- Documents, if blocked:
- External Systems Launch Pad, if blocked:

## 8. Validation
- Commands run:
- Results:
- pnpm-lock hash after:
- package/manifest status:
- git status after:

## 9. Playwright / Evidence
- Playwright files edited:
- Live evidence required after commit:
- Suggested command:
- Evidence output path expectation:

## 10. Prompt 05 / Phase 06 Handoff
- Remaining duplicate/header-card work:
- Required future proof:
- Hard stops:
```

---

## Required Validation

After edits, run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed source and test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as:

```bash
--runInBand
```

Do not run Playwright during Prompt 04 unless explicitly authorized by the user. Runtime structure changes require live evidence after commit, but the default Prompt 04 closeout may state the required command rather than running it.

If user authorizes live evidence, use the established scripts and environment conventions from prior Phase 03/04 evidence work:

```bash
pnpm pcc:e2e:live
pnpm pcc:e2e:evidence:registry
```

---

## Hard Stops

Stop and report if:

- repo is dirty before execution in overlapping files;
- shell `main[role="tabpanel"]` no longer owns active-panel semantics;
- Prompt 03 Team & Access shell-hero test is missing or failing before removal;
- Prompt 02 Control Center Settings readOnlyCue preservation is missing;
- Documents D1/D2/D3 proof cannot be established but the implementation would remove `PccDocumentsHeaderCard`;
- External Systems E1/E2 + loading/error proof cannot be established but the implementation would remove `PccExternalSystemsLaunchPadHeaderCard`;
- any retained operational/header-hybrid card would need to be changed;
- any direct-child bento invariant would be weakened;
- test migration would remove compatibility assertions for a surface whose runtime compatibility card remains;
- a surface would end with zero direct-child `[data-pcc-card]`;
- Playwright/evidence files would need edits;
- package-solution, webpart manifest, package files, or lockfile would change;
- validation changes `pnpm-lock.yaml`;
- runtime removal requires changes to shell, layout, project home, project readiness, approvals, or site health files.

---

## Completion Criteria

Prompt 04 is complete when:

- Team & Access duplicate header card is removed and tests migrated;
- Control Center Settings duplicate first card is removed and tests migrated;
- Documents is either safely removed with D1/D2/D3 proof or explicitly blocked and retained;
- External Systems Launch Pad header is either safely removed with E1/E2 proof or explicitly blocked and retained;
- orphan `PccExternalSystemsHeaderCard` is deleted only if zero non-self imports are freshly proven;
- compatibility-card vs shell-only surface sets match actual runtime state;
- direct-child bento invariants remain enforced for all surfaces;
- retained operational/header-hybrid cards remain untouched;
- no package/manifest/lockfile/Playwright/doc drift occurs;
- validation passes;
- closeout report clearly states required live evidence rerun and any remaining Phase 06 handoff.
