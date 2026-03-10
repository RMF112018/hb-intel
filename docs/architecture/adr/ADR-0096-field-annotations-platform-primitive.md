# ADR-0096: Field-Level Annotations as a Platform-Wide Collaborative Review Primitive

**Date:** 2026-03-10
**Status:** Accepted
**Deciders:** HB Intel Architecture Team
**Source Feature:** PH7-SF-07

---

## Context

Construction record review — Go/No-Go Scorecards, PMPs, Estimating Pursuits — is currently a
record-level activity. Reviewers leave comments on the record as a whole, producing feedback like
"regarding the square footage field..." that:

1. Loses context when the record is edited (the comment still exists; the field it referenced may
   have changed).
2. Has no resolution ownership — comments disappear or get buried without a clear "this was
   addressed" event.
3. Does not surface in BIC/accountability systems — a pending clarification is invisible to the
   platform's Next Move tracking.
4. Has no audit trail — resolved items leave no record of what was questioned or how it was
   resolved.

The con-tech UX study §8 documents that Procore's RFI system solves this for submittals, but no
platform provides field-level annotations generalizable to first-party records.
`@hbc/field-annotations` extends this to all HB Intel record types.

---

## Decisions Made

### D-01 — Storage Backend
**Decision:** SharePoint list `HBC_FieldAnnotations` (per site) + Azure Functions API layer.
Replies stored as a JSON blob column (max 50 entries enforced by Function).
**Rationale:** Consistent with the platform-wide SharePoint storage strategy established in
SF01. Azure Functions prevents direct REST calls from the browser, enabling server-side
notification registration and reply cap enforcement. The JSON blob for replies is a pragmatic
trade-off: annotations are point-in-time records; the 50-reply cap is generous for construction
review workflows; the alternative (a separate replies list) would require joins not natively
supported by SharePoint REST.

### D-02 — Annotation Scope Model
**Decision:** Annotations always scoped to `(recordType, recordId, fieldKey)`. No cross-record
concept. `fieldKey` is a stable constant, not the display label.
**Rationale:** Field-level specificity is the entire value proposition. Cross-record annotations
introduce ambiguity about where feedback lives. Stable `fieldKey` constants (not display labels)
ensure annotations survive field label renames.

### D-03 — BIC Blocking Integration
**Decision:** Opt-in per `IFieldAnnotationConfig` (`blocksBicOnOpenAnnotations: true` is the
default). Consuming module's `IBicNextMoveConfig.resolveIsBlocked` reads `IAnnotationCounts`
from `useFieldAnnotations` to derive the blocking condition.
`@hbc/field-annotations` does not import `@hbc/bic-next-move`.
**Rationale:** Preserves Tier 1 package boundary isolation. The consuming module knows its own
BIC blocking rules best — annotations are one possible blocking condition among many.
Inversion-of-control via the count API gives the consuming module full flexibility without
coupling the packages.

### D-04 — Versioned Record Integration
**Decision:** Annotation records store `createdAtVersion` and `resolvedAtVersion` at creation
and resolution time. Consuming module passes the current version number from `useVersionHistory`.
`@hbc/field-annotations` does not import `@hbc/versioned-record`.
**Rationale:** Same boundary isolation principle as D-03. The version numbers create a
time-indexed audit trail linking each annotation to the exact record state it was raised against.
This satisfies legal defensibility requirements (contract disputes, bid protest risk) without
coupling the packages.

### D-05 — Complexity Mode Rendering
**Decision:** Essential: all annotation UI hidden (zero DOM footprint). Standard: colored
indicator dots visible; thread opens on click; summary shows counts only. Expert: count badges
on markers; inline reply form in thread; expanded summary with per-field breakdown.
**Rationale:** Essential users (new hires, field staff) are overwhelmed by collaborative review
UI. Standard users see enough to participate in review. Expert users get the full audit-trail
richness they need for compliance and legal documentation.

### D-06 — SPFx Constraints
**Decision:** `HbcAnnotationThread` uses `@hbc/ui-kit/app-shell` Popover (not full Fluent
Dialog). `HbcAnnotationSummary` not rendered in SPFx contexts. All API calls via Azure Functions.
**Rationale:** SPFx webpart bundle budgets prohibit importing the full Fluent Dialog component.
The app-shell Popover provides equivalent positioning behavior within budget. Summary panels
are sidebar-native and don't translate meaningfully into webpart column layouts.

### D-07 — Reply Threading Model
**Decision:** Flat one-level replies within each annotation thread (no nested replies). Max 50
replies per annotation enforced server-side.
**Rationale:** Construction review conversations are short (typically 2–5 exchanges before
resolution). Nested threading introduces UI complexity that is not justified by the use case.
The 50-reply cap prevents degenerate cases while leaving room for all realistic conversations.

### D-08 — Assignment Model
**Decision:** Optional per config (`allowAssignment: false` is the default). When assigned,
Immediate-tier notification to assignee; when unassigned, Immediate to record owner. Resolution
sends Watch-tier notification to original author. Withdrawal sends Watch-tier to previous
assignee.
**Rationale:** Assignment is most valuable for Directors delegating clarifications to coordinators
(BD scorecard workflow) and Chief Estimators flagging items for the Estimating Lead. Making
it optional respects record types where ownership is implicit. Notification tiers follow the
established `@hbc/bic-next-move` urgency model: unresolved clarifications are Immediate-tier
accountability events.

### D-09 — Form Integration Pattern
**Decision:** Host form renders `HbcAnnotationMarker` adjacent to each annotatable field (no HOC).
Marker internally composes `useFieldAnnotation` and opens `HbcAnnotationThread` on click.
**Rationale:** HOC patterns obscure prop flow and complicate debugging. The adjacent-marker
pattern is explicit, type-safe, and allows per-field `canAnnotate` and `canResolve` props.
It matches the pattern used in Procore's BIC submittal system and is familiar to construction
tech teams.

### D-10 — Testing Sub-Path
**Decision:** `@hbc/field-annotations/testing` exports `createMockAnnotation()`,
`createMockAnnotationReply()`, `createMockAnnotationConfig()`, `mockAnnotationStates` (6 states).
Zero production bundle impact.
**Rationale:** Consistent with the pattern established by `@hbc/bic-next-move/testing` (D-10)
and `@hbc/complexity/testing` (D-10). Every consuming module would otherwise reimplement mock
annotation data. Canonical fixtures ensure visual and functional consistency across all
Storybook stories platform-wide.

---

## Consequences

**Positive:**
- Every HB Intel record type can adopt field-level collaborative review by adding `HbcAnnotationMarker`
  adjacent to each field — no custom review system per module.
- Open clarification requests are visible in BIC, My Work Feed, and the acknowledgment panel —
  eliminating the "silent pending feedback" problem.
- `createdAtVersion` and `resolvedAtVersion` create a legally defensible annotation audit trail
  at zero incremental cost per adopting module.
- The `@hbc/field-annotations/testing` sub-path ensures consistent test fixture reuse across
  all consumer modules.

**Negative / Trade-offs:**
- The JSON blob reply storage means replies cannot be independently queried or indexed. This
  is acceptable at the anticipated reply count (max 50) but would need a schema change if
  per-reply search or attribution reporting were required in the future.
- `IFieldAnnotationConfig.versionAware` requires the consuming module to manually pass version
  numbers. Forgetting this produces annotations with null `createdAtVersion` — not an error,
  but a gap in the audit trail. Lint rules or runtime dev-mode warnings should be added to
  consuming modules that declare `versionAware: true` but don't pass version numbers.
- BIC blocking is implemented via inversion-of-control in the consuming module. This is the
  correct architectural choice (D-03), but means each consuming module must write and maintain
  its own `resolveIsBlocked` logic. The adoption guide mitigates this with a canonical code
  pattern.
