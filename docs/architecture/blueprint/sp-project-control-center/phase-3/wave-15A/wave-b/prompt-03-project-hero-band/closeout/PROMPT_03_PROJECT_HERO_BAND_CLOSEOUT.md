# Wave 15A / Wave B (b1) — Prompt 03 Project Hero Band Closeout

`PccProjectHeroBand` primitive — replacement target for `PccProjectIntelligenceHeader`.

## Outcome

`PccProjectHeroBand` is a PCC-local project-context surface built and tested in isolation. The component is **not** mounted in `PccShell`; mounting and removal of the legacy `PccProjectIntelligenceHeader` + `PccProjectContextBand` are deferred to `Prompt_04_Shell_Recomposition_And_Rail_Removal.md`. The placeholder constant is extended additively with the four hero fields. No surface, router, shell, rail, header, context-band, command-search, app entry, backend, package, manifest, or lockfile change in this prompt.

- Posture: implementation prompt; new isolated primitive; no shell behavior change.
- Score improvement: foundational only — Prompt 03 unblocks the shell recomposition (Prompt 04).
- Final Wave 15A 56/56 doctrine readiness is **not** claimed.

## Files Created / Edited

```
apps/project-control-center/src/preview/projectPlaceholder.ts          (edited — additive + product-safe header rewrite)
apps/project-control-center/src/shell/PccProjectHeroBand.tsx           (created)
apps/project-control-center/src/shell/PccProjectHeroBand.module.css    (created)
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx      (created)
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-03-project-hero-band/closeout/PROMPT_03_PROJECT_HERO_BAND_CLOSEOUT.md  (created)
```

No other file is created, modified, deleted, or renamed.

## Placeholder Contract Changes

`apps/project-control-center/src/preview/projectPlaceholder.ts`:

1. **File header rewritten** with product-safe neutral language:

   ```
   Local project context placeholder used by PCC shell-level surfaces (header,
   hero band, context band) before they bind to live read-models. The values
   are reference-only product copy; this constant is not a fixture record and
   is not consumed from any shared fixture aggregate.
   ```

   The previous header referenced `Wave 2 / Prompt 03`, `header`, `fixture record`, and `PCC_FIXTURES`; that language is removed. No `Wave`, `Prompt`, `fixture`, `mock`, or `preview mode` language remains.

2. **`PccProjectPlaceholder` interface extended** with four new required fields:

   ```ts
   readonly clientName: string;
   readonly location: string;
   readonly estimatedValue: string;
   readonly sourceConfidence: 'reference' | 'live';
   ```

3. **`PCC_PROJECT_PLACEHOLDER` constant extended** with reference-only values:

   ```ts
   clientName: 'Reference Client',
   location: 'Reference Location',
   estimatedValue: '$0',
   sourceConfidence: 'reference',
   ```

   `'$0'` avoids implying a real dollar amount; copy can be tuned at later waves with operator review. The four new fields are **required** so the placeholder always provides them; existing consumers (`PccProjectContextBand`, `PccProjectIntelligenceHeader`, `PccApp.tsx`, related tests) read only the legacy fields and continue to compile (pure widening). No `@hbc/models` change.

## Product-Safe Language Confirmation

The hero band component source contains only the following user-visible literal strings (verified by inspection of `PccProjectHeroBand.tsx`):

| Literal                                 | Where                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------- |
| `Project Control Center`                | eyebrow text                                                              |
| `Reference data`                        | source-confidence label when `sourceConfidence='reference'`               |
| `Live project data`                     | source-confidence label when `sourceConfidence='live'`                    |
| `Project Intel`                         | toggle button label (visible at phone width, hidden via CSS at non-phone) |
| `Project hero band`                     | default `aria-label` (override-able via `ariaLabel` prop)                 |
| `Client`, `Location`, `Estimated Value` | metadata-row dt labels                                                    |

Forbidden copy is **not present** in the component source: no `Preview mode`, no `Mock`, no `Fixture`, no `Wave`, no `Prompt`. The forbidden-phrase test at `PccProjectHeroBand.test.tsx` asserts that the source-confidence container's `textContent` and the metadata-row's `textContent` do not contain `Preview mode`, `Mock data`, or `Fixture data` for both `'reference'` and `'live'` source-confidence states (scoped tightly per `feedback_no_section_wide_copy_blocklist`).

## Source-Confidence Vocabulary Decision

Spec doc 03 requires hero source-confidence labels `Reference data` and `Live project data` and the marker `data-pcc-source-confidence="<reference|live>"`. The currently-mounted `PccProjectContextBand` derives `sourceConfidence: 'preview' | 'live'` from `PccApp.previewMode` and renders its own copy. The two vocabularies coexist until Prompt 04 retires the band:

- Hero (`PccProjectHeroBand`, this prompt) — `PccProjectHeroSourceConfidence = 'reference' | 'live'`.
- Legacy band (`PccProjectContextBand`, untouched) — `PccProjectContextSourceConfidence = 'preview' | 'live'`.

Both compile and test green. Prompt 04 reconciles the vocabularies when it removes the band.

## Component Contract

### Public API

```ts
export interface PccProjectHeroBandProps {
  mode: PccResponsiveMode;
  projectName: string;
  clientName: string;
  location: string;
  estimatedValue: string;
  sourceConfidence: PccProjectHeroSourceConfidence;
  pills: ReadonlyArray<PccProjectHeroPill>;
  activeSurfaceLabel: string;
  activeSurfaceWorkflowLabel?: string;
  ariaLabel?: string;
}
```

### Required markers

- Root: `data-pcc-project-hero-band=""`, `data-pcc-mode={mode}`, `data-pcc-hero-density={'compact' | 'comfortable'}`, `role="region"`, `aria-label`.
- `data-pcc-project-identity=""` wraps project name + active-surface label (always-visible row).
- `data-pcc-project-metadata=""` wraps the Client / Location / Estimated Value `<dl>`.
- `data-pcc-source-confidence={'reference' | 'live'}` on the indicator; `data-pcc-source-confidence-label` on the inner label element.
- `data-pcc-active-surface-context=""` rendered **exactly once** in the band, in the always-visible identity row. Never duplicated inside the phone-mode collapsible.
- Auxiliary markers used by tests: `data-pcc-hero-pill-row`, `data-pcc-hero-pill` (with `data-tone`), `data-pcc-project-intel-toggle`, `data-pcc-project-intel-region`.

## Phone Toggle Behavior

At `mode='phone'`:

- Always visible: eyebrow `Project Control Center`, project name (`data-pcc-project-identity`), active-surface label (`data-pcc-active-surface-context`), the `Project Intel` toggle button.
- Collapsed (default `aria-expanded='false'`, `<div hidden>`): metadata row, command search (`PccCommandSearch variant="icon"`), source-confidence indicator, status-pill row.
- `fireEvent.click(toggle)` flips `aria-expanded` to `true` and removes the `hidden` attribute on the collapsible region.

At non-phone modes the toggle button still renders in the DOM (visually hidden via CSS `display: none`) and the collapsible region renders inline without `hidden`. CSS visibility hide is documented as a visual contract, not a jsdom assertion (per `feedback_tab_active_state_structural_assertions`).

## Responsive-Mode Test Coverage

| Case                                                                                                                                                                         | Modes covered                                      | Result |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| `data-pcc-mode` mirrors `mode` prop                                                                                                                                          | all 8 (`it.each` over `PCC_RESPONSIVE_MODES`)      | PASS   |
| Density: `compact` for phone/tabletPortrait/tabletLandscape/smallLaptop; `comfortable` for the four wider modes                                                              | all 8                                              | PASS   |
| Wide modes: metadata visible (`closest('[hidden]')` is null); `[data-pcc-command-search="expanded"]` present; icon variant absent                                            | `standardLaptop`, `desktop`                        | PASS   |
| Compact non-phone: `[data-pcc-command-search="icon"]` present; expanded variant absent                                                                                       | `smallLaptop`, `tabletLandscape`, `tabletPortrait` | PASS   |
| Phone: collapsible hidden by default; toggle has `aria-expanded='false'`; identity + active-surface visible outside collapsible; active-surface marker rendered exactly once | `phone`                                            | PASS   |
| Phone toggle expansion: `aria-expanded='true'` after click; `hidden` attribute removed; metadata + source-confidence + command-search + pills visible inside region          | `phone`                                            | PASS   |
| Non-phone: toggle still in DOM (CSS hidden); collapsible region renders without `hidden`                                                                                     | seven non-phone modes                              | PASS   |
| Identity + exactly one active-surface marker present                                                                                                                         | all 8 (`it.each`)                                  | PASS   |

15 distinct cases (some `it.each` over 8 modes, some explicit) yielding 30+ individual Vitest assertions. Targeted suite: 82 files / 1718 tests pass.

## Visual Contracts (CSS / Browser, Not jsdom)

Encoded in `PccProjectHeroBand.module.css`; validated structurally only in unit tests. Pixel-level confirmation is operator review at Prompt 04 mount time and Prompt 07 evidence capture:

- 72–85 px target band height on comfortable modes (`standardLaptop`, `largeLaptop`, `desktop`, `ultrawide`).
- Compact density at `smallLaptop`, `tabletLandscape`, `tabletPortrait`, `phone` — reduced gap/padding, retained 13px metadata typography.
- `tabletPortrait` and `phone` flip `.collapsible` to a stacked column.
- Status-pill tones encoded for `info` (blue), `warning` (amber), `neutral` (slate).
- Source-confidence dot turns accent-orange when `sourceConfidence='live'`; muted otherwise.
- Command-search variant per mode: `expanded` for the four wide modes; `icon` otherwise.
- Toggle button visibility: `display: none` at non-phone modes; `display: inline-flex` at `[data-pcc-mode='phone']`.
- 120 ms transitions on toggle hover/active state changes.
- Visible focus ring on `:focus-visible` for the toggle: `outline: 2px solid var(--pcc-hero-accent); outline-offset: 2px`.

Theme accent (`HBC_ACCENT_ORANGE`) is bridged from `@hbc/ui-kit/theme` to CSS via the inline-style CSS custom property `--pcc-hero-accent` on the band root (mirrors `PccShell` convention; see `feedback_ts_theme_tokens_via_inline_style_css_vars`).

## Validation

| Command                                                                     | Result                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`                                                        | only the four created files + the placeholder edit + this closeout; no unrelated drift                                                                                                                                                                                                 |
| `md5 pnpm-lock.yaml` (before)                                               | `c56df7b79986896624536aab74d609f4`                                                                                                                                                                                                                                                     |
| `md5 pnpm-lock.yaml` (after)                                                | `c56df7b79986896624536aab74d609f4` (unchanged)                                                                                                                                                                                                                                         |
| `pnpm --filter @hbc/spfx-project-control-center check-types`                | PASS                                                                                                                                                                                                                                                                                   |
| `pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand` | PASS (82 files / 1718 tests)                                                                                                                                                                                                                                                           |
| `pnpm --filter @hbc/spfx-project-control-center test`                       | PASS (82 files / 1718 tests)                                                                                                                                                                                                                                                           |
| `pnpm --filter @hbc/spfx-project-control-center build`                      | PASS — `dist/spfx-project-control-center.css` 72.30 kB, `dist/project-control-center-app.js` 830.82 kB. Bundle size unchanged from Prompt 02 because `PccProjectHeroBand` is **not** mounted in `PccShell` and Vite tree-shakes the unimported component out of the production bundle. |
| `pnpm exec prettier --check <changed-files>`                                | clean (`PccProjectHeroBand.tsx` and `PccProjectHeroBand.test.tsx` were re-formatted in-place after authoring; rechecked clean)                                                                                                                                                         |

## Context-Efficiency Section

Files actually read for Prompt 03 (per `wave-b1/docs/00_CONTEXT_EFFICIENCY_RULES.md`):

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_03_Project_Hero_Band.md`
- `apps/project-control-center/src/preview/projectPlaceholder.ts`
- `apps/project-control-center/src/shell/PccCommandSearch.tsx` (read once to confirm marker contract `data-pcc-command-search="expanded"|"icon"` and its CSS-module import)

Files **not** re-read (already in active context from prior prompts in this conversation): `wave-b1/docs/03_SHELL_TARGET_SPECIFICATION.md`, `wave-b1/docs/02_SOURCE_OWNERSHIP_MAP.md`, `apps/project-control-center/src/layout/footprints.ts`, `PccShell.tsx` (theme-bridge convention), `PccProjectIntelligenceHeader.tsx`, `PccProjectContextBand.tsx`, `PccNavigationRail.tsx`. No backend, surface, router, viewModel, webpart, `@hbc/models`, `@hbc/ui-kit` source beyond the `HBC_ACCENT_ORANGE` import. No homepage breakpoint policy. No broad audit.

## Guardrails Preserved

- No backend / Functions / Graph / PnP / SharePoint REST / Procore / Document Crunch / Adobe Sign change.
- No `apps/**/package.json` or root `package.json` change.
- No `@hbc/models` or `@hbc/ui-kit` source change.
- No `tools/spfx-shell/config/package-solution.json` change; no `.sppkg`, app-catalog, or tenant work.
- No CI / GitHub Actions workflow change.
- No dependency install or update; `pnpm-lock.yaml` MD5 unchanged before/after.
- No edits under `docs/architecture/plans/MASTER/**`.
- No edits under `apps/hb-webparts/**` (homepage breakpoint policy untouched).
- No surface (`apps/project-control-center/src/surfaces/**`), API (`src/api/**`), viewModel, or webpart change.
- `PccShell.tsx`, `PccSurfaceRouter.tsx`, `PccNavigationRail.tsx`, `PccProjectIntelligenceHeader.tsx`, `PccProjectContextBand.tsx`, `PccCommandSearch.tsx`, `PccApp.tsx` — **all untouched**.
- No `git push`.

## Residual Risk

- **Placeholder values are reference text.** `'Reference Client'`, `'Reference Location'`, `'$0'` are placeholder copy; live read-model binding is a later-wave concern.
- **Pixel-level visual cues remain operator-pending until Prompt 07.** Band height (72–85 px target), pill tone saturation, source-confidence dot color, focus-ring rendering, transition smoothness — all are CSS / browser visual contracts asserted structurally in unit tests, not pixel-level.
- **Tenant-hosted (SharePoint published / edit-mode) evidence remains operator-pending.** Hosted proof cannot be claimed from local validation alone.
- **No final Wave 15A 56/56 claim.** Shell remediation target is ≥ 3 in shell-related categories per the wave-b1 plan.
- **`PccCommandSearch` still imports `PccProjectIntelligenceHeader.module.css`.** Verified at plan time at `apps/project-control-center/src/shell/PccCommandSearch.tsx:3` (`import styles from './PccProjectIntelligenceHeader.module.css'`). Its `searchField`, `searchIcon`, and `searchInput` classes resolve from the legacy header's CSS module. When the hero band embeds `PccCommandSearch`, the styling continues to come from the legacy header's module. This is intentional for Prompt 03 (no `PccCommandSearch` source change is allowed by the prompt). **During Prompt 04 shell recomposition, the visual integration of the embedded search inside the hero band must be reviewed**, and one of the following must happen:
  1. `PccCommandSearch` is repointed at hero-band-owned CSS (its source changes in Prompt 04 scope), or
  2. The hero band's CSS Module re-declares the search-field / search-icon / search-input rules and `PccCommandSearch` continues to consume the legacy module unchanged, or
  3. The legacy `PccProjectIntelligenceHeader.module.css` is preserved on disk until full removal at Prompt 04 closeout (with `PccCommandSearch` continuing to import it).

  Prompt 04 must not skip this visual review; the choice of (i)/(ii)/(iii) belongs in its decision register.

## Next Prompt

Execute next:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b1/prompts/Prompt_04_Shell_Recomposition_And_Rail_Removal.md
```

Foundational state available to Prompt 04:

- 8-mode breakpoint contract live in `apps/project-control-center/src/layout/footprints.ts`.
- `PccHorizontalTabs` available at `apps/project-control-center/src/shell/PccHorizontalTabs.tsx`, ready to mount.
- `PccProjectHeroBand` available at `apps/project-control-center/src/shell/PccProjectHeroBand.tsx`, ready to mount.
- `PCC_PROJECT_PLACEHOLDER` exposes `clientName` / `location` / `estimatedValue` / `sourceConfidence` for hero binding.
- Legacy `PccNavigationRail`, `PccProjectIntelligenceHeader`, and `PccProjectContextBand` still mounted; their replacement (and the `PccCommandSearch` CSS-module repointing decision) is Prompt 04.
- All PCC tests green at 1718 / 82 files.
