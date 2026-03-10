# SF07-T09 — Deployment, ADR & Documentation: `@hbc/field-annotations`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** All 10 (D-01 through D-10)
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF07-T09 deployment task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Complete the documentation suite, write ADR-0091, produce the developer adoption guide and API reference, run the final pre-deployment checklist, and update `current-state-map.md` to classify the new plan files.

---

## 3-Line Plan

1. Write `docs/architecture/adr/ADR-0091-field-annotations-platform-primitive.md`.
2. Write `docs/how-to/developer/field-annotations-adoption.md` and `docs/reference/field-annotations/api.md`.
3. Execute the pre-deployment checklist and update `current-state-map.md §2`.

---

## Pre-Deployment Checklist

### Code Quality

- [ ] `pnpm --filter @hbc/field-annotations check-types` exits 0
- [ ] `pnpm --filter @hbc/field-annotations lint` exits 0
- [ ] `pnpm --filter @hbc/field-annotations test:coverage` exits 0 with ≥95% on all thresholds
- [ ] No domain package imports in `packages/field-annotations/src/` (architecture check — see verification commands below)
- [ ] `@hbc/field-annotations/testing` sub-path resolves and exports all 4 utilities (D-10)

### Contract Stability

- [ ] `IFieldAnnotation` has all required fields including `createdAtVersion` and `resolvedAtVersion` (D-04)
- [ ] `IFieldAnnotationConfig` has all 6 fields with correct defaults documented in `resolveAnnotationConfig`
- [ ] `IAnnotationCounts` has all 5 count fields required for BIC blocking resolvers (D-03)
- [ ] `AnnotationApi` has `list`, `get`, `create`, `addReply`, `resolve`, `withdraw` methods
- [ ] `ANNOTATION_MAX_REPLIES` constant exported and equals 50 (D-07)
- [ ] `intentColorClass` and `intentLabel` maps exported for all 4 intent values

### SPFx Compliance (D-06)

- [ ] `HbcAnnotationThread` imports `Popover` from `@hbc/ui-kit/app-shell` (not full `@hbc/ui-kit`)
- [ ] `HbcAnnotationSummary` PWA-only behavior documented in API reference
- [ ] No `@microsoft/sp-*` imports in `packages/field-annotations/src/`

### Documentation

- [ ] `docs/architecture/adr/ADR-0091-field-annotations-platform-primitive.md` written and accepted
- [ ] `docs/how-to/developer/field-annotations-adoption.md` written
- [ ] `docs/reference/field-annotations/api.md` written
- [ ] `current-state-map.md §2` updated with SF07 plan files classification

### Integration Verification

- [ ] BIC blocking pattern validated in dev-harness (adding clarification-request → BIC blocks; resolving → BIC unblocks)
- [ ] Annotation complexity gating validated: Essential hides all; Standard shows dots; Expert shows badge + expanded summary
- [ ] Notification registration confirmed: new annotation → Immediate to assignee/owner; resolution → Watch to author
- [ ] Testing sub-path exports confirmed: `createMockAnnotation`, `createMockAnnotationReply`, `createMockAnnotationConfig`, `mockAnnotationStates` (6 states)

### Storybook

- [ ] All `HbcAnnotationMarker` canonical state stories render without console errors
- [ ] All `HbcAnnotationThread` canonical state stories render without console errors
- [ ] All `HbcAnnotationSummary` canonical state stories render without console errors

### Build

- [ ] `pnpm turbo run build --filter @hbc/field-annotations...` exits 0
- [ ] `dist/index.js` and `dist/index.d.ts` present
- [ ] `testing/index.js` and `testing/index.d.ts` present (sub-path artifacts)

---

## ADR: `docs/architecture/adr/ADR-0091-field-annotations-platform-primitive.md`

```markdown
# ADR-0091: Field-Level Annotations as a Platform-Wide Collaborative Review Primitive

**Date:** 2026-03-09
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
```

---

## Developer Adoption Guide: `docs/how-to/developer/field-annotations-adoption.md`

```markdown
# How To: Add Field-Level Annotations to a New Module

**Time to implement:** ~3 hours for a standard record type.
**Prerequisite:** `HBC_FieldAnnotations` SharePoint list must be provisioned for the site.

## Step 1: Add dependency

\`\`\`json
{
  "dependencies": {
    "@hbc/field-annotations": "workspace:*"
  }
}
\`\`\`

## Step 2: Define annotation config for your record type

\`\`\`typescript
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
\`\`\`

## Step 3: Add HbcAnnotationMarker to form fields

\`\`\`tsx
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
\`\`\`

## Step 4: Add HbcAnnotationSummary to the record detail sidebar (PWA only)

\`\`\`tsx
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
\`\`\`

## Step 5: Wire BIC blocking (if blocksBicOnOpenAnnotations is true)

\`\`\`typescript
// In your module's BIC config
import { useFieldAnnotations } from '@hbc/field-annotations';

// In the record detail component, surface annotation counts to the BIC config:
const { counts } = useFieldAnnotations('your-record-type', record.id);
const isAnnotationBlocked =
  counts.openClarificationRequests > 0 || counts.openRevisionFlags > 0;
\`\`\`

See `docs/reference/field-annotations/api.md` for the full `IAnnotationCounts` interface.

## Step 6: Write tests

\`\`\`typescript
import {
  createMockAnnotation,
  createMockAnnotationConfig,
  mockAnnotationStates,
} from '@hbc/field-annotations/testing';
\`\`\`

See `docs/reference/field-annotations/api.md` for all testing utilities.
```

---

## Final Verification Commands

```bash
# 1. Full turbo build including field-annotations and all dependents
pnpm turbo run build --filter @hbc/field-annotations...

# 2. Full test suite with coverage enforcement
pnpm --filter @hbc/field-annotations test:coverage
# Expected: Lines ≥95%, Functions ≥95%, Branches ≥95%, Statements ≥95%

# 3. Confirm dist artifacts
ls packages/field-annotations/dist/
# Expected: index.js, index.d.ts, index.js.map, index.d.ts.map

# 4. Confirm testing sub-path artifacts
ls packages/field-annotations/testing/
# Expected: index.js, index.d.ts (or .ts source if not pre-compiled)

# 5. Architecture dependency check — no domain imports, no prohibited package imports
grep -r "from '@hbc/bic-next-move'" packages/field-annotations/src/ | grep -v "IBicOwner"
grep -r "from '@hbc/versioned-record'" packages/field-annotations/src/
grep -r "from '@hbc/notification-intelligence'" packages/field-annotations/src/
# Expected: zero matches for all three (IBicOwner type import from bic-next-move is the only exception)

# 6. Verify ADR and docs exist
test -f docs/architecture/adr/ADR-0091-field-annotations-platform-primitive.md && echo "ADR OK"
test -f docs/how-to/developer/field-annotations-adoption.md && echo "Adoption guide OK"
test -f docs/reference/field-annotations/api.md && echo "API reference OK"

# 7. SPFx compliance check
grep -r "from '@hbc/ui-kit'" packages/field-annotations/src/components/HbcAnnotationThread.tsx
# Expected: must show '@hbc/ui-kit/app-shell' NOT bare '@hbc/ui-kit'

# 8. Playwright E2E (requires dev-harness running)
pnpm exec playwright test e2e/field-annotations.spec.ts --reporter=list

# 9. Confirm testing sub-path exports
node -e "
  import('@hbc/field-annotations/testing').then(m => {
    console.log('Keys:', Object.keys(m));
    console.log('mockAnnotationStates keys:', Object.keys(m.mockAnnotationStates));
  });
"
# Expected mockAnnotationStates keys: empty, openComment, openClarification, openRevisionFlag, resolved, mixed
```

---

## Blueprint Progress Comment

Add to `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` at end of file:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF07 plan family created: 2026-03-09
Package: @hbc/field-annotations (not yet implemented — pending PH7.12 sign-off)
Documentation added:
  - docs/architecture/plans/shared-features/SF07-Field-Annotations.md
  - docs/architecture/plans/shared-features/SF07-T01-Package-Scaffold.md
  - docs/architecture/plans/shared-features/SF07-T02-TypeScript-Contracts.md
  - docs/architecture/plans/shared-features/SF07-T03-Storage-and-API.md
  - docs/architecture/plans/shared-features/SF07-T04-Hooks.md
  - docs/architecture/plans/shared-features/SF07-T05-HbcAnnotationMarker.md
  - docs/architecture/plans/shared-features/SF07-T06-HbcAnnotationThread-and-Summary.md
  - docs/architecture/plans/shared-features/SF07-T07-Platform-Wiring.md
  - docs/architecture/plans/shared-features/SF07-T08-Testing-Strategy.md
  - docs/architecture/plans/shared-features/SF07-T09-Deployment.md
ADR to create at implementation time: ADR-0091-field-annotations-platform-primitive.md
-->
```

---

## `current-state-map.md §2` Update

Add the following row to the Document Classification Matrix in `docs/architecture/blueprint/current-state-map.md §2`:

```
| SF07 shared-feature plans (10 files: SF07-Field-Annotations.md through SF07-T09-Deployment.md) | **Canonical Normative Plan** | Tier 2 — matrix classification only; pending PH7.12 sign-off before implementation begins |
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T09 not yet started.
-->
