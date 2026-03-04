# HbcStatusBadge

Status indicator badge for displaying entity status across tables, lists, and inline content.

## Import

```tsx
import { HbcStatusBadge } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'success' \| 'warning' \| 'error' \| 'info' \| 'neutral' | required | Status variant determining color and semantics |
| label | string | required | Status text label |
| size | 'small' \| 'medium' | 'medium' | Badge size |

## Usage

```tsx
<HbcStatusBadge variant="success" label="Approved" />

<HbcStatusBadge variant="warning" label="Pending Review" size="small" />

<HbcStatusBadge variant="error" label="Rejected" />

<HbcStatusBadge variant="info" label="In Progress" />
```

## Field Mode Behavior

In Field Mode, status colors shift to high-contrast variants optimized for dark backgrounds. Success remains green but lighter, warning becomes golden-yellow, error increases saturation, info uses bright cyan, and neutral shifts to lighter gray.

## Accessibility

- Implements `role="status"` for announcements when status changes
- `aria-label` includes variant context (e.g., "success status: Approved")
- Semantic color associations support users with color blindness
- Text remains readable at all sizes with sufficient luminosity contrast

## SPFx Constraints

No SPFx-specific constraints.
