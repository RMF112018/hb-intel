# Prompt 05 — Wave 2 Project Home Bento Dashboard and Priority Actions

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Implement the Project Home preview dashboard using the flexible bento/masonry layout. This is the primary visible PCC experience for Wave 2.

## Basis of Design

Use `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` as the visual direction. Preserve the command-center composition: dark header, HB-orange rail, KPI pills, trend chart, floating card grid, and dense operational cards.

## Required Project Home Cards

Implement fixture-driven preview cards for:

- Project Intelligence Header;
- Priority Actions;
- Site Health Summary;
- Document Control Center preview;
- Project Readiness;
- Approvals & Checkpoints;
- External Systems;
- Team Snapshot;
- Missing Configurations;
- Recent Activity.

## Data Source

Use Wave 1 fixtures from `@hbc/models/pcc`. Do not invent live data seams. If fixture gaps exist, create app-local presentation fixtures derived from Wave 1 shapes and clearly mark them preview-only.

## Layout Requirement

Cards must use unique sizes and measured/content-driven heights. Do not force equal row heights. Do not use the homepage paired-row layout.

## Required States

Each card family must support at least:

- normal preview state;
- empty state;
- missing configuration state where applicable;
- unavailable fixture state;
- error state shell.

## Validation

Add tests confirming:

- Project Home renders all required card titles;
- flexible footprint definitions exist for required cards;
- no equal-row fixed-pair layout dependency exists;
- Priority Actions can render high/medium/low style cues from fixture data;
- missing-config card renders from fixture or derived preview data;
- no live integrations are called.

Run package validation commands.

## Closeout

Create `Wave_2_Prompt_05_Closeout.md`. Include confirmation that the Project Home layout follows the bento/flexible layout contract.
