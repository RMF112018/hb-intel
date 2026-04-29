# HB Brand Usage Governance

## Purpose

This document defines binding brand-governance rules for logos, marks, fonts, and brand expression in HB Intel UI surfaces.

It is a supporting brand/source-of-truth governance layer and does not replace runtime doctrine.

## Doctrine Relationship

Runtime doctrine remains authoritative for:

- product behavior
- host fit
- accessibility
- interaction quality
- acceptance and closure

Brand governance in this file governs:

- source-of-truth handling
- logo/font usage policy
- expression intensity by surface context

## Archive Truth and Target Source Territory

- **Current archive truth:** `docs/reference/brand/HB-Brand-Guide.zip`
- **Target source territory:** `docs/reference/brand/source/`
- **Future action:** archive relocation/reconciliation is deferred to a later explicitly authorized prompt.

No archive movement or extraction is performed in Prompt 04.

## Source-of-Truth Boundary

`docs/reference/brand/` is reference/source-of-truth territory, not product import territory.

Product code must not import raw brand assets or fonts from `docs/reference/brand/`.

## Curated Asset Consumption Rule

Stable implementation-ready reusable assets belong in:

```text
packages/ui-kit/src/branding/assets/
```

They must be exported from `@hbc/ui-kit/branding`.

Applications should consume them from `@hbc/ui-kit/branding`, not raw file paths.

## Brand Expression by Context

Strongest brand expression should appear on:

- flagship shells
- command centers
- executive dashboards
- decision-critical surfaces

Restrained brand expression should appear on:

- routine forms
- tables
- logs
- settings
- standard controls

## Primitive Discipline Rule

Common controls (buttons, inputs, tables, dialogs, badges, tabs, pickers, command bars) should use governed UI-kit primitives.

Do not replace standard controls with bespoke brand-styled variants unless a documented exception is approved.

## Font Governance

Fonts are governed assets.

Required gate before any placement/copying:

- documented license/internal-use review

Until that gate is satisfied:

- do not copy/move font binaries
- do not expose ungoverned font imports in product code

## Prohibited Actions in Prompt 04

- move/copy/extract/optimize/rename brand binaries
- move/copy font binaries
- product/runtime import path mutation

## Evidence Expectations

For high-brand-strength surfaces, acceptance evidence should include:

- logo variant appropriateness
- readability/contrast notes
- confirmation of `@hbc/ui-kit/branding` consumption path
- confirmation that no raw source-brand imports are used

Runtime acceptance criteria remain governed by the runtime doctrine stack.
