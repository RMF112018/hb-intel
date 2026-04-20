# W0-G5-T03 — Draft, Save, Resume, and Clarification Return Behavior

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 5
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`
> **Related:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`; `docs/explanation/feature-decisions/PH7-SF-05-Shared-Feature-Step-Wizard.md`

**Status:** Complete
**Stream:** Wave 0 / G5
**Locked decisions served:** LD-01, LD-02, LD-03

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/session-state` | `packages/session-state/` | Draft persistence, draft retrieval, connectivity-aware sync | Assessed **ready**. Package has full source structure (db, context, hooks, sync), a clear README with provider/hooks pattern, and documented `IDraftEntry` and `IQueuedOperation` interfaces. Consume via `useDraft<T>()` hook and `useConnectivity()`. |
| `@hbc/step-wizard` | `packages/step-wizard/` | Step completion state is part of the draft payload | Must be sufficiently mature to define stable step IDs and `StepStatus` values. If Step Wizard state model is still changing, the draft payload schema will drift. |
| `@hbc/notification-intelligence` | `packages/notification-intelligence/` | Clarification-return notifications routed to requester | **Requires gate check.** Inspect `packages/notification-intelligence/src/` to confirm that the package can route a clarification-needed notification to a specific requester in the PWA context. If notification routing to the PWA is not yet implemented, T03 clarification-return behavior may be implemented with a polling fallback, clearly documented as a temporary measure. |

### Gate Outcome

`@hbc/session-state` is assessed ready and T03 may proceed with draft/save/resume behavior regardless of notification-intelligence status.

Clarification-return notification routing (Section: Clarification-Return Behavior) may be implemented with a polling fallback if `@hbc/notification-intelligence` is not yet PWA-ready. The polling fallback must be clearly marked in code and in this task file as a temporary measure to be replaced when the notification package is ready.

---

## Objective

Implement draft persistence, save, resume, and clarification-return behavior for the hosted PWA requester surface. After this task, a requester must be able to:

1. Start a project setup request, have their in-progress field values automatically preserved
2. Close the browser, return later, and resume exactly where they left off with no data loss
3. Be notified that a clarification is required (or discover it via status), navigate to the clarification request, provide the required input, and have that response submitted to the workflow

This task is the primary deliverable for the "interruption-safe" and "clarification-return capable" requirements of the G5 locked scope.

---

## Scope

### Draft Behavior

- Integrate `useDraft<RequestDraftPayload>()` from `@hbc/session-state` into the guided setup surface
- Auto-save draft state after each meaningful user interaction (step completion, field blur, explicit save action)
- Draft key strategy: use a stable, predictable key tied to the requester's identity and the active request (or `new-request` for an unsaved draft). Example: `pwa:request-draft:${userId}` or `pwa:request-draft:${requestId}` once a backend ID exists
- Draft TTL: set a TTL appropriate for the request lifecycle (suggested: 72 hours for an unsubmitted draft; longer for a draft associated with a submitted request awaiting clarification)
- On page load / route mount: check for an existing draft; if one exists, offer resume or discard

### Save / Resume Rules

- **Auto-save:** Draft is saved automatically on step advancement and on field-level blur for key fields. No explicit "save" button required for auto-save to work.
- **Explicit save:** A "Save and close" action must be available so requesters can intentionally save and leave without submitting. This action saves the draft and returns to the status list or home page.
- **Resume on return:** When a requester navigates back to `/project-setup` and a draft exists for their identity, the surface must restore the draft state: step position, field values, step completion statuses.
- **Resume offer:** The resume offer must be explicit — a dialog or banner saying "You have a draft in progress. Resume where you left off?" with clear resume and discard options. Do not silently resume or silently discard.
- **Discard behavior:** If the requester chooses to discard, the draft is cleared via `@hbc/session-state` and the flow starts fresh. The discard action requires confirmation if the draft is more than a single step complete.

### Clarification-Return Behavior

Clarification-return is the case where the workflow has reached `clarification-needed` state: the backend (or a controller) has flagged that the requester must provide additional or corrected information before provisioning can continue.

- **Notification path:** The requester must be surfaced a clarification prompt. The preferred mechanism is a notification from `@hbc/notification-intelligence` that routes the requester directly to the clarification step. If notification routing to the PWA is not yet ready, implement a status-based poll: when the requester views the `/projects` status list and a request is in `clarification-needed` state, a prominent action affordance (button or banner) takes them to the clarification entry surface.
- **Clarification entry surface:** The clarification prompt must show: (1) which step or field requires correction, (2) the reason or context provided by the controller/workflow, (3) the current value (if any), and (4) the input field for the corrected value.
- **Clarification draft:** The clarification response must also be auto-saved via `@hbc/session-state` using a distinct draft key (e.g., `pwa:clarification-draft:${requestId}:${clarificationId}`).
- **Clarification submission:** On submission, the clarification response is sent via the `@hbc/provisioning` API client. The PWA must handle the submission result: success transitions the request state and returns to the status list; failure shows an actionable error without discarding the draft.
- **Clarification resume:** If the requester is interrupted during clarification entry, the same draft/resume rules apply as for initial setup.

### Transient vs. Durable State

| State Type | Storage | Lifetime | Notes |
|---|---|---|---|
| Active step field values (unsaved) | React component state only | Tab session | Auto-saved to IndexedDB on blur/step-advance |
| In-progress draft (unsubmitted) | `@hbc/session-state` IndexedDB | 72h TTL | Persists across tab close and refresh |
| Submitted request state | Backend (via `@hbc/provisioning`) | Indefinite | PWA reads back from API; not duplicated in IndexedDB |
| Clarification prompt content | Backend (retrieved via API) | Until resolved | Not stored in PWA-side IndexedDB; fetched on load |
| Clarification response draft | `@hbc/session-state` IndexedDB | 24h TTL | Shorter TTL because clarification urgency is higher |
| Connectivity-queued operations | `@hbc/session-state` operation queue | Until executed | Auto-retried on reconnect |

---

## Exclusions / Non-Goals

- Do not implement a custom IndexedDB layer. `@hbc/session-state` owns that concern (package boundary rule).
- Do not store submitted request payloads or server-side state in the PWA-side draft store. The PWA reads submitted state from the API.
- Do not implement the notification delivery mechanism. `@hbc/notification-intelligence` owns that. T03 consumes notifications for routing; it does not reimplement notification delivery.
- Do not implement the controller-side clarification creation flow. That is an SPFx concern, not a PWA G5 concern.
- Do not implement the completion summary. That belongs to T05.

---

## Governing Constraints

- All draft persistence must go through `@hbc/session-state` — no parallel local storage or sessionStorage use (package boundary and interruption-safety rule)
- The draft payload schema defined in T02 governs what is persisted
- Resume must be explicit — not silent — to respect the requester's agency (LD-03)
- Clarification-return must preserve the workflow contract: the PWA submits the clarification through the same API path as SPFx (LD-02)

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/session-state` | Required | `useDraft<T>`, `useConnectivity`, `useSessionState` (queue operations) |
| `@hbc/step-wizard` | Required | Step state is part of draft payload |
| `@hbc/provisioning` | Required | Clarification submission API |
| `@hbc/notification-intelligence` | Preferred (fallback allowed) | Clarification-needed notification routing |
| `@hbc/ui-kit` | Required | Visual components for resume dialog, clarification banner |
| T02 parity contract | Required | Draft payload type definition |

---

## Acceptance Criteria

1. **Auto-save works:** Navigating to a mid-progress request setup, closing the tab, and reopening the PWA restores the draft state with no data loss.

2. **Resume is explicit:** A returning requester with an existing draft sees a "Resume draft?" prompt; they can resume or discard; discarding requires confirmation if the draft is substantive.

3. **Discard clears draft:** After a confirmed discard, the draft is gone from `@hbc/session-state` and the flow starts fresh.

4. **Clarification-needed state is surfaced:** When a request enters `clarification-needed`, the requester is shown a clear prompt (via notification or status list banner) to take action.

5. **Clarification entry and submission work:** The requester can enter a clarification response; the response is auto-saved as a draft; submission sends it via the `@hbc/provisioning` API client; success transitions the workflow.

6. **Clarification draft survives interruption:** If the requester is interrupted during clarification entry, their partial response is preserved on return.

7. **No parallel draft storage:** No localStorage, sessionStorage, or custom IndexedDB access exists in the feature module — all draft behavior routes through `@hbc/session-state`.

8. **Draft TTL is configured:** In-progress drafts have a 72h TTL; clarification drafts have a 24h TTL (or values confirmed with the architecture owner during T03 execution).

---

## Validation / Readiness Criteria

Before T03 is closed:

- Manual test: auto-save confirmed by observing IndexedDB state in browser DevTools
- Manual test: close-and-resume roundtrip verified in Chrome, Firefox, and Safari
- Manual test: clarification-return path verified end-to-end (mock `clarification-needed` state if needed)
- TypeScript compilation clean in `apps/pwa/`
- Unit tests cover: draft key generation, resume offer logic, discard confirmation behavior, clarification submission success path, clarification submission failure path

---

## Known Risks / Pitfalls

**Draft key collisions:** If a requester can have multiple simultaneous draft requests, a simple `pwa:request-draft:${userId}` key will collide. Confirm with the architecture owner whether multiple simultaneous drafts are a Wave 0 concern. If not, document the single-draft-per-user limitation explicitly in the feature behavior.

**TTL choice:** The 72h and 24h TTL values are suggestions. Confirm the right values with the product owner, especially for clarification drafts where the urgency may require a shorter or longer window.

**Notification-intelligence routing gap:** If `@hbc/notification-intelligence` cannot route to the PWA in Wave 0, the clarification-return experience will degrade to polling/status-check. This is acceptable but must be documented as a known limitation and tracked as a follow-on task.

**Step state vs. draft state divergence:** If the requester has a draft saved from an older Step Wizard version (different step IDs or field keys), the resume will fail silently or incorrectly. Add a draft version field to the payload and handle version mismatches explicitly.

---

## Progress Documentation Requirements

During active T03 work:

- Record the notification-intelligence gate check outcome in this file
- If the polling fallback for clarification-return is used, document it explicitly in this file and in the relevant code with a TODO comment referencing this task
- Record the agreed draft TTL values once confirmed with the product owner
- Track the draft key strategy decision (single vs. multiple draft support) in this file

---

## Closure Documentation Requirements

Before T03 can be closed:

- The draft key strategy is documented in this task file (finalized, not speculative)
- The draft payload type is committed as a TypeScript type in the codebase (in `apps/pwa/src/features/` or agreed shared location)
- The notification vs. polling decision for clarification-return is recorded in this file
- If any `@hbc/session-state` README gaps were found during T03, updates to that README are committed
- All acceptance criteria verified and checked off
- TypeScript compilation clean
- No undocumented `[TODO]` items related to draft persistence logic

---

## Closure Record

**Date:** 2026-03-15

### Gate Check Outcomes

**`@hbc/session-state`:** READY. Full IndexedDB draft layer, `useDraft<T>`, `useAutoSaveDraft`, `useDraftStore`, `SessionStateProvider` all stable and integrated.

**`@hbc/step-wizard`:** READY. Step IDs, `StepStatus`, ordering modes, and `draftKey` config all stable. Step wizard manages its own step progression state via `useDraftStore` internally.

**`@hbc/notification-intelligence`:** READY FOR PWA. `buildActionUrl()` already generates PWA-compatible clarification-return URLs (test coverage confirms `/project-setup?mode=clarification-return&requestId=...` pattern). No polling fallback needed.

### Draft Key Strategy (Finalized)

- **New request:** Single draft per user via `PROJECT_SETUP_DRAFT_KEY` (`'project-setup-form-draft'`). Multiple simultaneous drafts are not a Wave 0 concern.
- **Clarification-return:** Per-request draft via `buildClarificationDraftKey(requestId)` (`'project-setup-clarification-{requestId}'`).

### Draft TTL Values (Finalized)

- **New-request draft:** 48 hours (`NEW_REQUEST_DRAFT_TTL_HOURS`) — aligned with G4.
- **Clarification-return draft:** 168 hours / 7 days (`CLARIFICATION_DRAFT_TTL_HOURS`) — aligned with G4.

### Draft Payload Type Location

Draft payload types (`ISetupFormDraft`, `IClarificationDraft`) are defined in `packages/features/estimating/src/project-setup/types/IProjectSetupWizard.ts` and consumed by the PWA via `@hbc/features-estimating` import. No duplicate type definition in PWA-local code.

### Notification vs. Polling Decision

Notification routing via `@hbc/notification-intelligence` is functional for PWA. No polling fallback implemented. Clarification-return is surfaced via:
1. Notification deep-link (via `buildActionUrl()`)
2. Status list action button in `/projects` (click "Respond" on `NeedsClarification` rows)

### T01 Parity Corrections Applied

As part of T03 execution, the T01 wizard config was replaced with the canonical `PROJECT_SETUP_WIZARD_CONFIG` from `@hbc/features-estimating`. Step IDs, labels, field groupings, and validation rules now match the G4 contract per T02 parity contract §9.
