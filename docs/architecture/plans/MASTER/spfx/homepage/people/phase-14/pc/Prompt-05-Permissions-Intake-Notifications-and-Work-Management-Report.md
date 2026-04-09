# Prompt 05 — Permissions, Intake, Notifications, and Work Management Report

Phase-14 · People & Culture + HR Operating Companion implementation
package.

Deliverable for
[`Prompt-05-Permissions-Intake-Notifications-and-Work-Management.md`](./Prompt-05-Permissions-Intake-Notifications-and-Work-Management.md).
This prompt lands reducer-level role enforcement, a dedicated intake
triage tab, a notification runtime, queue-health signals, and
targeting guardrails for the People & Culture HR operating companion.
Preserves the strict HB Kudos boundary.

## 1. Permission Model Implemented

The two-role model (`editor` vs `approver`/`admin`) already had
UI-layer gating from Prompt-03 via `hasPeopleCultureCapability` inside
`ApprovalsSection.tsx` and `HomepageSection.tsx`. Prompt-05 adds the
**second layer**:

- **Reducer-level capability guard** in
  `apps/hb-webparts/src/webparts/peopleCultureCompanion/PeopleCultureCompanion.tsx`:
  a new `ACTION_CAPABILITY_REQUIREMENTS` map pairs every mutation
  action with the capability it requires. The shell now wraps the
  raw `rawDispatch` in a `useCallback`-memoized `dispatch` that
  silently drops any action whose required capability is absent for
  the current role. `replaceState` has no requirement and always
  passes. This means a direct `dispatch(…)` from test or future
  code cannot bypass UI gating — the guard is the authoritative
  enforcement point.

- **Editor-role read-only banner** rendered whenever
  `currentUserRole === 'editor'`:
  > "You are signed in as an Editor. Approval, pin/tier,
  > suppress/archive, and intake triage actions are read-only for
  > your role."
  This makes the role restriction visible to HR editors at a glance
  without them having to discover it via disabled buttons.

- Capability pairings (see `ACTION_CAPABILITY_REQUIREMENTS`):

  | Action | Required capability |
  |---|---|
  | `updateItem` | `canEdit` |
  | `approveItem` | `canApprove` |
  | `rejectItem` | `canResolveApprovals` |
  | `claimApproval` | `canClaimApproval` |
  | `reassignApproval` | `canReassignApproval` |
  | `suppressItem` | `canSuppress` |
  | `archiveItem` | `canUnpublish` |
  | `pinItem` | `canPin` |
  | `setHomepageTier` | `canManageHomepage` |
  | `acceptMilestoneCandidate` | `canResolveApprovals` |
  | `suppressMilestoneCandidate` | `canSuppress` |
  | `promoteIntake` | `canResolveApprovals` |
  | `declineIntake` | `canResolveApprovals` |
  | `returnIntakeForChanges` | `canResolveApprovals` |

  Editors pass through read-only actions only (`updateItem`
  requires `canEdit`, which editors hold).

## 2. Work-Management Behavior Implemented

Work management in the companion stays **operational and narrow**,
matching the Decision-Lock Appendix rule that the companion must not
become a heavy ticketing system:

- **Approval-only claim / reassignment** remains unchanged from
  Prompt-03 — claim/reassign only mutates items currently in
  `needsApproval`. Live and scheduled items stay unassigned. Claim
  ownership is still encoded as an `approval-owner:<name>` tag on
  the item; the notification builder surfaces that owner as the
  content-owner recipient for lifecycle transitions.
- **Notification runtime** (see §4) routes lifecycle transitions to
  the correct operator / owner cohorts without introducing any
  per-item assignment graph.
- **Intake triage** (see §3) is the only other work-management
  surface, and it is intentionally bounded to the limited non-HR
  intake model.

## 3. Intake Behavior Implemented

New dedicated **Intake** tab implemented via
`apps/hb-webparts/src/webparts/peopleCultureCompanion/sections/IntakeSection.tsx`.

Behavior:

- **Submitter role enforcement.** `PeopleCultureIntakeSubmitterRole`
  (`manager` / `leader` / `businessPartner`) is surfaced on each
  row as a badge so HR can see the submitter class at a glance.
  There is no open all-employee intake path; the submitter role is
  the only gate for appearing in the queue in the first place.
- **"Submitters never publish directly" banner.** A prominent
  `data-hbc-companion-intake-banner="hr-gate"` note is rendered at
  the top of the Intake panel:
  > "Submitters never publish directly. HR is always the gate."
- **Grouped review states.** Submissions are grouped by
  `PeopleCultureIntakeReviewState` in priority order: `awaitingHrReview`
  → `returnedForChanges` → `acceptedIntoDraft` → `declined`. Empty
  buckets are hidden.
- **Triage actions** on every pending row (gated by
  `canResolveApprovals`):
  - **Accept into draft** — promotes the submission into a PC
    draft item (reducer action `promoteIntake`, capability
    `canResolveApprovals`). Optional review notes captured from an
    inline input.
  - **Return for changes** — captures **required** review notes
    and flips the submission to `returnedForChanges` via the new
    reducer action `returnIntakeForChanges`.
  - **Decline** — terminal decline with optional notes. Reducer
    action `declineIntake`.
- **Editor role read-only.** When `currentUserRole === 'editor'`
  the triage panel is hidden entirely; editors see the queue and
  review notes but not the action buttons. A unit test asserts
  that the decline button is absent in editor mode.
- **Overview handoff.** The Overview panel now renders an "Open
  intake (N)" button that routes to the new tab, so HR can jump
  into full triage in one click from the dashboard.

## 4. Notification Behavior Implemented

**New file:**
`apps/hb-webparts/src/homepage/helpers/peopleCultureNotificationBuilder.ts`.

Pure derivation from the item set into
`PeopleCultureNotificationEvent[]`. Rules (per Decision-Lock Appendix):

| Trigger | Recipient cohort | Reason |
|---|---|---|
| `submitted` | editor + approver (operators) | Queue handoff |
| `approved` | submitter + contentOwner | Status update |
| `scheduled` | submitter + contentOwner | Status update |
| `published` | submitter + contentOwner | Status update |
| `rejected` | submitter + contentOwner | Status update |
| `revisionRequested` | submitter + contentOwner | Status update |
| `expired` | editor + approver (operators) | Re-triage |

**Featured people are never auto-notified.** The builder explicitly
filters out any recipient whose id matches `item.personRef?.id`, even
if that person happens to also be the submitter or content owner.
A unit test asserts the filter.

**Deterministic ids** (`nf:<itemId>:<trigger>:<recipientKind>`) plus
a `dedupeAgainst` option make re-runs idempotent — the builder never
emits a duplicate event the caller has already processed.

**New file:**
`apps/hb-webparts/src/webparts/peopleCultureCompanion/sections/NotificationsSection.tsx`.

Companion tab that renders the notification list filtered for the
current viewer via `filterNotificationsForViewer`:

- **Admin** sees everything.
- **Approver** sees operator-cohort events (editor + approver) plus
  any event whose recipient matches the viewer's email/id.
- **Editor** sees editor-cohort events plus own-identity events —
  but explicitly not approver-only events.

The UI is **observational only**: no actions, no claim, no assign.
Actions happen in the relevant section (Approvals / Content family /
Homepage). Each event row carries `data-hbc-companion-notification-*`
attributes so tests and downstream tooling can assert on trigger,
recipient kind, and item id.

## 5. Overview / Queue Validation Performed

**Queue health signal** added to
`buildCompanionOverview`. `PeopleCultureCompanionOverview` now
carries a `queueHealth: PeopleCultureQueueHealth` field computed by
the new `deriveQueueHealth` helper:

- `healthy` — all signals below their watch thresholds.
- `watch` — at least one signal at or above its watch threshold.
- `attention` — at least one signal at or above its attention
  threshold.

Default thresholds (configurable via
`BuildCompanionOverviewOptions.queueHealthThresholds`):

| Signal | Watch | Attention |
|---|---|---|
| Pending approvals | ≥ 3 | ≥ 6 |
| Expiring soon | ≥ 2 | ≥ 5 |
| Homepage conflicts | ≥ 1 | ≥ 3 |

**Overview panel enhancements** in `sections/OverviewSection.tsx`:

- New **Queue health** header + card grid at the top of the panel
  showing the aggregate health label plus pending-approvals,
  expiring-soon, and homepage-conflicts counts.
- New toolbar with **Open notifications (N)** and **Open intake
  (N)** buttons that route to the Prompt-05 tabs.
- `data-hbc-companion-queue-health` attribute on the overview panel
  so tests can assert the current state.

**Targeting guardrails** helper at
`apps/hb-webparts/src/homepage/helpers/peopleCultureTargetingGuardrails.ts`.
`detectTargetingRisks(items, options)` returns a
`Map<itemId, PeopleCultureTargetingRiskReason>` that surfaces three
conditions:

| Reason | Condition |
|---|---|
| `emptyTargetedAudience` | Scope is `targeted` but tags are empty or blank. |
| `unknownDimension` | Scope references a dimension not in the known set. |
| `outOfTaxonomyValue` | Scope references a dimension/value pair absent from the tenant taxonomy. |

The helper is wired as an **optional guardrail** — Prompt-05 ships
it alongside `detectHomepageConflicts` so future prompts can promote
the risks into a companion data attribute and a dashboard card
without further helper plumbing.

**Verification performed:**

- `apps/hb-webparts` `npm run check-types`: **clean**.
- `apps/hb-webparts` `npm run lint`: **clean**.
- `apps/hb-webparts` `npm run build` (tsc + vite): **clean**. Bundle
  grew **649 KB → 661 KB** accommodating the Prompt-05 runtime.
- New `peopleCulturePermissionsAndIntake.test.tsx`: **28 / 28** pass
  covering:
  - Notification builder recipient rules for every trigger
    (`submitted` / `approved` / `scheduled` / `published` /
    `rejected` / `revisionRequested` / `expired`)
  - Featured-person exclusion
  - Dedupe against prior emits
  - Viewer filtering for admin / approver / editor roles
  - Email-based own-identity matching
  - Targeting guardrails: empty, unknown dimension, out-of-taxonomy
  - Company-wide and in-taxonomy items not flagged
  - `deriveQueueHealth` bucketing at watch + attention thresholds
    with default and custom thresholds
  - Companion shell renders Notifications, Intake, Preview tabs
  - Overview "Open notifications" button routes to Notifications
  - Intake section renders HR-gate banner and buckets
  - Return-for-changes action flips submission state via reducer
  - Editor read-only banner rendered for editor role
  - Editor approve button disabled
  - Editor intake decline button not rendered
  - Overview exposes `queueHealth` data attribute
  - Notifications section renders for approver role
- Prompt-01..04 regression suites re-verified:
  - `peopleCultureSplitModel.test.ts`: 36 / 36 pass
  - `peopleCulturePublicRuntime.test.tsx`: 16 / 16 pass
  - `peopleCultureCompanionRuntime.test.tsx`: 16 / 16 pass (after
    updating the top-level-tabs assertion to include the new
    Notifications and Intake tabs)
  - `peopleCultureMediaAndPreview.test.tsx`: 18 / 18 pass
- Full `apps/hb-webparts` suite: **228 passing**, 14 pre-existing
  failures in unrelated test files (`bundleBudget`,
  `compositionPreview`, `discoveryWebpart`, `interactiveStates`,
  `motionAndAccessibility`, `operationalAwarenessWebparts`,
  `topBandWebparts`, `utilityWebparts`) confirmed to pre-exist on
  main. Delta vs. Prompt-04: **+28 passing tests**.
- `PeopleCultureCompanionWebPart.manifest.json`: bumped
  `0.0.2.0` → `0.0.3.0`.
- `apps/hb-webparts/config/package-solution.json`: bumped
  `1.0.0.117` → `1.0.0.118` (solution + feature in lockstep).
- `hb-webparts.sppkg` rebuilt via
  `npx tsx tools/build-spfx-package.ts --domain hb-webparts`. All
  14 shim entries preserved (no new webparts). `.sppkg` structure
  re-verified; final package **3023.9 KB**. Release asset hashes
  regenerated end-to-end from the new bundle
  (`hb-webparts-app-03827794.js`).

## Report Back Summary

1. **Permission model.** Reducer-level capability guard via
   `ACTION_CAPABILITY_REQUIREMENTS` blocks unauthorized dispatches
   regardless of UI gating. Editor read-only banner surfaces the
   role restriction. All 14 capability flags pair 1:1 with reducer
   actions.
2. **Work management.** Claim / reassignment stays bounded to
   approval work (unchanged from Prompt-03). Notifications route
   lifecycle transitions without introducing a per-item assignment
   graph. No heavy ticketing.
3. **Intake.** New dedicated Intake tab with HR-gate banner,
   review-state bucket grouping, and Accept-into-draft / Return
   for changes / Decline actions. Editor role sees the queue
   read-only. Overview handoff button links to the new tab.
4. **Notifications.** New deterministic notification builder with
   per-trigger recipient rules, featured-person exclusion, dedupe
   support, and a viewer-aware filter. New Notifications section
   renders events for the current viewer observationally.
5. **Overview / queue validation.** New `queueHealth` label on
   `PeopleCultureCompanionOverview` driven by `deriveQueueHealth`.
   Overview panel surfaces the health card plus pending /
   expiring / conflict counts and Prompt-05 tab handoffs.
   Targeting guardrails helper ships alongside for downstream
   promotion.
