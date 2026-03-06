# HbcToastContainer

Rendered toast stack UI bound to `HbcToastProvider` context.

## Import

```tsx
import { HbcToastContainer } from '@hbc/ui-kit';
```

## Props

`HbcToastContainer` does not require consumer props; it renders active toasts from context.

## Usage

```tsx
<HbcToastProvider>
  <AppContent />
  <HbcToastContainer />
</HbcToastProvider>
```

## Accessibility

- Uses live regions and category roles (`status`/`alert`) for announcements.
- Includes explicit dismiss affordances for persistent/error toasts.

## Field Mode / Theme

Container and toast cards use active light/field theme token surfaces and text colors.

## Entry Points

Exported from the full entry point: `@hbc/ui-kit`.
Mount once in shell/root layout; page components should call `useToast` only.
See [HbcToast.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcToast.md) and [entry-points.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/entry-points.md).

