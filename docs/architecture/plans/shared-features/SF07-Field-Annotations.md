# SF07 — `@hbc/field-annotations`: Inline Field-Level Annotations & Clarification Requests

**Plan Version:** 1.0
**Date:** 2026-03-09
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Priority Tier:** 1 — Foundation (must exist before BD scorecard director review workflow and Project Hub PMP collaborative review cycle)
**Estimated Effort:** 4–5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0091-field-annotations-platform-primitive.md`

> **Doc Classification:** Canonical Normative Plan — SF07 implementation master plan for `@hbc/field-annotations`; governs all task files SF07-T01 through SF07-T09.

---

## Purpose

`@hbc/field-annotations` is the platform-wide collaborative review primitive that answers the critical question in construction record management: **"Who needs to clarify what, on which specific field, and has it been resolved?"**

Every collaborative record in HB Intel — Go/No-Go Scorecards, Project Management Plans, Estimating Pursuits, Turnover Meeting packages — requires reviewers to annotate specific fields, not just the record as a whole. Without field-level annotations, review feedback degrades into generic email threads where context is lost the moment the record is edited, ownership of resolution is unclear, and there is no audit trail.

`@hbc/field-annotations` extends the construction industry's RFI/submittal concept (BIC mold-breaker §4) into a platform-wide primitive that works on any HB Intel record type, integrates natively with `@hbc/bic-next-move` to block advancement when unresolved clarifications exist, and preserves annotation history across record versions via `@hbc/versioned-record`.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Storage backend | SharePoint list `HBC_FieldAnnotations` (per site) + Azure Functions API layer; each annotation is a list item with replies stored as a JSON blob in a multi-line text column; Azure Function handles all CRUD operations with OData filtering |
| D-02 | Annotation scope model | Annotations always scoped to `(recordType, recordId, fieldKey)`; no cross-record annotation concept; a single `fieldKey` can have multiple annotation threads; `fieldKey` is stable (not the display label) |
| D-03 | BIC blocking integration | Opt-in per `IFieldAnnotationConfig`; `blocksBicOnOpenAnnotations: true` causes open `clarification-request` or `flag-for-revision` annotations to block the parent record's BIC state; blocking condition provided via `resolveIsBlocked` callback pattern in the parent module's BIC config |
| D-04 | Versioned-record integration | Annotation records store `versionNumber` at creation time; when `@hbc/versioned-record` creates a snapshot, consuming modules pass open annotation count as `contextPayload`; resolved annotations include `resolvedAtVersion`; annotation history is preserved across all versions |
| D-05 | Complexity mode rendering | Essential: `HbcAnnotationMarker` hidden (zero DOM footprint, zero layout shift); Standard: colored indicator dots visible, thread opens on click; Expert: full thread accessible inline where layout allows, `HbcAnnotationSummary` expanded by default |
| D-06 | SPFx constraints | `HbcAnnotationThread` popover uses `@hbc/ui-kit/app-shell` Popover primitive in SPFx contexts; `HbcAnnotationSummary` is PWA-preferred (SPFx contexts surface annotation state via marker dots only); all annotation API calls route through Azure Functions backend |
| D-07 | Reply threading model | Flat one-level replies within each annotation thread (no nested replies); replies sorted ascending by `createdAt`; Azure Function enforces a 50-reply cap per annotation (older replies preserved in data but not surfaced in UI) |
| D-08 | Assignment model | Optional per config (`allowAssignment?: boolean`); when `assignedTo` is set on a `clarification-request` or `flag-for-revision`, notification-intelligence registers an `Immediate`-tier event to the assignee; when unassigned, Immediate-tier notification goes to record owner; withdrawal registers a `Watch`-tier event to the previous assignee |
| D-09 | Form integration pattern | Host form renders `HbcAnnotationMarker` adjacent to each annotatable field (no HOC required); marker internally composes `useFieldAnnotation` hook and opens `HbcAnnotationThread` on click; `canAnnotate` prop controls write access per field instance |
| D-10 | Testing sub-path | `@hbc/field-annotations/testing` sub-path exports `createMockAnnotation()`, `createMockAnnotationReply()`, `createMockAnnotationConfig()`, `mockAnnotationStates` (6 canonical states); zero production bundle impact |

---

## Package Directory Structure

```
packages/field-annotations/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                                   # Main barrel export
│   ├── types/
│   │   ├── IFieldAnnotation.ts                    # All interfaces, type aliases, status/intent enums
│   │   └── index.ts
│   ├── constants/
│   │   ├── annotationDefaults.ts                  # Default config values, API list name, reply cap
│   │   └── index.ts
│   ├── api/
│   │   ├── AnnotationApi.ts                       # D-01: Azure Functions CRUD wrapper
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useFieldAnnotations.ts                 # Loads all annotations for a record
│   │   ├── useFieldAnnotation.ts                  # Loads annotations for a specific fieldKey
│   │   ├── useAnnotationActions.ts                # create, reply, resolve, withdraw mutations
│   │   └── index.ts
│   └── components/
│       ├── HbcAnnotationMarker.tsx                # D-05, D-09: indicator dot anchored to field
│       ├── HbcAnnotationThread.tsx                # D-06, D-07: popover thread per field
│       ├── HbcAnnotationSummary.tsx               # D-05, D-06: record-level open annotation panel
│       └── index.ts
├── testing/
│   ├── index.ts                                   # D-10: testing sub-path barrel
│   ├── createMockAnnotation.ts                    # D-10: IFieldAnnotation factory
│   ├── createMockAnnotationReply.ts               # D-10: IAnnotationReply factory
│   ├── createMockAnnotationConfig.ts              # D-10: IFieldAnnotationConfig factory
│   └── mockAnnotationStates.ts                    # D-10: 6 canonical annotation state fixtures
└── src/__tests__/
    ├── setup.ts
    ├── AnnotationApi.test.ts
    ├── useFieldAnnotations.test.ts
    ├── useFieldAnnotation.test.ts
    ├── useAnnotationActions.test.ts
    ├── HbcAnnotationMarker.test.tsx
    ├── HbcAnnotationThread.test.tsx
    └── HbcAnnotationSummary.test.tsx
```

---

## Complexity Mode Rendering Matrix (D-05)

| Component | Essential | Standard | Expert |
|---|---|---|---|
| `HbcAnnotationMarker` | Hidden — zero DOM footprint | Colored dot (red / amber / blue / grey) + hover tooltip | Colored dot + hover tooltip + open count badge |
| `HbcAnnotationThread` | Not rendered (marker hidden) | Popover on dot click — full thread + "Add annotation" CTA | Popover on dot click — full thread + inline reply + full resolve form with required note |
| `HbcAnnotationSummary` | Hidden — not mounted | Collapsed summary header with open count only | Expanded panel with per-field breakdown, intent badges, assignee display |

`forceVariant` overrides the user's global complexity setting for a specific instance. Required for: SPFx narrow column contexts (pin to `standard`), My Work Feed annotation rows (pin to `standard`).

---

## Annotation Intent Color Map

| Intent | Dot Color | Badge Label |
|---|---|---|
| `clarification-request` | Red | Clarification Request |
| `flag-for-revision` | Amber | Flag for Revision |
| `comment` | Blue | Comment |
| `resolved` (all intents) | Grey checkmark dot | Resolved |

---

## BIC Blocking Logic (D-03)

When the consuming module's `IBicNextMoveConfig` includes a `resolveIsBlocked` function that queries annotation state:

```typescript
// In the consuming module's BIC config — example pattern
resolveIsBlocked: (item) => {
  const openCount = getOpenAnnotationCount(item.id, ['clarification-request', 'flag-for-revision']);
  return openCount > 0;
},
resolveBlockedReason: (item) => {
  const count = getOpenAnnotationCount(item.id, ['clarification-request', 'flag-for-revision']);
  return count > 0 ? `${count} open annotation${count > 1 ? 's' : ''} require resolution` : null;
},
```

The consuming module uses `useFieldAnnotations` to maintain a local count. `@hbc/field-annotations` does not import `@hbc/bic-next-move` (preserves Tier 1 boundary isolation). BIC integration is always the responsibility of the consuming module.

---

## Integration Points

| Package | Integration Detail |
|---|---|
| `@hbc/bic-next-move` | Open `clarification-request` / `flag-for-revision` annotations block the parent record's BIC state via the consuming module's `resolveIsBlocked` resolver (D-03); `@hbc/field-annotations` does NOT import `@hbc/bic-next-move` |
| `@hbc/acknowledgment` | Reviewers may create annotations during acknowledgment review; `HbcAnnotationSummary` surfaced in the acknowledgment panel before sign-off; consuming module wires both |
| `@hbc/versioned-record` | Consuming module passes open annotation count as `contextPayload` when creating a version snapshot (D-04); annotations store `versionNumber` at creation; `resolvedAtVersion` set on resolution |
| `@hbc/notification-intelligence` | New annotation → `Immediate`-tier event to assignee (or record owner if unassigned); resolution → `Watch`-tier event to original author; withdrawal → `Watch`-tier to previous assignee (D-08) |
| `@hbc/complexity` | All three components read complexity context; Essential hides all annotation UI; Standard shows dots and thread; Expert shows inline thread and expanded summary (D-05) |
| My Work Feed (PH9b §A) | Unresolved annotations assigned to current user (`assignedTo.userId === currentUser.id`) appear in My Work Feed with intent badge and field label |
| `@hbc/workflow-handoff` | Receiving party flags specific fields in a handoff package as requiring clarification before acknowledgment; `HbcAnnotationMarker` rendered in handoff review UI |

---

## SPFx Constraints (D-06)

| Component | SPFx Behavior |
|---|---|
| `HbcAnnotationMarker` | Fully supported; renders using `@hbc/ui-kit/app-shell` primitives only |
| `HbcAnnotationThread` | Supported; uses `@hbc/ui-kit/app-shell` Popover primitive (not full Fluent Dialog) |
| `HbcAnnotationSummary` | Not rendered in SPFx; annotation summary surfaced via individual marker dots only |
| API calls | All route through Azure Functions; no direct SharePoint REST calls from components |

---

## Effort Estimates

| Task File | Scope | Estimate |
|---|---|---|
| T01 Package Scaffold | Directory, config, barrel stubs | 0.25 sw |
| T02 TypeScript Contracts | All interfaces, type aliases, constants, config shape | 0.5 sw |
| T03 Storage and API Layer | SharePoint list schema, `AnnotationApi`, Azure Function contract | 0.75 sw |
| T04 Hooks | `useFieldAnnotations`, `useFieldAnnotation`, `useAnnotationActions` with TanStack Query | 0.75 sw |
| T05 HbcAnnotationMarker | Indicator dot component, all intent color states, complexity gating, click handler | 0.5 sw |
| T06 HbcAnnotationThread and HbcAnnotationSummary | Thread popover with full CRUD, summary panel, resolved toggle | 1.0 sw |
| T07 Platform Wiring | BIC integration pattern doc, versioned-record integration, notification registration, complexity confirmation | 0.5 sw |
| T08 Testing Strategy | Testing sub-path, unit tests, Storybook stories, Playwright E2E | 0.75 sw |
| T09 Deployment | ADR-0091, pre-deploy checklist, developer how-to, API reference, current-state-map update | 0.25 sw |
| **Total** | | **5.25 sprint-weeks** |

> Note: Source spec estimated 3–4 sprint-weeks. Additional sprint-week accounts for D-01 Azure Functions storage layer, D-04 versioned-record integration, D-08 full assignment/notification wiring, and D-10 testing sub-path — all implementation scope beyond the original estimate.

---

## Implementation Phasing

### Wave 1 — Contracts, Storage & Hooks (T01 + T02 + T03 + T04)
Foundation layer. All types locked, `AnnotationApi` operational against SharePoint list, all three hooks functional. No UI yet. Consuming modules can begin wiring annotation state into their BIC config resolvers.

### Wave 2 — Components (T05 + T06)
`HbcAnnotationMarker` renders in all intent and complexity states. `HbcAnnotationThread` popover with full CRUD operational. `HbcAnnotationSummary` panel rendered in PWA contexts. SPFx constraints applied.

### Wave 3 — Platform Wiring (T07)
BIC blocking integration pattern documented and validated. Versioned-record snapshot integration confirmed. Notification-intelligence registration verified. Complexity dial gating confirmed across all three tiers.

### Wave 4 — Testing, Docs & Deployment (T08 + T09)
Testing sub-path published with 6 canonical fixtures. ≥95% coverage enforced. ADR-0091 written. Developer how-to and API reference authored. Storybook stories in all canonical states.

---

## Definition of Done

- [ ] `IFieldAnnotation`, `IAnnotationReply`, `IFieldAnnotationConfig` types defined and exported with all intent, status, and config values
- [ ] `AnnotationApi` wraps Azure Functions endpoints for list, get, create, reply, resolve, withdraw operations
- [ ] `useFieldAnnotations` loads all annotations for a `(recordType, recordId)` with open/resolved filtering via TanStack Query
- [ ] `useFieldAnnotation` loads annotations for a specific `(recordType, recordId, fieldKey)` with real-time update on mutation
- [ ] `useAnnotationActions` exposes create, reply, resolve, withdraw mutations with optimistic update
- [ ] `HbcAnnotationMarker` renders in correct color per intent; hidden when no annotations (zero layout footprint); invisible in Essential mode (D-05)
- [ ] `HbcAnnotationThread` popover renders full thread with reply, resolve, add annotation; app-shell popover primitive used in SPFx (D-06)
- [ ] `HbcAnnotationSummary` panel renders all open annotations grouped by field with intent badges; not rendered in SPFx (D-06)
- [ ] BIC blocking integration pattern documented in T07 and in `docs/how-to/developer/field-annotations-bic-integration.md`
- [ ] Versioned-record integration: consuming module `contextPayload` pattern documented; `versionNumber` stored on annotation at creation; `resolvedAtVersion` set on resolution
- [ ] Notification registration: new annotation → Immediate (to assignee or record owner); resolution → Watch (to author); withdrawal → Watch (to previous assignee) — all per D-08
- [ ] `@hbc/complexity` integration: Essential hides all annotation UI; Standard shows dots + thread; Expert shows inline thread + expanded summary (D-05)
- [ ] `@hbc/field-annotations/testing` sub-path exports all 4 testing utilities (D-10)
- [ ] Unit tests ≥95% on annotation status transitions, BIC blocking logic, and hook mutations
- [ ] Storybook stories: marker states (all intents, resolved, empty), thread with all intent types and reply flow, summary panel with mixed open annotations
- [ ] `docs/architecture/adr/ADR-0091-field-annotations-platform-primitive.md` written and accepted
- [ ] `docs/how-to/developer/field-annotations-adoption.md` written
- [ ] `docs/reference/field-annotations/api.md` written
- [ ] `pnpm turbo run build --filter @hbc/field-annotations...` passes with zero errors
- [ ] `current-state-map.md §2` updated with SF07 plan classification

---

## Task File Index

| File | Contents |
|---|---|
| `SF07-T01-Package-Scaffold.md` | Directory tree, `package.json`, `tsconfig.json`, `vitest.config.ts`, turbo registration, barrel stubs |
| `SF07-T02-TypeScript-Contracts.md` | All interfaces, type aliases, `IFieldAnnotation`, `IFieldAnnotationConfig`, intent/status enums, constants |
| `SF07-T03-Storage-and-API.md` | SharePoint list schema, Azure Functions API contract, `AnnotationApi.ts` implementation |
| `SF07-T04-Hooks.md` | `useFieldAnnotations.ts`, `useFieldAnnotation.ts`, `useAnnotationActions.ts` — full TanStack Query implementation |
| `SF07-T05-HbcAnnotationMarker.md` | `HbcAnnotationMarker.tsx` — all intent states, complexity gating, click-to-open thread, D-05/D-09 |
| `SF07-T06-HbcAnnotationThread-and-Summary.md` | `HbcAnnotationThread.tsx` (popover CRUD) + `HbcAnnotationSummary.tsx` (record panel), D-06/D-07 |
| `SF07-T07-Platform-Wiring.md` | BIC blocking pattern doc, versioned-record integration, notification-intelligence wiring, complexity confirmation |
| `SF07-T08-Testing-Strategy.md` | `testing/` sub-path exports, unit tests, Storybook stories, Playwright E2E scenarios |
| `SF07-T09-Deployment.md` | Pre-deployment checklist, ADR-0091 content, adoption how-to, API reference, verification commands |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07 master plan created: 2026-03-09
Classification: Canonical Normative Plan
ADR required: ADR-0091 (next available number per current-state-map.md §2.1)

SF07-T01 completed: 2026-03-09 — Package scaffold
SF07-T02 completed: 2026-03-09 — TypeScript contracts
SF07-T03 completed: 2026-03-09 — Storage and API layer
SF07-T04 completed: 2026-03-09 — Field annotations hooks
SF07-T05 completed: 2026-03-10 — HbcAnnotationMarker component
SF07-T06 completed: 2026-03-10 — HbcAnnotationThread and HbcAnnotationSummary components
SF07-T07 completed: 2026-03-10 — Platform wiring verification (all boundary checks, type contracts, complexity gating, build gates passed)
SF07-T08 completed: 2026-03-10 — Testing strategy (97 Vitest tests, 95.19% branch coverage, 4 testing sub-path factories, 20 Storybook stories, 9 Playwright E2E stubs)
SF07-T09 completed: 2026-03-10 — Deployment, ADR & Documentation (ADR-0096, package README, adoption guide, API reference, index updates)
SF07 complete: All T01–T09 tasks finished. Package @hbc/field-annotations fully implemented.
-->
