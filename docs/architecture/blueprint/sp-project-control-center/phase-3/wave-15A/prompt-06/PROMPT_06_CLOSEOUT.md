# Wave 15A Prompt 06 Closeout

## Summary

Prompt 06 remediated the two highest-visibility routed PCC surfaces — Project Home and Team & Access — using only the shared substrate landed in Prompts 02–05 (`PccBentoGrid`, `PccDashboardCard`, `PccSurfaceContextHeader`, `PccPreviewState`, `pccSurfacePostureCopy`, `PccDisabledAffordance`). No shared layout primitives, view-model contracts, router IDs, active-panel ownership, or `@hbc/models` types were touched.

- Project Home bento composition reordered so the priority cluster (priority actions → setup gaps → operational health → pending decisions → readiness) reaches the user before reference and history content.
- `PccMissingConfigurationsCard` promoted from `compact` → `standard` for first-scan presence — promotion is clean under the existing `FOOTPRINT_COLUMN_SPANS` for every responsive mode.
- Team & Access lane footprints kept at `wide` / `wide` / `full` — current mix already fits cleanly at every responsive mode (`wideDesktop` 6+6=12; min-protections handle narrower modes). The collapse the user observed was an internal-density problem, not a footprint-mix problem.
- Permission Request and Access Manager lanes now expose explicit in-card hierarchy via a new `.laneSection` utility (no card-in-card).
- Access Manager inert action row routed through `PccDisabledAffordance` with paired `aria-describedby` reason content.
- SPFx 4-part version bumped `1.0.0.8` → `1.0.0.9` for SharePoint manifest "Project Control Center".

## Footprint decision and rationale

| Card | Before | After | Why |
| --- | --- | --- | --- |
| `PccMissingConfigurationsCard` | `compact` | `standard` | At `wideDesktop` 3 → 4 cols, at `standardDesktop` 2 → 3 cols. Both wider, none degraded by min-protection. At `tabletPortrait` `compact`=1 vs `standard` min=2 — `standard` becomes full-width single column (preferable to half-width stranded card). At `phone` both = 1 (no change). Net: better first-scan presence with no narrow-mode regression. |
| Team & Access `team-viewer` lane | `wide` | `wide` (kept) | At `wideDesktop` lane shell renders 2 lanes per branch where rebalance is relevant: `wide`+`wide` = 6+6 = 12 (perfect fit). No bento gap. Demoting to `standard` (4 cols) would leave 4 cols slack. Current footprint is optimal — collapse remediated via internal `.laneSection` hierarchy instead. |
| Team & Access `permission-request` lane | `wide` | `wide` (kept) | Same rationale as Team Viewer; pairs cleanly at every mode. Internal hierarchy added via `.laneSection`. |
| Team & Access `access-manager` lane | `full` | `full` (kept) | Lane intentionally fills its own row (`12` cols at `wideDesktop`). Internal sections added; inert action buttons routed through `PccDisabledAffordance`. |

Decision pinned against `apps/project-control-center/src/layout/footprints.ts:FOOTPRINT_COLUMN_SPANS` and `FOOTPRINT_MIN_COLUMN_SPANS` at execution time.

## Active-panel ownership preserved

- `PccProjectIntelligenceCard` remains the **sole** owner of `data-pcc-active-surface-panel="project-home"`. Verified by `tests/PccProjectHome.composition.test.tsx` ("exactly one [data-pcc-active-surface-panel='project-home'] exists, carried by the Project Intelligence card").
- `PccTeamAccessHeaderCard` (introduced in Prompt 05) remains the **sole** owner of `data-pcc-active-surface-panel="team-and-access"`. Verified by `tests/PccTeamAccessSurface.layout.test.tsx` ("exactly one [data-pcc-active-surface-panel='team-and-access'] exists").

## SPFx version before / after

| File | Before | After |
| --- | --- | --- |
| `apps/project-control-center/config/package-solution.json` (solution) | `1.0.0.8` | `1.0.0.9` |
| `apps/project-control-center/config/package-solution.json` (feature) | `1.0.0.8` | `1.0.0.9` |
| `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` | `1.0.0.8` | `1.0.0.9` |

## Files Changed

### New tests

- `apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx` — fixture + read-model bento ordering invariant; Missing Configurations footprint; active-panel ownership.
- `apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx` — lane footprint markers; bento direct-child invariant; Permission Request + Access Manager lane-section structure; Access Manager `PccDisabledAffordance` reason chain; no card-in-card.

### Modified — Project Home

- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx` — fixture path reordered to put priority cluster ahead of reference / history.
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx` — read-model path reordered to mirror fixture; Procore snapshot moved adjacent to Site Health (source-confidence cluster); unified-lifecycle and Ask HBI sections continue to anchor below the first-scan + reference cluster.
- `apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx` — footprint `compact` → `standard`.

### Modified — Team & Access

- `apps/project-control-center/src/surfaces/teamAccess/PccPermissionRequestLaneCard.tsx` — three explicit `.laneSection` regions (request form, permission templates, request queue) with semantic headings.
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessManagerLaneCard.tsx` — four explicit `.laneSection` regions (actions, execution status, execution queue, permission templates); inert action row routed through `PccDisabledAffordance` (3 actions × shared product-grade reason).
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.module.css` — added `.laneSection`, `.laneSectionTitle`; added `min-width: 0` to `.body` and `.queueRow` for narrow-width text-truncation safety.

### Versioning

- `apps/project-control-center/config/package-solution.json` (`1.0.0.8` → `1.0.0.9`).
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` (`1.0.0.8` → `1.0.0.9`).

### Closeout docs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-06/PROMPT_06_CLOSEOUT.md` (this file).
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-06/README.md`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-06/evidence/screenshots/after/` (operator-pending captures).

## Validation commands and results

```text
1. pnpm --filter @hbc/spfx-project-control-center check-types
   pass

2. pnpm --filter @hbc/spfx-project-control-center test
   pass — 76 test files / 1615 tests

3. pnpm --filter @hbc/spfx-project-control-center build
   pass — vite production build (dist/spfx-project-control-center.css 71.48 kB,
   dist/project-control-center-app.js 828.54 kB)

4. pnpm exec prettier --check <changed files>
   pass — all formatted
```

No workspace-wide validation was run (no shared exports / contracts changed). No `pnpm install` / `pnpm add` invoked.

## Lockfile MD5 before / after

| When | `pnpm-lock.yaml` MD5 |
| --- | --- |
| Before edits (`HEAD = a79d62155`) | `c56df7b79986896624536aab74d609f4` |
| After edits | `c56df7b79986896624536aab74d609f4` |

No drift.

## User-visible copy grep results (Project Home + Team & Access)

Final scan over `apps/project-control-center/src/surfaces/projectHome` and `apps/project-control-center/src/surfaces/teamAccess` excluding `*.test.*`, JSDoc comments, and string-literal type-union members:

| Token pattern | Hits |
| --- | --- |
| `"Read-only preview"` | 0 |
| `"Fixture default"` | 0 |
| `"Preview confidence"` | 0 |
| `"Pending envelope"` | 0 |
| `"Read-model available"` | 0 |
| `"Envelope confidence"` | 0 |
| `"Runtime envelope timestamp"` | 0 |
| `"Not connected in this prompt"` | 0 |
| `"in this preview"` | 0 |
| `"in this prompt"` | 0 |
| `"preview-safe"` | 0 |
| `"fixture-driven"` | 0 |
| `"preview mode"` | 0 |
| `"Inert preview"` | 0 |
| `\bWave [0-9]+\b` in JSX text or string literals | 0 |
| `\bPrompt [0-9]+\b` in JSX text or string literals | 0 |

## Screenshot evidence index

`evidence/screenshots/after/` — **OPERATOR-PENDING.** Captures listed below must be taken from the local PCC dev harness using `<PccBentoGrid forceMode={...}>` overrides. Tenant-hosted evidence is explicitly deferred to Prompt 09.

Required captures:

| Surface | Width | Filename |
| --- | --- | --- |
| Project Home | desktop wide (`wideDesktop`) | `prompt06-layout-after-project-home-desktop-wide.png` |
| Project Home | SharePoint-constrained simulated (`standardDesktop` at narrow viewport) | `prompt06-layout-after-project-home-sharepoint-constrained-simulated.png` |
| Project Home | tablet (`tabletLandscape` or `tabletPortrait`) | `prompt06-layout-after-project-home-tablet.png` |
| Project Home | narrow / container (`phone`) | `prompt06-layout-after-project-home-narrow-container.png` |
| Team & Access (access-manager branch) | desktop wide | `prompt06-layout-after-team-and-access-desktop-wide.png` |
| Team & Access (access-manager branch) | SharePoint-constrained simulated | `prompt06-layout-after-team-and-access-sharepoint-constrained-simulated.png` |
| Team & Access (access-manager branch) | tablet | `prompt06-layout-after-team-and-access-tablet.png` |
| Team & Access (access-manager branch) | narrow / container if harness route renders at phone width | `prompt06-layout-after-team-and-access-narrow-container.png` |

## Tenant evidence

**OPERATOR-PENDING / deferred to Prompt 09.** Wave 15A README forbids hosted tenant claims before Prompt 09 closeout. No tenant probe, no app-catalog upload, no `.sppkg` generation, no Graph / PnP / Procore / Document Crunch / Adobe Sign call was executed.

## Residual risks

- **Operator-pending screenshots.** All required captures are queued for the operator before Prompt 09 tenant validation. The local dev harness already exposes `forceMode` on `PccBentoGrid` so capture is mechanical.
- **Footprint decision is composition-stable.** If a future surface request demands a different mix at standardDesktop or tabletLandscape, revisit the Team & Access lane footprints with the same `FOOTPRINT_COLUMN_SPANS` validation gate documented above.
- **`.laneSection` is presentational.** It introduces semantic `<section>` + `<h4>` only inside lane card bodies; no view-model or contract change.
- **Adjacent surface regression check.** No regression-fix call-outs against Documents, Project Readiness, Site Health, Settings, Approvals, or External Systems were required during this remediation. If subsequent screenshots reveal one, scope the fix narrowly and record under a follow-up.
- **Product-review pass on revised lane-section headings.** The new "Request" / "Open requests" / "Actions" / "Execution status" / "Open assignments" / "Permission templates" labels are tighter than the prior label-less density but remain subject to product-owner review.

## Stop conditions encountered

None. The footprint mix at every responsive mode satisfied the math without primitive changes. The Team & Access collapse remediation reduced to in-card hierarchy, which the user explicitly authorized via `.laneSection` (not card-in-card). No backend / view-model field synthesis was needed.

## Next prompt

`Prompt_07_Documents_And_Project_Readiness_Surface_Remediation.md`
