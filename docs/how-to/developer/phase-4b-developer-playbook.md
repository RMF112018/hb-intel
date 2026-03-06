# Phase 4b Developer Playbook

Phase 4b authoring playbook for HB Intel pages under binding decisions D-01 through D-10.

## 5-Step Page Formula

1. Choose a layout variant: `dashboard`, `list`, `form`, `detail`, or `landing`.
2. Resolve page data with `@hbc/query-hooks` and derive `isLoading`, `isError`, and `isEmpty`.
3. Define command actions in a `CommandBarAction[]` and pass them to shell actions.
4. Wrap page content in `WorkspacePageShell` with required layout + state props.
5. Build page body only from `@hbc/ui-kit` and related approved facades.

## Canonical Skeleton

```tsx
const { data, isLoading, isError } = useRiskItems();
const isEmpty = !isLoading && !data?.length;

const actions: CommandBarAction[] = [
  { key: 'new', label: 'New Item', icon: 'Add', onClick: handleNew, isPrimary: true },
  { key: 'export', label: 'Export', icon: 'ArrowExport', onClick: handleExport },
];

return (
  <WorkspacePageShell
    layout="dashboard"
    title="Risk Register"
    isLoading={isLoading}
    isError={isError}
    isEmpty={isEmpty}
    actions={actions}
  >
    {/* page content */}
  </WorkspacePageShell>
);
```

## Allowed and Prohibited Imports

```ts
// Allowed
import { ... } from '@hbc/ui-kit';
import { ... } from '@hbc/app-shell';
import { ... } from '@hbc/query-hooks';
import { ... } from '@hbc/auth';
import { ... } from '@tanstack/react-router';

// Prohibited in apps/
import { ... } from '@fluentui/react-components';
import { ... } from 'zustand';
import { ... } from '@tanstack/react-query';
```

## Mechanical Guarantees When Following This Playbook

- Shell framing and navigation state are derived by system shell primitives.
- Layout contract is enforced by `WorkspacePageShell` + ESLint rules.
- Page state transitions (loading, empty, error) remain consistent via shell props.
- Form architecture, mobile/field mode, and feedback pathways are enforced by shared components and lint gates.

## Verification Checklist

- `pnpm turbo run build`
- `pnpm turbo run check-types`
- `pnpm turbo run lint`
- `pnpm --filter @hbc/ui-kit build-storybook`
- `pnpm --filter @hbc/ui-kit test-storybook --url http://127.0.0.1:6006`
- `pnpm e2e`
