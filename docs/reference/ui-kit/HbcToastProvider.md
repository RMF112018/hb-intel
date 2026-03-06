# HbcToastProvider

Context provider that owns toast queue state and category-based timing rules.

## Import

```tsx
import { HbcToastProvider } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `ReactNode` | Yes | Descendant tree receiving toast context. |
| `maxVisible` | `number` | No | Maximum simultaneous visible toasts (`3` default). |

## Usage

```tsx
<HbcToastProvider maxVisible={4}>
  <AppContent />
</HbcToastProvider>
```

## Accessibility

- Works with `HbcToastContainer` live-region semantics (`alert`/`status` roles).

## Field Mode / Theme

Toast visuals are theme-token driven through the active provider tree.

## Entry Points

Exported from the full entry point: `@hbc/ui-kit`.
Use only at shell/root composition boundaries; page components should use `useToast`.
See [HbcToast.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/HbcToast.md) and [entry-points.md](/Users/bobbyfetting/hb-intel/docs/reference/ui-kit/entry-points.md).

