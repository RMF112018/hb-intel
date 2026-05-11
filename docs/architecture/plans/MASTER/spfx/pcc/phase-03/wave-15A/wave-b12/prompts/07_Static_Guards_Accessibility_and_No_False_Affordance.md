# PCC Phase 07 — Claude Code Opus 4.7 Execution Prompt

## Required Operating Mode

You are executing inside the `RMF112018/hb-intel` repo as a local code agent using Claude Code with Opus 4.7.

Follow these rules for this prompt:

- Work only inside the repo.
- Do not make broad, unfocused repo scans.
- Do not re-read files that are still within your current context or memory unless you need to verify drift or inspect a specific changed section.
- Prefer targeted file reads and targeted searches.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not mutate tenant systems, Procore, Sage, SharePoint, or any live external system.
- Do not introduce command-model behavior, approval execution, source-system mutation, sync execution, or autonomous HBI decisioning.
- Do not render developer/internal copy in the UI.
- Preserve Project Home Phase 06 behavior unless this prompt explicitly says otherwise.
- Preserve Document Control’s specialized `PccDocumentsSurface` unless this prompt explicitly says otherwise.
- Keep the bento direct-child invariant intact.
- Keep shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]` ownership intact.
- If repo truth differs from this prompt, stop and report the mismatch rather than forcing stale instructions.

## Phase 07 Baseline

Current intended baseline:

```text
PCC package posture: 1.0.0.218 / 1.0.0.218
pnpm-lock.yaml md5: 7c19ccfa8718a42f7f55ce178a626996
Phase 06 evidence commits:
  4c772ac3c8e48c46bb5f5bdb108fb53b1b51bb7a
  e6886489bb4f85d32840f69914dfb3b615f28aaf
Phase 06 evidence root:
  docs/architecture/evidence/pcc-live/phase-06-v1.0.0.218-final/
  docs/architecture/evidence/pcc-live/surface-smoke-1778491135146/
```

Phase 07 objective:

```text
Remove and permanently block the Phase 05 regression where redundant top-level
Dashboard/title-description bento cards returned on the six shared primary
dashboard pages: Core Tools, Estimating & Preconstruction, Project Startup &
Closeout, Project Controls, Cost & Time, and Systems Administration.
```


# Prompt 07 — Static Guards, Accessibility, and No-False-Affordance Coverage

## Objective

Harden static and rendered-output guardrails so Phase 07 cannot regress source authority, accessibility posture, or false-affordance controls.

## Static Guards to Preserve or Add

Tests must continue to guard against:

```text
echarts-for-react dependency or import
grid-auto-flow: dense
Project Intelligence rendered as a bento card
card-level data-pcc-active-surface-panel
nested data-pcc-card
developer/internal UI copy
```

## Rendered UI Copy Guard

Preserve or add rendered-text checks for the six shared dashboards that block:

```text
todo
tbd
placeholder
stub
mock
fixture
debug
dev-only
not implemented
developer
code agent
prompt
repo
test selector
internal only
coming soon
```

Allowed exception:

- Existing approved analytics copy may include “sample project data” because Phase 06 intentionally uses deterministic preview data with product-grade disclosure.

## Accessibility / Semantics Checks

Confirm:

- The first direct card heading is logical after top-card removal.
- The shared dashboards do not lose heading hierarchy.
- Disabled/deferred modules still expose visible reason copy from the module registry.
- Launch-only modules still expose no-writeback authority cues.
- Analytics still provide accessible `role="img"` labels and fallback summaries outside the chart canvas.
- The command-search preview remains non-interactive unless future work explicitly makes it operational.

## No-False-Affordance Checks

For module rows and selected-module content:

- Non-selectable/deferred modules must not appear as active clickable gateway actions.
- Disabled state must expose reason copy.
- No approve/reject/waive/override action verbs should appear in Approvals selected-module context unless a future approved command-model contract exists.

## Commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

## Acceptance Criteria

- Static guards pass.
- Rendered-copy guards pass.
- Accessibility-preservation assertions pass.
- No false affordance introduced.
- No source-system action authority is implied.
