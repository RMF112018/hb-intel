# Wave 15A — wave-b2 — Prompt 01 — Scope Lock and Repo-Truth Audit

## 1. Objective

Read-only scope lock and repo-truth confirmation for the PCC shared shell flagship remediation (Wave 15A wave-b2) prior to Prompt 02 implementation. This audit:

- transcribes the user-locked decisions for the wave verbatim;
- confirms the current state of the shell, hero, tab rail, command-search affordance, breakpoint contract, and the tests that consume them;
- separates source truth (files inspected) from visual evidence (hosted screenshots);
- flags drift between the current code and the locked decisions for Prompt 02 to reconcile;
- preserves the Prompt 02 decision gate.

No source, test, fixture, manifest, package, or lockfile mutation is performed by this prompt. The single deliverable is this audit document.

## 2. Files Read

The following 18 paths were inspected at the working-tree HEAD prior to this audit:

```
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/layout/footprints.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/IProjectProfile.ts
packages/models/src/pcc/fixtures/projectProfile.ts
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/README.md
```

The wave plan README at `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b2/README.md` was used as the wave-b2 governing document.

## 3. User-Locked Decisions for Wave 15A wave-b2

The decisions below are user-locked for wave-b2. They are recorded verbatim and are not subject to editorial paraphrase or pre-decision in this audit.

### 3.1 Hero band

- **Hero primary title:** `Project Control Center`.
- **Hero secondary title:** active surface name (driven by the current tab selection).
- **Project number is excluded** from the hero.
- **Mandatory hero facts (locked-in):** location, estimated value, scheduled completion, project stage.
- **Excluded hero facts (locked-out):** client, project status, source confidence, last updated.

### 3.2 Tab rail

- **External-systems tab label:** `External Platforms`.
- **External Platforms page title:** `External Platforms Launch Pad`.
- **Tab-rail icons removed** for now (text-only tab rail).

### 3.3 Command search

- **Command-search affordance remains a disabled preview** (no functional change in wave-b2).

### 3.4 Color discipline

- **Color usage is limited to existing `@hbc/ui-kit` branded colors only.** No ad-hoc hex literals or new color tokens are authorized in wave-b2.

## 4. Source Truth vs Visual Evidence

This audit explicitly distinguishes two kinds of evidence.

### 4.1 Source truth (this audit)

Files inspected at HEAD: the 18 paths listed in §2. Working-tree status and `pnpm-lock.yaml` MD5 captured prior to authoring (see §5.10). All findings in §5 are derived from these inspected files.

### 4.2 Visual evidence (out-of-band)

Current SharePoint-hosted screenshots show a flat hero band and a static tab rail. These screenshots are visual context only. This audit does **not** treat them as hosted proof, does not claim that hosted validation has been performed, and does not extract any score, percentage, or readiness conclusion from them. Hosted/tenant verification is out of scope for Prompt 01.

## 5. Repo-Truth Findings

Each finding is tagged either _(matches locked decision)_ or _(drifts from locked decision — Prompt 02 to reconcile)_.

### 5.1 Shell composition (`PccShell.tsx`)

The shell renders, in order: theme-vars CSS custom-property root → `PccProjectHeroBand` → `PccHorizontalTabs` → main canvas (`PccBentoGrid` via the surface router). _(matches locked decision: thin shell of hero + tabs + canvas.)_

### 5.2 Hero content source (`PccProjectHeroBand.tsx`, `PccApp.tsx`, `projectPlaceholder.ts`)

The hero displays:

- eyebrow: `"Project Control Center"`;
- identity: `projectName`, `activeSurfaceLabel`, optional `activeSurfaceWorkflowLabel` (props);
- metadata: `clientName`, `location`, `estimatedValue`, plus a source-confidence badge (props);
- pills (`pills` prop array);
- a phone-mode collapsible toggle for project-intel;
- a `PccCommandSearch` instance with variant chosen by responsive mode.

Hero values are wired from `PccApp.tsx` using reference values exposed by `projectPlaceholder.ts` (`projectName`, `subtitle`, `dateScope`, `pills`, `clientName`, `location`, `estimatedValue`, `sourceConfidence`).

Tag against locked decisions:

- eyebrow `"Project Control Center"` _(matches: hero primary title)_;
- secondary identity from `activeSurfaceLabel` _(matches: hero secondary title)_;
- `clientName` rendered in metadata _(drifts: client is locked-out)_;
- source-confidence badge rendered _(drifts: source confidence is locked-out)_;
- `estimatedValue` rendered _(matches: estimated value is locked-in)_;
- `location` rendered _(matches: location is locked-in)_;
- scheduled completion **not currently rendered in the hero** _(drifts: scheduled completion is locked-in and must appear)_;
- project stage **not currently rendered in the hero** _(drifts: project stage is locked-in and must appear)_;
- project number not rendered _(matches: project number is locked-out)_;
- last-updated not rendered _(matches: last updated is locked-out)_;
- project status not rendered as such _(matches: project status is locked-out; current status pills should be reviewed by Prompt 02 to confirm they do not reintroduce the excluded "project status" facet)_.

### 5.3 Reference identity values (`projectPlaceholder.ts`)

`projectPlaceholder.ts` currently exposes: `projectName`, `subtitle`, `dateScope`, `pills`, `clientName`, `location`, `estimatedValue`, `sourceConfidence`. The set lacks `projectStage` and `scheduledCompletionDate` _(drifts: locked-in mandatory hero facts not yet present in the placeholder source)_. Prompt 02 will need to extend `projectPlaceholder.ts` (additive only) or otherwise source these two facts.

Note: `IProjectProfile.ts` already includes `projectStage` and `scheduledCompletionDate` as contract fields, so the read-model contract supports the locked decisions; only the placeholder/preview seam needs additive extension.

### 5.4 Tab labels and IDs (`PccHorizontalTabs.tsx`, `PccMvpSurfaces.ts`)

Surface IDs from `PccMvpSurfaces.ts`: `project-home`, `team-and-access`, `documents`, `project-readiness`, `approvals`, `external-systems`, `control-center-settings`, `site-health`.

Tab labels in `PccHorizontalTabs.tsx` (`TAB_LABELS` constant):

| Surface ID                | Current label       | Status against locked decision                       |
| ------------------------- | ------------------- | ---------------------------------------------------- |
| `project-home`            | `Project Home`      | not in scope of wave-b2 lock                         |
| `team-and-access`         | `Team`              | not in scope of wave-b2 lock                         |
| `documents`               | `Documents`         | not in scope of wave-b2 lock                         |
| `project-readiness`       | `Project Readiness` | not in scope of wave-b2 lock                         |
| `approvals`               | `Approvals`         | not in scope of wave-b2 lock                         |
| `external-systems`        | `Apps`              | **drifts**: locked tab label is `External Platforms` |
| `control-center-settings` | `Settings`          | not in scope of wave-b2 lock                         |
| `site-health`             | `Site Health`       | not in scope of wave-b2 lock                         |

Surface `displayName` for `external-systems` in `PccMvpSurfaces.ts` is `External Systems`. The locked External Platforms page title is `External Platforms Launch Pad`. Prompt 02 should reconcile the tab label, the surface display name (where consumed by the active-surface page), and the page title against the locked decisions, and confirm both sources of truth.

### 5.5 Icon usage (`PccHorizontalTabs.tsx`)

`PccHorizontalTabs.tsx` currently imports a per-surface `IconComponent` set (`TAB_ICONS`) and renders an icon span alongside the label inside each tab button. _(drifts: locked decision is text-only tab rail; icons are to be removed for now.)_

### 5.6 Command-search behavior (`PccCommandSearch.tsx`)

Two variants are rendered:

- `variant="icon"`: a `<button disabled>` with an aria-labelled Search icon;
- `variant="expanded"`: an `<input readonly>` with an aria-labelled Search icon.

Both variants are non-functional preview affordances today. _(matches locked decision: command-search affordance remains a disabled preview in wave-b2.)_

### 5.7 Tab accessibility wiring (`PccHorizontalTabs.tsx`)

The tab rail uses `role="tablist"`, per-tab `role="tab"`, `aria-selected` reflecting active state, optional `aria-controls` (when a `panelId` is supplied), roving `tabIndex` (active tab `0`, others `-1`), and keyboard handlers for `ArrowRight`/`ArrowLeft` (with wrap), `Home`, `End`, plus `Enter`/`Space` activation. Each tab also stamps `data-pcc-tab-id` and an active-tab data attribute for test markers. _(matches locked decision: a11y wiring should be preserved when icons are removed.)_

### 5.8 Breakpoint mode contract (`apps/project-control-center/src/layout/footprints.ts`)

Eight responsive modes are defined: `phone`, `tabletPortrait`, `tabletLandscape`, `smallLaptop`, `standardLaptop`, `largeLaptop`, `desktop`, `ultrawide`. The contract includes column-span and minimum-span lookup tables. _(matches locked decision: 8-mode responsive contract is preserved.)_

### 5.9 Tests that currently consume the audited surfaces

- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx` — 8-mode shell behavior, hero+tabs+canvas markers, phone-navigation visibility, plus the `resolveResponsiveMode` boundary contract.
- `apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx` — canonical tab order, marker contract, label rendering, `aria-selected`/active markers, "icons are decorative" assertion (icon a11y leakage), click + keyboard navigation (ArrowRight/Left/Home/End wrap), button type + Enter/Space activation, `aria-controls`/`panelId` wiring, phone-width disclosure, active-indicator + density markers.
- `apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx` — eyebrow + identity + metadata rendering, active-surface marker, source-confidence states, forbidden-phrase validation, status pills tone markers, density modes (compact vs comfortable), command-search variant per mode (expanded vs icon), phone-mode collapsible project-intel + toggle interaction.

### 5.10 Working-tree state and lockfile baseline

At audit time:

- `git status --short` reported a single untracked entry: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b2/` (the wave plan dir for wave-b2). No app-code, test, model, manifest, or package mutations are pending.
- `pnpm-lock.yaml` MD5: `c56df7b79986896624536aab74d609f4`.

## 6. Implementation File Map for Prompt 02

This map names files Prompt 02 may need to touch in order to satisfy the user-locked decisions in §3. It is descriptive, not prescriptive; Prompt 02 owns the implementation choices.

### 6.1 Likely-touched (in scope of wave-b2)

| Path                                                                  | Likely role in Prompt 02                                                                                                                                                                            |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/project-control-center/src/shell/PccProjectHeroBand.tsx`        | Render mandatory hero facts (location, estimated value, scheduled completion, project stage); remove rendering of locked-out facts (client, project status, source confidence, last updated).       |
| `apps/project-control-center/src/shell/PccProjectHeroBand.module.css` | Style adjustments aligned with the locked hero composition; visual separation from the tab rail.                                                                                                    |
| `apps/project-control-center/src/shell/PccShell.tsx`                  | Compose hero/tab/canvas with the locked visual separation; preserve thin-shell composition.                                                                                                         |
| `apps/project-control-center/src/shell/PccShell.module.css`           | Visual-separation seam styling between hero and tab rail.                                                                                                                                           |
| `apps/project-control-center/src/shell/PccHorizontalTabs.tsx`         | Remove icon rendering; update `external-systems` label to `External Platforms`; preserve a11y wiring (role=tablist/tab, aria-selected, aria-controls, roving tabIndex, Arrow/Home/End/Enter/Space). |
| `apps/project-control-center/src/shell/PccHorizontalTabs.module.css`  | Tab-rail styling for text-only rail and active indicator.                                                                                                                                           |
| `apps/project-control-center/src/shell/PccCommandSearch.tsx`          | No functional change required by wave-b2. Touch only if disabled-preview wording, markers, or styling must be tightened to match the locked posture.                                                |
| `apps/project-control-center/src/preview/projectPlaceholder.ts`       | Additive extension to expose `projectStage` and `scheduledCompletionDate` placeholder values consumed by the hero.                                                                                  |
| `apps/project-control-center/src/PccApp.tsx`                          | Wire any new placeholder fields through to `PccProjectHeroBand`; update prop-set to drop locked-out hero fields.                                                                                    |

### 6.2 Conditional / likely NOT touched

| Path                                                                                               | Default posture                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`                                       | **Likely NOT touched.** Edit only if tab-panel `aria-controls` ownership or active-surface panel ID assignment must change to satisfy the new tab rail.                                                                                                                                                                                 |
| `packages/models/src/pcc/PccMvpSurfaces.ts`                                                        | **Likely NOT touched.** Edit only if the External Platforms page title or the `external-systems` surface displayName must be reconciled at the model layer for the active-surface page consumer. Any change here is a cross-package edit and Prompt 02 should weigh whether to localize the label override at the tab/page layer first. |
| `packages/models/src/pcc/IProjectProfile.ts`, `packages/models/src/pcc/fixtures/projectProfile.ts` | **Not touched.** The contract already supports the locked-in hero facts.                                                                                                                                                                                                                                                                |
| `apps/project-control-center/src/layout/footprints.ts`                                             | **Not touched.** The 8-mode breakpoint contract is preserved.                                                                                                                                                                                                                                                                           |

### 6.3 Test files (future consumers, not Prompt 02 source-of-truth edits)

See §8 below.

## 7. Guardrails (wave-b2 globals)

- No live tenant writes.
- No Microsoft Graph / PnP / SharePoint REST runtime.
- No Procore / Document Crunch / Adobe Sign runtime.
- No backend route changes.
- No approval or workflow execution.
- No dependency install/update.
- No package, manifest, or `.sppkg` changes.
- No `pnpm-lock.yaml` drift.
- No final 56/56 flagship-scoring claim (see §9).
- No `git push` unless explicitly instructed.
- Wave-b2 color usage is restricted to existing `@hbc/ui-kit` branded colors only — no ad-hoc hex literals or new color tokens.

## 8. Known Future Test Updates

The following tests are expected to require updates in Prompt 02 (or a dedicated test-alignment prompt). This audit lists them; it does **not** modify them.

- `apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx` — remove or update icon-specific assertions (notably the "icons are decorative" assertion and any density-marker assertions tied to icon rendering). Preserve a11y wiring coverage (role=tablist/tab, aria-selected, aria-controls, roving tabIndex, Arrow/Home/End wrap, Enter/Space activation, active indicator). Update the `external-systems` label assertion from `Apps` to `External Platforms`.
- `apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx` — revise metadata assertions to match the locked hero facts: drop assertions that require client, project status, source confidence, or last-updated rendering; add assertions that require location, estimated value, scheduled completion, and project stage; confirm primary identity (`Project Control Center`) and secondary identity (active surface name); review the forbidden-phrase suite for compatibility with the new locked copy and prefer structural assertions where bare product words may legitimately appear.
- `apps/project-control-center/src/tests/PccShell.responsive.test.tsx` — extend coverage for the new hero/tab visual-separation markers and the disabled command-search affordance contract; preserve the 8-mode boundary contract for `resolveResponsiveMode`.

## 9. Flagship Scoring Posture (no 56/56 claim)

This prompt is scope lock and repo-truth confirmation only. Final flagship scoring (the 56/56 / per-criterion matrix) requires Prompt 07 evidence and hosted validation, neither of which is in scope here. This audit does not state, imply, or pre-record any flagship score, partial score, or readiness percentage.

## 10. Risks

- **R1.** The "icons are decorative" assertion in `PccHorizontalTabs.test.tsx` directly conflicts with the text-only rail decision; Prompt 02 will need to remove or restructure the assertion rather than try to preserve the legacy icon contract.
- **R2.** The locked-in/locked-out hero facts require non-trivial rewrites of the hero component and its tests; a half-applied change risks the hero rendering both excluded fields (client, project status, source confidence, last updated) and the new mandatory fields (project stage, scheduled completion).
- **R3.** Phone-mode collapsible project-intel and density modes interact with the new visual-separation requirements. Prompt 02 should preserve the collapsible toggle behavior unless explicitly authorized to change it.
- **R4.** Lockfile drift watch: any incidental `pnpm-lock.yaml` modification during wave-b2 must be investigated, not silently accepted (per repo memory `feedback_lockfile_discipline`).
- **R5.** External-systems label drift exists at two layers: the tab rail (`Apps` → `External Platforms`) and the surface displayName (`External Systems` → potentially `External Platforms Launch Pad` for the page title). Prompt 02 should choose where the rename lands (tab/page-local override vs `PccMvpSurfaces.ts` displayName mutation) and document the choice.
- **R6.** `projectPlaceholder.ts` lacks `projectStage` and `scheduledCompletionDate`. Adding them is additive and low-risk, but the prop wiring through `PccApp.tsx` and `PccProjectHeroBand.tsx` must be consistent.

## 11. Recommendation for Prompt 02

Proceed to Prompt 02 with the user-locked decisions in §3 as the binding scope. Prompt 02's decision gate is preserved: this audit reports facts and locked decisions only and does not pre-decide implementation choices that Prompt 02 owns. Prompt 02 should confirm the tab-label/page-title resolution path (tab-local vs model-layer) before editing `packages/models/**`, and should plan the `PccProjectHeroBand` rewrite as a single coherent change rather than a series of partial edits.
