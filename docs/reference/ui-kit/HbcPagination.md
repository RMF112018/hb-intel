# HbcPagination

Pagination control for navigating through multi-page data sets.

## Import

```tsx
import { HbcPagination } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| currentPage | number | required | Currently displayed page (1-indexed) |
| totalPages | number | required | Total number of pages |
| onPageChange | (pageNumber: number) => void | required | Callback when user changes page |
| pageSizeOptions | PageSizeOption[] | [10, 25, 50, 100] | Available items-per-page choices |
| pageSize | number | 10 | Current number of items displayed per page |

### PageSizeOption

| Property | Type | Description |
|----------|------|-------------|
| label | string | Display label (e.g., "10 items") |
| value | number | Items per page count |

## Usage

```tsx
<HbcPagination
  currentPage={1}
  totalPages={5}
  onPageChange={(page) => setCurrentPage(page)}
  pageSize={10}
  pageSizeOptions={[
    { label: '10 per page', value: 10 },
    { label: '25 per page', value: 25 },
  ]}
/>
```

## Field Mode Behavior

Pagination controls use dark background with light text and borders in Field Mode. Button states (enabled, disabled, active) maintain clear contrast. Navigation buttons and page number buttons adapt color accordingly.

## Accessibility

- `nav` wrapper with `aria-label="Pagination"`
- Page buttons are `<button>` elements with clear aria-label (e.g., "Go to page 2")
- Current page button has `aria-current="page"`
- Previous/Next buttons disabled when at boundaries with `aria-disabled="true"`
- Page size selector is semantic `<select>` or custom button group
- Keyboard: Tab through controls, Enter/Space to activate
- Focus indicators clearly visible on all interactive elements

## SPFx Constraints

No SPFx-specific constraints.
