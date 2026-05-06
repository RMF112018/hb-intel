# Wave 15A — wave-b2 — Prompt 02 — Hero Project Context and Visual Hierarchy — Closeout

## 1. Objective

Rebuild `PccProjectHeroBand` to satisfy the user-locked hero contract recorded in the Prompt 01 audit: primary title `Project Control Center`, secondary title = active surface name, supporting compact surface description, and the four mandatory facts (location, estimated value, scheduled completion, project stage). Replace shell dependence on `PCC_PROJECT_PLACEHOLDER` with a profile-derived view-model anchored on `SAMPLE_PROJECT_PROFILE`. Remove the source-confidence badge, status pills, client-name fact, and phone-mode collapsible. Migrate hero CSS off ad-hoc literals to UI-kit branded tokens and introduce a deliberate hero/tab seam.

Tab-rail label/icon work (`Apps` → `External Platforms`, icon removal) is **deferred to Prompt 03** by scope.

## 2. Files Changed

Authoritative source: `git show --name-only HEAD` after commit. Changed paths in this commit:

```
apps/project-control-center/src/PccApp.test.tsx                                M
apps/project-control-center/src/PccApp.tsx                                     M
apps/project-control-center/src/preview/projectPlaceholder.ts                  D
apps/project-control-center/src/preview/projectShellViewModel.ts               A
apps/project-control-center/src/shell/PccProjectHeroBand.module.css            M
apps/project-control-center/src/shell/PccProjectHeroBand.tsx                   M
apps/project-control-center/src/shell/PccShell.tsx                             M
apps/project-control-center/src/shell/surfaceHeroCopy.ts                       A
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx              M
apps/project-control-center/src/tests/PccShell.navigation.test.tsx             M
apps/project-control-center/src/tests/PccShell.responsive.test.tsx             M
apps/project-control-center/src/tests/projectShellViewModel.test.ts            A
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_02_Hero_Closeout.md  A
```

The untracked wave-b2 plan dir at `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b2/` remains untracked and is **out of scope** for this commit.

## 3. Behavior Changed

### 3.1 Locked-in (now rendered)

- Primary title `Project Control Center` (small uppercase eyebrow) at `data-pcc-hero-primary-title`.
- Secondary title = `PCC_MVP_SURFACES[activeSurfaceId].displayName` at `data-pcc-hero-secondary-title`.
- Compact supporting description from the **full-taxonomy** local map `PCC_SURFACE_HERO_DESCRIPTIONS` (8 surfaces) at `data-pcc-hero-surface-description`. Single-line clamp on desktop/laptop, two-line clamp on compact modes.
- Four mandatory facts in a metadata grid at `data-pcc-hero-facts`:
  - `data-pcc-hero-fact-location` → `profile.projectLocation` (e.g., `Sample City, ST`)
  - `data-pcc-hero-fact-estimated-value` → `Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 })` (e.g., `$25,000,000`)
  - `data-pcc-hero-fact-scheduled-completion` → `Intl.DateTimeFormat('en-US', { month:'short', day:'numeric', year:'numeric', timeZone:'UTC' })` (e.g., `Sep 30, 2027`; UTC-anchored for CI stability)
  - `data-pcc-hero-fact-project-stage` → human label from a complete `PccProjectStage` map (covers all six members of `PCC_PROJECT_STAGES`)
- Visual hero surface (`data-pcc-hero-surface`) and an explicit hero/tab seam (`data-pcc-hero-tab-seam`).
- Disabled command-search affordance preserved at `data-pcc-hero-command-search` (variant flips between `expanded` ≥ standardLaptop and `icon` below).

### 3.2 Locked-out (removed)

- Source-confidence badge — removed throughout the chain: `IPccShellHeroViewModel` carries no `sourceConfidence` field; `PccProjectHeroBandProps` does not declare one; `PccShell` does not forward one; `PccApp` does not compute one. The previous `data-pcc-source-confidence`/`-label`/`-dot` markers are absent. (Per the user-corrected lock: "remove from hero props … remove from PccShell hero forwarding … remove from PccApp shell hero construction".)
- Client name (`data-pcc-hero-fact-client` is absent).
- Status pills (no `data-pcc-status-pill`/`data-pcc-pill`/`data-pcc-hero-pill`/`data-pcc-hero-pill-row`).
- Phone-mode `Project Intel` toggle and collapsible region (`data-pcc-project-intel-toggle`/`data-pcc-project-intel-region`) — replaced by an always-visible facts grid that wraps to two columns at phone width.
- The `PCC_PROJECT_PLACEHOLDER` reference fixture and its forbidden literals (`Reference Client`, `Reference Location`, `$0`) are no longer present in any code path that the shell renders. The placeholder file is deleted.

### 3.3 View-model layer

- `apps/project-control-center/src/preview/projectShellViewModel.ts` exports `IPccShellHeroViewModel` and `deriveShellHeroViewModel(profile, activeSurfaceId)` plus three pure formatters (`formatEstimatedValue`, `formatScheduledCompletion`, `formatProjectStage`).
- `PccApp` now consumes `SAMPLE_PROJECT_PROFILE` from `@hbc/models/pcc` and derives the hero view-model.
- `PccShell` accepts a single `heroViewModel: IPccShellHeroViewModel` prop instead of the prior flat list of `projectName/clientName/location/estimatedValue/pills/sourceConfidence/...`.

### 3.4 Visual hierarchy + seam

- All ad-hoc color literals removed from `PccProjectHeroBand.module.css`. Surface, border, and text rely on `--pcc-color-card`, `--pcc-color-border`, `--pcc-color-text-primary`, `--pcc-color-text-muted`, `--pcc-color-canvas` (already wired by `PccShell.tsx` from `HBC_SURFACE_LIGHT`).
- Hero card uses `--pcc-elevation-card` (already mapped to `elevationCard` from `@hbc/ui-kit/theme`).
- Hero/tab seam is a dedicated `<div data-pcc-hero-tab-seam>` that renders the canvas color with a bottom border, producing a visible gap before the tab rail.

### 3.5 Display formats

- Currency formatter constructed once at module scope (en-US, no fractional digits).
- Date formatter constructed once at module scope (en-US, UTC time zone). UTC anchoring ensures the boundary cases (`2027-01-01`, `2027-12-31`) and the SAMPLE date (`2027-09-30`) format identically across CI runners regardless of host time zone.

### 3.6 Project-stage label coverage

- `PCC_PROJECT_STAGES` is exported from `@hbc/models/pcc/PccProjectEnums` as a frozen 6-tuple: `['lead', 'estimating', 'preconstruction', 'active_construction', 'closeout', 'warranty']`.
- The local `PROJECT_STAGE_LABELS: Record<PccProjectStage, string>` map covers all six members. Any future addition to `PccProjectStage` in `@hbc/models` will fail TypeScript compilation here, forcing a label update in lockstep.
- The view-model unit test iterates `PCC_PROJECT_STAGES` and asserts every label, so coverage is enforced at runtime as well.

## 4. Tests Run

- `pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHeroBand PccShell projectShellViewModel PccApp` — 1 initial failure (`PccShell.navigation.test.tsx` line 152 still asserted the legacy `data-pcc-active-surface-context` marker). Updated that test to assert `data-pcc-hero-secondary-title` and `data-pcc-hero-surface-description` and re-ran.
- `pnpm --filter @hbc/spfx-project-control-center test -- PccShell.navigation` after the test edit — passes.
- `pnpm --filter @hbc/spfx-project-control-center check-types` — exits 0 (`tsc --noEmit`).
- `pnpm exec prettier --check` over the 11 authored/edited files — passes after `--write` on `surfaceHeroCopy.ts` and `PccProjectHeroBand.test.tsx` (each invoked on the single file path, never a directory glob).
- Final full-package suite (84 test files / 1751 tests) — all pass.

## 5. Lockfile Status

- Pre-edit baseline: `pnpm-lock.yaml` MD5 = `c56df7b79986896624536aab74d609f4`.
- Post-edit: MD5 unchanged.
- No `pnpm install` / `pnpm add` / `pnpm update` was run during this prompt (per `feedback_lockfile_discipline`).

## 6. Marker-Consumer Grep Results

Pre-removal grep across `apps`, `packages`, `backend`, `tools`, `docs/reference`:

- `PCC_PROJECT_PLACEHOLDER` consumers: `apps/project-control-center/src/PccApp.tsx` only (plus a tree-diagram mention in `apps/project-control-center/README.md`). The lone code consumer was rewritten and the file was deleted.
- `data-pcc-source-confidence` consumers in shell-rendered code paths: `PccProjectHeroBand.tsx` (the hero we rewrote), `PccApp.test.tsx` (updated), and `PccProjectHeroBand.module.css` (rewritten).
- `data-pcc-source-confidence` references that **remain on disk**: `apps/project-control-center/src/shell/PccProjectContextBand.tsx` and its co-located test/CSS. This component is **orphaned dead code**: the `PccProjectContextBand.test.tsx` opening comment notes that the shell no longer mounts it. No file imports `PccProjectContextBand` from a path the runtime renders. Per the wave-b2 scope (hero remediation only), this orphan was **not** removed in this prompt; it is logged as residual cleanup in §7.
- `data-pcc-pill` / `data-pcc-status-pill` consumers: none in active hero-rendering code after this prompt's edits.

## 7. Residual Risks and Recommended Follow-ups

- **R1.** `apps/project-control-center/src/shell/PccProjectContextBand.tsx` (and its module.css and test) is orphaned dead code that still uses the deprecated `data-pcc-source-confidence` and `data-pcc-active-surface-context` markers. Removing it cleanly is a small, low-risk follow-up but was out of scope for wave-b2 hero remediation. Recommend a dedicated cleanup commit.
- **R2.** `apps/project-control-center/README.md` references `projectPlaceholder.ts` in a tree diagram. The reference is now stale. Updating it falls under documentation upkeep, not hero remediation; recommend folding into the README refresh that accompanies a later closeout.
- **R3.** Tab-rail label drift (`Apps` → `External Platforms`) and tab-rail icon removal remain — these are Prompt 03 scope per the wave plan.
- **R4.** Hosted/tenant validation has not been performed. Per `feedback_operator_pending_proof`, screenshots are operator-pending evidence reserved for Prompt 07.
- **R5.** No `PCC_SURFACE_HERO_DESCRIPTIONS` test exists outside the consumer tests; the constant is exercised indirectly via `PccProjectHeroBand` and `projectShellViewModel` tests. If the local map is ever consumed by a non-shell surface, a dedicated unit test would be appropriate.

## 8. Screenshots Needed (operator-pending)

Hosted screenshots at `desktop`, `largeLaptop`, `standardLaptop`, `smallLaptop`, `tabletLandscape`, `tabletPortrait`, `phone`, and `ultrawide` are operator-pending evidence and are deferred to the wave's evidence-capture step (Prompt 07 hosted validation). They are not asserted here as proof of behavior; the structural-test contracts above are the unit-level proof.

## 9. Flagship Scoring Posture (no 56/56 claim)

Prompt 02 advances the hero against the locked content contract. The 56/56 / per-criterion flagship scoring requires Prompt 07 evidence and hosted validation, neither of which is in scope here. This closeout makes no claim of partial or final flagship readiness.
