# PCC Phase 03 Conditional Command Header Content — Local-Agent Prompt Package v2

## Package Objective

This package instructs a local code agent to complete:

```text
Phase 03 — Conditional Command Header Content
```

The command header must conditionally render deterministic, surface-specific content for all current PCC MVP surfaces while preserving Phase 2 shell-owned active-panel semantics.

## Why This Package Was Regenerated

The prior package was structurally correct but not detailed enough. This v2 package follows the same detailed structure as the provided reference prompt package:

- shared common requirements;
- explicit repo-truth scope;
- phase objective;
- in-scope / out-of-scope boundaries;
- exact files to inspect;
- step-by-step prompt sequencing;
- acceptance criteria;
- evidence and validation posture;
- final report expectations.

## Current Planning Assumptions

The planning audit found the following, but Prompt 01 must re-check current `main` before edits:

- `PccShell.tsx` owns `data-pcc-active-surface-panel={activeSurfaceId}` on `main[role="tabpanel"]`.
- `PccProjectHeroBand.tsx` renders active surface title, description, summary items, cues, read-only cue, facts, and command-search preview.
- `projectShellViewModel.ts` already exposes `surfaceSummaryItems`, `surfaceCues`, and `readOnlyCue`.
- `surfaceHeaderMetadata.ts` appears to be the current metadata source of truth.
- `PccCommandSearch.tsx` is a non-interactive preview capsule.
- Duplicate/header-like cards remain on each surface and are Phase 04 handoff inventory.
- The correct package-solution path is `apps/project-control-center/config/package-solution.json`.

## Included Files

| File | Purpose |
|---|---|
| `COMMON_REQUIREMENTS.md` | Shared requirements for all prompts. |
| `PACKAGE_MANIFEST.md` | File inventory and execution sequence. |
| `README.md` | Package overview and usage. |
| `Implementation_Plan.md` | Full Phase 03 implementation plan. |
| `Prompt_01_Repo_Baseline_And_Phase_2_Verification.md` | Pre-edit repo-truth gate and exact metadata target matrix. |
| `Prompt_02_Surface_Command_Header_Metadata.md` | Add/complete deterministic metadata for all surfaces. |
| `Prompt_03_PccProjectHeroBand_Conditional_Rendering.md` | Render richer conditional summary/cue content in the header. |
| `Prompt_04_Header_A11y_And_Responsive_Semantics.md` | Harden accessibility, non-color-only semantics, wrapping, and compact behavior. |
| `Prompt_05_Tests_And_Targeted_Validation.md` | Complete unit/component tests and validation. |
| `Prompt_06_Phase_4_Handoff_Inventory.md` | Document duplicate/header-card handoff inventory for Phase 04. |
| `Auditor_Prompt_For_Phase_3_Completion_Review.md` | Fresh-session auditor prompt for reviewing plans/execution. |

## Execution Sequence

Run prompts in order:

1. Prompt 01 — Repo baseline and Phase 2 verification.
2. Prompt 02 — Surface command-header metadata.
3. Prompt 03 — Conditional header rendering.
4. Prompt 04 — Header accessibility and responsive semantics.
5. Prompt 05 — Tests and targeted validation.
6. Prompt 06 — Phase 04 handoff inventory.

Do not skip Prompt 01. It is the mandatory pre-edit repo-truth gate.

## Non-Negotiable Phase Boundary

Phase 03 is **not** the duplicate-card removal phase.

The following cards/components are inventory/handoff items only:

```text
PccProjectIntelligenceCard
PccDocumentsHeaderCard
PccTeamAccessHeaderCard
Project Readiness hero/top command card
Approvals home/top command card
PccExternalSystemsLaunchPadHeaderCard
Control Center Settings overview card
PccSiteHealthOverviewCard
```

Content may be extracted or mirrored into metadata, but runtime removal belongs to Phase 04.

## Required Validation

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

Run only if Playwright/live selector output is touched:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

## Recommended Next Action

Run `Prompt_01_Repo_Baseline_And_Phase_2_Verification.md` with the local code agent.
