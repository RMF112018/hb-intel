# Wave 15A Prompt 07 Closeout

## Summary

Prompt 07 sharpened the Documents and Project Readiness surfaces using only the shared substrate landed in Prompts 02–06. Documents now declares an explicit Project Record / working-files / external-launch tier on each lane card via the existing `PccDashboardCard.hierarchy` prop and a new additive `data-pcc-document-lane-tier` marker. Project Readiness moved its Wave 8 BlockersCard and Wave 9 LifecycleBlockersCard earlier in the cascade and promoted both to `footprint="full"` + `hierarchy="primary"`, eliminating the "blockers buried behind reference content" first-scan problem. Ownership escalation chips are now routed through `PccDisabledAffordance` so every inert chip carries an `aria-describedby` reason node.

- No backend / API changes
- No `@hbc/models` changes
- No router ID changes
- No active-panel ownership changes
- No shared layout primitive edits
- No Project Home / Team & Access redesign
- No Site Health / Settings / Approvals / External Systems edits
- Lockfile unchanged

## Confirmed base commit / HEAD before execution

`6b9f3fc4608f95ae728f94aba4999e6cd15491e4` — clean worktree (Wave B / Wave C / Wave D plan packages were committed prior to Prompt 07; no in-flight unrelated edits).

## Documents lane-tier decision and rationale

| Lane | Tier marker | `hierarchy` | Rationale |
| --- | --- | --- | --- |
| Project Record (`data-pcc-doc-lane="project-record"`) | `data-pcc-document-lane-tier="source-of-record"` | `primary` | Project Record is the formal, authoritative project file repository. Promoting it visually via `data-pcc-card-hierarchy="primary"` (which the shared `PccDashboardCard.module.css` styles with an accent border) tells the user at a glance which lane is canonical. Eyebrow tightened to `"Source of record"`. |
| My Project Files (`data-pcc-doc-lane="my-project-files"`) | `data-pcc-document-lane-tier="working-files"` | `standard` (default) | Working files are personal scratch space; not yet part of the formal project record until submitted. Default hierarchy treatment leaves it visually equal but identified by a clear tier marker. Eyebrow tightened to `"Working files"`. |
| External Systems (`data-pcc-doc-lane="external-systems"`) | `data-pcc-document-lane-tier="external-launch"` | `supporting` | External systems are launch-only; PCC never mirrors / syncs / writes back. Visual demotion via `data-pcc-card-hierarchy="supporting"` (slight opacity reduction in the shared CSS) signals the lower data-fidelity surface. Eyebrow tightened to `"External launches"`. |

`data-pcc-card-hierarchy` is treated by `apps/project-control-center/src/layout/PccDashboardCard.module.css` lines 11–17 (primary border-color accent) and lines 19–21 (supporting opacity). The shared CSS gate **passed** at execution time, so visual treatment lands without any shared-primitive change.

The lane description for `project-record` was scrubbed of the `"in this preview"` developer-leak ("file actions are read-only in this preview" → "document actions are managed in SharePoint"); other lane descriptions were already product-grade after Prompt 05.

## Project Readiness blocker hierarchy decision and rationale

### Wave 8 framework

Order before:
```
Hero(full) → LifecycleGateMap(full) → DomainGrid(full) → Blockers(wide) → Ownership(wide) → PriorityActions(wide) → Evidence(wide) → DownstreamModules(full)
```

Order after:
```
Hero(full) → LifecycleGateMap(full) → Blockers(full, hierarchy=primary) → DomainGrid(full) → Ownership(wide) → PriorityActions(wide) → Evidence(full) → DownstreamModules(full)
```

Rationale:
- **BlockersCard moved up from row 4 to row 3** so blockers reach the user immediately after the lifecycle map. Blockers are the single most actionable readiness signal; first-scan placement matches scorecard intent.
- **BlockersCard footprint promoted from `wide` to `full`** so it claims the entire row and reads as the primary attention card.
- **`hierarchy="primary"`** triggers the shared accent-border CSS on the BlockersCard so the visual weight matches the cascade priority.
- **EvidenceSourceHealthCard footprint promoted from `wide` to `full`** so the row math stays clean: `wideDesktop` 12-col rows now read `12 → 12 → 12 → 12 → 6+6=12 → 12 → 12` with no slack.
- All other Wave 8 footprints unchanged.

### Wave 9 lifecycle

Order before:
```
LifecycleHero(full) → LifecycleMap(full) → LifecycleFamilyDomains(full) → LifecycleMyActions(wide) → LifecycleBlockers(wide) → LifecycleEvidence(wide) → LifecycleFutureCloseout(standard) → LifecycleSourceTraceability(standard) → LifecycleReadinessSignals(full)
```

Order after:
```
LifecycleHero(full) → LifecycleMap(full) → LifecycleBlockers(full, hierarchy=primary) → LifecycleFamilyDomains(full) → LifecycleMyActions(wide) → LifecycleEvidence(wide) → LifecycleFutureCloseout(standard) → LifecycleSourceTraceability(standard) → LifecycleReadinessSignals(full)
```

Rationale:
- **LifecycleBlockersCard moved up from row 5 to row 3** so blockers precede family-domain decomposition and lifecycle action lanes.
- **LifecycleBlockersCard footprint promoted from `wide` to `full`** plus `hierarchy="primary"` for the same visual treatment as Wave 8 BlockersCard.
- All other Wave 9 footprints unchanged. The pre-existing 4-col slack on row 6 (`standard` + `standard` = 8 of 12 at wideDesktop) is preserved — not a Prompt 07 regression.

### Ownership escalation routing

`OwnershipAccountabilityCard` previously rendered escalation persona chips as raw `<span className={inertChip}>` elements. Each chip is now wrapped in `<PccDisabledAffordance variant="chip">` carrying `reason="Escalations are managed by your PCC administrator."`. The existing `data-pcc-readiness-ownership-escalation={persona}` marker is preserved on the wrapping `<span>` so all consumer assertions (e.g. `tests/PccProjectReadinessSurface.test.tsx:182-183`) remain green. Each chip now exposes:

- `aria-disabled="true"` (semantic disabled state)
- `aria-describedby` resolving to a non-empty reason node
- consistent visual treatment via `PccDisabledAffordance` styles

## Active-panel ownership preserved

- `PccDocumentsHeaderCard` remains the **sole** owner of `data-pcc-active-surface-panel="documents"`. Verified in `tests/PccDocumentsSurface.tier.test.tsx` ("exactly one [data-pcc-active-surface-panel='documents'] exists, on the header card").
- `HeroCard` remains the **sole** owner of `data-pcc-active-surface-panel="project-readiness"`. Verified in `tests/PccProjectReadinessSurface.hierarchy.test.tsx` ("HeroCard remains the sole [data-pcc-active-surface-panel='project-readiness'] owner").

## SPFx version before / after

| File | Before | After |
| --- | --- | --- |
| `apps/project-control-center/config/package-solution.json` (solution) | `1.0.0.9` | `1.0.0.10` |
| `apps/project-control-center/config/package-solution.json` (feature) | `1.0.0.9` | `1.0.0.10` |
| `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` | `1.0.0.9` | `1.0.0.10` |

## Files Changed

### New tests

- `apps/project-control-center/src/tests/PccDocumentsSurface.tier.test.tsx` — lane-tier markers; per-lane `data-pcc-card-hierarchy`; eyebrow short-form; sole active-panel owner.
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.hierarchy.test.tsx` — Wave 8 BlockersCard hierarchy + footprint + DOM order vs DomainGrid; Evidence footprint; Wave 9 LifecycleBlockersCard hierarchy + footprint + DOM order vs LifecycleFamilyDomains; Hero sole active-panel owner; Ownership escalation chips routed through `PccDisabledAffordance` with paired reason nodes.

### Modified — Documents

- `apps/project-control-center/src/surfaces/documents/PccDocumentControlLaneCard.tsx` — per-lane `LANE_TIER`, `LANE_EYEBROW`, `LANE_HIERARCHY` constants; `PccDashboardCard` now receives `hierarchy` and product-grade `eyebrow`; lane root emits the additive `data-pcc-document-lane-tier` marker; existing markers preserved.
- `apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts` — scrub `"in this preview"` from the `project-record` lane description.

### Modified — Project Readiness

- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`:
  - Wave 8 ready and fixture-scaffold paths reordered so BlockersCard precedes DomainGrid.
  - BlockersCard `footprint="full"` + `hierarchy="primary"`.
  - EvidenceSourceHealthCard `footprint="full"` for clean row math.
  - Wave 9 lifecycle composition reordered so LifecycleBlockersCard precedes LifecycleFamilyDomains.
  - LifecycleBlockersCard `footprint="full"` + `hierarchy="primary"`.
  - Ownership escalation chips routed through `PccDisabledAffordance variant="chip"` with paired reason copy; existing `data-pcc-readiness-ownership-escalation={persona}` marker preserved on the wrapping `<span>`.
  - New import: `PccDisabledAffordance`.

### Versioning

- `apps/project-control-center/config/package-solution.json` (`1.0.0.9` → `1.0.0.10`).
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` (`1.0.0.9` → `1.0.0.10`).

### Closeout docs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-07/PROMPT_07_CLOSEOUT.md` (this file).
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-07/README.md`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-07/evidence/screenshots/after/` (operator-pending captures).

## Validation commands and results

```text
1. pnpm --filter @hbc/spfx-project-control-center check-types
   pass

2. pnpm --filter @hbc/spfx-project-control-center test
   pass — 78 test files / 1630 tests

3. pnpm --filter @hbc/spfx-project-control-center build
   pass — vite production build (dist/spfx-project-control-center.css 71.48 kB,
   dist/project-control-center-app.js 829.06 kB)

4. pnpm exec prettier --check <changed files>
   pass — all formatted (warnings on unrelated docs/architecture/plans/.../wave-d/
   files were ignored as authorized unrelated local artifacts)
```

No workspace-wide validation was run (no shared exports / contracts changed). No `pnpm install` / `pnpm add` invoked.

## Lockfile MD5 before / after

| When | `pnpm-lock.yaml` MD5 |
| --- | --- |
| Before edits (`HEAD = 6b9f3fc46`) | `c56df7b79986896624536aab74d609f4` |
| After edits | `c56df7b79986896624536aab74d609f4` |

No drift.

## User-visible forbidden-token grep results

Final scan over `apps/project-control-center/src/surfaces/documents` and `apps/project-control-center/src/surfaces/projectReadiness` excluding `*.test.*`, JSDoc comments, and string-literal type-union members:

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
| Documents | desktop wide (`wideDesktop`) | `prompt07-layout-after-documents-desktop-wide.png` |
| Documents | SharePoint-constrained simulated (`standardDesktop` at narrow viewport) | `prompt07-layout-after-documents-sharepoint-constrained-simulated.png` |
| Documents | tablet (`tabletLandscape` or `tabletPortrait`) | `prompt07-layout-after-documents-tablet.png` |
| Documents | narrow / container (`phone`) | `prompt07-layout-after-documents-narrow-container.png` |
| Project Readiness | desktop wide | `prompt07-layout-after-project-readiness-desktop-wide.png` |
| Project Readiness | SharePoint-constrained simulated | `prompt07-layout-after-project-readiness-sharepoint-constrained-simulated.png` |
| Project Readiness | tablet | `prompt07-layout-after-project-readiness-tablet.png` |
| Project Readiness | narrow / container | `prompt07-layout-after-project-readiness-narrow-container.png` |

## Tenant evidence

**OPERATOR-PENDING / deferred to Prompt 09.** Wave 15A README forbids hosted tenant claims before Prompt 09 closeout. No tenant probe, no app-catalog upload, no `.sppkg` generation, no Graph / PnP / Procore / Document Crunch / Adobe Sign call was executed.

## Residual risks

- **Operator-pending screenshots.** All required captures are queued for the operator before Prompt 09 tenant validation.
- **Eyebrow short-form copy** (`"Source of record"`, `"Working files"`, `"External launches"`) and the new ownership escalation reason wording (`"Escalations are managed by your PCC administrator."`) remain subject to product-owner review; centralized constants make follow-up edits trivial.
- **Bento bento direct-child invariant** for Project Readiness is now partly covered by the new hierarchy test (DOM order via `compareDocumentPosition`); a dedicated direct-child invariant test for every Project Readiness card remains a follow-up item if regressions emerge.
- **No regression-fix call-outs** were required against Project Home, Team & Access, Site Health, Settings, Approvals, or External Systems during this remediation.
- **Wave 9 source traceability + future closeout footprint slack** at `wideDesktop` (4 cols) is pre-existing and was deliberately not changed in Prompt 07's scope.

## Stop conditions encountered

None. Shared `data-pcc-card-hierarchy` CSS gate **passed** at execution time so the visual-tiering portion shipped without any shared-primitive change. No view-model or backend field synthesis was needed to strengthen the blocker hierarchy — pure composition and footprint changes sufficed.

## Next prompt

`Prompt_08_Site_Health_Settings_Approvals_External_Systems_Remediation.md`
