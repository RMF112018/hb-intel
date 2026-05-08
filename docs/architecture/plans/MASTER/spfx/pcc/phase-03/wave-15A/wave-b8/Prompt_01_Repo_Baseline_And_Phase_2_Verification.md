# Prompt 01 — Repo Baseline and Phase 2 Verification v2

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Role

You are the local code agent for PCC Phase 03.

This prompt is a **pre-edit repo-truth gate**. It is intentionally documentation / analysis only.

Do **not** make runtime edits in this prompt. Do **not** change tests. Do **not** change package files. Do **not** change the lockfile. Do **not** remove any duplicate/header cards.

Your job is to verify current repo truth, confirm whether the Phase 2 shell-header ownership handoff still holds, confirm the correct metadata source of truth, and produce the exact target metadata matrix that later prompts will implement.

## Phase / Scope

```text
Phase 03 — Conditional Command Header Content
```

This phase is limited to making the PCC shell command header conditionally render deterministic, surface-specific content for the current eight MVP surfaces.

Phase 03 must preserve:

- SharePoint host-fit.
- Shell-owned active panel semantics.
- Tab / tabpanel accessibility.
- Bento direct-child invariants.
- Preview / read-only / no-writeback posture.
- The distinction between PCC surfaces and work centers/modules.
- Package, manifest, and lockfile safety.

Phase 03 must not implement:

- Full Modules launcher behavior.
- Command routing.
- Active module state.
- Live mutation, writeback, approval execution, repair execution, file operations, or settings mutation.
- Duplicate/header-card runtime removal.
- Broad Project Home bento realignment.
- Broad shell/nav redesign.

## Known Handoff Baseline

The Phase 2 handoff is available at commit:

```text
10bf7fd1ff03625ba741d75934844892656d8e16
```

Prompt 01 must compare current local repo truth against this handoff baseline.

Do not assume the current working tree is identical to the handoff commit. The repo moves quickly. Confirm it.

## Shared Guardrails

- Work from current repo truth.
- Start with git state and current HEAD.
- Treat commit summaries as context only, not evidence.
- Inspect source files directly.
- Preserve shell-owned `data-pcc-active-surface-panel={activeSurfaceId}` on `main[role="tabpanel"]`.
- Preserve `id`, `role`, `aria-labelledby`, and tab `aria-controls`.
- Preserve `PccDashboardCard.dataActiveSurfacePanel` only as a deprecated compatibility marker unless a later phase explicitly removes it.
- Preserve direct children of `PccBentoGrid`; do not introduce wrappers between grid and cards.
- Preserve the non-interactive `PccCommandSearch` preview posture.
- Preserve static/deterministic header metadata. Do not invent live counts or source confidence.
- Do not change `pnpm-lock.yaml`, package dependencies, SPFx package-solution files, or webpart manifests.
- Use `apps/project-control-center/config/package-solution.json` for package-solution references.
- Treat root `config/package-solution.json` as stale unless current repo truth proves otherwise.

## Objective

Confirm the current implementation baseline and produce a complete, exact, implementation-ready metadata target matrix for all eight MVP surfaces.

This prompt must answer:

1. Is current local `main` clean?
2. What is current branch and HEAD?
3. Does current HEAD match or diverge from the Phase 2 handoff commit?
4. Does Phase 2 shell ownership still exist exactly as audited?
5. Does `surfaceHeaderMetadata.ts` remain the source of truth?
6. What exact metadata should Prompt 02 implement or adjust per surface?
7. Which duplicate/header cards remain Phase 04 handoff inventory?
8. Which files should Prompt 02 touch?
9. Which tests should Prompt 02/03/05 add or adjust?
10. Are all package-solution references using the PCC app path?

## Required First Actions

Run these before inspecting source:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
git merge-base --is-ancestor 10bf7fd1ff03625ba741d75934844892656d8e16 HEAD; echo "handoff_ancestor=$?"
git diff --name-status 10bf7fd1ff03625ba741d75934844892656d8e16..HEAD -- apps/project-control-center packages/models/src/pcc docs/reference/spfx-surfaces/project-control-center e2e/pcc-live package.json apps/project-control-center/package.json apps/project-control-center/config/package-solution.json pnpm-lock.yaml
```

Interpretation:

- `handoff_ancestor=0` means the handoff commit is in current HEAD history.
- A non-empty `git diff --name-status ...` means there has been repo drift after the handoff commit in relevant PCC areas. That may be acceptable, but it must be inventoried before later prompts execute.
- If the working tree is not clean, do not edit. Report the dirty files and whether they appear related to Phase 03.

## Required Files to Inspect

Inspect current repo truth for each file below. Do not rely on memory.

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/state/usePccShellState.ts
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
playwright.pcc-live.config.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
package.json
apps/project-control-center/package.json
apps/project-control-center/config/package-solution.json
```

Also inspect the Phase 04 handoff inventory if present:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b8/handoff/Phase_04_Duplicate_Header_Card_Removal_Handoff_Inventory.md
```

## Required Governing References to Confirm

Confirm these files exist. Read only the portions needed to verify the Phase 03 constraints; do not perform a full scorecard audit in Prompt 01.

```text
docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Evidence_Taxonomy.md
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
```

If any are missing or renamed, report current repo truth and do not invent replacement references.

## Required Searches

Search production, test, docs, and Playwright code for:

```text
dataActiveSurfacePanel
data-pcc-active-surface-panel
main[role="tabpanel"]
PCC_SHELL_SURFACE_HEADER_METADATA
surfaceHeaderMetadata
surfaceSummaryItems
surfaceCues
readOnlyCue
PccProjectIntelligenceCard
PccDocumentsHeaderCard
PccTeamAccessHeaderCard
PccExternalSystemsLaunchPadHeaderCard
PccExternalSystemsHeaderCard
PccSiteHealthOverviewCard
PccSurfaceContextHeader
getSoleActivePanel
getActiveCompatibilityCard
activePanelCount
shellActivePanelCount
package-solution.json
config/package-solution.json
apps/project-control-center/config/package-solution.json
```

## Required Baseline Findings

### A. Git / Handoff Baseline

Report:

- `git status --short`.
- Current branch.
- Current HEAD.
- Whether the Phase 2 handoff commit is an ancestor of HEAD.
- Whether there are relevant diffs from the handoff commit to current HEAD.
- Whether those diffs affect Phase 03 shell/header/metadata/test/evidence posture.
- Whether it is safe to proceed to Prompt 02 after Prompt 01.

If HEAD has diverged from the handoff commit in relevant PCC files, classify the drift:

```text
No drift / Documentation-only drift / Test-only drift / Source drift requiring Prompt 02 adjustment / Blocking drift
```

### B. Shell Ownership

Confirm current `PccShell.tsx` still renders semantic shell ownership equivalent to:

```tsx
<main
  id={ACTIVE_PANEL_ID}
  role="tabpanel"
  aria-labelledby={`pcc-tab-${activeSurfaceId}`}
  data-pcc-active-surface-panel={activeSurfaceId}
>
```

Also confirm:

- `ACTIVE_PANEL_ID` value.
- `PccHorizontalTabs` receives `panelId={ACTIVE_PANEL_ID}`.
- Every tab emits `aria-controls={panelId}`.
- Tab IDs follow `pcc-tab-${surfaceId}`.
- `aria-labelledby` updates when `activeSurfaceId` changes.
- `PccApp` re-derives `heroViewModel` from `shell.activeSurfaceId`.

If any of this is no longer true, stop and report drift.

### C. Card Compatibility Marker

Confirm whether `PccDashboardCard.dataActiveSurfacePanel` remains available and whether duplicate/header cards still use it.

Clarify in the completion report:

- This is compatibility-only.
- Shell `<main role="tabpanel">` is the semantic active-panel owner.
- Broad `[data-pcc-active-surface-panel]` counts may currently include both shell main and one compatibility card.
- Prompt 01 does not authorize removal or demotion of the compatibility marker.

### D. Metadata Source of Truth

Confirm whether the source remains:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```

If another file has replaced it, identify that file and stop before implementation.

Confirm:

- It is keyed over `PccMvpSurfaceId`.
- It covers all eight current IDs from `PCC_MVP_SURFACE_IDS`.
- `surfaceSummaryItems`, `surfaceCues`, and `readOnlyCue` are present for every surface.
- Summary tones are restricted to the valid tone union.
- Metadata values are deterministic presentational strings.
- No values imply live counts, writeback authority, approval execution, repair execution, file operations, external writeback, settings mutation, or autonomous HBI decision-making.

### E. Exact Target Metadata Matrix

Before any code edits, define the exact target metadata for every current MVP surface:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

For each surface, provide an implementation-ready table:

| Field | Required Detail |
|---|---|
| Surface ID | Exact ID |
| Surface display name | Exact display name from `PCC_MVP_SURFACES` |
| Current secondary title | Current shell title |
| Current hero description | Exact current copy from `surfaceHeroCopy.ts` |
| Target summary items | IDs, labels, values, tones |
| Target cues | IDs, labels, values |
| Target read-only cue | Exact copy |
| Source type | Static copy / fixture-derived / read-model-derived |
| Fixture/reference file | File path if fixture-derived or read-model-derived |
| Duplicate-card content being absorbed | Exact card/content source, if applicable |
| Content intentionally not absorbed | Exact content and why it remains bento/Phase 04 |
| Tests required | Specific expected assertions |
| Phase 03 risk | Low / Medium / High |
| Prompt 02 action | Keep / revise / add field / defer |

The matrix must be exact enough that Prompt 02 can edit without re-deciding copy strategy.

### F. Project Home Content Extraction Boundary

For `project-home`, specifically inspect:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
```

Report which visible content units are safe to absorb into header metadata and which must remain in bento until Phase 04.

Minimum classification:

- Project stage/status/type pills.
- High-priority actions count.
- Pending approvals count.
- Blocking setup gaps count.
- Source meta label.
- HBI advisory cue.
- Client fact.
- Location fact.
- Estimated value fact.
- Scheduled completion fact.

Do not authorize removal of `PccProjectIntelligenceCard`.

### G. Duplicate/Header Card Boundary

Inventory but do not remove:

```text
Project Home — PccProjectIntelligenceCard
Documents — PccDocumentsHeaderCard
Team & Access — PccTeamAccessHeaderCard
Project Readiness — ReadinessHeroSlot / HeroCard / loading-error state cards
Approvals — HomeCard / Approvals home / loading-error state cards
External Systems — PccExternalSystemsLaunchPadHeaderCard
External Systems — PccExternalSystemsHeaderCard if still present and unused
Control Center Settings — overview/primary command card
Site Health — PccSiteHealthOverviewCard
```

For each item, report:

- Source file.
- Whether it is still rendered.
- Whether it has `dataActiveSurfacePanel`.
- Whether it is pure duplicate, partial duplicate, operational content, or state/degraded branch carrier.
- Whether any content may feed Prompt 02 metadata.
- Phase 04 disposition recommendation.
- Hard stop preventing Prompt 03+ removal.

### H. Test and Playwright Baseline

Report current coverage for:

- Header metadata covers all eight surfaces.
- Hero metadata renders for all eight surfaces.
- Shell metadata switches on tab change.
- Shell `main[role="tabpanel"]` active-panel ownership.
- `aria-controls` / `aria-labelledby`.
- Command search remains non-interactive.
- Bento direct-child invariant.
- Duplicate/header card compatibility markers.
- Playwright broad active-panel selector.
- Playwright shell active-panel evidence selector.
- Live evidence writer fields for `activePanelCount`, owner tag, role, id, shell count.

Identify exact test gaps that later prompts must close. At minimum, assess whether shell tab-switching assertions cover all eight surfaces or only selected surfaces.

### I. Package-Solution Path

Confirm this path exists:

```text
apps/project-control-center/config/package-solution.json
```

Confirm whether this stale path exists:

```text
config/package-solution.json
```

Search for stale root path references. Report each hit and whether it is:

```text
Current blocker / Historical doc only / Prompt-package reference to correct / Not relevant
```

Do not update files in Prompt 01.

## Prohibited in Prompt 01

- No runtime source changes.
- No test changes.
- No package changes.
- No lockfile changes.
- No SPFx package-solution changes.
- No webpart manifest changes.
- No duplicate-card removal.
- No module launcher implementation.
- No command routing.
- No active module state.
- No live evidence generation unless explicitly requested by the user.
- No broad formatting or unrelated cleanup.
- No committing.

## Stop Conditions

Stop and report before proceeding to Prompt 02 if any of these are true:

- Working tree has uncommitted files that overlap Phase 03 target files.
- `PccShell.tsx` no longer renders shell-owned `main[role="tabpanel"]`.
- `PccHorizontalTabs.tsx` no longer wires `aria-controls` to the panel ID.
- `surfaceHeaderMetadata.ts` is absent, unused, or no longer keyed over all eight surfaces.
- `PccCommandSearch` has become interactive without explicit authorization.
- `PccBentoGrid` direct-child assumptions have changed.
- Package-solution path has moved or current repo uses root `config/package-solution.json`.
- Current HEAD has source drift after handoff that changes shell/header/test/evidence assumptions and cannot be reconciled by Prompt 02.

## Acceptance Criteria

- Current repo truth verified.
- Handoff comparison completed.
- Drift identified and classified.
- Phase 2 shell ownership confirmed or blocked.
- Metadata source of truth confirmed or blocked.
- Exact metadata target matrix produced for all eight surfaces.
- Project Home content extraction boundary classified.
- Duplicate-card Phase 04 boundary confirmed.
- Test/Playwright baseline and gaps documented.
- Correct package-solution path confirmed.
- Prompt 02 changed-file list proposed.
- No files changed.

## Required Completion Response

Use this structure exactly:

```markdown
## Prompt 01 Repo Baseline Complete

## Git / Handoff Baseline
- `git status --short`:
- Current branch:
- Current HEAD:
- Phase 2 handoff commit:
- Handoff commit ancestor of HEAD:
- Relevant diff from handoff to HEAD:
- Drift classification:
- Safe to proceed to Prompt 02:

## Files Inspected
- ...

## Searches Performed
- ...

## Phase 2 Shell Ownership Verification
- `ACTIVE_PANEL_ID`:
- Shell `main[role="tabpanel"]` marker:
- `aria-labelledby`:
- `aria-controls` from tabs:
- Tab ID convention:
- Hero view-model re-derived from active surface:
- Card marker compatibility:
- Drift / blockers:

## Metadata Source-of-Truth Verification
- Source file:
- Exhaustiveness over `PccMvpSurfaceId`:
- Current summary item posture:
- Current cue posture:
- Current read-only cue posture:
- Forbidden authority language check:
- Current gaps:

## Exact Target Surface Metadata Matrix
<surface-by-surface table with all required fields from Section E>

## Project Home Content Extraction Boundary
<table or bullet matrix covering every required Project Home content unit>

## Duplicate/Header Card Phase 04 Handoff Boundary
<table covering every required duplicate/header card>

## Test and Playwright Baseline
- Header metadata tests:
- Hero rendering tests:
- Shell tab switching tests:
- Shell active-panel tests:
- Command search tests:
- Bento direct-child tests:
- Compatibility-marker tests:
- Playwright selector posture:
- Evidence writer posture:
- Gaps later prompts must close:

## Package-Solution Path Verification
- Valid path:
- Stale root path exists:
- Stale root path references found:
- Classification of stale references:

## Planned Changed Files for Prompt 02
- ...

## Validation Plan for Prompt 02+
- Typecheck:
- Test:
- Prettier:
- Diff check:
- Lockfile re-check:
- Package-solution check:

## Prompt 01 Final Decision
Approved for Prompt 02 planning / Approved with Prompt 02 refinements / Do not proceed
```
