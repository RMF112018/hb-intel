# How-To: Adopt `@hbc/acknowledgment` in a Module

## Step 1 — Register your context type

Open a PR to add your context type to `packages/acknowledgment/src/config/contextTypes.ts`:

```typescript
export const ACK_CONTEXT_TYPES = {
  // ... existing entries ...
  MY_MODULE_THING: 'my-module-thing',  // ← add your entry
} as const;
```

## Step 2 — Define your config

```typescript
import { IAcknowledgmentConfig, ACK_CONTEXT_TYPES } from '@hbc/acknowledgment';
import { IMyRecord } from '../types';

export const myRecordAckConfig: IAcknowledgmentConfig<IMyRecord> = {
  label: 'My Record Sign-Off',
  mode: 'single',                                   // or 'parallel' / 'sequential'
  contextType: ACK_CONTEXT_TYPES.MY_MODULE_THING,
  resolveParties: (record) => [{
    userId: record.assigneeId,
    displayName: record.assigneeName,
    role: 'Assignee',
    required: true,
  }],
  resolvePromptMessage: (record, party) =>
    `By acknowledging, you confirm receipt of ${record.title}.`,
  requireConfirmationPhrase: false,
  allowDecline: true,
  declineReasons: ['Wrong record', 'Not my responsibility', 'Other'],
};
```

## Step 3 — Render in detail view

```typescript
import { HbcAcknowledgmentPanel } from '@hbc/acknowledgment';

<HbcAcknowledgmentPanel
  item={myRecord}
  config={myRecordAckConfig}
  contextId={myRecord.id}
  currentUserId={currentUser.id}
/>
```

## Step 4 — Render badge in list rows

```typescript
import { HbcAcknowledgmentBadge } from '@hbc/acknowledgment';

<HbcAcknowledgmentBadge
  item={myRecord}
  config={myRecordAckConfig}
  contextId={myRecord.id}
/>
```

## Step 5 — Write tests

```typescript
import { createMockAckConfig, createAckWrapper, mockAckStates } from '@hbc/acknowledgment/testing';
import { renderHook } from '@testing-library/react';
import { useAcknowledgmentGate } from '@hbc/acknowledgment';

const config = createMockAckConfig({ mode: 'single', contextType: ACK_CONTEXT_TYPES.MY_MODULE_THING });
const { wrapper } = createAckWrapper();
const { result } = renderHook(
  () => useAcknowledgmentGate(config, mockAckStates.pending, myRecord, 'user-1'),
  { wrapper }
);
expect(result.current.canAcknowledge).toBe(true);
```
