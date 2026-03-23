# Record Form Adoption Guide

> **Doc Classification:** Living Reference (Diataxis) — How-to quadrant; developer audience; record-form module adoption.

## 1. Register Your Module

```typescript
import { RecordFormModuleRegistry } from '@hbc/record-form';
RecordFormModuleRegistry.register([myModuleRegistration]);
```

## 2. Implement IRecordFormSchemaProvider

```typescript
import type { IRecordFormSchemaProvider } from '@hbc/record-form';
export const mySchemaProvider: IRecordFormSchemaProvider = {
  moduleKey: 'my-module',
  getFieldDefinitions: (recordType, mode) => [...],
  getValidationRules: (recordType) => [...],
};
```

## 3. Use Hooks

```typescript
import { useRecordFormState, useRecordDraftPersistence, useRecordSubmission } from '@hbc/record-form';
```

## 4. Wire Composition Shells

```tsx
import { RecordFormShell, RecordSubmitBarShell } from '@hbc/record-form';
```

## 5. Testing

```typescript
import { createMockRecordFormState, mockRecordFormScenarios } from '@hbc/record-form/testing';
```

## Related

- [ADR-0120](../../architecture/adr/ADR-0120-record-form.md)
- [API Reference](../../reference/record-form/api.md)
- [SF23 Master Plan](../../architecture/plans/shared-features/SF23-Record-Form.md)
