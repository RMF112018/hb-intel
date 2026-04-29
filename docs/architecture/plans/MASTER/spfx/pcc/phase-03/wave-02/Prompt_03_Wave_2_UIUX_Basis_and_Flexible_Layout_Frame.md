# Prompt 03 — Wave 2 UI/UX Basis and Flexible Layout Frame

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Implement the PCC shell visual frame and flexible layout foundation based on the saved basis-of-design image. This is the core UI/UX prompt for Wave 2.

## Governing Design Asset

Inspect and reference:

```text
docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png
```

Do not treat the image as pixel-perfect. Treat it as the governing visual direction for:

- dark navy project intelligence header;
- HB-orange application navigation rail;
- compact command/search area;
- floating summary cards;
- white/light operational cards;
- tight bento/masonry grid;
- status-driven construction project dashboard tone.

## Required Implementation

Create or update PCC shell components to include:

```text
PccShell
PccNavigationRail
PccProjectIntelligenceHeader
PccCommandSearch
PccBentoGrid
PccDashboardCard
PccStatusPill
PccPreviewState
```

Names may vary if repo conventions require it, but the concepts must be present and documented.

## Flexible Layout Requirement

Implement a controlled bento/masonry-style layout. The layout must support:

- unique card heights;
- variable column spans;
- card footprint variants (`hero`, `wide`, `standard`, `compact`, `tall`, `full` or equivalent);
- container-aware breakpoints;
- tight vertical packing;
- predictable DOM and keyboard order;
- no equal-height paired-row requirement.

Use CSS Grid with measured row spans or an equivalent accessible implementation. Do not use CSS columns as the primary layout model. Do not blindly use `grid-auto-flow: dense` for critical content.

## Explicit Anti-Pattern

Do not import, copy, or adapt the `hb-intel-homepage` fixed paired-row layout as the PCC Project Home layout. PCC may learn from its measurement and container-awareness patterns, but it must not inherit the row-pair/equal-height behavior.

## Required Responsive Modes

Document and implement initial behavior for:

- wide desktop;
- standard desktop/laptop;
- tablet landscape;
- tablet portrait;
- phone/narrow.

## Validation

Add tests or source-level assertions that prove:

- PCC app does not import homepage layout modules;
- all MVP surfaces can render in the shell frame;
- the basis-of-design repo path appears in docs or source comments where appropriate;
- the layout contract supports variable footprints;
- no live integration imports were introduced.

Run package validation:

```bash
git status --short
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center lint
```

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Prompt_03_Closeout.md
```

Include screenshots or local-render notes if available, but do not deploy or package for app catalog.
