# How To: Add Field-Level Annotations to a New Module

**Time to implement:** ~3 hours for a standard record type.
**Prerequisite:** `HBC_FieldAnnotations` SharePoint list must be provisioned for the site.

## Step 1: Add dependency

```json
{
  "dependencies": {
    "@hbc/field-annotations": "workspace:*"
  }
}
```

## Step 2: Define annotation config for your record type

```typescript
// packages/your-module/src/annotations/yourRecordAnnotationConfig.ts
import type { IFieldAnnotationConfig } from '@hbc/field-annotations';

export const yourRecordAnnotationConfig: IFieldAnnotationConfig = {
  recordType: 'your-record-type',         // Stable slug — must be globally unique
  blocksBicOnOpenAnnotations: true,        // Set false for comment-only modules
  allowAssignment: true,                  // Set false if role is always implicit
  requireResolutionNote: true,            // Recommended: true for audit trail
  visibleToViewers: true,
  versionAware: false,                    // Set true if module uses @hbc/versioned-record
};
```

## Step 3: Add HbcAnnotationMarker to form fields

```tsx
import { HbcAnnotationMarker } from '@hbc/field-annotations';

// Wrap annotatable form fields in a flex container
<div className="field-with-annotation">
  <TextInput id="fieldName" name="fieldName" {...fieldProps} />
  <HbcAnnotationMarker
    recordType="your-record-type"
    recordId={record.id}
    fieldKey="fieldName"           // Must be stable — not the display label
    fieldLabel="Field Display Name"
    config={yourRecordAnnotationConfig}
    canAnnotate={currentUser.canAnnotate}
    canResolve={currentUser.canResolve}
  />
</div>
```

## Step 4: Add HbcAnnotationSummary to the record detail sidebar (PWA only)

```tsx
import { HbcAnnotationSummary } from '@hbc/field-annotations';

// In the record detail sidebar (not in SPFx webparts)
<HbcAnnotationSummary
  recordType="your-record-type"
  recordId={record.id}
  config={yourRecordAnnotationConfig}
  onFieldFocus={(fieldKey) => {
    document.getElementById(fieldKey)?.scrollIntoView({ behavior: 'smooth' });
  }}
/>
```

## Step 5: Wire BIC blocking (if blocksBicOnOpenAnnotations is true)

```typescript
// In your module's BIC config
import { useFieldAnnotations } from '@hbc/field-annotations';

// In the record detail component, surface annotation counts to the BIC config:
const { counts } = useFieldAnnotations('your-record-type', record.id);
const isAnnotationBlocked =
  counts.openClarificationRequests > 0 || counts.openRevisionFlags > 0;
```

See `docs/reference/field-annotations/api.md` for the full `IAnnotationCounts` interface.

## Step 6: Write tests

```typescript
import {
  createMockAnnotation,
  createMockAnnotationConfig,
  mockAnnotationStates,
} from '@hbc/field-annotations/testing';
```

See `docs/reference/field-annotations/api.md` for all testing utilities.
