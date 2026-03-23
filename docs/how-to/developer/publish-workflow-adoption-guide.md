# Publish Workflow Adoption Guide

> **Doc Classification:** Living Reference (Diataxis) — How-to quadrant; developer audience.

## 1. Register Module
```typescript
import { PublishModuleRegistry } from '@hbc/publish-workflow';
PublishModuleRegistry.register([myRegistration]);
```

## 2. Create Publish Request
```typescript
import { createModulePublishRequest } from '@hbc/publish-workflow';
const request = createModulePublishRequest('my-module', recordId, userId);
```

## 3. Use Hooks
```typescript
import { usePublishWorkflowState, usePublishReadinessState, usePublishQueue } from '@hbc/publish-workflow';
```

## 4. Wire Shells
```tsx
import { PublishPanelShell } from '@hbc/publish-workflow';
```

## Related
- [ADR-0122](../../architecture/adr/ADR-0122-publish-workflow.md)
- [API Reference](../../reference/publish-workflow/api.md)
