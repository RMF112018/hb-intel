# Export Runtime Adoption Guide

> **Doc Classification:** Living Reference (Diataxis) — How-to quadrant; developer audience; export-runtime module adoption.

This guide explains how to integrate `@hbc/export-runtime` into a feature module to provide export capabilities (CSV, XLSX, PDF, Print).

## Prerequisites

- `@hbc/export-runtime` added as a workspace dependency
- `@hbc/ui-kit` available for visual components
- React 18+ with hooks support

## 1. Register Your Module

At app initialization, register your module with the `ExportModuleRegistry`:

```typescript
import { ExportModuleRegistry } from '@hbc/export-runtime';
import { myModuleRegistration } from './export-runtime/adapters';

ExportModuleRegistry.register([myModuleRegistration]);
```

## 2. Implement IExportModuleTruthProvider

Your truth provider supplies source truth stamps and payloads for exports:

```typescript
import type { IExportModuleTruthProvider, ExportPayload, IExportSourceTruthStamp } from '@hbc/export-runtime';

export const myTruthProvider: IExportModuleTruthProvider = {
  moduleKey: 'my-module',

  getSourceTruthStamp(recordId, projectId): IExportSourceTruthStamp {
    return {
      moduleKey: 'my-module',
      projectId,
      recordId,
      snapshotTimestampIso: new Date().toISOString(),
      snapshotType: 'current-view',
      appliedFilters: getCurrentFilters(),
      appliedSort: getCurrentSort(),
      visibleColumns: getVisibleColumns(),
    };
  },

  buildPayload(recordId, projectId, intent): ExportPayload {
    return {
      kind: 'table',
      columns: getColumnDefinitions(),
      rowCount: getRowCount(),
      selectedRowIds: getSelectedRowIds(),
      filterSummary: getFilterSummary(),
      sortSummary: getSortSummary(),
    };
  },
};
```

## 3. Create Module Registration

```typescript
import type { IExportModuleRegistration } from '@hbc/export-runtime';

export const myModuleRegistration: IExportModuleRegistration = {
  moduleKey: 'my-module',
  displayName: 'My Module',
  supportedFormats: ['csv', 'xlsx', 'pdf'],
  supportedIntents: ['working-data', 'current-view', 'presentation'],
  complexityTier: 'standard',
  truthProvider: myTruthProvider,
};
```

## 4. Use Hooks

### Runtime State

```typescript
import { useExportRuntimeState } from '@hbc/export-runtime';

const { requests, isLoading, suppressedFormats, topRecommended, queueCount, refetch } =
  useExportRuntimeState({ adapter, moduleKey: 'my-module', projectId });
```

### Composition State (Expert Tier)

```typescript
import { useExportCompositionState } from '@hbc/export-runtime';

const { sections, toggleSection, reorderSection, isValid, resetComposition } =
  useExportCompositionState({ initialSections });
```

### Offline Queue

```typescript
import { useExportQueue } from '@hbc/export-runtime';

const { pendingRequests, pendingCount, replayRequest, restoreReceipt } =
  useExportQueue({ adapter });
```

## 5. Wire Composition Shells

```tsx
import { ExportActionMenuShell, ExportFormatPickerShell } from '@hbc/export-runtime';

<ExportActionMenuShell
  adapter={adapter}
  moduleKey="my-module"
  projectId={projectId}
  complexityTier="standard"
  onExportSelected={handleExportSelected}
/>
```

## 6. Create Export Requests

```typescript
import { createModuleExportRequest } from '@hbc/export-runtime';

const request = createModuleExportRequest(
  'my-module', recordId, projectId, 'csv', 'working-data'
);
```

## 7. Testing

```typescript
import { createMockExportRequest, mockExportScenarios } from '@hbc/export-runtime/testing';

const request = createMockExportRequest({ format: 'xlsx', intent: 'current-view' });
const scenario = mockExportScenarios.tableExportLifecycle;
```

## Related

- [ADR-0119 — Export Runtime Architecture](../../architecture/adr/ADR-0119-export-runtime.md)
- [API Reference](../../reference/export-runtime/api.md)
- [SF24 Master Plan](../../architecture/plans/shared-features/SF24-Export-Runtime.md)
