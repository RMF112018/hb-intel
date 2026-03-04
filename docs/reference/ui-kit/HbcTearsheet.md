# HbcTearsheet

Multi-step wizard tearsheet for guided workflows. Provides step-by-step navigation through complex user tasks.

## Import

```tsx
import { HbcTearsheet } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | false | Controls tearsheet visibility |
| onDismiss | () => void | required | Callback fired when user dismisses tearsheet |
| steps | TearsheetStep[] | required | Array of step objects with label, content |
| currentStep | number | 0 | Currently active step index |
| onStepChange | (stepIndex: number) => void | required | Callback when user navigates to new step |
| title | string | required | Tearsheet title/heading |

## Usage

```tsx
const [currentStep, setCurrentStep] = useState(0);
const [open, setOpen] = useState(false);

const steps = [
  { label: 'Basic Info', content: <BasicInfoForm /> },
  { label: 'Details', content: <DetailsForm /> },
  { label: 'Review', content: <ReviewStep /> },
];

<HbcTearsheet
  open={open}
  onDismiss={() => setOpen(false)}
  steps={steps}
  currentStep={currentStep}
  onStepChange={setCurrentStep}
  title="New Project Wizard"
/>
```

## Field Mode Behavior

In Field Mode (dark theme), the tearsheet surface uses a high-contrast dark background with light text and borders. Step indicators and content areas adapt to maintain readability in low-light environments. Interactive elements (buttons, inputs) inherit Field Mode styling.

## Accessibility

- `role="dialog"` applied to modal container
- `aria-modal="true"` for assistive technology
- Step indicator displays `aria-current="step"` for active step
- Keyboard navigation: Tab moves through content, Escape dismisses
- Next/Previous buttons have clear ARIA labels
- Focus trap maintained within tearsheet

## SPFx Constraints

No SPFx-specific constraints.
