# HB Brand Usage Governance

## Purpose

This document defines binding governance for use of HB logos, marks, fonts, and brand expression in HB Intel UI surfaces.

The goal is to make HB Intel feel like a premium custom-built HB product while preserving maintainability, accessibility, host safety, and UI-kit discipline.

## Doctrine Alignment

This document is a supporting brand/source-of-truth governance layer. It does not replace Layer 1 runtime doctrine.

Runtime doctrine remains authoritative for product behavior, host fit, accessibility, interaction quality, and acceptance.

## Current vs Target Archive Posture

- **Current archive truth:** `docs/reference/brand/HB-Brand-Guide.zip`
- **Target source territory:** `docs/reference/brand/source/`
- **Future action:** archive relocation/reconciliation is deferred to a later explicitly authorized prompt.

## Source-of-Truth Boundary

`docs/reference/brand/` is reference/source-of-truth territory, not product import territory.

Product code must not import raw brand assets or fonts from `docs/reference/brand/`.

Stable implementation-ready reusable assets must be consumed from `@hbc/ui-kit/branding`.

## Primitive Discipline Rule

Common controls (buttons, inputs, tables, dialogs, pickers, badges, tabs, command bars, empty states) should use governed UI-kit primitives.

Do not create bespoke brand-styled replacements for standard controls unless a documented exception is approved.

## Logo Usage Rules

### Required

- Use official logo files from approved source package lineage or curated UI-kit registry.
- Preserve aspect ratio and clear space.
- Use reverse/white variants on dark backgrounds.
- Use vector/high-resolution assets for large placements.
- Use compact marks only where space is genuinely constrained.
- Provide accessible naming/alt text where logos carry identity meaning.

### Prohibited

- Stretching, skewing, squashing, or cropping official marks.
- Recoloring logos outside approved variants.
- Creating unofficial lockups or derivative marks.
- Using low-quality JPGs where cleaner PNG/SVG assets are available.
- Using logos as ornamental texture/filler without communicative purpose.
- Replacing real logos with initials where real marks are expected.

## Font Governance and License/Internal-Use Gate

Fonts are governed assets and must be handled with licensing care.

### Binding Gate

Before any font placement/copying into implementation paths, document:

- license/internal-use review outcome;
- approved usage scope;
- fallback posture.

### Binding Rules

- Do not duplicate font files across apps.
- Do not import raw font files directly from app code.
- Do not include font binaries in generated prompt packages, exported documentation zips, or public artifacts.
- Do not use ungoverned app-local `@font-face` declarations.
- Expose approved font usage through governed UI-kit theme/font layer only.
- Define fallback font stacks for all production surfaces.

## Brand Expression by Surface Type

| Surface Type                      | Brand Strength     | Guidance                                                                     |
| --------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| Flagship shell / command center   | Strong             | Confident identity, disciplined hierarchy, authentic marks                   |
| Executive dashboard               | Strong             | Premium composition with restrained but visible identity                     |
| Decision-critical summary surface | Strong             | Clarity-first branded framing, high-trust status language                    |
| SPFx domain app                   | Moderate to strong | Application identity allowed, no host chrome duplication                     |
| Workflow execution surface        | Moderate           | Brand through hierarchy/status/composition, not ornamental control restyling |
| Forms/tables/logs/settings        | Light to moderate  | Prioritize efficiency, legibility, validation, and consistency               |
| Admin/internal utility            | Light              | Keep predictable and control-oriented                                        |
| Field-facing surface              | Context-driven     | Usability, contrast, and resilience outweigh decoration                      |

## PCC-Specific Brand Direction

PCC should feel like a blend of:

- polished executive command center;
- premium custom-built HB product;
- high-density project-controls cockpit.

PCC should not feel like:

- a default SharePoint list page;
- a generic enterprise card grid;
- a lightly tinted template;
- a decorative dashboard with weak operational clarity;
- a control playground that reinvents standard primitives.

Recommended traits:

- authentic HB mark in application header/rail;
- dark intelligence header where appropriate;
- disciplined HB accent use;
- compact operational cards and clear hierarchy;
- variable-density bento/cockpit overviews where appropriate;
- structured workbench layouts for forms, workflows, logs, approvals, and detail review.

## Accessibility and Contrast Requirements

Brand treatment must not reduce accessibility quality.

Required:

- text and interactive contrast must meet runtime doctrine expectations;
- focus visibility must remain clear;
- logo and adjacent text must remain readable at supported breakpoints;
- reverse variants must be used where standard marks lose contrast;
- motion around brand treatment must respect `prefers-reduced-motion`.

If branding harms readability/usability, revise the treatment.

## Evidence Requirements

For flagship/decision-critical surfaces using prominent branding, capture:

- breakpoint screenshots;
- logo variant confirmation;
- readability/contrast notes;
- confirmation of `@hbc/ui-kit/branding` consumption path;
- confirmation that no raw source-brand imports exist;
- reduced-motion and keyboard/focus checks where relevant.

Runtime acceptance closure remains governed by runtime doctrine and scoring model.

## Exception Process

A brand exception is allowed only when documented and when it materially improves clarity/trust/fit without violating core governance.

Exception template:

```md
## Brand Exception

- Surface:
- Asset / font / treatment:
- Standard rule being excepted:
- Reason:
- Accessibility impact:
- Host/runtime impact:
- Review owner:
- Expiration or revisit trigger:
```

## Developer Checklist

Before using a brand asset in product UI:

- [ ] Confirm whether the asset is source-only or curated for UI use.
- [ ] Confirm reusable assets are exported from `@hbc/ui-kit/branding`.
- [ ] Confirm app code is not importing from `docs/reference/brand/`.
- [ ] Confirm the logo variant fits the background and contrast needs.
- [ ] Preserve aspect ratio and clear space.
- [ ] Confirm responsive readability across target breakpoints.
- [ ] Confirm alt text/decorative semantics are correct.
- [ ] Confirm font usage goes through governed UI-kit theme/font paths only.
- [ ] Document any approved exception.

## Prompt 05 Implementation Status Note

Prompt 05 curated stable reusable corporate logo assets into `packages/ui-kit/src/branding/assets/` and exposed them via `@hbc/ui-kit/branding`.

Reef Arches status for corrective Option B: SVG registry export is deferred until a clean self-contained SVG is available, and `reefArchesLogoPng` is the sole active Reef Arches curated registry asset.

Boundaries preserved:

- no product/runtime source changes were made;
- no brand archive relocation was performed;
- no PDFs were copied;
- no fonts were copied, extracted, or moved;
- font implementation work remains deferred to later authorized prompts.
