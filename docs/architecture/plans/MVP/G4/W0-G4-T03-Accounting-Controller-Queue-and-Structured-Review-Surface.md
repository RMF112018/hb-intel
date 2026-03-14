# W0-G4-T03 — Accounting/Controller Queue and Structured Review Surface

> **Doc Classification:** Canonical Normative Plan — implementation-governing task plan for Wave 0 Group 4, Task 03. Specifies the Accounting/controller-facing SPFx queue surface and structured review surface for project setup request review, approval, clarification requests, and routing.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — implementation requires G3 acceptance gate to be satisfied and ADR-0090 to exist on disk
**Parent Plan:** `W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
**Governed by:** CLAUDE.md v1.6 → `current-state-map.md` → G3 master plan → G4 master plan → this document
**Unlocks:** T07 (review surface failure modes), T08 (controller surface tests)
**Phase 7 gate:** ADR-0090 must exist on disk before implementation begins

---

## 1. Objective

Define the complete implementation specification for the Accounting/controller-facing SPFx project setup review experience. This covers:

- The queue-first review posture: what the controller sees when they arrive at the review section of the Accounting app
- The structured review surface: what the controller sees when they open a specific request for review
- The full action affordance set: approve, request clarification, hold, and forward-routing
- What ownership, next-action, and history context controllers need and how it is presented
- How `@hbc/ui-kit` should provide the queue and review presentation primitives
- What this surface consumes from G3 contracts and backend/shared-platform layers
- What belongs here versus what belongs in Admin

---

## 2. Why This Task Exists

The project setup request lifecycle requires controller review at the `UnderReview` → `NeedsClarification | AwaitingExternalSetup | ReadyToProvision` decision point. This is a structured, accountable review action — the controller decides whether to approve, flag for clarification, place on hold, or route forward.

Currently, the Accounting app (`apps/accounting/src/`) has three pages: `BudgetsPage`, `InvoicesPage`, and `OverviewPage`. There is no project setup queue, no review surface, and no action affordances for the controller role. The wave-0 validation report confirmed this gap explicitly.

T03 creates this surface from scratch within the Accounting SPFx app. It does not adapt an existing surface — it introduces new routes, pages, and components governed entirely by the specifications in this plan.

---

## 3. Scope

### 3.1 In Scope

- New route(s) in `apps/accounting/src/router/` for the project setup queue and review surfaces
- New page(s) in `apps/accounting/src/pages/` implementing the queue and structured review
- Queue table composition using `HbcDataTable` from `@hbc/ui-kit`
- Structured review panel or page composition using `@hbc/ui-kit` primitives and G3 contract components
- All action affordances: approve, request clarification, hold, forward-routing
- History and audit trail section in the review surface
- BIC ownership display using `@hbc/bic-next-move`
- `@hbc/complexity` gates for operational detail fields
- Navigation from queue to review and back

### 3.2 Out of Scope

- Provisioning retry or recovery actions (Admin scope — T04)
- Requester setup form (Estimating scope — T01)
- Completion confirmation (T05)
- Budgets, invoices, or existing Accounting financial surfaces (not touched by T03)
- PWA equivalent (G5)
- Backend provisioning saga changes (G2 scope)

---

## 4. Governing Constraints

1. **`@hbc/ui-kit` is the required source of all shared UI components.** No app-local reusable queue or review component systems.
2. **`@hbc/complexity` governs all role-based detail in the review surface.** No hardcoded controller-specific rendering.
3. **The controller does not use a wizard for review.** The review surface is a structured review panel — not a step-wizard. The controller reads a submitted request and takes a discrete action. `@hbc/step-wizard` is not used in T03.
4. **Controller actions must produce state transitions via the provisioning API.** Actions (approve, clarify, hold, forward) must call the appropriate provisioning API endpoint — not modify `IProjectSetupRequest` state locally in the store.
5. **History must be immutable and append-only in the display.** The review surface shows read-only history using `HbcAuditTrailPanel` or `HbcStatusTimeline` from `@hbc/ui-kit`. The controller does not edit history.
6. **The review surface is not the admin surface.** Actions involving provisioning retry, failure archival, or escalation are out of scope for T03. If a request is in `Failed` state and the controller sees it, the available action is "Route to Admin" — not retry.

---

## 5. Route Structure

T03 introduces the following routes in the Accounting app's router:

```typescript
// Add to apps/accounting/src/router/routes.ts

const projectReviewQueueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-review',
  component: lazyRouteComponent(() =>
    import('../pages/ProjectReviewQueuePage.js').then((m) => ({ default: m.ProjectReviewQueuePage }))
  ),
});

const projectReviewDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-review/$requestId',
  component: lazyRouteComponent(() =>
    import('../pages/ProjectReviewDetailPage.js').then((m) => ({ default: m.ProjectReviewDetailPage }))
  ),
});
```

These routes must be added to the `webpartRoutes` export array alongside the existing Accounting routes.

Navigation from other parts of the Accounting app to the queue is via a navigation entry (see T07 for navigation composition rules).

---

## 6. Queue Surface: `ProjectReviewQueuePage`

### 6.1 Page Purpose

The queue surface is the controller's landing view for project setup review work. It answers: "What requests are waiting for my review, and in what order should I act on them?"

### 6.2 Data Source

The queue reads from `createProvisioningApiClient(url, getToken).listRequests()` filtered to requests in the `UnderReview` state. The controller may also choose to see requests in adjacent states (`NeedsClarification` — returned to requester, awaiting re-submission; `AwaitingExternalSetup` — waiting on external input; `Failed` — for routing decisions).

**Default filter:** `state === 'UnderReview'`
**Filter options (UI toggle):** A `HbcTabs` component (or filter strip) allows the controller to switch between:
- "Pending Review" (`UnderReview`)
- "Awaiting Re-Submission" (`NeedsClarification`)
- "Awaiting External Setup" (`AwaitingExternalSetup`)
- "Failed / Needs Routing" (`Failed`)

### 6.3 Queue Table Specification

The queue is rendered using `HbcDataTable<IProjectSetupRequest>` from `@hbc/ui-kit`.

| Column | Source | Rendering |
|--------|--------|-----------|
| Project Name | `request.projectName` | Link to `/project-review/$requestId` |
| Department | `request.department` | Text |
| State | `request.state` | `HbcStatusBadge` |
| Submitted By | `request.submittedBy` | Text (email or display name) |
| Submitted | `request.submittedAt` | Relative timestamp (e.g., "2 hours ago") |
| Current Owner | `IBicNextMoveState.currentOwner` | From BIC config resolution |
| Priority | `IBicNextMoveState.urgency` (if available) | `HbcStatusBadge` — or sort indicator |
| Actions | — | "Open" button per row |

**Sort order (default):** Oldest-first by `submittedAt` within the active filter tab. Ties broken by alphabetical `projectName`.

**Empty state:** `HbcEmptyState` with message "No requests pending review." when the filtered list is empty.

### 6.4 Queue Row Actions

Each queue row has a single primary action: `HbcButton` variant `secondary` size `small` labeled "Open" — navigates to `/project-review/$requestId`.

Row-level quick actions (optional enhancement — include only if it does not complicate the table layout):
- "Hold" — transitions `UnderReview` → `UnderReview` with a hold flag (if supported by the provisioning API's hold mechanism)

Do not add clarification or approval actions directly on queue rows. Those belong in the structured review surface.

### 6.5 Queue Page Shell

```tsx
<WorkspacePageShell layout="list" title="Project Setup Review">
  <HbcTabs> {/* filter strip */}
    {/* Pending Review | Awaiting Re-Submission | Awaiting External | Failed */}
  </HbcTabs>
  <HbcDataTable<IProjectSetupRequest> ... />
</WorkspacePageShell>
```

---

## 7. Structured Review Surface: `ProjectReviewDetailPage`

### 7.1 Page Purpose

The structured review surface is the controller's workspace for reviewing a specific request and taking a decisive action. It answers: "What is this request, why is it here, who submitted it, is everything complete, and what do I do with it?"

The review surface is deliberately not a wizard. The controller is not filling out a form — they are reviewing a submitted, structured request and choosing from a set of bounded actions. The layout must reflect that function: information first, actions second.

### 7.2 Page Layout

```
WorkspacePageShell layout="detail" title="{projectName}"
├── Back navigation ("← Back to Queue")
├── Core Summary Section
│   ├── Project name, department, type, stage
│   ├── State badge (HbcStatusBadge)
│   ├── BIC ownership + next action (HbcBicDetail)
│   ├── Submitted by, submitted at
│   └── Action affordances panel (§7.5)
├── Request Detail Section
│   ├── Team and ownership fields
│   ├── Additional metadata (all request fields not in core summary)
│   └── HbcComplexityGate standard: operational fields (timestamps, step status)
├── History and Audit Section
│   ├── HbcAuditTrailPanel or HbcStatusTimeline
│   └── HbcComplexityGate standard: full transition history
└── Action Panel (sticky on desktop, section on mobile/tablet — see T07)
    ├── Approve
    ├── Request Clarification
    ├── Place on Hold
    └── Route to Admin (when state is Failed)
```

### 7.3 Core Summary Section

Fields that must always be visible (no complexity gate):

| Field | Source | Component |
|-------|--------|-----------|
| Project Name | `request.projectName` | `HbcTypography` heading |
| Department | `request.department` | `HbcTypography` |
| Project Type | `request.projectType` | `HbcTypography` |
| Project Stage | `request.projectStage` | `HbcTypography` |
| State | `request.state` | `HbcStatusBadge` |
| Current Owner / Action | BIC config | `HbcBicDetail` |
| Submitted By | `request.submittedBy` | `HbcTypography` |
| Submitted At | `request.submittedAt` | `HbcTypography` (formatted) |

### 7.4 Request Detail Section

The full request field set is presented in a structured read-only form using `HbcCard` sections:

- **Team**: `groupMembers` list, `opexManagerUpn`
- **Site and structure** (once G1-T01 add-ons are in scope): selected add-ons, department library selection

Under `HbcComplexityGate minTier="standard"`:
- Provisioning step history (if any steps have run)
- Internal request ID (`request.requestId`)
- Last-updated timestamp

### 7.5 Action Affordances Panel

The action panel contains the controller's decision options. It must be clearly separated visually from the read-only content — use a `HbcPanel` (side panel) or a sticky bottom bar on desktop, depending on T07's layout specification.

**Action: Approve**
- Button: `HbcButton` variant `primary` labeled "Approve Request"
- Confirmation: `HbcConfirmDialog` before executing — "Approve this project setup request? This will move the request to 'Ready to Provision' (or 'Awaiting External Setup' if an external setup step is needed)."
- API call: `client.approveRequest(requestId)` — must exist on provisioning API client
- On success: navigate back to queue (`/project-review`)
- On failure: `HbcBanner` variant `error` in the page body

**Action: Request Clarification**
- Button: `HbcButton` variant `secondary` labeled "Request Clarification"
- Interaction: Opens `HbcModal` or `HbcPanel` (not a full page navigation) with:
  - A multi-line `HbcInput` or text area for clarification note (what specifically needs to be corrected)
  - A step/field selector that allows the controller to flag specific steps (populated from the `IStepWizardConfig` step list from G3-T01) — optional at Wave 0; may default to free-text only
  - "Submit Clarification" and "Cancel" buttons
- API call: `client.requestClarification(requestId, { note, flaggedSteps? })` — must exist on provisioning API client
- On success: request state transitions to `NeedsClarification`; navigate back to queue

**Action: Place on Hold**
- Button: `HbcButton` variant `secondary` labeled "Place on Hold"
- Confirmation: `HbcConfirmDialog` — "Hold this request? It will remain in review state but marked as on hold."
- API call: `client.holdRequest(requestId)` — if this is not a distinct API call, use a note/flag mechanism on the existing update endpoint
- On success: request updates with a hold indicator

**Action: Route to Admin** (visible only when `request.state === 'Failed'`)
- Button: `HbcButton` variant `secondary` labeled "Send to Admin"
- No confirmation required (non-destructive action)
- Navigates to the Admin app's provisioning failures surface (see T07 for cross-app navigation URL)
- Does not change request state — the action is a cross-app navigation for the controller's benefit

### 7.6 History and Audit Section

The history section renders the full lifecycle event log for the request using `HbcAuditTrailPanel` from `@hbc/ui-kit`. If `HbcAuditTrailPanel` is not yet implemented in `@hbc/ui-kit`, it must be added there before T03 uses it.

**Minimum history fields per event:**
- Event type (state transition, clarification request, hold, approval, retry)
- Actor (user who triggered the event)
- Timestamp
- Notes/payload (clarification note text, if applicable)

**Default state:** Collapsed with "Show History" trigger. Expanded on click.

Under `HbcComplexityGate minTier="standard"`:
- Full event payload (including raw transition metadata)
- Internal identifiers

---

## 8. What This Surface Consumes from G3

| G3 Output | How T03 Uses It |
|-----------|-----------------|
| BIC config (G3-T02) | `HbcBicDetail` in core summary; queue sort order via urgency |
| Canonical action contract (G3-T02) | Action descriptions in the BIC detail section |
| Notification specs (G3-T04) | When controller submits clarification, notification fires via provisioning API (not directly from UI) |
| Complexity gate spec table (G3-T06) | Which fields are gated at `standard` tier in the review surface |

---

## 9. What Belongs Here vs. Admin

| Capability | Review Surface (T03) | Admin Surface (T04) |
|-----------|---------------------|---------------------|
| Approve/reject a submitted request | ✓ | — |
| Request clarification from requester | ✓ | — |
| View full request fields and history | ✓ | ✓ (with more operational depth) |
| Retry a failed provisioning step | — | ✓ (bounded) |
| Force-retry structural/permissions failures | — | ✓ (admin-class) |
| Archive/suppress failure records | — | ✓ |
| Navigate to Admin from a failed request | ✓ (navigation only) | — |
| Provision oversight dashboard (all active runs) | — | ✓ |
| System settings and escalation configuration | — | ✓ |

The review surface must not grow provisioning retry buttons, failure investigation tools, or admin configuration access. Any capability request that would blur this table requires a design review and an ADR before implementation.

---

## 10. `@hbc/ui-kit` Component Assignments

| Review Surface Element | Required Component | Notes |
|------------------------|-------------------|-------|
| Page shell | `WorkspacePageShell layout="list"` (queue) / `"detail"` (review) | Existing pattern |
| Queue table | `HbcDataTable<IProjectSetupRequest>` | Coordinator queue |
| State badge | `HbcStatusBadge` | All status displays |
| BIC ownership | `HbcBicDetail` | Full ownership context |
| History/audit | `HbcAuditTrailPanel` or `HbcStatusTimeline` | If not in ui-kit: add it |
| Approve button | `HbcButton variant="primary"` | Approve action |
| Clarify / Hold / Admin buttons | `HbcButton variant="secondary"` | Secondary actions |
| Approve confirmation | `HbcConfirmDialog` | Before approve API call |
| Clarification input | `HbcModal` + `HbcInput` (multi-line) | Clarification note entry |
| Action failure banner | `HbcBanner variant="error"` | On API failure |
| Success toast | `HbcToast` | After successful approve/clarify |
| Empty state | `HbcEmptyState` | Empty queue |
| Filter tabs | `HbcTabs` | Queue state filters |
| Complexity gate | `HbcComplexityGate` | Operational detail gates |
| Field rows | `HbcTypography` + `HbcCard` | Read-only field display |

**Primitives requiring `@hbc/ui-kit` addition if missing:** `HbcAuditTrailPanel` — verify existence in `packages/ui-kit/src/` before T03 implements the history section. If absent, create it in `@hbc/ui-kit` first.

---

## 11. Known Risks and Pitfalls

**R1 — Controller provisioning API methods may not exist:**
`approveRequest`, `requestClarification`, and `holdRequest` may not be present on the provisioning API client. These endpoints must exist in the backend and the API client before T03 implementation proceeds. Identify gaps early and raise them as G2/backend dependencies.

**R2 — `HbcAuditTrailPanel` not confirmed in `@hbc/ui-kit`:**
The audit trail panel is a specific rendering of event history. If `@hbc/ui-kit` only has `HbcStatusTimeline`, verify whether it satisfies the history display requirements. If neither exists, create `HbcAuditTrailPanel` in `@hbc/ui-kit` before T03 implementation.

**R3 — Clarification step-flagging requires G3-T01 step list:**
The clarification modal's step selector depends on the `IStepWizardConfig<IProjectSetupRequest>` step names from G3-T01. If G3-T01 is not locked, the step selector can default to free-text only for Wave 0 — but the architecture must support adding the step selector when G3-T01 is locked.

**R4 — Navigation back to queue on action:**
After approve or clarification submission, the page navigates back to the queue. This requires TanStack Router's `useNavigate()` hook. Ensure the navigation happens after the API response resolves — not before.

---

## 12. Acceptance Criteria

T03 is complete when all of the following are true:

- [ ] `ProjectReviewQueuePage.tsx` exists in `apps/accounting/src/pages/` with `HbcDataTable` queue
- [ ] `ProjectReviewDetailPage.tsx` exists in `apps/accounting/src/pages/` with full review composition
- [ ] Both routes are registered in `apps/accounting/src/router/routes.ts`
- [ ] Approve, Request Clarification, Hold, and Route-to-Admin actions are implemented
- [ ] All actions call provisioning API client methods (no bespoke fetch calls)
- [ ] `HbcAuditTrailPanel` (or equivalent) renders history in review surface
- [ ] `HbcBicDetail` renders in core summary
- [ ] Operational detail is gated at `standard` tier via `HbcComplexityGate`
- [ ] No retry/recovery actions in the review surface
- [ ] No hardcoded role-check logic outside `@hbc/auth` / `@hbc/complexity`
- [ ] No app-local reusable UI component systems
- [ ] Build, lint, and type-check pass
- [ ] Reference document exists at `docs/reference/spfx-surfaces/controller-review-surface.md`

---

*End of W0-G4-T03 — Accounting/Controller Queue and Structured Review Surface v1.0*
