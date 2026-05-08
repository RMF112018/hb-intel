# Prompt 01 — Repo Baseline and Phase 2 Verification

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Shared Guardrails

- Work from current repo truth.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between PCC surfaces and work centers/modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not implement full Modules launcher behavior.
- Do not implement command routing.
- Do not introduce active module state.
- Do not remove duplicate/header cards in Phase 03.
- Do not change `pnpm-lock.yaml`, package dependencies, or SPFx package-solution files unless a prompt explicitly proves it is unavoidable and the user approves.
- Use `apps/project-control-center/config/package-solution.json` for package-solution references.

---

## Role

You are the local code agent for Phase 03. This prompt is a **pre-edit repo-truth gate**.

Do not make runtime edits in this prompt. Your job is to verify current repo truth, confirm whether Phase 2 prerequisites still exist, and define the exact target metadata matrix before implementation begins.

## Objective

Confirm the current implementation baseline and produce a complete, exact metadata target matrix for all eight MVP surfaces.

This prompt must tighten the following items before any later prompt edits:

1. Re-check current `main` because the repo is moving quickly.
2. Confirm whether Phase 2 shell ownership still exists exactly as audited.
3. Confirm whether `surfaceHeaderMetadata.ts` is still the correct source of truth.
4. Define the exact target metadata per surface before editing.
5. Keep Phase 03 strictly focused on conditional command header content, not Phase 04 duplicate-card removal.
6. Treat `PccProjectIntelligenceCard` and other header cards as Phase 04 handoff inventory, except for content extraction needed to populate header metadata.
7. Correct all validation references to `apps/project-control-center/config/package-solution.json`.

## Required First Actions

Run:

```bash
git status --short
```

Then inspect current repo truth.

## Required Files to Inspect

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/state/usePccShellState.ts
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/config/package-solution.json
```

## Required Searches

Search production, test, and Playwright code for:

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
PccSiteHealthOverviewCard
package-solution.json
```

## Required Baseline Findings

### A. Shell Ownership

Confirm current `PccShell.tsx` still renders semantic shell ownership equivalent to:

```tsx
<main
  id={ACTIVE_PANEL_ID}
  role="tabpanel"
  aria-labelledby={`pcc-tab-${activeSurfaceId}`}
  data-pcc-active-surface-panel={activeSurfaceId}
>
```

If this is no longer true, stop and report drift.

### B. Card Compatibility Marker

Confirm whether `PccDashboardCard.dataActiveSurfacePanel` remains available and still used by duplicate/header cards.

Clarify that this is compatibility only, not semantic ownership.

### C. Metadata Source of Truth

Confirm whether the source remains:

```text
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```

If another file has replaced it, identify that file and stop before implementation.

### D. Exact Target Metadata Matrix

Before any code edits, define the exact target metadata for each current MVP surface:

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

For each surface, specify:

| Field | Required Detail |
|---|---|
| Summary items | IDs, labels, values, tones |
| Cues | IDs, labels, values |
| Read-only cue | Exact copy |
| Source | Static copy or fixture-derived |
| Fixture/reference file | File path if fixture-derived |
| Tests | Expected assertion(s) |

### E. Duplicate/Header Card Boundary

Inventory but do not remove:

```text
Project Home — PccProjectIntelligenceCard
Documents — PccDocumentsHeaderCard
Team & Access — PccTeamAccessHeaderCard
Project Readiness — ReadinessHeroSlot / HeroCard
Approvals — HomeCard / Approvals home
External Systems — PccExternalSystemsLaunchPadHeaderCard
Control Center Settings — overview/primary command card
Site Health — PccSiteHealthOverviewCard
```

### F. Package-Solution Path

Confirm this path exists or report current repo truth:

```text
apps/project-control-center/config/package-solution.json
```

Do not use stale root:

```text
config/package-solution.json
```

## Prohibited in Prompt 01

- No runtime source changes.
- No tests changes.
- No package changes.
- No lockfile changes.
- No duplicate-card removal.
- No module launcher implementation.
- No command routing.

## Acceptance Criteria

- Current repo truth verified.
- Drift identified if present.
- Exact metadata target matrix produced.
- Duplicate-card removal boundary confirmed.
- Correct package-solution path confirmed.
- Prompt 02 changed-file list proposed.

## Required Completion Response

```markdown
## Prompt 01 Repo Baseline Complete

## Git / Main Baseline
- `git status --short`:
- Current branch / HEAD if checked:

## Files Inspected

## Searches Performed

## Phase 2 Shell Ownership Verification
- Shell `main[role="tabpanel"]` marker:
- `aria-labelledby`:
- `aria-controls` from tabs:
- Card marker compatibility:

## Metadata Source-of-Truth Verification
- Source file:
- Exhaustiveness over `PccMvpSurfaceId`:
- Current gaps:

## Exact Target Surface Metadata Matrix
<surface-by-surface table>

## Duplicate/Header Card Phase 04 Handoff Boundary
<inventory>

## Package-Solution Path Verification
- Valid path:
- Stale path references found:

## Planned Changed Files for Prompt 02

## Validation Plan
```
