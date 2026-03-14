> **Doc Classification:** Canonical Normative Plan — Integration rules, failure mode catalog, package boundary drift prevention, and G4/G5 validation checklist for the six shared primitive packages.

# Shared Primitive Integration Checklist — Project Setup

**Traceability:** W0-G3-T07 (`docs/architecture/plans/MVP/G3/W0-G3-T07-Shared-Primitive-Integration-Rules-Failure-Modes-and-Validation.md`)
**Source of truth:** `packages/provisioning/src/integration-rules.ts`, `packages/provisioning/src/failure-modes.ts`

---

## 1. Integration Rules

7 rules governing interactions between the six shared packages. Each rule has a stable identifier (`IR-##`) referenced by T08 integration tests.

| Rule ID | Package Pair | Rule | Anti-Pattern | Correct Pattern |
|---------|-------------|------|-------------|-----------------|
| IR-01 | `@hbc/step-wizard` ↔ `@hbc/session-state` | The wizard must NOT clear the draft inside `onAllComplete`. The consuming surface must call `clearDraft(draftKey)` after API submission succeeds. | Calling `clearDraft()` inside `onAllComplete` callback | Call `clearDraft()` in the API success handler after submission completes |
| IR-02 | `@hbc/bic-next-move` ↔ `@hbc/notification-intelligence` | `useBicNextMove` resolves the current owner from request state — it does not fire notifications. Notifications are fired by the backend state transition handlers (T04). | Wiring frontend BIC transfer events to directly call `NotificationApi.send()` | Let backend fire all ownership-change notifications; frontend only reads current owner via `useBicNextMove` |
| IR-03 | `@hbc/step-wizard` ↔ `@hbc/bic-next-move` | Setup intake form (Steps 1–5) is owned entirely by the requester. BIC transfer happens at form submission, not at step completion. `resolveAssignee` should be omitted. | Wiring step completion to BIC transfers in the setup wizard | Omit `resolveAssignee` in project setup wizard config; use `deriveCurrentOwner()` at the lifecycle level |
| IR-04 | `@hbc/workflow-handoff` ↔ `@hbc/bic-next-move` | BIC config must handle `workflowStage === "Completed"` with an active outbound handoff. `resolveCurrentOwner()` must return the handoff recipient. `workflowStage` governs when it disagrees with handoff status. | Resolving BIC ownership from handoff status field alone | Check `workflowStage` first (primary signal), active handoff as secondary signal |
| IR-05 | `@hbc/notification-intelligence` ↔ `@hbc/workflow-handoff` | Handoff package must register `provisioning.handoff-received` and `provisioning.handoff-acknowledged` event types via `NotificationRegistry.register()` at initialization. | Sending handoff notifications from the consuming surface independently | Let `workflow-handoff` package send its own notifications; surface only calls handoff API methods |
| IR-06 | `@hbc/complexity` ↔ all packages | `ComplexityProvider` must be mounted at app root (or webpart root for SPFx). Complexity gates individual fields/sections, not entire views. | Gating complexity at page/route level (`if (tier === "expert") return <AdminView />`) | Use `HbcComplexityGate` at individual field/section level; switching tiers progressively reveals more |
| IR-07 | `@hbc/session-state` ↔ `@hbc/notification-intelligence` | Offline notification read/dismiss actions must be queued in the session-state operation queue and replayed on reconnect. | Silently discarding notification read/dismiss events when offline | Call `queueOperation({ type: "notification-action", ... })` when connectivity is offline or degraded |

---

## 2. Failure Mode Catalog

10 failure modes covering degraded behavior at every integration seam. Each mode has a stable identifier (`FM-##`) referenced by T08 integration tests.

| FM ID | Title | Scenario | Expected Degradation | Affected Packages |
|-------|-------|----------|---------------------|-------------------|
| FM-01 | IndexedDB Unavailable | IndexedDB unavailable (private browsing, storage quota, browser restriction) | Form functions normally; auto-save silently disabled; no error thrown | `@hbc/session-state` |
| FM-02 | BIC resolveCurrentOwner Returns Null | Request in ReadyToProvision or Provisioning state (system-owned) | BIC badge shows "In Progress" or system indicator; null owner handled gracefully | `@hbc/bic-next-move` |
| FM-03 | Notification Registration Missing | Backend fires event type not yet registered on frontend | Backend delivers notification; frontend falls back to raw event type string | `@hbc/notification-intelligence` |
| FM-04 | Handoff validateReadiness Fails | User attempts handoff but validateReadiness returns non-null error | HbcHandoffComposer displays blocking error; "Send Handoff" CTA disabled | `@hbc/workflow-handoff` |
| FM-05 | API Submission Fails After onAllComplete | Wizard completes, API call fails | Draft NOT cleared; form remains on Review step; error displayed; retry available | `@hbc/step-wizard`, `@hbc/session-state` |
| FM-06 | Clarification Draft TTL Expires | 7-day draft TTL expires before requester returns | useDraft returns null; falls back to server record; in-progress responses lost | `@hbc/session-state`, `@hbc/step-wizard` |
| FM-07 | BIC Module queryFn Fails | My Work calls provisioning queryFn; API returns 500 | Failed module in failedModules[]; other modules continue; empty items returned | `@hbc/bic-next-move` |
| FM-08 | Complexity Tier Cannot Be Derived | User AD groups match no roleComplexityMap entry | Falls back to "essential" tier; user sees minimum info; can adjust via HbcComplexityDial | `@hbc/complexity` |
| FM-09 | SignalR Disconnected During Provisioning | SignalR disconnects mid-provisioning (network, token, firewall) | Falls back to polling every 30s; "Live updates paused" message displayed | `@hbc/session-state` |
| FM-10 | Handoff Recipient Cannot Be Resolved | projectLeadId is null or user no longer in directory | preflight.blockingReason returned; handoff blocked; no recipient ambiguity | `@hbc/workflow-handoff`, `@hbc/bic-next-move` |

---

## 3. Package Boundary Drift Prevention

Patterns that indicate boundary drift — must be caught in code review.

| Anti-Pattern | Why It's a Violation | Correct Pattern |
|-------------|---------------------|-----------------|
| Form validation in `IStepWizardConfig.onAllComplete` | `onAllComplete` is a notification event, not a validation gate | Validation belongs in each step's `validate()` function |
| `NotificationApi.send()` called from frontend surface for lifecycle events | Double-fires with backend dispatch | Backend fires all lifecycle notifications; frontend fires only UI-originated actions |
| `if (tier === 'admin') show(...)` in JSX | Hardcoded role check bypasses complexity gating | Use `HbcComplexityGate minTier="expert"` |
| Draft cleared before API call succeeds | Loses user data on API failure | Clear draft only on successful API response |
| New `IMyWorkItem` aggregation surface in any G4/G5 app | Conflicts with future My Work implementation | Use BIC badges + notification center as interim; no custom work-item aggregation |
| `useBicNextMove` config duplicated per surface | Multiple sources of truth for ownership semantics | Define config once, import everywhere |
| Handoff notification sent independently by surface | Double-fires with workflow-handoff package dispatch | Let workflow-handoff package send its own notifications |

---

## 4. Integration Validation Checklist

G4/G5 implementation teams must verify all items before the project setup UX is considered integration-complete and eligible for pilot deployment.

### 4.1 Step-Wizard Integration

- [ ] `useStepWizard` is wired to `IProjectSetupRequest` with `PROJECT_SETUP_WIZARD_CONFIG`
- [ ] `draftKey` is set to `'project-setup-form-draft'` for new requests
- [ ] `draftKey` is set to `'project-setup-clarification-{requestId}'` for clarification returns
- [ ] `onAllComplete` does NOT clear the draft
- [ ] The consuming surface clears the draft after successful API submission

### 4.2 BIC Integration

- [ ] `useBicNextMove(request, PROJECT_SETUP_BIC_CONFIG)` is wired in all three surfaces (estimating, accounting, admin)
- [ ] `HbcBicBadge` is rendered in list views; `HbcBicDetail` is rendered in detail views
- [ ] Null owner (system states) renders gracefully without warning badges
- [ ] `registerBicModule('provisioning', ...)` is called at app initialization
- [ ] The BIC config is imported from a single shared location (not duplicated per surface)

### 4.3 Notification Integration

- [ ] `NotificationRegistry.register([...])` is called at initialization with all 12 event types from T04
- [ ] `HbcNotificationBadge` is mounted in the app header
- [ ] `HbcNotificationCenter` is accessible (modal/panel in header)
- [ ] `HbcNotificationBanner` is mounted for `immediate`-tier banners
- [ ] No frontend surface calls `NotificationApi.send()` for lifecycle events

### 4.4 Handoff Integration

- [ ] `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG` is wired in the Estimating completion view
- [ ] `HbcHandoffComposer` is shown when `workflowStage === 'Completed'` and `siteLaunch.siteUrl` is set
- [ ] Pre-flight validation failures display blocking reason with resolution guidance
- [ ] `HbcHandoffStatusBadge` is visible on the request detail view

### 4.5 Session-State Integration

- [ ] `SessionStateProvider` is mounted at app root / webpart root
- [ ] `HbcConnectivityBar` is mounted at app root / webpart root
- [ ] Draft-saved indicator appears after first auto-save (visible without user action)
- [ ] Auto-save fires with 1.5-second debounce on field change
- [ ] Draft is NOT cleared on API submission failure
- [ ] Resume offer ("Continue or start fresh?") appears for new-request drafts
- [ ] Clarification-return always resumes from server + delta (no start-fresh option)

### 4.6 Complexity Integration

- [ ] `ComplexityProvider` is mounted at app root / webpart root
- [ ] `HbcComplexityDial` is accessible (header or settings)
- [ ] All gated fields use `HbcComplexityGate` (no raw role checks)
- [ ] Core summary fields (7 universally visible fields from T06) are visible at Essential tier
- [ ] Expert-tier content (error details, correlation IDs) is hidden at Standard and below
- [ ] Coaching prompts appear at Essential tier; are hidden at Standard and Expert

### 4.7 Cross-Package Failure Modes

- [ ] FM-01: `useDraft` returns null handled gracefully (no crash)
- [ ] FM-02: Null BIC owner renders gracefully (no crash)
- [ ] FM-03: Missing event type registration does not crash notification center
- [ ] FM-05: API submission failure retains draft and shows error
- [ ] FM-06: Expired clarification draft shows appropriate message

---

## 5. Code Artifact Cross-References

All T01–T07 code artifacts in `packages/provisioning/src/`:

| Task | File | Description |
|------|------|-------------|
| T01 | `types.ts` | Core provisioning types and request model |
| T02 | `bic-config.ts` | BIC ownership config, role constants, `deriveCurrentOwner` |
| T02 | `bic-registration.ts` | BIC module registration seam for My Work |
| T02 | `handoff-config.ts` | Estimating → Project Hub handoff config and validation |
| T03 | `state-machine.ts` | State transitions, notification targets |
| T04 | `notification-templates.ts` | Notification event templates |
| T04 | `notification-registrations.ts` | Notification event type registrations |
| T05 | `hooks/useProvisioningSignalR.ts` | SignalR provisioning status hook |
| T06 | `summary-field-registry.ts` | Summary field descriptors, status/department labels, urgency indicators |
| T06 | `history-level-registry.ts` | History level model (Level 0/1/2), content descriptors |
| T06 | `coaching-prompt-registry.ts` | Coaching prompt registry (Essential tier) |
| T06 | `complexity-gate-helpers.ts` | Complexity gate visibility helpers |
| T07 | `integration-rules.ts` | Integration rule registry (IR-01 through IR-07) |
| T07 | `failure-modes.ts` | Failure mode registry (FM-01 through FM-10) |

---

**Related reference documents:**
- [Setup Wizard Contract](setup-wizard-contract.md) (T01)
- [BIC Action Contract](bic-action-contract.md) (T02)
- [Setup Handoff Routes](setup-handoff-routes.md) (T02)
- [Clarification Re-entry Spec](clarification-reentry-spec.md) (T03)
- [Setup Notification Registrations](setup-notification-registrations.md) (T04)
- [Draft Key Registry](draft-key-registry.md) (T05)
- [My Work Alignment Contract](my-work-alignment-contract.md) (T05)
- [Complexity Gate Spec](complexity-gate-spec.md) (T06)

*End of W0-G3-T07 — Shared Primitive Integration Checklist v1.0*
