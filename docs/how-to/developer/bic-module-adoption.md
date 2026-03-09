# How To: Add BIC Next Move to a New Module

**Time to implement:** ~2 hours for a direct-assignee module, ~4 hours for workflow-state-derived.

## Tier-1 Mandatory-Use Policy

BIC Next Move is a **Tier-1 Platform Primitive** (per [ADR-0080](../../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md) and the [Platform Primitives Registry](../../reference/platform-primitives.md)). If your feature's domain includes ball-in-court or ownership tracking, you **must** consume `@hbc/bic-next-move`. Reimplementing ownership/BIC logic outside the primitive is prohibited.

---

## Step 1: Add dependency

```json
// In your module's package.json
{
  "dependencies": {
    "@hbc/bic-next-move": "workspace:*"
  }
}
```

## Step 2: Add your key to BIC_MODULE_MANIFEST

In `packages/bic-next-move/src/constants/manifest.ts`, add your key to the array:

```typescript
export const BIC_MODULE_MANIFEST = [
  // ... existing keys ...
  'your-module-key',   // <- Add here
] as const;
```

Submit this as a one-line PR change. The manifest guard will warn if you forget.

## Step 3: Define your BIC config

```typescript
// packages/your-module/src/bic/yourItemBicConfig.ts
import { IBicNextMoveConfig } from '@hbc/bic-next-move';
import { IYourItem } from '../types';

export const yourItemBicConfig: IBicNextMoveConfig<IYourItem> = {
  ownershipModel: 'direct-assignee', // or 'workflow-state-derived'
  resolveCurrentOwner: (item) => item.assignee ? {
    userId: item.assignee.id,
    displayName: item.assignee.name,
    role: item.assignee.role,
  } : null,
  resolveExpectedAction: (item) => item.pendingAction,
  resolveDueDate: (item) => item.dueDate ?? null,
  resolveIsBlocked: (item) => item.isBlocked,
  resolveBlockedReason: (item) => item.blockedReason ?? null,
  resolvePreviousOwner: (item) => null, // implement if available
  resolveNextOwner: (item) => null,     // implement if available
  resolveEscalationOwner: (item) => null, // implement if available
};
```

## Step 4: Register at bootstrap

```typescript
// packages/your-module/src/index.ts
import { registerBicModule } from '@hbc/bic-next-move';
import { yourItemBicConfig, resolveFullBicState } from '@hbc/bic-next-move';

registerBicModule({
  key: 'your-module-key',
  label: 'Your Module Label',
  queryFn: async (userId) => {
    const items = await fetchYourItemsOwnedBy(userId);
    return items.map(item => ({
      itemKey: `your-module-key::${item.id}`,
      moduleKey: 'your-module-key',
      moduleLabel: 'Your Module Label',
      state: resolveFullBicState(item, yourItemBicConfig),
      href: `/your-module/${item.id}`,
      title: item.title,
    }));
  },
});
```

## Step 5: Render in list rows

```tsx
import { HbcBicBadge } from '@hbc/bic-next-move';
// In SPFx: import from '@hbc/ui-kit/app-shell' internally -- HbcBicBadge handles this

<HbcBicBadge item={yourItem} config={yourItemBicConfig} />
```

## Step 6: Render in detail view

```tsx
import { HbcBicDetail } from '@hbc/bic-next-move';

<HbcBicDetail
  item={yourItem}
  config={yourItemBicConfig}
  showChain={true}
  onNavigate={(href) => router.navigate({ to: href })}
/>
```

## Step 7: Write tests

```typescript
import { createMockBicConfig, mockBicStates } from '@hbc/bic-next-move/testing';
// Use the canonical fixtures -- do not reimplement boilerplate
```

See [`docs/reference/bic-next-move/api.md`](../../reference/bic-next-move/api.md) for full API reference.
