# Wave 15A — wave-b2 — Prompt 03 — Tab Rail No-Icons, Labels, and Motion — Closeout

## 1. Objective

Turn the PCC horizontal tab rail into a premium text-only navigation band: drop all tab icons, rename the `external-systems` tab label from `Apps` to `External Platforms`, migrate every CSS color literal to existing `@hbc/ui-kit` branded tokens, introduce a stronger selected-state treatment with restrained motion (180–200ms) and a `prefers-reduced-motion` safeguard, and preserve all keyboard / a11y behavior. Update `PCC_MVP_SURFACES['external-systems'].displayName` so the user-visible chain (tab → hero secondary title → header card eyebrow) stays consistent with the new tab label.

## 2. Files Changed

Authoritative source: `git show --name-only HEAD`. Changed paths in this commit:

```
apps/project-control-center/src/shell/PccHorizontalTabs.module.css     M
apps/project-control-center/src/shell/PccHorizontalTabs.tsx            M
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx       M
packages/models/src/pcc/PccMvpSurfaces.ts                              M
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_03_Tab_Rail_Closeout.md  A
```

The untracked wave-b2 plan dir at `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b2/` remains untracked and is **out of scope** for this commit.

## 3. Behavior Changed

### 3.1 Labels

- `TAB_LABELS['external-systems']` in `PccHorizontalTabs.tsx`: `'Apps'` → `'External Platforms'`.
- `PCC_MVP_SURFACES['external-systems'].displayName` in `PccMvpSurfaces.ts`: `'External Systems'` → `'External Platforms'`. This cascades automatically to:
  - the hero secondary title (Prompt 02 binds `secondaryTitle = surface.displayName`),
  - `PccExternalSystemsHeaderCard.tsx` eyebrow (`eyebrow={SURFACE.displayName}`),
  - `PccExternalSystemsLaunchPadHeaderCard.tsx` eyebrow (`eyebrow={SURFACE.displayName}`).

The internal surface ID `external-systems` is preserved. No file renames, route key changes, backend route names, read-model keys, package identifiers, or `data-pcc-tab-id` markers were touched (per the Identifier Preservation Guardrail).

### 3.2 Icons removed

- 8 icon imports from `@hbc/ui-kit/icons` (`AlertTriangle`, `BlueprintRoll`, `ExternalLink`, `HardHat`, `Home`, `Inspection`, `Settings`, `Submittal`) deleted.
- The `IconComponent` type alias and the `TAB_ICONS` constant deleted.
- The `iconNode` JSX variable and its `{iconNode}` mount inside the tab button deleted.
- The `.icon` CSS rule removed.
- The `gap` between icon and label inside the tab is removed (no second child to gap from).

### 3.3 CSS — UI-kit-token-only color discipline

All ad-hoc literals replaced with existing `--pcc-color-*` CSS custom properties wired by `PccShell.tsx`:

| Old literal                                                          | New token-backed reference                           |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| `rgba(15, 23, 42, 0.08)` (tablist border-bottom)                     | `var(--pcc-color-border)`                            |
| `rgba(15, 23, 42, 0.72)` (inactive text)                             | `var(--pcc-color-rail-muted)`                        |
| `rgba(15, 23, 42, 0.92)` (hover text)                                | `var(--pcc-color-rail-text)`                         |
| `var(--pcc-tabs-accent, #f37021)` (selected text + border + outline) | `var(--pcc-color-rail-accent)`                       |
| `rgba(243, 112, 33, 0.08)` (selected bg tint)                        | removed; selected uses `var(--pcc-color-rail-hover)` |
| `currentColor` background on indicator                               | `var(--pcc-color-rail-accent)`                       |

The local `--pcc-tabs-accent` CSS custom property and its inline-style wiring on the tablist root are eliminated.

### 3.4 State styling

- **Inactive**: `--pcc-color-rail-muted` text, weight 600, transparent border-bottom (2px reserve), transparent background.
- **Hover**: `--pcc-color-rail-text` text, `--pcc-color-rail-hover` background.
- **Pressed (`:active`)**: `--pcc-color-rail-pressed` background.
- **Focus-visible**: 2px `--pcc-color-rail-accent` outline, 2px offset, 4px border-radius (preserves the prior contract).
- **Selected (`data-pcc-tab-active="true"`)**: `--pcc-color-rail-accent` text, weight 700, `--pcc-color-rail-hover` background (lifted from the rail), 3px solid `--pcc-color-rail-accent` border-bottom, active indicator at full opacity and full scale.

The selected state now reads with clearly increased visual weight (text + bolder weight + thicker accent border + bg lift + animated indicator) without introducing a new accent-tinted token.

### 3.5 Motion

- Tab transitions: `color 180ms ease-out, background-color 180ms ease-out, border-color 200ms ease-out`.
- Active-indicator transitions: `opacity 180ms ease-out, transform 200ms ease-out`.
- Active indicator inactive state: `opacity: 0; transform: translateX(-50%) scaleX(0.6)`. Active state: `opacity: 1; transform: translateX(-50%) scaleX(1)`.
- `@media (prefers-reduced-motion: reduce)` block at the bottom of the CSS sets `transition: none` for `.tab` and `.activeIndicator`. End states still apply (no motion, but instantaneous flip between active/inactive). No JS reduced-motion hook was introduced (none existed in the app).

The "single moving underline that translates between tabs" pattern is explicitly NOT adopted; per-tab grow/fade indicator was preferred to avoid DOM measurement / `ResizeObserver` complexity for wave-b2.

### 3.6 A11y preserved

- `role="tablist"`, `role="tab"`, `aria-selected`, optional `aria-controls`, roving `tabIndex`, ArrowRight/Left wrap, Home/End jump, Enter/Space activation — all intact and verified by the existing test suite.
- No `aria-label` is set on individual tabs; accessible name is the visible label (now plain text since icons are gone).

### 3.7 Hero/tab seam preserved

The `data-pcc-hero-tab-seam` element introduced by Prompt 02 is rendered by `PccProjectHeroBand`, not by the tab rail. Prompt 03 did not edit it. The tab rail's `border-bottom: 1px solid var(--pcc-color-border)` coexists cleanly with the seam element above it.

## 4. Display-Name Decision Record (mandatory)

**Path taken: Decision 2 (PRIMARY).** `PCC_MVP_SURFACES['external-systems'].displayName` was updated to `'External Platforms'`. Decision 2A (fallback) was not triggered: although the `External Systems` literal appears 98 times across the workspace, classification (see §5) shows the bulk are engineering nomenclature (SharePoint list-schema docs, backend mock provider data fields, separate label-vocabulary maps in unrelated adapters, code comments referring to wave/prompt history). Only the displayName field is the user-visible nav-label cascade source.

### Literal `External Systems` references that **remained intentionally unchanged**

| Path / class of reference                                                                                                                                                                                          | Reason for non-update                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/project-control-center/src/viewModels/approvalsReadinessReferencesAdapter.ts` `'external-systems' → 'External Systems'` (CheckpointSourceModule label map)                                                   | Separate label vocabulary for approval-record source modules; not the surface displayName cascade. Renaming this is a cross-vocabulary harmonization decision, not a tab-rail concern.                                                                                                                |
| `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts` (two hits — module label maps)                                                                                              | Same — independent module-label vocabulary on the readiness surface.                                                                                                                                                                                                                                  |
| `apps/project-control-center/src/surfaces/constraintsLog/constraintsLogAdapter.ts` `targetLabel: 'External Systems'`                                                                                               | Adapter-level target-label literal in a separate surface; out of scope for tab-rail prompt.                                                                                                                                                                                                           |
| `apps/project-control-center/src/surfaces/buyoutLog/buyoutLogAdapter.ts` `targetLabel: 'External Systems'`                                                                                                         | Same as above.                                                                                                                                                                                                                                                                                        |
| `apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts` `'external-systems' → 'External Systems'`                                                                                         | Document-control module-label vocabulary; separate from surface displayName.                                                                                                                                                                                                                          |
| `apps/project-control-center/src/surfaces/documents/PccDocumentControlPermissionsCard.tsx` `EX: 'External Systems'`                                                                                                | Permission-code label literal; not part of the nav-label chain.                                                                                                                                                                                                                                       |
| `apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx` `title="External Systems"`                                                                                                       | Project-home launcher card with its own author-chosen title (eyebrow says "Integrations"); independent of `PCC_MVP_SURFACES.displayName`. Harmonization deferred to a project-home / surface-content prompt.                                                                                          |
| `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsHeaderCard.tsx` `title="External Systems"` (line 12)                                                                                   | Hardcoded card title literal alongside the displayName-driven eyebrow. Now produces an internal `EXTERNAL PLATFORMS / External Systems` mismatch between eyebrow and title within the same card. **Flagged in §8 residuals**; harmonization belongs to the External Platforms surface-content prompt. |
| `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx` `eyebrow="External Systems"` (lines 126, 144)                                                                             | Hardcoded eyebrow strings on internal surface cards; harmonization belongs to surface-content scope.                                                                                                                                                                                                  |
| `packages/models/src/pcc/ExternalSystemsLaunchPad.ts`, `ExternalSystemsUrlPolicy.ts`, `PccCapabilities.ts`, `PccFeatureFlags.ts`, `PccReadModels.ts`, `index.ts` (comments / type docstrings)                      | Engineering nomenclature for the data-layer "External Systems" domain; not user-visible labels.                                                                                                                                                                                                       |
| `backend/functions/src/hosts/pcc-read-model/**` (mock provider, routes, tests — multiple files)                                                                                                                    | Backend service / mock data; data-layer references, not user-visible labels.                                                                                                                                                                                                                          |
| `docs/reference/sharepoint/list-schemas/**` (8+ files: `external-system-definitions.md`, `external-url-policy-registry.md`, `external-system-health-snapshots.md`, `pcc-list-inventory.json`, `List-Map.md`, etc.) | SharePoint list-schema documentation for the "External Systems" data domain (the SharePoint lists themselves are named in the tenant; this nomenclature is structural, not nav-label).                                                                                                                |
| `apps/project-control-center/src/tests/PccProjectHome.test.tsx` `'External Systems'` in `REQUIRED_CARD_TITLES` (line 47)                                                                                           | Pinned to the project-home `<PccDashboardCard title="External Systems">` literal — not displayName-derived. Stays in sync with the (intentionally unchanged) hardcoded title above.                                                                                                                   |
| `apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx` `indexOfTitle(titles, 'External Systems')` (line 48)                                                                                   | Same — references the project-home card title literal.                                                                                                                                                                                                                                                |
| Test descriptions / `it()` titles mentioning "External Systems lane" or "External Systems section" in PccDocumentsSurface and adjacent test files                                                                  | Engineering-prose test descriptions; not user-visible.                                                                                                                                                                                                                                                |
| `apps/project-control-center/README.md` (two mentions in tabular surface listings)                                                                                                                                 | Documentation drift; defer to Prompt 06 docs/evidence cleanup per the user's residual note.                                                                                                                                                                                                           |
| `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` (comment referring to "External Systems Launch Pad surface")                                                                                          | Code comment; engineering reference.                                                                                                                                                                                                                                                                  |
| `apps/project-control-center/src/viewModels/useProcoreSurfaceReadModel.ts` (comment)                                                                                                                               | Code comment.                                                                                                                                                                                                                                                                                         |
| Various API client / test files mentioning "External Systems Launch Pad" in comments / `it()` titles describing wave 15 prompt 04 work                                                                             | Historical wave/prompt references; not user-visible labels.                                                                                                                                                                                                                                           |

The above list is the explicit audit trail required by the plan. Each line is "intentionally unchanged with reason." Future contributors who later harmonize the External Platforms surface content can use this list as the inventory of additional renames to consider.

## 5. Cascade Grep Summary

`grep -rn "External Systems" apps packages backend tools docs/reference 2>/dev/null | grep -v "\.archive\|node_modules\|dist/" | tee /tmp/external-systems-cascade.txt` returned 98 hits across roughly 30 files. Per-file counts (top 15):

| File                                                                                     | Hits | Class                                                                            |
| ---------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| `docs/reference/sharepoint/list-schemas/pcc-list-inventory.json`                         | 8    | doc / data-layer (unchanged)                                                     |
| `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`               | 3    | backend test / data-layer (unchanged)                                            |
| `apps/project-control-center/src/tests/PccProjectHome.test.tsx`                          | 3    | test pinning project-home card title (unchanged — see §4 row)                    |
| `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts`   | 3    | adapter label vocabulary (unchanged)                                             |
| `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx` | 3    | surface-content literal (unchanged — flagged in residuals)                       |
| `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`                  | 3    | test referring to "External Systems Launch Pad" in comments / titles (unchanged) |
| (8 SharePoint list-schema docs at 2 hits each)                                           | 16   | doc / data-layer (unchanged)                                                     |
| `packages/models/src/pcc/PccMvpSurfaces.ts`                                              | 1    | **displayName updated → "External Platforms"**                                   |
| ...                                                                                      | ...  | ...                                                                              |

The full classified file is at `/tmp/external-systems-cascade.txt` (transient). The decision summary above is the durable record.

## 6. Tests Run

- `pnpm --filter @hbc/models build` — TypeScript build clean; `dist/` updated locally so downstream consumers resolve the new `displayName` value during type-check and tests. `dist/` is gitignored and not staged.
- `pnpm --filter @hbc/models test` — 45 test files / 790 tests pass.
- `pnpm --filter @hbc/models check-types` — exit 0.
- `pnpm --filter @hbc/spfx-project-control-center test -- PccHorizontalTabs PccApp PccShell` — 84 files / 1753 tests pass.
- `pnpm --filter @hbc/spfx-project-control-center test` (full suite) — 84 files / 1753 tests pass.
- `pnpm --filter @hbc/spfx-project-control-center check-types` — exit 0.
- `pnpm exec prettier --check` over the four authored/edited files plus the closeout doc — passes after `--write` on `PccHorizontalTabs.test.tsx` and `PccMvpSurfaces.ts` (each invoked on the single file path, never a directory glob). Prettier's auto-fix on `PccMvpSurfaces.ts` removed redundant quotes around the `documents` and `approvals` object keys (purely cosmetic, in the same file as the displayName edit).

## 7. Lockfile Status

- Pre-edit baseline: `pnpm-lock.yaml` MD5 = `c56df7b79986896624536aab74d609f4`.
- Post-edit: MD5 unchanged.
- No `pnpm install` / `pnpm add` / `pnpm update` was run during this prompt (per `feedback_lockfile_discipline`).

## 8. Validation Not Run / Operator-Pending

- `:focus-visible` structural assertion — impractical in jsdom; not added to the unit test. The CSS rule (2px `--pcc-color-rail-accent` outline, 2px offset, 4px border-radius) is verified by code review and operator-pending hosted screenshots.
- Hosted SharePoint screenshots at all 8 responsive modes — operator-pending. Not asserted as unit-test proof.
- `prefers-reduced-motion` reduced-motion behavior — visible only to users with the OS preference set; CSS rule is verified by inspection. Operator-pending.

## 9. Residual Risks and Recommended Follow-ups

- **R1.** Hardcoded literal `title="External Systems"` on `PccExternalSystemsHeaderCard.tsx:12` now contradicts the displayName-driven eyebrow on the same card (eyebrow → "External Platforms", title → "External Systems"). Recommend a small surface-content prompt that harmonizes the External Platforms surface header (this is consistent with the user's note that "the page title decision … likely not fully implemented until the External Platforms surface title is touched").
- **R2.** `PccExternalSystemsSurface.tsx` uses `eyebrow="External Systems"` on internal cards (lines 126, 144); same harmonization applies.
- **R3.** Project-home launcher card (`PccProjectHome/PccExternalSystemsCard.tsx` line 71) renders `<PccDashboardCard footprint="standard" eyebrow="Integrations" title="External Systems">`. The launcher card title is independent of the surface displayName but still surfaces the legacy term in the project-home composition. Harmonization is a project-home / surface-content concern, not tab-rail.
- **R4.** `PccProjectContextBand.tsx` (and its `.module.css` and `.test.tsx`) is still orphaned dead code carrying deprecated `data-pcc-source-confidence` and `data-pcc-active-surface-context` markers. Per the user's wave-b2 residual note, this cleanup is deferred to a separate small prompt or Prompt 06.
- **R5.** `apps/project-control-center/README.md` references `projectPlaceholder.ts` (deleted in Prompt 02) and lists "External Systems" as a surface name. Per the user's note, this is deferred to Prompt 06 docs/evidence cleanup.
- **R6.** Cross-vocabulary `'external-systems' → 'External Systems'` label maps in `approvalsReadinessReferencesAdapter.ts`, `projectReadinessAdapter.ts`, `documentControlViewModel.ts`, and others continue to render the legacy term where those adapters surface module-source labels in approval/readiness/document records. This is a cross-vocabulary harmonization decision and is out of tab-rail scope.

## 10. Flagship Scoring Posture (no 56/56 claim)

Prompt 03 advances the tab rail against the user-locked navigation contract. The 56/56 / per-criterion flagship scoring requires Prompt 07 evidence and hosted validation, neither of which is in scope here. This closeout makes no claim of partial or final flagship readiness.
