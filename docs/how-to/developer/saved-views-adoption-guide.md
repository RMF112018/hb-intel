# Saved Views Adoption Guide

> **Doc Classification:** Living Reference (Diataxis) — How-to quadrant; developer audience.

## 1. Register Module

```typescript
import { SavedViewModuleRegistry } from '@hbc/saved-views';
SavedViewModuleRegistry.register([myRegistration]);
```

## 2. Use TanStack Table Mapper

```typescript
import { createTanStackTableMapper } from '@hbc/saved-views';
const mapper = createTanStackTableMapper('my-module', 'default', mySchema);
```

## 3. Use Hooks

```typescript
import { useSavedViews, useViewCompatibility, useWorkspaceStateMapper } from '@hbc/saved-views';
```

## 4. Wire Composition Shells

```tsx
import { SavedViewPickerShell, SavedViewChipShell } from '@hbc/saved-views';
```

## Related

- [ADR-0121](../../architecture/adr/ADR-0121-saved-views.md)
- [API Reference](../../reference/saved-views/api.md)
