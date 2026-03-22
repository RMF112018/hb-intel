# @hbc/field-annotations

Field-level, section-level, and block-level collaborative annotation primitive for HB Intel.
Enables reviewers to attach comments, clarification requests, and revision flags to form fields,
content sections, and data blocks on any record type. Integrates with BIC Next Move, Versioned
Record, and Notification Intelligence via inversion-of-control.

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
| `AnchorType` | Union type | `'field' \| 'section' \| 'block'` — anchor targeting mode |
| `useFieldAnnotations` | Hook | Record-level annotation list + counts |
| `useFieldAnnotation` | Hook | Single-field annotation + replies |
| `useAnnotationActions` | Hook | Create, reply, resolve, withdraw mutations |
| `AnnotationApi` | Object | REST client for all annotation CRUD operations |
| `HbcAnnotationAnchor` | Component | Section/block annotation wrapper — wraps content with positioned indicator |
| `HbcAnnotationMarker` | Component | Complexity-gated field-adjacent marker (Standard: dot; Expert: dot+count badge) |
| `HbcAnnotationThread` | Component | Anchored Popover showing annotation list and inline actions |
| `HbcAnnotationSummary` | Component | Record-level summary panel (PWA only) |
| `ANNOTATION_LIST_TITLE` | Constant | `'HBC_FieldAnnotations'` |
| `ANNOTATION_MAX_REPLIES` | Constant | `50` |
| `intentColorClass` | Constant | CSS color class map per `AnnotationIntent` |
| `intentLabel` | Constant | Display label map per `AnnotationIntent` |
| `resolveAnnotationConfig` | Function | Merges partial config with defaults |
| `resolveAnchorType` | Function | Resolves optional `AnchorType` to concrete value (default: `'field'`) |
| `ANCHOR_PREFIX_SECTION` | Constant | `'section:'` — key prefix convention for section anchors |
| `ANCHOR_PREFIX_BLOCK` | Constant | `'block:'` — key prefix convention for block anchors |

## Section/Block Anchoring

For content regions that are not individual form fields (e.g., summary panels, data tables),
use `HbcAnnotationAnchor` to wrap the target content:

```tsx
import { HbcAnnotationAnchor } from '@hbc/field-annotations';

<HbcAnnotationAnchor
  recordType="project-hub-pmp"
  recordId={project.id}
  anchorKey="section:financial-summary"
  anchorLabel="Financial Summary"
  anchorType="section"
  config={config}
  canAnnotate={canAnnotate}
  canResolve={canResolve}
>
  <FinancialSummaryPanel data={financialData} />
</HbcAnnotationAnchor>
```

Anchor key conventions:
- **Section anchors:** `section:<slug>` (e.g., `section:financial-summary`)
- **Block anchors:** `block:<slug>` (e.g., `block:cash-flow-table`)

## Testing

```typescript
import {
  createMockAnnotation,
  createMockAnnotationReply,
  createMockAnnotationConfig,
  mockAnnotationStates,
} from '@hbc/field-annotations/testing';
```

Eight canonical states: `empty`, `openComment`, `openClarification`, `openRevisionFlag`,
`resolved`, `sectionAnchor`, `blockAnchor`, `mixed`.

## Architecture Boundaries

This package does **not** import `@hbc/bic-next-move` (except the `IBicOwner` type),
`@hbc/versioned-record`, or `@hbc/notification-intelligence`. All integrations are
implemented as inversion-of-control patterns in the consuming module.

## Related

- ADR: `docs/architecture/adr/ADR-0096-field-annotations-platform-primitive.md`
- Adoption guide: `docs/how-to/developer/field-annotations-adoption.md`
- API reference: `docs/reference/field-annotations/api.md`
- Plan family: `docs/architecture/plans/shared-features/SF07-Field-Annotations.md`
