# HbcRichTextEditor

> **Governance Status:** Layer 3 component reference
> **Purpose:** API/usage guidance for HbcRichTextEditor.
> **Authority Boundary:** This document does not override Layer 1 runtime doctrine, runtime overlays, acceptance/scoring model, active supporting SPFx standards, or active supporting SPFx patterns.
> **Routing Note:** Consuming surfaces must follow runtime doctrine first.

Rich text editor input for formatted notes and narrative content.

## Import

```tsx
import { HbcRichTextEditor } from '@hbc/ui-kit';
```

## Props

| Prop          | Type                      | Required | Description                                         |
| ------------- | ------------------------- | -------- | --------------------------------------------------- |
| `value`       | `string`                  | Yes      | Current editor content value.                       |
| `onChange`    | `(value: string) => void` | Yes      | Change callback.                                    |
| `placeholder` | `string`                  | No       | Placeholder when editor is empty.                   |
| `enableVoice` | `boolean`                 | No       | Enables voice dictation controls (where supported). |

## Usage

```tsx
<HbcRichTextEditor value={summary} onChange={setSummary} placeholder="Enter project summary..." />
```

## Accessibility

- Keep adjacent labels/instructions describing editor purpose.
- Ensure keyboard-only editing paths remain available.

## Field Mode / Theme

Editor chrome and typography adapt through active theme tokens.

## Entry Points

Exported from the full entry point: `@hbc/ui-kit`.
See [entry-points.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/entry-points.md).
