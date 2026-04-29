# HbcTypography

> **Governance Status:** Layer 3 component reference
> **Purpose:** API/usage guidance for HbcTypography.
> **Authority Boundary:** This document does not override Layer 1 runtime doctrine, runtime overlays, acceptance/scoring model, active supporting SPFx standards, or active supporting SPFx patterns.
> **Routing Note:** Consuming surfaces must follow runtime doctrine first.

Intent-based text component providing semantic typography with automatic style resolution.

## Governance Clarification

- Typography usage remains subject to runtime doctrine.
- Brand/font usage remains subject to `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`.
- Governed custom font placement remains blocked unless `docs/reference/brand/FONT-LICENSE-CLEARANCE.md` is approved.

## Import

```tsx
import { HbcTypography } from '@hbc/ui-kit';
```

## Props

| Prop      | Type                        | Default   | Description                                                     |
| --------- | --------------------------- | --------- | --------------------------------------------------------------- |
| intent    | TypographyIntent            | required  | Intent name: 'h1', 'h2', 'h3', 'body', 'caption', 'label', etc. |
| as        | keyof JSX.IntrinsicElements | auto      | HTML tag override (h1, h2, p, span, etc.)                       |
| children  | ReactNode                   | required  | Text content                                                    |
| className | string                      | undefined | Additional CSS classes for customization                        |

## Usage

```tsx
<HbcTypography intent="h1">Page Title</HbcTypography>

<HbcTypography intent="body">
  Regular paragraph content with standard line height and spacing.
</HbcTypography>

<HbcTypography intent="caption" as="span">
  Metadata or supporting text
</HbcTypography>

<HbcTypography intent="label" className="text-blue-600">
  Custom styled label
</HbcTypography>
```

## Field Mode Behavior

In Field Mode, contrast is automatically adjusted. Text opacity and color lightness increase for dark backgrounds. Heading intents receive brighter tones, body text maintains readability with hbcFieldTheme tokens.

## Accessibility

- Semantic HTML via the `as` prop ensures proper document structure
- Font sizes maintain WCAG AA contrast ratios against backgrounds
- Intents map to logical typography hierarchy (h1 > h2 > body > caption)
- Screen readers interpret semantic heading levels correctly

## SPFx Constraints

No SPFx-specific constraints.
