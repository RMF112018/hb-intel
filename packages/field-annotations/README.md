# @hbc/field-annotations

Field-level collaborative annotation primitive for HB Intel. Enables reviewers to attach
comments, clarification requests, and revision flags to individual form fields on any record
type. Integrates with BIC Next Move, Versioned Record, and Notification Intelligence via
inversion-of-control.

## Installation

```bash
pnpm add @hbc/field-annotations
```

## Quick Start

```tsx
import { HbcAnnotationMarker, HbcAnnotationSummary } from '@hbc/field-annotations';
import type { IFieldAnnotationConfig } from '@hbc/field-annotations';

const config: IFieldAnnotationConfig = {
  recordType: 'bd-scorecard',
  blocksBicOnOpenAnnotations: true,
  allowAssignment: true,
  requireResolutionNote: true,
  visibleToViewers: true,
  versionAware: false,
};

// In a form — adjacent to each annotatable field:
<HbcAnnotationMarker
  recordType="bd-scorecard"
  recordId={record.id}
  fieldKey="projectSquareFootage"
  fieldLabel="Project Square Footage"
  config={config}
  canAnnotate={canAnnotate}
  canResolve={canResolve}
/>

// In the record detail sidebar (PWA only):
<HbcAnnotationSummary
  recordType="bd-scorecard"
  recordId={record.id}
  config={config}
  onFieldFocus={(fieldKey) => scrollToField(fieldKey)}
/>
```

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `IFieldAnnotation` | Interface | Core annotation record |
| `IFieldAnnotationConfig` | Interface | Per-record-type configuration |
| `IAnnotationCounts` | Interface | Aggregated open/resolved counts (used for BIC blocking) |
| `AnnotationIntent` | Union type | `'comment' \| 'clarification-request' \| 'flag-for-revision'` |
| `AnnotationStatus` | Union type | `'open' \| 'resolved' \| 'withdrawn'` |
| `useFieldAnnotations` | Hook | Record-level annotation list + counts |
| `useFieldAnnotation` | Hook | Single-field annotation + replies |
| `useAnnotationActions` | Hook | Create, reply, resolve, withdraw mutations |
| `AnnotationApi` | Object | REST client for all annotation CRUD operations |
| `HbcAnnotationMarker` | Component | Complexity-gated field-adjacent marker (Standard: dot; Expert: dot+count badge) |
| `HbcAnnotationThread` | Component | Anchored Popover showing annotation list and inline actions |
| `HbcAnnotationSummary` | Component | Record-level summary panel (PWA only) |
| `ANNOTATION_LIST_TITLE` | Constant | `'HBC_FieldAnnotations'` |
| `ANNOTATION_MAX_REPLIES` | Constant | `50` |
| `intentColorClass` | Constant | CSS color class map per `AnnotationIntent` |
| `intentLabel` | Constant | Display label map per `AnnotationIntent` |
| `resolveAnnotationConfig` | Function | Merges partial config with defaults |

## Testing

```typescript
import {
  createMockAnnotation,
  createMockAnnotationReply,
  createMockAnnotationConfig,
  mockAnnotationStates,
} from '@hbc/field-annotations/testing';
```

Six canonical states: `empty`, `openComment`, `openClarification`, `openRevisionFlag`,
`resolved`, `mixed`.

## Architecture Boundaries

This package does **not** import `@hbc/bic-next-move` (except the `IBicOwner` type),
`@hbc/versioned-record`, or `@hbc/notification-intelligence`. All integrations are
implemented as inversion-of-control patterns in the consuming module.

## Related

- ADR: `docs/architecture/adr/ADR-0096-field-annotations-platform-primitive.md`
- Adoption guide: `docs/how-to/developer/field-annotations-adoption.md`
- API reference: `docs/reference/field-annotations/api.md`
- Plan family: `docs/architecture/plans/shared-features/SF07-Field-Annotations.md`
