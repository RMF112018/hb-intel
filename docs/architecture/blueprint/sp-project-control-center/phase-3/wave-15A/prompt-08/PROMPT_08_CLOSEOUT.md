# Wave 15A Prompt 08 Closeout

## Summary

Prompt 08 sharpened the four governance / risk / integration surfaces — Site Health, Control Center Settings, Approvals, and External Systems — using only the shared substrate landed in Prompts 02–07. The visual treatment of each surface's command-center card now matches the Prompt 07 hierarchy pattern (`hierarchy="primary"` accent border on the active-panel-owning card). Site Health gained a per-check severity-tier marker and a Repair Requests footprint promotion. Control Center Settings received its first test coverage and stable scope-cell markers. The last raw inert-button cluster on External Systems Project Links was migrated through `PccDisabledAffordance`.

- No backend / API changes
- No `@hbc/models` changes
- No router ID changes
- No active-panel ownership changes
- No shared layout primitive edits
- No first-impression surface redesign (Project Home / Team & Access / Documents / Project Readiness untouched)
- No new feature workflows; no integration enablement; no credentials
- Lockfile unchanged

## Confirmed base commit / HEAD before execution

`6b8c080a335f249a9206681646602fd89edb0407` — clean worktree (Wave D plan package was committed as doc-only on top of Prompt 07 runtime at `d4ed9159b`; no in-flight unrelated edits). `wave-e/` plan-package directory was the only authorized untracked local artifact at execution time and was excluded from staging.

## Site Health hierarchy / footprint / severity-marker decision

| Card | Before | After | Rationale |
| --- | --- | --- | --- |
| `PccSiteHealthOverviewCard` | `footprint="full"` | `footprint="full"` + `hierarchy="primary"` | The Overview is the Site Health command center (severity rollup, failing/warning counts). Promotion mirrors the pattern across Documents (Project Record), Project Readiness (Hero), Approvals (Home), and External Systems (Launch Pad). |
| `PccSiteHealthRepairRequestsCard` | `footprint="standard"` | `footprint="wide"` | Repair requests are the most actionable signal on the surface. Footprint math at `wideDesktop`: layout was `12 / 6+4 / 4+4=8` (6 cols slack across rows 2+3); after promotion `12 / 6+4 / 6+4=10` (4 cols slack). Both tighter and Repair reads at peer weight with Checks. |
| `PccSiteHealthChecksCard` | unchanged | + per-row `data-pcc-site-health-check-severity-tier="security|repair|warning|info|other"` marker | Maps existing `severity` field via a local `severityTier` helper. Stable structural marker for tests; no view-model change. Critical/Blocking + Security Risk → `security`; Repair Required → `repair`; Warning → `warning`; Info → `info`. |

`PccSiteHealthRepairRequestsCard` body cue scrubbed from `"Preview placeholder · no live repair runner is active in this preview."` → `"Repair runs are managed in SharePoint admin tooling."` (forbidden-token "Preview placeholder" / "in this preview" removed).

## Settings governance-marker decision and new test coverage

- **Header card** promoted to `hierarchy="primary"` (sole active-panel owner pattern).
- **Scope cells** now emit additive `data-pcc-settings-scope-id={id}` (`project|site|persona|integration`) and `data-pcc-settings-scope-state="preview"` markers. **Structural only** — no `locked` / `editable` / governance-authority semantics introduced; the surface is preview-only today and the `state="preview"` baseline reserves a slot for future product decisions without inventing copy.
- **New test file** `tests/PccControlCenterSettingsSurface.test.tsx` fills the zero-coverage gap. Asserts: bento direct-child invariant; sole active-panel owner; header card hierarchy; per-scope-cell markers; no enabled buttons / no http(s) anchors.

## Approvals decision

- **`HomeCard` promoted to `hierarchy="primary"`.** Visual review confirmed the shared-CSS treatment is a subtle 1px border-color shift toward the rail accent; it does not visually compete with the four metric pills, six state-count pills, and five mode-count pills already on the card. Same accent treatment as Documents / Project Readiness / Site Health / External Systems.
- **All other Prompt 05 work intact** — `DisabledActionsRow` already routes every inert action button (Queue, MyApprovals, Escalation, AdminVerification, DecisionHistorySeam) through `PccDisabledAffordance`; bento direct-child invariant covered by existing tests; seam cards already use `PccPreviewState state="not-yet-implemented-operation"` with the `reason`/`nextStep` slots from Prompt 05.
- New `it` extended in `tests/PccApprovalsSurface.test.tsx`: HomeCard emits `data-pcc-card-hierarchy="primary"`.

## External Systems disabled-affordance migration decision

- **`PccExternalSystemsLaunchPadHeaderCard` promoted to `hierarchy="primary"`.**
- **Project Links inert launch buttons migrated through `PccDisabledAffordance`.** Today's raw `<button disabled aria-disabled="true">` rendered next to a separate `<span data-pcc-launch-pad-link-disabled-reason>` was replaced with `<PccDisabledAffordance label="Open external system" reason={row.disabledReason} className={styles.linkRowAction} data-pcc-launch-pad-link-action="open" data-pcc-launch-pad-link-action-state="preview-disabled" />`.
- **Existing markers preserved via prop pass-through:** `data-pcc-launch-pad-link-action="open"` and `data-pcc-launch-pad-link-action-state="preview-disabled"` now land on the inner `<button>` rendered by `PccDisabledAffordance` (its `...rest` spread accepts arbitrary `data-*` props). The separate `<span data-pcc-launch-pad-link-disabled-reason={row.id}>` reason caption remains in place for backwards compatibility with two existing tests; the affordance also exposes its own internal `aria-describedby` reason node.
- Tests updated to drop the native `disabled` boolean check (the affordance uses `aria-disabled` only) and to additionally assert the `data-pcc-disabled-affordance-variant` marker on the matched element.

## Active-panel ownership preserved

| Surface | Sole owner of `data-pcc-active-surface-panel="…"` |
| --- | --- |
| `site-health` | `PccSiteHealthOverviewCard` (verified — `tests/PccSiteHealthSurface.test.tsx`) |
| `control-center-settings` | Header card on `PccControlCenterSettingsSurface` (verified — new `tests/PccControlCenterSettingsSurface.test.tsx`) |
| `approvals` | `HomeCard` on `PccApprovalsSurface` (verified — extended `tests/PccApprovalsSurface.test.tsx`) |
| `external-systems` | `PccExternalSystemsLaunchPadHeaderCard` (verified — extended `tests/PccExternalSystemsSurface.test.tsx`) |

All four assertions are net-new or extended Prompt 08 tests; no router-id or active-panel-ownership changes shipped.

## SPFx version before / after

| File | Before | After |
| --- | --- | --- |
| `apps/project-control-center/config/package-solution.json` (solution) | `1.0.0.10` | `1.0.0.11` |
| `apps/project-control-center/config/package-solution.json` (feature) | `1.0.0.10` | `1.0.0.11` |
| `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` | `1.0.0.10` | `1.0.0.11` |

## Files Changed

### New tests

- `apps/project-control-center/src/tests/PccControlCenterSettingsSurface.test.tsx` — first coverage for Settings: bento invariant, active-panel owner, header hierarchy, scope-cell markers, read-only surface guards.

### Modified — Site Health

- `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx` — `hierarchy="primary"`.
- `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthRepairRequestsCard.tsx` — footprint `standard` → `wide`; placeholder cue scrubbed of forbidden tokens.
- `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthChecksCard.tsx` — added `severityTier` helper + per-row `data-pcc-site-health-check-severity-tier` marker; exported new `PccSiteHealthSeverityTier` type.
- `apps/project-control-center/src/tests/PccSiteHealthSurface.test.tsx` — repair-cue assertion updated to product-grade copy; three new `it`s for hierarchy / footprint / severity-tier markers.

### Modified — Control Center Settings

- `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx` — header `hierarchy="primary"`; per-scope-cell `data-pcc-settings-scope-id` + `data-pcc-settings-scope-state="preview"` markers; `data-pcc-settings-scope-grid` wrapper marker.

### Modified — Approvals

- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx` — `HomeCard` `hierarchy="primary"`.
- `apps/project-control-center/src/tests/PccApprovalsSurface.test.tsx` — single new `it` asserting HomeCard hierarchy.

### Modified — External Systems

- `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx` — `hierarchy="primary"`.
- `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsProjectLinksCard.tsx` — inert launch buttons routed through `PccDisabledAffordance`; existing `data-*` markers preserved via prop pass-through.
- `apps/project-control-center/src/tests/PccExternalSystemsSurface.test.tsx` — disabled-affordance assertions migrated to the `PccDisabledAffordance` shape (`aria-disabled` + `data-pcc-disabled-affordance-variant`); single new `it` asserting LaunchPad header hierarchy.

### Versioning

- `apps/project-control-center/config/package-solution.json` (`1.0.0.10` → `1.0.0.11`).
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` (`1.0.0.10` → `1.0.0.11`).

### Closeout docs

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-08/PROMPT_08_CLOSEOUT.md` (this file).
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-08/README.md`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-08/evidence/screenshots/after/` (operator-pending captures).

## Validation commands and results

```text
1. pnpm --filter @hbc/spfx-project-control-center check-types
   pass

2. pnpm --filter @hbc/spfx-project-control-center test
   pass — 79 test files / 1641 tests

3. pnpm --filter @hbc/spfx-project-control-center build
   pass — vite production build (dist/spfx-project-control-center.css 71.48 kB,
   dist/project-control-center-app.js 829.50 kB)

4. pnpm exec prettier --check <changed files>
   pass — all formatted
```

No workspace-wide validation was run (no shared exports / contracts changed). No `pnpm install` / `pnpm add` invoked.

## Lockfile MD5 before / after

| When | `pnpm-lock.yaml` MD5 |
| --- | --- |
| Before edits (`HEAD = 6b8c080a3`) | `c56df7b79986896624536aab74d609f4` |
| After edits | `c56df7b79986896624536aab74d609f4` |

No drift.

## User-visible forbidden-token grep results

Final scan over `apps/project-control-center/src/surfaces/siteHealth`, `apps/project-control-center/src/surfaces/controlCenterSettings`, `apps/project-control-center/src/surfaces/approvals`, and `apps/project-control-center/src/surfaces/externalSystems`, excluding `*.test.*`, JSDoc comments, and string-literal type-union members:

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
| `"Preview placeholder"` | 0 |
| `\bWave [0-9]+\b` in JSX text or string literals | 0 |
| `\bPrompt [0-9]+\b` in JSX text or string literals | 0 |

## Screenshot evidence index

`evidence/screenshots/after/` — **OPERATOR-PENDING.** Captures listed below must be taken from the local PCC dev harness using `<PccBentoGrid forceMode={...}>` overrides. Tenant-hosted evidence is explicitly deferred to Prompt 09.

Required captures (4 surfaces × 4 widths = 16 files):

| Surface | Width | Filename |
| --- | --- | --- |
| Site Health | desktop wide | `prompt08-layout-after-site-health-desktop-wide.png` |
| Site Health | SharePoint-constrained simulated | `prompt08-layout-after-site-health-sharepoint-constrained-simulated.png` |
| Site Health | tablet | `prompt08-layout-after-site-health-tablet.png` |
| Site Health | narrow / container | `prompt08-layout-after-site-health-narrow-container.png` |
| Control Center Settings | desktop wide | `prompt08-layout-after-control-center-settings-desktop-wide.png` |
| Control Center Settings | SharePoint-constrained simulated | `prompt08-layout-after-control-center-settings-sharepoint-constrained-simulated.png` |
| Control Center Settings | tablet | `prompt08-layout-after-control-center-settings-tablet.png` |
| Control Center Settings | narrow / container | `prompt08-layout-after-control-center-settings-narrow-container.png` |
| Approvals | desktop wide | `prompt08-layout-after-approvals-desktop-wide.png` |
| Approvals | SharePoint-constrained simulated | `prompt08-layout-after-approvals-sharepoint-constrained-simulated.png` |
| Approvals | tablet | `prompt08-layout-after-approvals-tablet.png` |
| Approvals | narrow / container | `prompt08-layout-after-approvals-narrow-container.png` |
| External Systems | desktop wide | `prompt08-layout-after-external-systems-desktop-wide.png` |
| External Systems | SharePoint-constrained simulated | `prompt08-layout-after-external-systems-sharepoint-constrained-simulated.png` |
| External Systems | tablet | `prompt08-layout-after-external-systems-tablet.png` |
| External Systems | narrow / container | `prompt08-layout-after-external-systems-narrow-container.png` |

## Tenant evidence

**OPERATOR-PENDING / deferred to Prompt 09.** Wave 15A README forbids hosted tenant claims before Prompt 09 closeout. No tenant probe, no app-catalog upload, no `.sppkg` generation, no Graph / PnP / Procore / Document Crunch / Adobe Sign / Sage call was executed.

## Residual risks

- **Operator-pending screenshots.** All 16 captures (4 surfaces × 4 widths) queued for the operator before Prompt 09 tenant validation.
- **Settings scope-state markers are baseline-only.** `data-pcc-settings-scope-state="preview"` reserves the slot. Future product work that introduces `locked` / `editable` semantics will need to (a) extend the marker vocabulary and (b) add reason copy. Today there is no record-backed governance authority field to derive from (per `feedback_no_invented_record_fields`).
- **Severity-tier helper is local to PccSiteHealthChecksCard.** If other Site Health components (Drift, Repair Requests) grow severity-tier visualizations, the helper should move to a shared module. Today it's the only consumer.
- **Approvals HomeCard hierarchy.** Visual review confirmed the accent treatment is subtle and does not compete with metric pills. If product review later disagrees, the change is one prop removal.
- **No regression-fix call-outs** were required against Project Home, Team & Access, Documents, or Project Readiness during this remediation.

## Stop conditions encountered

None. The footprint promotion math was verified via `FOOTPRINT_COLUMN_SPANS` before committing. The shared `data-pcc-card-hierarchy` CSS gate already passed in Prompt 07 and remained valid. No backend / view-model field synthesis was needed; no real-integration enablement required. Project Links inert button migration preserved every existing `data-*` marker via prop pass-through; no marker rename.

## Next prompt

`Prompt_09_Tenant_Validation_56_Scorecard_And_Closeout.md`
