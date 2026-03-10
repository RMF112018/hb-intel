# `@hbc/field-annotations` API Reference

**Package:** `@hbc/field-annotations`
**Version:** 0.1.0
**Tier:** Tier-1 Platform Primitive
**ADR:** [ADR-0096](../../architecture/adr/ADR-0096-field-annotations-platform-primitive.md)
**Audience:** Developers, Feature Authors

---

## Types

### `AnnotationIntent`

```typescript
type AnnotationIntent = 'comment' | 'clarification-request' | 'flag-for-revision';
```

- `'comment'` — Informational note; does not block BIC.
- `'clarification-request'` — Reviewer needs an answer before advancing; blocks BIC when `config.blocksBicOnOpenAnnotations` is true.
- `'flag-for-revision'` — Specific change is required; blocks BIC when `config.blocksBicOnOpenAnnotations` is true.

### `AnnotationStatus`

```typescript
type AnnotationStatus = 'open' | 'resolved' | 'withdrawn';
```

### `IBicOwner`

Re-exported from `@hbc/bic-next-move`. Used for annotation author and assignee identity.

```typescript
interface IBicOwner {
  userId: string;
  displayName: string;
  role: string;
  groupContext?: string;
}
```

### `IAnnotationReply`

```typescript
interface IAnnotationReply {
  replyId: string;
  author: IBicOwner;
  body: string;
  createdAt: string;  // ISO 8601
}
```

### `IFieldAnnotation`

Core annotation record. Scoped to `(recordType, recordId, fieldKey)` per D-02.

```typescript
interface IFieldAnnotation {
  annotationId: string;
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  intent: AnnotationIntent;
  status: AnnotationStatus;
  author: IBicOwner;
  assignedTo: IBicOwner | null;
  body: string;
  createdAt: string;              // ISO 8601
  createdAtVersion: number | null; // D-04: version at creation
  resolvedAt: string | null;
  resolvedBy: IBicOwner | null;
  resolutionNote: string | null;
  resolvedAtVersion: number | null; // D-04: version at resolution
  replies: IAnnotationReply[];      // D-07: flat, max 50
}
```

### `IFieldAnnotationConfig`

Per-record-type configuration. One instance per record type.

```typescript
interface IFieldAnnotationConfig {
  recordType: string;
  blocksBicOnOpenAnnotations?: boolean;  // Default: true (D-03)
  allowAssignment?: boolean;             // Default: false (D-08)
  requireResolutionNote?: boolean;       // Default: true
  visibleToViewers?: boolean;            // Default: true
  versionAware?: boolean;               // Default: false (D-04)
}
```

### `IAnnotationCounts`

Aggregated counts for BIC blocking resolvers and summary display (D-03).

```typescript
interface IAnnotationCounts {
  totalOpen: number;
  openClarificationRequests: number;
  openRevisionFlags: number;
  openComments: number;
  totalResolved: number;
}
```

### Mutation Input Types

```typescript
interface ICreateAnnotationInput {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  intent: AnnotationIntent;
  body: string;
  assignedTo?: IBicOwner | null;        // D-08
  createdAtVersion?: number | null;      // D-04
}

interface IAddReplyInput {
  annotationId: string;
  body: string;
}

interface IResolveAnnotationInput {
  annotationId: string;
  resolutionNote?: string | null;
  resolvedAtVersion?: number | null;     // D-04
}

interface IWithdrawAnnotationInput {
  annotationId: string;
}
```

### Hook Return Types

```typescript
interface IUseFieldAnnotationsResult {
  annotations: IFieldAnnotation[];
  counts: IAnnotationCounts;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

interface IUseFieldAnnotationResult {
  annotations: IFieldAnnotation[];
  openCount: number;
  isLoading: boolean;
  isError: boolean;
}

interface IUseAnnotationActionsResult {
  createAnnotation: (input: ICreateAnnotationInput) => Promise<IFieldAnnotation>;
  addReply: (input: IAddReplyInput) => Promise<IAnnotationReply>;
  resolveAnnotation: (input: IResolveAnnotationInput) => Promise<IFieldAnnotation>;
  withdrawAnnotation: (input: IWithdrawAnnotationInput) => Promise<IFieldAnnotation>;
  isCreating: boolean;
  isReplying: boolean;
  isResolving: boolean;
  isWithdrawing: boolean;
}
```

---

## Hooks

### `useFieldAnnotations(recordType, recordId)`

Loads all annotations for a record with aggregated counts.

```typescript
function useFieldAnnotations(
  recordType: string,
  recordId: string
): IUseFieldAnnotationsResult;
```

**Behavior:**
- Fetches via `AnnotationApi.list(recordType, recordId)`.
- Stale time: 60 seconds (`ANNOTATION_STALE_TIME_RECORD_MS`).
- Computes `IAnnotationCounts` from the returned annotation list.
- Refetches on window focus.

### `useFieldAnnotation(recordType, recordId, fieldKey)`

Loads annotations for a specific field on a record.

```typescript
function useFieldAnnotation(
  recordType: string,
  recordId: string,
  fieldKey: string
): IUseFieldAnnotationResult;
```

**Behavior:**
- Fetches via `AnnotationApi.get(recordType, recordId, fieldKey)`.
- Stale time: 30 seconds (`ANNOTATION_STALE_TIME_FIELD_MS`).
- Primary consumer: `HbcAnnotationMarker`.
- `HbcAnnotationThread` reuses this hook's data via TanStack Query cache — no duplicate network requests.

### `useAnnotationActions(recordType, recordId)`

Provides create, reply, resolve, and withdraw mutations.

```typescript
function useAnnotationActions(
  recordType: string,
  recordId: string
): IUseAnnotationActionsResult;
```

**Behavior:**
- Each mutation invalidates the `fieldAnnotationsQueryKey` on success, triggering a refetch of both `useFieldAnnotations` and `useFieldAnnotation` consumers.
- Optimistic updates applied for reply and resolve mutations.

---

## Components

### Complexity Tier Rendering Matrix (D-05)

| Component | Essential | Standard | Expert |
|-----------|-----------|----------|--------|
| `HbcAnnotationMarker` | Hidden (zero DOM footprint) | Colored dot + hover tooltip | Colored dot + hover tooltip + open count badge |
| `HbcAnnotationThread` | Not rendered (marker hidden) | Popover on dot click — full thread + "Add annotation" CTA | Popover on dot click — full thread + inline reply + full resolve form |
| `HbcAnnotationSummary` | Hidden — not mounted | Collapsed summary header with open count only | Expanded panel with per-field breakdown, intent badges, assignee display |

### `HbcAnnotationMarker`

Field-adjacent indicator dot. Complexity-gated per D-05.

```tsx
<HbcAnnotationMarker
  recordType="bd-scorecard"
  recordId={record.id}
  fieldKey="projectSquareFootage"
  fieldLabel="Project Square Footage"
  config={annotationConfig}
  canAnnotate={canAnnotate}
  canResolve={canResolve}
  forceVariant="standard"  // Optional: override global complexity
/>
```

**Props:**
- `recordType` — Record type slug.
- `recordId` — Unique record identifier.
- `fieldKey` — Stable field key (not display label).
- `fieldLabel` — Human-readable label for display in thread header.
- `config` — `IFieldAnnotationConfig` for this record type.
- `canAnnotate` — Whether the current user can create annotations on this field.
- `canResolve` — Whether the current user can resolve annotations on this field.
- `forceVariant?` — Override global complexity tier (`'essential' | 'standard' | 'expert'`).

**Behavior:**
- Internally composes `useFieldAnnotation` to load field-specific annotations.
- Opens `HbcAnnotationThread` on click.
- Dot color determined by highest-priority open annotation intent (see Intent Color Map below).
- Zero DOM footprint in Essential mode (D-05).

### `HbcAnnotationThread`

Anchored Popover showing the annotation thread for a field (D-06, D-07).

**Behavior:**
- Uses `@hbc/ui-kit/app-shell` Popover primitive for SPFx bundle compliance (D-06).
- Renders full thread with reply form, resolve action, and withdraw action.
- Standard mode: full thread + "Add annotation" CTA.
- Expert mode: full thread + inline reply form + full resolve form with required note.
- Flat one-level replies, max 50 per annotation (D-07).

### `HbcAnnotationSummary`

Record-level summary panel (PWA only — D-06).

```tsx
<HbcAnnotationSummary
  recordType="bd-scorecard"
  recordId={record.id}
  config={annotationConfig}
  onFieldFocus={(fieldKey) => scrollToField(fieldKey)}
/>
```

**Props:**
- `recordType` — Record type slug.
- `recordId` — Unique record identifier.
- `config` — `IFieldAnnotationConfig` for this record type.
- `onFieldFocus` — Callback when user clicks a field link in the summary; use for scroll-to-field.

**Behavior:**
- Standard mode: collapsed summary header with open count only.
- Expert mode: expanded panel with per-field breakdown, intent badges, assignee display.
- Not rendered in SPFx contexts (D-06).

---

## API Layer

### `AnnotationApi`

REST client wrapping Azure Functions endpoints (D-01).

```typescript
const AnnotationApi = {
  list(recordType: string, recordId: string): Promise<IFieldAnnotation[]>;
  get(recordType: string, recordId: string, fieldKey: string): Promise<IFieldAnnotation[]>;
  create(input: ICreateAnnotationInput): Promise<IFieldAnnotation>;
  addReply(input: IAddReplyInput): Promise<IAnnotationReply>;
  resolve(input: IResolveAnnotationInput): Promise<IFieldAnnotation>;
  withdraw(input: IWithdrawAnnotationInput): Promise<IFieldAnnotation>;
};
```

All calls route through `ANNOTATION_API_BASE` (`/api/field-annotations`). Internal mapping from `IRawAnnotationListItem` (SharePoint list shape) to `IFieldAnnotation` is handled transparently.

---

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `ANNOTATION_LIST_TITLE` | `'HBC_FieldAnnotations'` | SharePoint list title (D-01) |
| `ANNOTATION_API_BASE` | `'/api/field-annotations'` | Azure Functions base path (D-01) |
| `ANNOTATION_MAX_REPLIES` | `50` | Server-enforced reply cap (D-07) |
| `ANNOTATION_STALE_TIME_RECORD_MS` | `60_000` | TanStack Query stale time for `useFieldAnnotations` |
| `ANNOTATION_STALE_TIME_FIELD_MS` | `30_000` | TanStack Query stale time for `useFieldAnnotation` |
| `ANNOTATION_DEFAULT_BLOCKS_BIC` | `true` | Default for `IFieldAnnotationConfig.blocksBicOnOpenAnnotations` |
| `ANNOTATION_DEFAULT_ALLOW_ASSIGNMENT` | `false` | Default for `IFieldAnnotationConfig.allowAssignment` |
| `ANNOTATION_DEFAULT_REQUIRE_RESOLUTION_NOTE` | `true` | Default for `IFieldAnnotationConfig.requireResolutionNote` |
| `ANNOTATION_DEFAULT_VISIBLE_TO_VIEWERS` | `true` | Default for `IFieldAnnotationConfig.visibleToViewers` |
| `ANNOTATION_DEFAULT_VERSION_AWARE` | `false` | Default for `IFieldAnnotationConfig.versionAware` |

### Intent Color Map

| Intent | CSS Class Suffix | Display Label |
|--------|-----------------|---------------|
| `'clarification-request'` | `red` | Clarification Request |
| `'flag-for-revision'` | `amber` | Flag for Revision |
| `'comment'` | `blue` | Comment |
| `'resolved'` (any intent) | `grey` | — |

Accessed via `intentColorClass` and `intentLabel` constant maps.

### `resolveAnnotationConfig(config)`

Merges a partial `IFieldAnnotationConfig` with platform defaults.

```typescript
function resolveAnnotationConfig(
  config: IFieldAnnotationConfig
): Required<IFieldAnnotationConfig>;
```

---

## Testing Sub-Path

**Import:** `@hbc/field-annotations/testing`

Zero production bundle impact — the testing sub-path is excluded from the main entry point.

### `createMockAnnotation(overrides?)`

```typescript
function createMockAnnotation(
  overrides?: Partial<IFieldAnnotation>
): IFieldAnnotation;
```

Returns a fully populated `IFieldAnnotation` with realistic defaults.

### `createMockAnnotationReply(overrides?)`

```typescript
function createMockAnnotationReply(
  overrides?: Partial<IAnnotationReply>
): IAnnotationReply;
```

### `createMockAnnotationConfig(overrides?)`

```typescript
function createMockAnnotationConfig(
  overrides?: Partial<IFieldAnnotationConfig>
): IFieldAnnotationConfig;
```

### `mockAnnotationStates`

```typescript
const mockAnnotationStates: Record<string, IFieldAnnotation[]>;
```

6 canonical state fixtures:
- `empty` — No annotations
- `openComment` — Single open comment annotation
- `openClarification` — Single open clarification-request annotation
- `openRevisionFlag` — Single open flag-for-revision annotation
- `resolved` — All annotations resolved
- `mixed` — Mix of open and resolved annotations across multiple intents

---

## See Also

- [How To: Add Field-Level Annotations to a New Module](../../how-to/developer/field-annotations-adoption.md)
- [Platform Primitives Registry](../platform-primitives.md)
- [ADR-0096 — Field-Level Annotations as Platform Primitive](../../architecture/adr/ADR-0096-field-annotations-platform-primitive.md)
- [`packages/field-annotations/README.md`](../../../packages/field-annotations/README.md)
