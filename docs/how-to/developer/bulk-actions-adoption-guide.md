# Bulk Actions Adoption Guide

> **Doc Classification:** Living Reference (Diataxis) — How-to quadrant; developer audience.

## 1. Register Module
```typescript
import { BulkActionModuleRegistry } from '@hbc/bulk-actions';
BulkActionModuleRegistry.register([{ moduleKey: 'my-module', displayName: 'My Module', actions: [...] }]);
```

## 2. Use Hooks
```typescript
import { useBulkSelection, useBulkActionExecution } from '@hbc/bulk-actions';
```

## 3. Wire Shells
```tsx
import { BulkSelectionBarShell, BulkActionMenuShell } from '@hbc/bulk-actions';
```

## Related
- [ADR-0123](../../architecture/adr/ADR-0123-bulk-actions.md)
- [API Reference](../../reference/bulk-actions/api.md)
