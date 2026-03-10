# How-To: Adopt `@hbc/step-wizard` in a Module

## Prerequisites

- `@hbc/bic-next-move` SF02 amendment merged (step-wizard:* wildcard)
- `@hbc/session-state` available in your app shell
- `@hbc/complexity` `ComplexityProvider` wrapping your module

## Installation

```bash
pnpm --filter @your-module add @hbc/step-wizard
```

## Minimal Integration — Sequential Wizard

```typescript
import { HbcStepWizard } from '@hbc/step-wizard';
import type { IStepWizardConfig } from '@hbc/step-wizard';

const wizardConfig: IStepWizardConfig<MyRecord> = {
  draftKey: (item) => `my-module:${item.id}`,
  orderMode: 'sequential',
  steps: [
    {
      id: 'details',
      label: 'Project Details',
      required: true,
      validate: (item) => !item.projectName ? 'Project name is required' : null,
      renderStep: ({ item, onFieldChange }) => <DetailsStep item={item} onChange={onFieldChange} />,
    },
    {
      id: 'team',
      label: 'Team Assignment',
      required: true,
      resolveAssignee: (item) => item.projectManager,
      validate: (item) => !item.projectManager ? 'Project Manager required' : null,
      renderStep: ({ item }) => <TeamStep item={item} />,
    },
    {
      id: 'confirm',
      label: 'Confirm & Submit',
      required: true,
      renderStep: ({ item }) => <ConfirmStep item={item} />,
    },
  ],
  onAllComplete: (item) => {
    // UI-only effects: route away, show banner, etc.
    // Heavy side-effects (emails, BIC transfers) belong server-side.
    navigate(`/records/${item.id}/complete`);
  },
};

function MyModuleWizard({ item }: { item: MyRecord }) {
  return <HbcStepWizard config={wizardConfig} item={item} />;
}
```

## Adding Overdue Detection

```typescript
{
  id: 'sign-off',
  label: 'Final Sign-Off',
  required: true,
  dueDate: (item) => item.signOffDeadline ?? null,
  resolveAssignee: (item) => item.superintendent,
  renderStep: ({ item }) => <SignOffStep item={item} />,
}
```

When `signOffDeadline` is past and the step is incomplete, `@hbc/notification-intelligence`
receives an `'immediate'`-tier overdue event automatically.

## Embedding an Acknowledgment Step

```typescript
import { HbcAcknowledgmentPanel } from '@hbc/acknowledgment';

{
  id: 'ack-turnover',
  label: 'Turnover Sign-Off',
  required: true,
  resolveAssignee: (item) => item.projectManager,
  validate: (item) =>
    !item.turnoverAckComplete ? 'All parties must acknowledge before continuing' : null,
  renderStep: ({ item }) => (
    <HbcAcknowledgmentPanel
      config={turnoverAckConfig}
      item={item}
      onAllAcknowledged={() => { /* update item.turnoverAckComplete */ }}
    />
  ),
}
```

## Compact Progress Indicator

Place anywhere that has access to `config` and `item` — no extra wiring needed:

```typescript
import { HbcStepProgress } from '@hbc/step-wizard';

<HbcStepProgress config={wizardConfig} item={item} variant="bar" />
<HbcStepProgress config={wizardConfig} item={item} variant="ring" />
<HbcStepProgress config={wizardConfig} item={item} variant="fraction" />
```

## Allowing Step Reopen

```typescript
const wizardConfig: IStepWizardConfig<MyRecord> = {
  // ...
  allowReopen: true,  // Enables reopenStep() on completed steps
};
```

## Testing Utilities

```typescript
import {
  createMockWizardConfig,
  mockWizardStates,
  mockUseStepWizard,
  createWizardWrapper,
} from '@hbc/step-wizard/testing';

// In your component test:
const wrapper = createWizardWrapper(mockWizardStates.inProgress.state);
const { result } = renderHook(
  () => useStepWizard(createMockWizardConfig(), myItem),
  { wrapper }
);
```

## Order Mode Reference

| Mode | Use When |
|---|---|
| `sequential` | Hard sequence required; no backtracking (e.g., approval chains) |
| `parallel` | Steps completable in any order (e.g., pre-bid checklists) |
| `sequential-with-jumps` | Ordered first pass + free revision (e.g., turnover prep) |
