# Implementation Plan — PCC Phase 2 Shell Header Consolidation

## Objective

Implement the Phase 2 foundation required by the PCC Basis of Design: consolidate active surface ownership into the shell, establish the typed command-header metadata seam, and de-risk later removal of duplicate surface header cards.

This plan intentionally avoids removing duplicate bento header cards. That belongs in the next phase after the shell owns surface identity, active panel semantics, and header metadata.

---

## Phase 2 Success Criteria

1. `PccShell.tsx` `main[role="tabpanel"]` owns:
   - `id={ACTIVE_PANEL_ID}`;
   - `role="tabpanel"`;
   - `aria-labelledby={`pcc-tab-${activeSurfaceId}`}`;
   - `data-pcc-active-surface-panel={activeSurfaceId}`.
2. Exactly one semantic shell active panel exists.
3. Active tab changes update the `main` marker and `aria-labelledby`.
4. `PccHorizontalTabs` remains keyboard accessible and continues to use `aria-controls`.
5. `PccDashboardCard.dataActiveSurfacePanel` is no longer required for active-panel ownership.
6. Existing direct-child bento tests continue to pass.
7. Surface header metadata exists for all eight MVP surfaces.
8. Tests and comments no longer claim the active panel must be a card inside the bento grid.
9. Playwright live tests either remain compatible or gain explicit shell-owner checks.
10. Package, lockfile, manifest, SPPKG, and dependency files remain unchanged unless repo truth proves otherwise.

---

## Prompt Breakdown

### Prompt 00 — Mandatory Pre-Edit Repo-Truth Gate

Purpose:
- prevent stale audit assumptions;
- confirm current shell markup;
- inventory all active-panel markers;
- inspect Playwright dependency;
- confirm package-solution posture;
- produce a short execution plan.

Expected output:
- no runtime changes;
- report only;
- approval gate before Prompt 01.

### Prompt 01 — Active Surface Panel Ownership Move

Purpose:
- add `data-pcc-active-surface-panel={activeSurfaceId}` to shell `main`;
- keep tabpanel ARIA contract intact;
- update immediate shell tests;
- avoid deleting card-level compatibility too early.

Expected files:
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx`

### Prompt 02 — Shell Hero View-Model Extension

Purpose:
- create/extend typed surface header metadata seam;
- derive deterministic surface-level summary/cue data for all eight surfaces;
- avoid visual redesign and module launcher implementation.

Expected files:
- `apps/project-control-center/src/preview/projectShellViewModel.ts`
- possibly `apps/project-control-center/src/shell/surfaceHeaderMetadata.ts`
- possibly `apps/project-control-center/src/shell/PccProjectHeroBand.tsx`
- focused tests.

### Prompt 03 — Surface Header Metadata and Compatibility Bridge

Purpose:
- wire header metadata through `PccApp → PccShell → PccProjectHeroBand`;
- show lightweight surface-specific header metadata where safe;
- document card-level marker as deprecated compatibility;
- do not remove duplicate cards.

Expected files:
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccProjectHeroBand.tsx`
- shell CSS if needed.

### Prompt 04 — Test Update and Direct-Child Guardrails

Purpose:
- revise stale tests that assume active-panel marker is a bento card;
- add tests proving no card ownership dependency;
- preserve direct-child card tests;
- prevent nested-card or wrapper regressions.

Expected files:
- `apps/project-control-center/src/tests/PccCardTierContract.test.tsx`
- `apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx`
- `apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx`
- possibly a new `PccShell.activePanelOwnership.test.tsx`.

### Prompt 05 — Playwright Selector and Evidence Posture

Purpose:
- inspect whether live Playwright only checks presence;
- optionally upgrade page object results to record owner tag/role/id;
- avoid hard failure if tenant deployment has not yet been updated;
- keep evidence sanitized and safe.

Expected files:
- `e2e/pcc-live/pcc-live.page-object.ts`
- `e2e/pcc-live/pcc-live.surfaces.ts`
- `e2e/pcc-live/pcc-live.surface-smoke.spec.ts`
- possibly evidence writer typings.

### Prompt 06 — Targeted Validation and Closeout

Purpose:
- run required validations;
- confirm no package/lockfile/manifest drift;
- produce closeout summary;
- identify any skipped live evidence.

Expected files:
- no production changes unless validation exposes small fixes.

### Prompt 07 — Phase 3 Handoff Inventory

Purpose:
- inventory duplicate top-level header cards;
- classify useful content to move into command header later;
- identify tests that should be updated in Phase 3;
- do not remove cards.

Expected output:
- documentation-only handoff file under a repo-appropriate plan/evidence path selected by the local agent.

---

## Risk Register

| Risk | Description | Mitigation |
|---|---|---|
| R-01 | Tests currently treat card marker as active panel | Update tests before removing any card marker assumptions. |
| R-02 | Multiple markers after adding shell marker | In Phase 2, distinguish semantic shell ownership from temporary card compatibility; either allow compatibility in tests or safely remove card markers only after all consumers are updated. |
| R-03 | Playwright evidence still searches broad selector | Update page object to inspect owner if in scope; do not block Phase 2 on tenant evidence if local component tests prove ownership. |
| R-04 | Duplicate header-card removal creeps into Phase 2 | Hard prohibit runtime removal. Inventory only. |
| R-05 | Package-solution path uncertainty | Verify whether file moved/absent/irrelevant before any packaging assertion. |
| R-06 | Lockfile/package drift | Record before/after md5 and inspect `git status --short`. |
| R-07 | Header metadata becomes visual redesign | Keep copy compact and deterministic; avoid module launcher and command-search activation. |
| R-08 | Direct-child bento regression | Preserve `PccBentoGrid` child structure; run existing direct-child tests. |

---

## Required Final Closeout

The local agent’s final closeout must include:

```markdown
## Phase 2 Closeout

## Git Status

## Files Changed

## Active Panel Ownership Proof

## Header Metadata Proof

## Test Results

## Playwright / Evidence Posture

## Package / Lockfile / Manifest Proof

## Compatibility Bridge Status

## Phase 3 Handoff
```
