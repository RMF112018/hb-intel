# UI Kit Agent Usage Guide

## Purpose

This guide gives future agents/developers a concise reading order and precedence model for UI governance decisions.

## Precedence Rule

Apply this precedence in order:

1. doctrine
2. overlays
3. acceptance/scoring
4. standards
5. patterns
6. component/layout references

Component and layout references are usage guidance and cannot override higher authorities.

## Reading Order by Surface Type

### Homepage SPFx

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
4. `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
5. `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
6. relevant supporting standards/patterns only where they do not conflict with homepage-specific doctrine/overlay

### Full-Page / PCC SPFx

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
3. `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
4. SPFx scorecard/evidence artifacts under `docs/reference/spfx-surfaces/`
5. `docs/reference/ui-kit/standards/*.md`
6. `docs/reference/ui-kit/patterns/*.md`
7. component/layout references under `docs/reference/ui-kit/`

### PWA

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
3. relevant standards/patterns where applicable
4. component/layout references for API/usage detail only

### Brand and Logo Usage

1. runtime doctrine and relevant overlay for surface behavior constraints
2. `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`
3. `docs/reference/brand/BRAND-ASSET-INVENTORY.md`
4. consume reusable assets through `@hbc/ui-kit/branding` and curated assets under `packages/ui-kit/src/branding/assets/`

### Component Usage

1. resolve surface doctrine/overlay/acceptance first
2. then use `docs/reference/ui-kit/Hbc*.md`, `DashboardLayout.md`, `WorkspacePageShell.md`, and `ListLayout.md` for API/usage guidance

## Validation and Evidence Checklist

For governance/doc updates, include at minimum:

- `git status --short`
- targeted formatter checks (Prettier/format checks required by active prompt)
- package checks only when prompt requires them (for example `@hbc/ui-kit` type/build/test/lint)
- explicit attribution of failures: prompt-related vs pre-existing/unrelated vs unresolved/unknown

## Do Not Use as Authority

- Component docs do not override doctrine.
- Layout references do not override doctrine.
- Brand docs do not replace runtime doctrine.
- Font usage must follow `docs/reference/brand/FONT-LICENSE-CLEARANCE.md`.
- Current approved usage is limited to governed UI-kit theme tokens/registry.
- Raw app imports, app-local placement, external redistribution, and expanded usage remain prohibited unless separately approved.
