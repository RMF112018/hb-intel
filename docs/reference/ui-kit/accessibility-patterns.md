# UI Kit Accessibility Patterns

## Focus Trapping Pattern (WCAG 2.4.3 + 2.1.2)

### When to Use
- Modal dialogs, command palettes, and overlays with `role="dialog"` / `aria-modal="true"`
- Any UI surface where focus must remain bounded while open

### Implementation

```typescript
import * as React from 'react';
import { useFocusTrap } from '@hbc/ui-kit/hooks';

export function MyDialog({ isOpen }: { isOpen: boolean }) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  // D-PH4C-10: Focus remains inside dialog while active.
  useFocusTrap(dialogRef, isOpen);

  if (!isOpen) return null;
  return <div ref={dialogRef} role="dialog" aria-modal="true" />;
}
```

### Verification
- Keyboard test: `Tab` and `Shift+Tab` never escape dialog content
- Storybook a11y run: no WCAG 2.4.3 / 2.1.2 violations

## Data Table Header Association Pattern (WCAG 1.3.1)

### Requirement
Every data cell (`<td>`) must reference the header cells (`<th>`) that describe it using `headers`.

### Implementation

```typescript
const tablePrefix = React.useId().replace(/:/g, '');
const thId = `${tablePrefix}-${header.id}`;

<th id={thId} scope="col">{headerLabel}</th>
<td headers={headerChain.join(' ')}>{value}</td>
```

### Edge Cases
- Grouped headers: include both group and leaf IDs in `headers` (space-separated)
- `colSpan` spacer rows: keep structural `<td colSpan>` cells decorative only
- Row headers: if introduced later (`<th scope="row">`), include row + column IDs in `headers`

### Verification
- Storybook a11y scan: no WCAG 1.3.1 table-relationship violations
- Screen reader check: cell announcements include associated header labels
