# HbcCalendarGrid

Month calendar grid for Daily Log and date selection, displaying status dots, weather icons, and crew count badges.

## Import

```tsx
import { HbcCalendarGrid } from '@hbc/ui-kit';
import type { HbcCalendarGridProps, CalendarDayData } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| year | number | required | Calendar year |
| month | number | required | Month (0-indexed: 0=January, 11=December) |
| days | CalendarDayData[] | required | Day data array |
| onDayClick | (date: string) => void | undefined | Click handler for day cells |
| onMonthChange | (direction: number) => void | undefined | Month navigation handler (+1 next, -1 previous) |
| className | string | undefined | Additional CSS class |

### CalendarDayData

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string | yes | ISO date string (YYYY-MM-DD) |
| status | 'draft' \| 'submitted' \| 'approved' | no | Day status for color-coded dot |
| weatherIcon | ReactNode | no | Optional weather icon |
| crewCount | number | no | Crew count badge value |
| badges | ReactNode[] | no | Additional badge elements |

## Usage

```tsx
<HbcCalendarGrid
  year={2026}
  month={2}
  days={[
    { date: '2026-03-01', status: 'approved', crewCount: 12 },
    { date: '2026-03-02', status: 'draft' },
  ]}
  onDayClick={(date) => navigate(`/daily-log/${date}`)}
  onMonthChange={(dir) => setMonth(m => m + dir)}
/>
```

## Field Mode Behavior

In Field Mode, today's highlight uses orange ring inset shadow. Status dot colors adapt via `hbcFieldTheme` tokens for contrast on dark backgrounds.

## Accessibility

- Uses ARIA grid roles with proper row/cell structure
- Keyboard navigation via Enter/Space to select days
- Day status conveyed by both color dot and aria-label text
- Month navigation buttons have descriptive aria-labels

## SPFx Constraints

No SPFx-specific constraints. Pure CSS Grid layout with Griffel styles.
