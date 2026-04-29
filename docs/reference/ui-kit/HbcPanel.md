# HbcPanel

> **Governance Status:** Layer 3 component reference
> **Purpose:** API/usage guidance for HbcPanel.
> **Authority Boundary:** This document does not override Layer 1 runtime doctrine, runtime overlays, acceptance/scoring model, active supporting SPFx standards, or active supporting SPFx patterns.
> **Routing Note:** Consuming surfaces must follow runtime doctrine first.


Side panel overlay for detailed views, editing, and secondary workflows.

## Import

```tsx
import { HbcPanel } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | required | Controls panel visibility |
| onDismiss | () => void | required | Callback when panel should close |
| size | 'small' \| 'medium' \| 'large' \| 'full' | 'medium' | Panel width |
| title | string | required | Panel header title |
| children | ReactNode | required | Panel content |

## Usage

```tsx
const [panelOpen, setPanelOpen] = useState(false);

<HbcPanel
  open={panelOpen}
  onDismiss={() => setPanelOpen(false)}
  size="large"
  title="Edit Item"
>
  <HbcForm onSubmit={handleSave}>
    {/* form fields */}
  </HbcForm>
</HbcPanel>

<HbcButton onClick={() => setPanelOpen(true)}>
  Open Panel
</HbcButton>
```

## Field Mode Behavior

Panel overlay adapts to Field Mode with darker background color. The semi-transparent backdrop uses hbcFieldTheme opacity values. Panel surface elevation shadows appear darker and more prominent on dark themes.

## Accessibility

- Implements `role="dialog"` with `aria-modal="true"`
- `aria-label` or title identifies the panel purpose
- Focus trap keeps focus within panel while open
- Escape key closes panel (ESC listener)
- Dismiss button provided in header with aria-label

## SPFx Constraints

No SPFx-specific constraints.
