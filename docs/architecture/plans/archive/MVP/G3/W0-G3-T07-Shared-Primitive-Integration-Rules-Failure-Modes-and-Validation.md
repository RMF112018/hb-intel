# W0-G3-T07 — Shared Primitive Integration Rules, Failure Modes, and Validation

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 3 task plan defining how the six shared primitive packages interact without overlap, the failure modes at every integration seam, degraded behavior expectations, and the validation checklist G4/G5 must pass before implementation is considered integration-complete.

**Phase Reference:** Wave 0 Group 3 — Shared-Platform Wiring and Workflow Experience Plan
**Depends On:** T01 through T06 (all prior G3 contracts must be stable before this task is finalized)
**Unlocks:** T08 (failure-mode tests), G4/G5 entry condition T07 (complete integration validation checklist)
**Repo Paths Governed:** All six shared primitive packages + consuming app surfaces + provisioning package

---

## Objective

This task assembles the complete integration picture across all six shared packages and defines what must be true about their interactions for the project setup workflow to function correctly as a composed system.

Each of T01–T06 specified a contract for one package in isolation. T07 asks: when all six contracts run together, what are the interaction risks, failure modes, and degraded-state behaviors? And what must a G4/G5 implementation team validate to prove the integration is correct?

---

## Why This Task Exists

Individual package contracts are necessary but not sufficient. Real integration failures emerge at seams between packages:
- The step-wizard calls `onAllComplete`, but the session-state draft is not yet cleared when the provisioning API call fails — what happens?
- The BIC config's `resolveCurrentOwner` returns null for a system-owned state, but the notification payload requires a non-null `recipientUserId` — what prevents a runtime error?
- The complexity gate hides the operational detail panel, but the admin needs to see it urgently during an incident — is there a mechanism to temporarily elevate?
- The handoff package fires a BIC transfer on send, but the BIC config has not been updated to handle the `HandoffStatus === 'sent'` case — is ownership ambiguous?

T07 identifies these seams, specifies the failure modes, and defines the degraded behavior that prevents failures from cascading.

---

## Scope

T07 specifies:
- Integration rules between each pair of shared packages that interact
- Failure mode catalog (one entry per identified failure mode)
- Degraded behavior specification (what should happen when a package fails or returns unexpected results)
- Package boundary drift prevention rules
- The complete integration validation checklist for G4/G5

T07 does not specify:
- Backend provisioning saga failure handling (MVP Project Setup T05 and T07 scope)
- Network-level failure handling beyond session-state's offline queue
- Error recovery UI design (G4/G5 scope)

---

## Part 1 — Integration Rules Between Packages

### Rule 1 — `@hbc/step-wizard` ↔ `@hbc/session-state`

**Expected interaction:** The wizard uses `useDraft` (via `draftKey` config prop) to persist step statuses and form values automatically. On wizard mount, draft is loaded. On step completion, draft is updated. On wizard completion, the surface clears the draft.

**Integration rule:** The wizard must NOT be responsible for deciding when to clear the draft. The consuming surface must call `clearDraft(draftKey)` after the API submission succeeds. If the wizard's `onAllComplete` is used to trigger submission and the submission fails, the draft must be retained.

**Anti-pattern to prevent:** Do not call `clearDraft` inside `IStepWizardConfig.onAllComplete`. That callback fires when the wizard reports all steps complete — before the API call. Clearing the draft there would lose the user's data on API failure.

---

### Rule 2 — `@hbc/bic-next-move` ↔ `@hbc/notification-intelligence`

**Expected interaction:** When BIC transfers (owner changes), a notification event is fired. For the project setup workflow, this is governed by the lifecycle transitions, not by the BIC package directly. The backend fires the notification when the state transition is recorded.

**Integration rule:** BIC transfer and notification dispatch are separate concerns. `useBicNextMove` resolves the current owner from the request state — it does not fire notifications. Notifications are fired by the backend state transition handlers (T04). The frontend BIC badge always reflects the current server state (via polling or SignalR).

**Anti-pattern to prevent:** Do not wire frontend BIC transfer events to directly call `NotificationApi.send()`. That would double-fire notifications (once from the frontend, once from the backend). All notification dispatch for ownership changes originates from the backend.

---

### Rule 3 — `@hbc/step-wizard` ↔ `@hbc/bic-next-move`

**Expected interaction:** Each wizard step may have a `resolveAssignee` function that returns the BIC owner for that step. When a step is `in-progress`, the assignee is the current step owner. When the step completes, the BIC transfers to the next step's assignee.

**Integration rule for project setup:** The setup intake form (Steps 1–5) is owned entirely by the requester. There is no per-step assignee change within the form steps. The BIC transfer at the workflow level (requester → controller) happens at form submission — not at step completion. The `resolveAssignee` prop in the project setup wizard config should be omitted (all steps are requester-owned).

**Integration rule for clarification return:** During clarification return, the requester owns all steps again. No per-step assignee transfer. The BIC transfer back to the controller happens at resubmission.

**Anti-pattern to prevent:** Do not wire step completion to BIC transfers in the setup wizard. BIC ownership for the setup workflow is determined by `deriveCurrentOwner()` at the lifecycle level, not at the individual step level.

---

### Rule 4 — `@hbc/workflow-handoff` ↔ `@hbc/bic-next-move`

**Expected interaction:** When a handoff is sent (`HandoffApi.send()`), BIC automatically transfers to the handoff recipient. When the handoff is acknowledged, BIC transfers to the new record owner in the destination module. When the handoff is rejected, BIC returns to the sender.

**Integration rule:** The BIC config (T02) must handle the case where `workflowStage === 'Completed'` AND an active outbound handoff exists. In that state, `resolveCurrentOwner()` must return the handoff recipient (not the requester). This case was identified in T02 and must be verified in the integration test.

**Integration rule for rejection:** When a handoff is rejected, `onRejected` returns the request to coordinator review. The BIC must subsequently show the request's coordinator/controller as the owner. The state transition in `onRejected` must trigger the state machine update before the next BIC resolution.

**Anti-pattern to prevent:** Do not resolve BIC ownership from the handoff status field alone. The `resolveCurrentOwner` function must check `workflowStage` first (primary signal) and the active handoff as a secondary signal. If both disagree, `workflowStage` governs.

---

### Rule 5 — `@hbc/notification-intelligence` ↔ `@hbc/workflow-handoff`

**Expected interaction:** When `HandoffApi.send()` is called, the workflow-handoff package fires `provisioning.handoff-received` to the recipient. When `HandoffApi.acknowledge()` is called, it fires `provisioning.handoff-acknowledged` to the sender. These notifications use `NotificationApi.send()` internally.

**Integration rule:** The handoff package must register `provisioning.handoff-received` and `provisioning.handoff-acknowledged` event types via `NotificationRegistry.register()` at initialization. These registrations are part of the T04 notification registration table and must be present before any handoff is sent.

**Anti-pattern to prevent:** Do not send handoff notifications from the consuming surface independently. The handoff package handles its own notification dispatch. The surface should only call the handoff API methods and trust that notifications are fired correctly.

---

### Rule 6 — `@hbc/complexity` ↔ All Other Packages

**Expected interaction:** The complexity tier is a global context. Every complexity-gated component reads the current tier from `ComplexityProvider`. BIC badges use the tier to choose compact vs. full display. History expansion is available only at Standard+. Operational detail is gated at Expert.

**Integration rule:** `ComplexityProvider` must be mounted **at app root** (or webpart root for SPFx), not inside individual components or routes. This ensures the tier is consistent across all surfaces within the same session.

**Integration rule for the notification center:** At Essential tier, `HbcNotificationCenter` shows only `immediate`-tier notifications. This is appropriate — Essential users should not be overwhelmed by watch/digest notifications. This behavior is governed by the complexity package's integration with `@hbc/notification-intelligence`, not by the consuming surface.

**Anti-pattern to prevent:** Do not gate complexity at the page or route level using `if (tier === 'expert') return <AdminView />`. The complexity gate must be at the individual field or section level, not at the entire view level. Switching tiers should progressively reveal more within the same view — not navigate the user to a different page.

---

### Rule 7 — `@hbc/session-state` ↔ `@hbc/notification-intelligence`

**Expected interaction:** When the user dismisses or reads notifications while offline, those actions are queued in the session-state operation queue and replayed on reconnect.

**Integration rule:** The notification package's read/dismiss mutations must call `queueOperation({ type: 'notification-action', ... })` when `useConnectivity()` returns `'offline'` or `'degraded'`. This is the session-state package's job when the notification package calls it — the consuming surface does not need to orchestrate this.

**Anti-pattern to prevent:** Do not silently discard notification read/dismiss events when offline. The user expects their "read" action to persist even if the network was unavailable at the time.

---

## Part 2 — Failure Mode Catalog

### FM-01: `useDraft` Returns Null (IndexedDB Unavailable)

**Scenario:** IndexedDB is unavailable (private browsing mode, storage quota exceeded, browser restriction).

**Expected degradation:** Form functions normally. Auto-save is silently disabled. Draft-saved indicator is hidden. No error is thrown. If the user navigates away, data is lost (expected — no storage available).

**G4/G5 requirement:** The consuming surface must handle `useDraft` returning null for `savedDraft` gracefully. `null` draft = initialize empty form. Do not crash.

---

### FM-02: BIC `resolveCurrentOwner` Returns Null

**Scenario:** The request is in `ReadyToProvision` or `Provisioning` state (system-owned).

**Expected degradation:** BIC badge shows "In Progress" (or system indicator) instead of a named owner. `HbcBicBadge` must handle `currentOwner === null` without rendering an unassigned warning (this is an expected system state, not an accountability gap).

**G4/G5 requirement:** The BIC config's `resolveCurrentOwner` returns null for system states (T02). The surface must not crash. The `HbcBicBadge` component handles null owner gracefully (renders system indicator).

---

### FM-03: Notification Registration Missing for an Event Type

**Scenario:** A backend state transition fires `NotificationApi.send()` with `eventType: 'provisioning.step-completed'`, but the frontend has not yet registered this event type via `NotificationRegistry.register()`.

**Expected degradation:** The backend delivers the notification (it does not depend on frontend registration). The frontend notification center receives the event but cannot display a description label for it (it falls back to the raw event type string). User receives the notification but sees the eventType key instead of a human-readable description.

**G4/G5 requirement:** All event types in the T04 registration table must be registered at app initialization before the notification center is displayed. This is verified in T08.

---

### FM-04: Handoff `validateReadiness` Fails at Assembly Time

**Scenario:** The user attempts to initiate the Estimating → Project Hub handoff, but `validateReadiness(request)` returns a non-null error (e.g., site URL not yet available because provisioning completed but the URL update has not yet synced to the frontend).

**Expected degradation:** `HbcHandoffComposer` displays the blocking error from `validateReadiness`. The "Send Handoff" CTA is disabled. The user cannot send the handoff until the blocking condition is resolved. No error is thrown; the UI remains usable.

**G4/G5 requirement:** The surface must not hide the pre-flight result. It must display `preflight.blockingReason` to the user with guidance on how to resolve it.

---

### FM-05: Step-Wizard `onAllComplete` Fires but API Submission Fails

**Scenario:** The wizard reports all steps complete, `onAllComplete` fires, the surface calls `ProjectSetupApi.submit()`, and the API call returns an error.

**Expected degradation:** Draft is NOT cleared. The form remains on the Review step. An error message is displayed. The user can retry submission. All entered values remain intact.

**G4/G5 requirement:** Draft clearing must be conditional on API success (Rule 1). The surface must catch the API error and display it without clearing the form.

---

### FM-06: Clarification Draft TTL Expires Before Response

**Scenario:** The requester opens the clarification return form, starts entering responses, then does not return for 8+ days. The 7-day clarification draft TTL expires.

**Expected degradation:** On return, `useDraft` returns null. The surface falls back to loading from the server record (the original submitted request values). The requester's in-progress clarification response notes are lost. The step statuses are re-derived from the open clarification annotations (as if opening clarification return for the first time).

**G4/G5 requirement:** The surface must display a message: "Your previous responses were saved temporarily and have expired. Please review the clarification requests and respond again." This message must be shown when the draft is null but the request is still in `NeedsClarification` state.

---

### FM-07: BIC Module Registration `queryFn` Fails for One Module

**Scenario:** When My Work ships and calls each module's `queryFn`, the provisioning module's API returns a 500 error.

**Expected degradation:** Per `@hbc/bic-next-move` module registry design, a failed module is reported in `IBicMyItemsResult.failedModules[]` but does not block other modules from being displayed. My Work continues to show items from other modules.

**G4/G5 requirement (interim):** The `queryFn` in the BIC module registration must handle API errors gracefully and return an empty items array (not throw). The error should be logged but not propagated.

---

### FM-08: `@hbc/complexity` Cannot Derive Tier from Role (No AD Group Match)

**Scenario:** A user's Azure AD groups do not match any entry in `roleComplexityMap.ts`. The complexity package cannot derive a tier from role.

**Expected degradation:** Complexity tier falls back to `'essential'` (the configured `fallbackTier`). The user sees the minimum information set. They can manually adjust to Standard or Expert via `HbcComplexityDial` if they need more detail.

**G4/G5 requirement:** The `ComplexityProvider` must be configured with a `fallbackTier` of `'essential'`. The Essential tier must show all universally-visible fields (core summary). The fallback must not blank out the page.

---

### FM-09: SignalR Disconnected During Provisioning

**Scenario:** The requester is watching their provisioning status page. SignalR disconnects mid-provisioning (network hiccup, token expiry, firewall).

**Expected degradation:** The provisioning status page falls back to polling (`GET /api/provisioning-status/{projectId}` every 30 seconds). The `isPollingFallbackRequired` flag on `IProvisioningStatus` is set to true. The page displays "Live updates paused — checking every 30 seconds" (or equivalent, per `HbcConnectivityBar` behavior).

**G4/G5 requirement:** The status page must implement the polling fallback. It must not show a broken/stuck progress bar when SignalR disconnects. This is governed by MVP Project Setup T05 (orchestrator); T07 (G3) identifies it as an integration point with `@hbc/session-state`'s connectivity detection.

---

### FM-10: Handoff Recipient Cannot Be Resolved

**Scenario:** `resolveRecipient(request)` in the handoff config cannot resolve a valid BIC owner because `request.projectLeadId` is null or the user no longer exists in the directory.

**Expected degradation:** `usePrepareHandoff` returns `preflight.blockingReason: 'Project lead is not assigned. Update the project team before handoff.'` The handoff is blocked. No recipient ambiguity.

**G4/G5 requirement:** The surface must display the blocking reason and provide a direct link to the Project Team step so the user can update the project lead before initiating the handoff.

---

## Part 3 — Package Boundary Drift Prevention

The following patterns indicate boundary drift and must be caught in code review:

| Anti-pattern | Why it's a violation | Correct pattern |
|-------------|---------------------|-----------------|
| Form validation in `IStepWizardConfig.onAllComplete` | `onAllComplete` is a notification event, not a validation gate | Validation belongs in each step's `validate()` function |
| `NotificationApi.send()` called from frontend surface for lifecycle events | Double-fires with backend dispatch | Backend fires all lifecycle notifications; frontend fires only UI-originated actions |
| `if (tier === 'admin') show(...)` in JSX | Hardcoded role check bypasses complexity gating | Use `HbcComplexityGate minTier="expert"` |
| Draft cleared before API call succeeds | Loses user data on API failure | Clear draft only on successful API response |
| New `IMyWorkItem` aggregation surface in any G4/G5 app | Conflicts with future My Work implementation | Use BIC badges + notification center as interim; no custom work-item aggregation |
| `useBicNextMove` config duplicated per surface | Multiple sources of truth for ownership semantics | Define config once, import everywhere |
| Handoff notification sent independently by surface | Double-fires with workflow-handoff package dispatch | Let workflow-handoff package send its own notifications |

---

## Part 4 — Integration Validation Checklist

G4/G5 implementation teams must verify all items in this checklist before the project setup UX is considered integration-complete and eligible for pilot deployment.

**Step-Wizard Integration:**
- [ ] `useStepWizard` is wired to `IProjectSetupRequest` with `PROJECT_SETUP_WIZARD_CONFIG`
- [ ] `draftKey` is set to `'project-setup-form-draft'` for new requests
- [ ] `draftKey` is set to `'project-setup-clarification-{requestId}'` for clarification returns
- [ ] `onAllComplete` does NOT clear the draft
- [ ] The consuming surface clears the draft after successful API submission

**BIC Integration:**
- [ ] `useBicNextMove(request, PROJECT_SETUP_BIC_CONFIG)` is wired in all three surfaces (estimating, accounting, admin)
- [ ] `HbcBicBadge` is rendered in list views; `HbcBicDetail` is rendered in detail views
- [ ] Null owner (system states) renders gracefully without warning badges
- [ ] `registerBicModule('provisioning', ...)` is called at app initialization
- [ ] The BIC config is imported from a single shared location (not duplicated per surface)

**Notification Integration:**
- [ ] `NotificationRegistry.register([...])` is called at initialization with all 12 event types from T04
- [ ] `HbcNotificationBadge` is mounted in the app header
- [ ] `HbcNotificationCenter` is accessible (modal/panel in header)
- [ ] `HbcNotificationBanner` is mounted for `immediate`-tier banners
- [ ] No frontend surface calls `NotificationApi.send()` for lifecycle events

**Handoff Integration:**
- [ ] `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG` is wired in the Estimating completion view
- [ ] `HbcHandoffComposer` is shown when `workflowStage === 'Completed'` and `siteLaunch.siteUrl` is set
- [ ] Pre-flight validation failures display blocking reason with resolution guidance
- [ ] `HbcHandoffStatusBadge` is visible on the request detail view

**Session-State Integration:**
- [ ] `SessionStateProvider` is mounted at app root / webpart root
- [ ] `HbcConnectivityBar` is mounted at app root / webpart root
- [ ] Draft-saved indicator appears after first auto-save (visible without user action)
- [ ] Auto-save fires with 1.5-second debounce on field change
- [ ] Draft is NOT cleared on API submission failure
- [ ] Resume offer ("Continue or start fresh?") appears for new-request drafts
- [ ] Clarification-return always resumes from server + delta (no start-fresh option)

**Complexity Integration:**
- [ ] `ComplexityProvider` is mounted at app root / webpart root
- [ ] `HbcComplexityDial` is accessible (header or settings)
- [ ] All gated fields use `HbcComplexityGate` (no raw role checks)
- [ ] Core summary fields (7 universally visible fields from T06) are visible at Essential tier
- [ ] Expert-tier content (error details, correlation IDs) is hidden at Standard and below
- [ ] Coaching prompts appear at Essential tier; are hidden at Standard and Expert

**Cross-Package Failure Modes:**
- [ ] FM-01: `useDraft` returns null handled gracefully (no crash)
- [ ] FM-02: Null BIC owner renders gracefully (no crash)
- [ ] FM-03: Missing event type registration does not crash notification center
- [ ] FM-05: API submission failure retains draft and shows error
- [ ] FM-06: Expired clarification draft shows appropriate message

---

## Required Outputs

| Artifact | Location | Description |
|----------|----------|-------------|
| Shared primitive integration validation checklist | `docs/reference/workflow-experience/primitive-integration-checklist.md` | Complete integration rules, failure mode catalog, and validation checklist |

The reference document must be added to `current-state-map.md §2`.

---

## Acceptance Criteria

- [ ] 7 integration rules between package pairs are specified with anti-patterns
- [ ] 10 failure modes are cataloged with expected degradation and G4/G5 requirements
- [ ] Package boundary drift prevention table is complete
- [ ] Integration validation checklist covers all 6 shared packages with specific checklist items
- [ ] Reference document exists at `docs/reference/workflow-experience/primitive-integration-checklist.md`
- [ ] Reference document is added to `current-state-map.md §2`

---

*End of W0-G3-T07 — Shared Primitive Integration Rules, Failure Modes, and Validation v1.0*
