# PCC Phase 04 Implementation Plan — Remove Duplicate Top-Level Surface Header Cards

## 1. Objective

Remove or demote duplicate surface header cards from PCC bento surfaces so the shell command header owns surface identity and the bento field starts with operational content.

## 2. Current Baseline

# Repo-Truth Baseline Used to Generate This Package

This package was generated from the attached Phase 04 package-generator prompt and a repo-truth audit of `RMF112018/hb-intel` on `main`.

Observed repo-truth anchors:

- `PccShell.tsx` currently renders `PccProjectHeroBand`, `PccHorizontalTabs`, and `main[role="tabpanel"]`, then wraps surface children in `PccBentoGrid`.
- `main[role="tabpanel"]` currently owns `data-pcc-active-surface-panel={activeSurfaceId}`.
- `PccHorizontalTabs` is still wired with `panelId={ACTIVE_PANEL_ID}`.
- `surfaceHeaderMetadata.ts` exists and provides deterministic metadata for all eight MVP surfaces.
- `projectShellViewModel.ts` derives shell hero content from `PCC_SHELL_SURFACE_HEADER_METADATA`.
- `PccProjectHeroBand.tsx` renders surface summary items, surface cues, read-only cue, hero facts, and `PccCommandSearch`.
- `apps/project-control-center/config/package-solution.json` exists and reports solution version `1.0.0.19` and feature version `1.0.0.18` at audit time.
- Phase 04 handoff inventory exists at `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/handoff/Phase_04_Duplicate_Header_Card_Removal_Handoff_Inventory.md`.
- That handoff inventory states that broad `[data-pcc-active-surface-panel]` count is intentionally `2` before Phase 04: shell `main` semantic owner plus one direct bento-child compatibility card per active surface. Phase 04 is expected to reduce that to `1` in lockstep with test/e2e/evidence updates.
- The handoff inventory classifies pure shell duplicates versus operational/non-removal-ready cards. Phase 04 must not destructively remove operational content.

Primary candidate inventory from handoff:

- Pure shell duplicates / expected removal candidates:
  - `PccTeamAccessHeaderCard`
  - `PccDocumentsHeaderCard` after state-cue retention check
  - `PccExternalSystemsLaunchPadHeaderCard` after launch/subtitle cue relocation
  - Control Center Settings first command card
  - unused legacy `PccExternalSystemsHeaderCard` housekeeping candidate
- Operational or conditional candidates requiring preservation/demotion rather than destructive removal:
  - `PccProjectIntelligenceCard`
  - Project Readiness `ReadinessHeroSlot` ready/state content
  - Approvals `HomeCard` ready/state content
  - `PccSiteHealthOverviewCard`

## 3. Phase 04 Scope

In scope:

- confirm Phase 2/3 shell header ownership and metadata rendering;
- inventory all top-level header/command cards;
- remove safe pure duplicate header cards;
- demote or extract mixed cards that contain both duplicate and useful operational content;
- preserve operational metrics, status context, degraded-state context, and state/source cues;
- update tests that currently depend on direct-bento-child compatibility active-panel cards;
- update Playwright/evidence selectors only if required by changed markup;
- document deferred Phase 05/06 work.

Out of scope:

- full Modules launcher;
- command routing;
- active module state;
- Project Home full bento span composition;
- global footprint redesign;
- live writeback;
- external system integration;
- SharePoint navigation changes;
- package-solution version bump unless explicitly required for tenant deployment.

## 4. Removal Tiers

### Tier A — Safe pure duplicates

Remove after confirming header content covers equivalent context:

- `PccTeamAccessHeaderCard`
- `PccDocumentsHeaderCard` if state-cue retention remains visible elsewhere
- Control Center Settings first command card
- legacy unused `PccExternalSystemsHeaderCard` if confirmed unimported

### Tier B — Partial duplicates requiring content relocation

Remove only after moving or preserving subtitle/cue content:

- `PccExternalSystemsLaunchPadHeaderCard`

### Tier C — Operational candidates not safe for destructive removal

Do not remove until content has a retained home:

- `PccProjectIntelligenceCard`
- Project Readiness ready hero/state cards
- Approvals ready/state cards
- `PccSiteHealthOverviewCard`

For Tier C, Phase 04 should demote/rename/reclassify only where safe, or retain as an operational card with duplicate title/advisory copy stripped. Do not lose metrics.

## 5. Target Surface Outcomes

### Project Home

- `Project Intelligence` must no longer be the duplicate first-fold bento header.
- Preserve project facts and command summary counts.
- If full card removal would lose facts/counts, replace/demote into a slim operational card or explicitly move content into existing operational cards.
- Do not perform Phase 06 row/span composition beyond what is required to prevent obvious structural regression.

### Documents

- Remove the `PccDocumentsHeaderCard`.
- Ensure document state/source cue remains visible through shell header and/or existing surface context.
- Surface should begin with actual document/source cards.

### Team & Access

- Remove `PccTeamAccessHeaderCard`.
- Surface should begin with Team Viewer / Permission Requests / Access Manager or current equivalent operational lanes.

### Project Readiness

- Do not delete operational readiness hero stats or degraded-state context.
- If duplicate title/advisory copy is removed, retain stats and source-health badges.

### Approvals

- Do not remove operational metrics/states/modes.
- Retain degraded-state `PccSurfaceContextHeader` posture.

### External Systems

- Move/retain launch subtitle and “opens in new tab” cue.
- Remove the pure header wrapper only when the launcher/source cards preserve the operational meaning.
- Confirm unused legacy header component is actually unused before deletion.

### Control Center Settings

- Remove pure preview/identity command card if downstream settings and missing configuration cards carry operational content.

### Site Health

- Do not delete health metrics unless equivalent summary appears in header or a retained operational card.
- Prefer retain/demote as operational health summary if metrics remain card-owned.

## 6. Test Strategy

Update or add tests for:

- shell-owned active panel marker;
- no direct-bento-child card required for active surface ownership;
- each surface has operational first card;
- no generic title/description-only card remains in first position;
- Documents and Team duplicate header cards are absent;
- Project Home facts/counts are still present somewhere;
- Project Readiness, Approvals, and Site Health operational metrics remain present;
- bento direct-child invariant remains valid;
- tab/tabpanel a11y remains valid;
- disabled/source/read-only cues remain truthful.

## 7. Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## 8. Optional Evidence Trigger

Run Playwright evidence if:

- e2e selectors referenced card-level active surface markers;
- visual screenshot/surface-smoke specs depend on duplicate cards;
- visible structure changes materially enough to require current tenant evidence;
- auditor asks for tenant proof before proceeding.

## 9. Acceptance Criteria

- Phase 2/3 shell ownership remains intact.
- Safe duplicate cards are removed.
- Operational content is preserved.
- Tests no longer rely on card-level active-panel marker.
- Bento direct-child invariants remain protected.
- No unrelated refactors or package drift.
- Phase 05/06 handoff inventory is updated.
