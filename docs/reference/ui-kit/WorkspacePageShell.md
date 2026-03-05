# WorkspacePageShell

Shared page wrapper for workspace pages, displaying title, optional description, status badge, and active project context.

## Import

```tsx
import { WorkspacePageShell } from '@hbc/ui-kit';
import type { WorkspacePageShellProps } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | required | Page title |
| description | string | undefined | Optional description text |
| status | { label: string; variant: StatusVariant } | undefined | Optional status badge |
| children | ReactNode | required | Page content |

## Usage

```tsx
<WorkspacePageShell
  title="Daily Log"
  description="Track daily site activity"
  status={{ label: 'Draft', variant: 'warning' }}
>
  <DailyLogContent />
</WorkspacePageShell>
```

## Field Mode Behavior

In Field Mode, title and description text colors adapt via `hbcFieldTheme` tokens. The status badge uses `HbcStatusBadge` which handles its own field mode adaptation.

## Accessibility

- Uses semantic heading hierarchy for title
- Description text provides context for screen readers
- Status badge uses `HbcStatusBadge` with proper ARIA attributes
- Project context displayed for orientation

## SPFx Constraints

Depends on `useProjectStore` from `@hbc/shell` for active project context. In SPFx environments, ensure the shell store is properly initialized.
