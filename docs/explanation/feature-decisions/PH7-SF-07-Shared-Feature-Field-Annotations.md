# PH7-SF-07: `@hbc/field-annotations` — Inline Field-Level Comments & Clarification Requests

**Priority Tier:** 1 — Foundation (must exist before any collaborative review workflow)
**Package:** `packages/field-annotations/`
**Interview Decision:** Q6 — Option B confirmed
**Mold Breaker Source:** UX-MB §4 (Universal Next Move); ux-mold-breaker.md Signature Solution #4; con-tech-ux-study §8 (Procore BIC — RFI-style clarification on submittals)

---

## Problem Solved

Collaborative review of construction records — Go/No-Go Scorecards, Project Management Plans, Turnover Meeting packages, Estimating pursuits — requires the ability for reviewers to comment on specific fields, not just on the record as a whole. Current platforms provide record-level comment threads (equivalent to a generic chat), which forces reviewers to write "regarding the square footage in the Estimating section, line 3..." rather than attaching the comment directly to the field.

This creates four real problems:
1. **Context loss**: Record-level comments lose their context when the record is edited
2. **Resolution ambiguity**: It's unclear when a comment has been "addressed"
3. **No assignment**: Comments don't have an owner responsible for resolution
4. **No audit trail**: Resolved comments disappear; there is no record of what was questioned and how it was resolved

**Confirmed Phase 7 use cases:**
- BD Go/No-Go Scorecard: Director requests clarification on a specific scoring criterion before approval
- Project Hub PMP: VP questions a specific constraint or milestone in a monthly review
- Estimating: Chief Estimator flags a specific cost assumption for the Estimating Lead to revisit
- `@hbc/workflow-handoff`: Receiving party flags specific fields in a handoff package as requiring clarification before acknowledgment

---

## Mold Breaker Rationale

The ux-mold-breaker.md Operating Principle §7.2 (Responsibility-first) applies: every clarification request must have an owner who is responsible for resolving it. The BIC primitive governs the "ball" at the field level — when a reviewer opens a clarification request on a field, BIC transfers to the record owner; when the record owner responds, BIC transfers back to the reviewer.

The con-tech UX study §8 documents that Procore's RFI and submittal system achieves this for those specific item types, but no platform provides field-level annotations generalizable to first-party records. `@hbc/field-annotations` extends this capability universally.

---

## Applicable Modules

| Module | Record Type | Annotation Use Case |
|---|---|---|
| Business Development | Go/No-Go Scorecard | Director flags scoring criteria; requests clarification from BD Manager |
| Business Development | Living Strategic Intelligence | Approver questions a specific data point before approval |
| Project Hub | PMP | VP or PM flags a specific section; reviewer requests revision |
| Estimating | Active Pursuit | Chief Estimator requests revision of a specific cost line |
| `@hbc/workflow-handoff` | Handoff package fields | Receiving party flags pre-handoff items |

---

## Interface Contract

```typescript
// packages/field-annotations/src/types/IFieldAnnotation.ts

export type AnnotationStatus = 'open' | 'resolved' | 'withdrawn';
export type AnnotationIntent = 'comment' | 'clarification-request' | 'flag-for-revision';

export interface IFieldAnnotation {
  annotationId: string;
  /** Record type namespace (e.g., 'bd-scorecard') */
  recordType: string;
  recordId: string;
  /** Field key this annotation is attached to */
  fieldKey: string;
  /** Human-readable field label (captured at creation) */
  fieldLabel: string;
  intent: AnnotationIntent;
  status: AnnotationStatus;
  /** Author of the annotation */
  author: IBicOwner;
  /** Who is responsible for resolving this annotation */
  assignedTo: IBicOwner | null;
  body: string;
  createdAt: string; // ISO 8601
  resolvedAt: string | null;
  resolvedBy: IBicOwner | null;
  /** Resolution note (required for clarification-request and flag-for-revision) */
  resolutionNote: string | null;
  /** Thread of replies */
  replies: IAnnotationReply[];
}

export interface IAnnotationReply {
  replyId: string;
  author: IBicOwner;
  body: string;
  createdAt: string;
}

export interface IFieldAnnotationConfig {
  /** Record type namespace */
  recordType: string;
  /** Whether annotation authors can assign to specific users */
  allowAssignment?: boolean;
  /** Whether resolution requires a note */
  requireResolutionNote?: boolean;
  /** Whether read-only viewers can see annotations */
  visibleToViewers?: boolean;
}
```

---

## Package Architecture

```
packages/field-annotations/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IFieldAnnotation.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useFieldAnnotations.ts        # loads all annotations for a record
│   │   ├── useFieldAnnotation.ts         # loads annotations for a specific field
│   │   └── useAnnotationActions.ts       # create, reply, resolve, withdraw
│   └── components/
│       ├── HbcAnnotationMarker.tsx       # indicator dot/icon on annotated fields
│       ├── HbcAnnotationThread.tsx       # popover thread for a specific field
│       ├── HbcAnnotationSummary.tsx      # record-level summary panel (all open annotations)
│       └── index.ts
```

---

## Component Specifications

### `HbcAnnotationMarker` — Field Indicator

Rendered alongside any form field that may have annotations. The host component (the form field itself) renders the marker, passing its field key.

```typescript
interface HbcAnnotationMarkerProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: IFieldAnnotationConfig;
  /** Whether the current user can add new annotations on this field */
  canAnnotate?: boolean;
}
```

**Visual behavior:**
- No annotation: invisible (zero layout footprint)
- Open annotation(s): colored indicator dot (red for clarification-request, amber for flag-for-revision, blue for comment)
- Resolved annotation(s) only: small grey checkmark dot
- Clicking dot opens `HbcAnnotationThread` popover anchored to the field
- Hovering shows tooltip: "2 open annotations"

### `HbcAnnotationThread` — Field-Level Comment Thread

A floating popover anchored to the annotated field showing the full annotation thread.

```typescript
interface HbcAnnotationThreadProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: IFieldAnnotationConfig;
  canAnnotate?: boolean;
  canResolve?: boolean;
}
```

**Visual behavior:**
- Thread list: each annotation as a card with: intent badge (Comment / Clarification Request / Flag for Revision), author avatar + name, body text, timestamp, replies thread, status badge
- "Add annotation" CTA at bottom: intent selector dropdown + text area + optional assignee picker
- Resolve CTA: requires resolution note if `requireResolutionNote` is true
- Reply CTA: inline reply text area within each annotation card
- Resolved annotations collapsed by default with a "Show resolved (N)" toggle

### `HbcAnnotationSummary` — Record-Level Open Annotations Panel

A panel rendered in the record detail page sidebar showing all open annotations across all fields.

```typescript
interface HbcAnnotationSummaryProps {
  recordType: string;
  recordId: string;
  config: IFieldAnnotationConfig;
  /** Clicking a field summary item scrolls the form to that field */
  onFieldFocus?: (fieldKey: string) => void;
}
```

**Visual behavior:**
- "N open annotations" header with status breakdown (X clarification requests, Y revision flags, Z comments)
- List of open annotations grouped by field, showing: field label, intent badge, author, body excerpt
- Clicking an item calls `onFieldFocus(fieldKey)` to scroll the form to the annotated field

---

## Integration with Form Fields

The integration pattern uses a HOC (Higher-Order Component) or a wrapper approach — the host form must render the `HbcAnnotationMarker` adjacent to each annotatable field:

```typescript
// In a form field group
<FormGroup>
  <Label htmlFor="totalBuildableArea">Total Buildable Area (SF)</Label>
  <div className="field-with-annotation">
    <TextInput id="totalBuildableArea" name="totalBuildableArea" {...fieldProps} />
    <HbcAnnotationMarker
      recordType="bd-scorecard"
      recordId={scorecard.id}
      fieldKey="totalBuildableArea"
      fieldLabel="Total Buildable Area (SF)"
      config={scorecardAnnotationConfig}
      canAnnotate={currentUser.role === 'Director of Preconstruction'}
    />
  </div>
</FormGroup>
```

---

## BIC Integration

When a clarification-request or flag-for-revision annotation is created:
- BIC state on the parent record gains a blocking condition: `resolveIsBlocked` returns `true`
- `resolveBlockedReason` returns: "N open clarification requests (see annotations)"
- When all open annotations are resolved: blocking condition is cleared; BIC advances

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Open clarification-request/flag-for-revision annotations block the BIC state of the parent record |
| `@hbc/acknowledgment` | Reviewers may use annotations during acknowledgment review before signing off |
| `@hbc/versioned-record` | Annotations are preserved per version; resolved annotations include the version at which they were resolved |
| `@hbc/notification-intelligence` | New annotation → Immediate notification to assignee (if assigned) or record owner; resolution → Watch notification |
| `@hbc/complexity` | Essential: annotation markers hidden (noise reduction); Standard: markers visible; Expert: full thread with reply history |
| PH9b My Work Feed (§A) | Unresolved annotations assigned to current user appear in My Work Feed |

---

## SPFx Constraints

- `HbcAnnotationThread` popover uses `@hbc/ui-kit/app-shell` popover primitive in SPFx contexts
- `HbcAnnotationSummary` is PWA-preferred; in SPFx contexts, annotation summary is surfaced via `HbcAnnotationMarker` dots only
- All annotation API calls route through Azure Functions backend

---

## Priority & ROI

**Priority:** P0 — Required before BD scorecard director review workflow and Project Hub PMP review cycle can function as collaborative documents
**Estimated build effort:** 3–4 sprint-weeks (three components, API, BIC integration, notification integration)
**ROI:** Eliminates context-losing email comment chains; creates per-field accountability; resolves the #1 complaint about record-level comments (loss of context when record changes); makes clarification workflows visible in BIC and My Work Feed

---

## Definition of Done

- [ ] `IFieldAnnotation` type defined and exported with all intent and status values
- [ ] `useFieldAnnotations` loads all annotations for a record (with open/resolved filtering)
- [ ] `useFieldAnnotation` loads annotations for a specific field key
- [ ] `useAnnotationActions` exposes create, reply, resolve, withdraw mutations
- [ ] `HbcAnnotationMarker` renders indicator dot in correct color per intent; hidden when no annotations
- [ ] `HbcAnnotationThread` popover renders full thread with reply, resolve, add annotation
- [ ] `HbcAnnotationSummary` panel renders all open annotations grouped by field
- [ ] BIC integration: open clarification-request → blocking condition on parent record
- [ ] `@hbc/versioned-record` integration: annotations preserved per version
- [ ] Notification registration: new annotation → Immediate; resolution → Watch
- [ ] `@hbc/complexity` integration: markers hidden in Essential, visible in Standard+, full thread in Standard+
- [ ] Unit tests ≥95% on BIC blocking logic and annotation status transitions
- [ ] Storybook: marker states, thread with all intent types, summary panel

---

## ADR Reference

Create `docs/architecture/adr/0016-field-annotations-platform-primitive.md` documenting the decision to implement field-level annotations as a shared package rather than per-module comment systems, the BIC blocking integration strategy, and the version-pinning approach for annotation audit trail.
