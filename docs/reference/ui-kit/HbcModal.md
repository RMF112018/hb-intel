# HbcModal

Modal dialog component for critical user interactions and confirmations.

## Import

```tsx
import { HbcModal } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | required | Controls modal visibility |
| onDismiss | () => void | required | Callback when modal should close |
| size | 'small' \| 'medium' \| 'large' \| 'fullscreen' | 'medium' | Modal dimensions |
| title | string | required | Modal header title |
| children | ReactNode | required | Modal body content |
| footer | ReactNode | undefined | Modal footer with actions |

## Usage

```tsx
const [modalOpen, setModalOpen] = useState(false);

<HbcModal
  open={modalOpen}
  onDismiss={() => setModalOpen(false)}
  size="medium"
  title="Confirm Action"
  footer={
    <div className="flex gap-2">
      <HbcButton variant="outline" onClick={() => setModalOpen(false)}>
        Cancel
      </HbcButton>
      <HbcButton variant="danger" onClick={handleConfirm}>
        Delete
      </HbcButton>
    </div>
  }
>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
</HbcModal>

<HbcButton onClick={() => setModalOpen(true)}>
  Open Modal
</HbcButton>
```

## Field Mode Behavior

Modal surface background adapts to Field Mode with darker color. Title and content text increase in brightness for readability. Footer and button styling use hbcFieldTheme tokens. The backdrop semi-transparent overlay uses appropriate opacity for dark theme.

## Accessibility

- Implements `role="dialog"` with `aria-modal="true"`
- `aria-labelledby` references the title element
- Focus trap prevents focus outside modal while open
- Escape key closes modal
- Dismiss button provided in header with `aria-label`
- All interactive elements (buttons) are keyboard accessible
- Screen readers announce modal presence and title

## SPFx Constraints

No SPFx-specific constraints.
