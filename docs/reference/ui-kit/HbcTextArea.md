# HbcTextArea

Multi-line text input for structured form capture.

## Import

```tsx
import { HbcTextArea } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | Yes | Current textarea value. |
| `onChange` | `(value: string) => void` | Yes | Change callback. |
| `label` | `string` | No | Field label text. |
| `placeholder` | `string` | No | Placeholder text. |
| `rows` | `number` | No | Visible row count (`4` default). |
| `maxLength` | `number` | No | Optional character cap. |
| `error` | `string` | No | Validation message shown as error text. |

## Usage

```tsx
<HbcTextArea
  label="Notes"
  value={notes}
  onChange={setNotes}
  rows={6}
/>
```

## Accessibility

- Use `label` for screen-reader discoverability.
- Provide `error` text for invalid states.

## Field Mode / Theme

Input surface, border, and focus styles adapt via active theme tokens.

## Entry Points

Exported from the full entry point: `@hbc/ui-kit`.
See [entry-points.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/entry-points.md).

