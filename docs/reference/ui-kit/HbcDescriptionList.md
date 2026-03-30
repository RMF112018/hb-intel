# HbcDescriptionList

Semantic key/value metadata display using `<dl>`/`<dt>`/`<dd>` elements in a 2-column grid layout.

## When to use

- Card metadata sections (client, location, type, etc.)
- Detail panel summaries
- Record overview fields
- Any label/value pair display that benefits from semantic HTML

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `DescriptionListItem[]` | required | Label/value pairs to display |
| `dense` | `boolean` | `false` | Compact spacing for card contexts |
| `className` | `string` | — | Additional CSS class |

### DescriptionListItem

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Label text (rendered in `<dt>`) |
| `value` | `ReactNode` | Value content (rendered in `<dd>`) |

## Usage

```tsx
import { HbcDescriptionList } from '@hbc/ui-kit';

const items = [
  { label: 'Client', value: 'ACME Construction' },
  { label: 'Location', value: 'Denver, CO' },
  { label: 'Type', value: 'Commercial Office' },
];

<HbcDescriptionList items={items} dense />
```

## Accessibility

- Uses semantic `<dl>`, `<dt>`, `<dd>` elements
- Screen readers announce label/value associations correctly
- Values support `ReactNode` for rich content (badges, links) while maintaining semantic structure

## Design tokens

- Standard: `label` tokens for `<dt>`, `body` tokens for `<dd>`, 12px column gap, 6px row gap
- Dense: `bodySmall` tokens for both, 10px column gap, 4px row gap
- Colors: `HBC_SURFACE_LIGHT['text-muted']` for labels, `['text-primary']` for values
- Values truncate with ellipsis on overflow

## Data attribute

`data-hbc-ui="description-list"` on the `<dl>` element.
