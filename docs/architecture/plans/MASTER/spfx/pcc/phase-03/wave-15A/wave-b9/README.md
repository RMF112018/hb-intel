# PCC Phase 04 Local-Agent Package — Remove Duplicate Top-Level Surface Header Cards

## Purpose

This package instructs the local code agent to complete:

```text
Phase 04 — Remove Duplicate Top-Level Surface Header Cards
```

The objective is to remove or demote duplicate surface header/title cards from the PCC bento grid now that the shell command header owns active surface identity and command context.

The bento grid must begin with working operational content, not generic title/description cards.

## Governing Scope

# Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, and tab/tabpanel accessibility.

Do not implement Phase 05 module launcher, Phase 06 Project Home bento composition realignment, URL routing, command routing, active module state, live integrations, writeback, or broad visual redesign during Phase 04.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

## Package Files

- `README.md`
- `Implementation_Plan.md`
- `Prompt_01_Duplicate_Header_Card_Inventory.md`
- `Prompt_02_Project_Home_Project_Intelligence_Extraction.md`
- `Prompt_03_Documents_And_Team_Header_Card_Removal.md`
- `Prompt_04_Remaining_Surface_Header_Card_Removal.md`
- `Prompt_05_Test_Updates_And_Bento_Invariants.md`
- `Prompt_06_Targeted_Validation_And_Phase_5_6_Handoff.md`
- `Auditor_Prompt_For_Phase_4_Completion_Review.md`

## Required Execution Order

Run prompts in strict order.

1. Prompt 01 — inventory and plan only.
2. Prompt 02 — Project Home extraction/demotion strategy; no destructive loss.
3. Prompt 03 — remove pure duplicate Documents and Team cards.
4. Prompt 04 — remove remaining safe duplicates and preserve operational candidates.
5. Prompt 05 — update tests and bento/active-panel guardrails.
6. Prompt 06 — targeted validation and handoff to Phases 05/06.

## Non-Negotiable Acceptance Criteria

Phase 04 is complete only when:

- no surface starts with a generic title/description-only card;
- Project Home no longer uses `Project Intelligence` as a bento header card;
- Documents and Team no longer render duplicate full-width header cards;
- useful counts/cues are preserved in shell header or operational cards;
- `data-pcc-active-surface-panel` remains shell-owned on `main[role="tabpanel"]`;
- broad active panel marker count is reduced from the pre-Phase-04 compatibility posture to the post-removal shell-owned posture where appropriate;
- bento direct-child invariant remains protected;
- tests are updated to stop depending on card-level active-panel ownership;
- check-types and tests pass;
- no package/lockfile/manifest drift occurs unless explicitly justified.

## Baseline Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Optional Live Evidence

Run live evidence if visible structure materially changes or if Playwright/evidence selectors are touched:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

## Repo Baseline

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
