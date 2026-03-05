# HbcApprovalStepper

Vertical or horizontal approval workflow stepper displaying an approval chain with avatars, decision badges, timestamps, and comments.

## Import

```tsx
import { HbcApprovalStepper } from '@hbc/ui-kit';
import type { HbcApprovalStepperProps, ApprovalStep } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| steps | ApprovalStep[] | required | Array of approval steps in order |
| orientation | 'vertical' \| 'horizontal' | 'vertical' | Layout direction of the stepper |
| className | string | undefined | Additional CSS class |

### ApprovalStep

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique step identifier |
| userName | string | yes | Display name of the approver |
| userRole | string | yes | Role or title of the approver |
| avatarUrl | string | no | Avatar image URL (falls back to initials) |
| decision | 'approved' \| 'rejected' \| 'pending' \| 'skipped' | no | Decision state |
| timestamp | string | no | ISO timestamp of the decision |
| comment | string | no | Optional approver comment |

## Usage

```tsx
<HbcApprovalStepper
  steps={[
    { id: '1', userName: 'Jane Smith', userRole: 'PM', decision: 'approved', timestamp: '2026-03-01T10:00:00Z' },
    { id: '2', userName: 'Bob Lee', userRole: 'Director', decision: 'pending' },
  ]}
  orientation="vertical"
/>
```

## Field Mode Behavior

In Field Mode, decision badge colors adapt via `hbcFieldTheme` tokens. Avatar backgrounds maintain contrast on dark surfaces.

## Accessibility

- Uses `role="list"` with proper `aria-label` attributes
- Decision states conveyed with color and text
- Connector lines between steps provide visual flow

## SPFx Constraints

No SPFx-specific constraints. Renders as pure HTML/CSS with Griffel styles.
