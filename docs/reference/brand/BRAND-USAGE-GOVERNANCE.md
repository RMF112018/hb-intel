# HB Brand Usage Governance

## Purpose

This document defines binding governance for use of HB logos, marks, fonts, and brand expression in HB Intel UI surfaces.

The goal is to make HB Intel feel like a premium custom-built HB product while preserving maintainability, accessibility, host safety, and UI-kit discipline.

## Governing Principles

### 1. Brand assets are canonical, not decorative

HB logos, marks, and fonts are governed source assets. They must not be copied, recolored, stretched, recreated, or scattered into app-local folders without review.

### 2. Brand expression is context-driven

Brand expression should be strongest in:

- flagship SPFx shells;
- PCC and project-control command centers;
- executive dashboards;
- orientation and onboarding surfaces;
- presentation-grade homepage moments;
- decision-critical summary surfaces.

Brand expression should be more restrained in:

- routine forms;
- data-entry screens;
- dense tables;
- settings pages;
- logs;
- internal admin utilities;
- repeated workflow screens.

### 3. Do not reinvent common UI primitives

Buttons, fields, tables, badges, tabs, dialogs, pickers, command bars, empty states, and routine controls should use governed UI-kit primitives.

Premium brand expression should come through:

- layout and composition;
- authentic logo usage;
- typography and hierarchy;
- color discipline;
- status language;
- command-center density;
- confident spacing;
- purposeful motion;
- evidence-backed quality.

Do not build custom one-off controls merely to make a screen feel branded.

### 4. UI doctrine still governs product behavior

Brand usage must not override:

- accessibility;
- contrast;
- keyboard behavior;
- touch target size;
- reduced-motion requirements;
- SharePoint host safety;
- breakpoint stability;
- state-model completeness;
- data confidence and operational clarity.

A visually branded surface that fails usability or host-fit requirements is non-compliant.

## Asset Source-of-Truth Rules

### Source archive

The full source package belongs under:

```text
docs/reference/brand/source/HB-Brand-Guide.zip
```

This package is for reference, auditability, and curation only.

Application code must not import from this location.

### Curated UI assets

Reusable implementation-ready brand assets belong under:

```text
packages/ui-kit/src/branding/assets/
```

They must be exported through:

```text
packages/ui-kit/src/branding/index.ts
```

Applications must consume them through:

```ts
import { brandAssets } from '@hbc/ui-kit/branding';
```

or named exports from `@hbc/ui-kit/branding`.

### App-local assets

App-local brand or image assets are allowed only when the asset is:

- campaign-specific;
- editorial;
- temporary;
- surface-specific;
- not a reusable corporate logo/mark/font.

If an app-local asset becomes reusable, it should be promoted into `@hbc/ui-kit/branding`.

## Logo Usage Rules

### Required

- Use official logo files from the approved brand source package or curated UI-kit registry.
- Preserve aspect ratio.
- Preserve clear space.
- Use reverse/white variants on dark backgrounds.
- Use high-resolution or vector assets for large placements.
- Use compact marks only where space is genuinely constrained.
- Provide accessible names/alt text where the logo conveys identity.
- Treat decorative duplicate logos as decorative only if identity is already communicated elsewhere.

### Prohibited

- Stretching, squashing, skewing, or cropping official marks.
- Recoloring logos outside approved variants.
- Creating unofficial logo lockups.
- Using low-quality JPGs where cleaner PNG/SVG assets are available.
- Using logos as background texture or ornamental filler.
- Combining HB marks with unrelated icons in a way that implies a new brand.
- Replacing real logos with text initials where a real mark is expected.

## Font Governance

### Source font package

The brand package includes a Futura font archive. Font files are governed assets and must be treated with licensing care.

### Binding rules

- Do not duplicate font files across apps.
- Do not import raw font files directly from app code.
- Do not include font binaries in generated prompt packages, exported documentation zips, or public artifacts.
- Do not use ungoverned `@font-face` declarations in app-local CSS.
- Do not assume web use is permitted until license/internal-use posture is confirmed.
- If approved, expose fonts through a UI-kit theme/font layer.
- Define fallback font stacks for every production use.

### Recommended implementation path

If license review confirms permitted use, implement brand fonts through a centralized UI-kit layer such as:

```text
packages/ui-kit/src/theme/fonts/
packages/ui-kit/src/theme/fontTokens.ts
packages/ui-kit/src/theme/globalFontFace.css
```

or another repo-approved UI-kit theme path.

Then expose usage through semantic tokens, for example:

```ts
export const hbcFontFamilies = {
  brand: 'Futura, Avenir Next, Segoe UI, Arial, sans-serif',
  body: 'Segoe UI, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;
```

Product surfaces should consume font tokens, not raw font files.

## Brand Expression by Surface Type

| Surface Type | Brand Strength | Guidance |
|---|---|---|
| PCC / project control command center | Strong | Dark command header, authentic HB mark, high-density cockpit, confident status language |
| Executive dashboard | Strong | Premium composition, strong metrics, restrained but visible HB identity |
| Homepage flagship hero | Strong | Governed by homepage overlay; authentic logo, approved background/media posture |
| SPFx domain app | Moderate to strong | Application identity is allowed; do not duplicate SharePoint global chrome |
| Workflow execution screen | Moderate | Use standard primitives; brand through shell, status, hierarchy, and typography |
| Forms/tables/logs/settings | Light to moderate | Prioritize efficiency, clarity, validation, and accessible controls |
| Admin/internal utility | Light | Avoid unnecessary brand-heavy treatment; optimize for predictability and control |
| Field-facing surface | Context-driven | Strong clarity, touch usability, contrast, and offline/host resilience outweigh decoration |

## PCC-Specific Brand Direction

PCC should feel like a combination of:

- polished executive command center;
- premium custom-built HB product;
- high-density project controls cockpit.

PCC should not feel like:

- a default SharePoint list page;
- a generic enterprise card grid;
- a lightly tinted Microsoft template;
- an ornamental marketing dashboard;
- a custom-control playground that reinvents common UI primitives.

Recommended PCC brand traits:

- HB mark in the application rail/header;
- dark navy command-center header where appropriate;
- HB orange as a disciplined accent, not a blanket fill color;
- compact operational cards with strong status hierarchy;
- variable-density bento/cockpit layouts for overview surfaces;
- structured workbench layouts for forms, workflows, logs, and reviews;
- clear data freshness/source indicators;
- authentic logo usage through `@hbc/ui-kit/branding`.

## Accessibility and Contrast

Brand assets must pass the same accessibility expectations as the rest of the UI.

Required:

- text contrast must meet WCAG 2.1 AA minimums;
- interactive controls must meet minimum contrast and focus visibility requirements;
- logo placement must remain readable at supported breakpoints;
- reverse logos must be used on dark backgrounds where standard marks lose contrast;
- motion or visual effects around brand assets must respect `prefers-reduced-motion`.

If a logo or brand treatment harms readability or usability, the design must be revised.

## Evidence Requirements

For flagship or decision-critical surfaces using prominent brand treatment, acceptance evidence should include:

- screenshots across required breakpoints;
- confirmation of logo variant used;
- contrast/readability notes for logo and adjacent text;
- verification that app imports brand assets from `@hbc/ui-kit/branding`;
- confirmation that no raw source-package imports exist;
- reduced-motion and keyboard/focus checks where applicable.

## Exception Process

A brand exception is allowed only when it is documented and materially improves:

- clarity;
- trust;
- brand accuracy;
- host fit;
- project context;
- executive comprehension;
- field usability.

An exception is not allowed when it:

- creates unofficial brand variants;
- duplicates font/logo files unnecessarily;
- weakens accessibility;
- makes the UI harder to maintain;
- bypasses UI-kit governance;
- preserves a generic outcome through superficial branding only.

Exception record template:

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
- [ ] Confirm the asset is exported from `@hbc/ui-kit/branding` if reusable.
- [ ] Confirm the app is not importing directly from `docs/reference/brand/source/`.
- [ ] Confirm the logo variant fits the background.
- [ ] Preserve aspect ratio and clear space.
- [ ] Confirm contrast and readability.
- [ ] Confirm responsive behavior at target breakpoints.
- [ ] Confirm alt text or decorative semantics.
- [ ] Confirm font usage goes through UI-kit theme/font governance.
- [ ] Document any exception.
