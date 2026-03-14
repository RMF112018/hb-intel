# W0-G3-T05 — Session State, Draft, Save, and Resume Contract

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 3 task plan defining how `@hbc/session-state` governs draft persistence, auto-save behavior, visible draft-saved feedback, resume behavior, and the same-context reopening required by clarification returns. This plan is the authoritative draft key registry for all project setup form surfaces.

**Phase Reference:** Wave 0 Group 3 — Shared-Platform Wiring and Workflow Experience Plan
**Depends On:** T01 (step-wizard config — requires draft key), T03 (clarification-return draft key distinction)
**Unlocks:** T07 (session-state failure modes), T08 (draft/resume tests), G4/G5 form implementations
**Repo Paths Governed:** `packages/session-state/src/`, `apps/estimating/src/`, `apps/pwa/src/`, `apps/accounting/src/`

---

## Objective

This task defines the complete session-state integration contract for the project setup workflow surfaces. It specifies every draft key, what each key stores, its TTL, when it is created/cleared, and the expected auto-save and resume behavior for each saveable surface.

The G3-D4 locked decision requires: auto-save in background + visible draft-saved feedback + resume behavior + same saved context reopened for clarification returns. This task specifies exactly what that means in implementation terms for every G4/G5 surface that touches the project setup workflow.

---

## Why This Task Exists

Without this contract, G4/G5 surfaces would:
- Invent their own persistence keys (risking collisions between surfaces or between new-request and clarification-return modes)
- Choose arbitrary TTLs (24 hours may be appropriate for a same-session form but catastrophically short for a 3-day clarification cycle)
- Implement auto-save with no visible feedback (G3-D4 explicitly prohibits invisible auto-save)
- Lose draft context when the user returns for clarification after multi-day absence

`@hbc/session-state` provides the storage engine (`useDraft`, IndexedDB, offline queue). T05 defines the contracts around it — what to store, when, and for how long.

---

## Scope

T05 specifies:
- The complete draft key registry for all project setup surfaces
- TTL requirements for each draft key
- Auto-save trigger specification (when to save, what to save)
- Visible draft-saved feedback requirements
- Resume behavior (what to restore, what to re-derive, what to prompt)
- Clarification-return same-context specification
- Transient vs. durable state distinction
- Failure and interruption recovery expectations

T05 does not specify:
- The IndexedDB implementation (that is `@hbc/session-state`'s concern)
- The visual design of draft-saved indicators (G4/G5 scope — T05 specifies behavior requirements)
- The provisioning lifecycle state (`@hbc/provisioning` owns this)
- The step-wizard step status (T01 governs this; T05 stores the step status as part of the draft)

---

## Governing Constraints

- `@hbc/session-state` is the **only** permitted persistence layer for in-progress form state. Surfaces must not use React state alone (lost on unmount), localStorage directly (bypasses TTL management), or any other storage mechanism for draft form data.
- Auto-save must be visible. G3-D4 explicitly requires visible draft-saved feedback. An auto-save that happens silently with no indicator is a violation of this contract.
- The clarification-return draft key must be distinct from the initial submission draft key. Using the same key creates a collision risk that could overwrite or corrupt the original submission state.
- Draft state must not be treated as the provisioning lifecycle source of truth. Draft state = what the user has typed. Provisioning state = what the backend has recorded. On resume, draft state is layered on top of the server record (not a replacement for it).

---

## Draft Key Registry

Every saveable surface in the project setup workflow must use exactly the draft keys defined in this registry. No surface may introduce a new draft key without updating this registry and `current-state-map.md §2`.

### Key 1 — New Request Form Draft

```typescript
const DRAFT_KEY_NEW_REQUEST = 'project-setup-form-draft';
```

| Property | Value |
|----------|-------|
| **Key** | `'project-setup-form-draft'` |
| **Surface** | New request intake form (Estimating app, PWA) |
| **Stores** | `IProjectSetupRequest` field values (partial — all fields the user has entered) + `IStepRuntimeEntry[]` (step statuses for the wizard) |
| **TTL** | 48 hours |
| **Created** | On first field change by the user (not on form open) |
| **Cleared** | On successful request submission; on explicit user discard; on TTL expiry |
| **Scope** | Global (not per-request-ID — there is no request ID yet until submission) |

**TTL rationale:** 48 hours is appropriate for an in-progress form that the user started but did not finish. A user who abandons a setup form and returns two days later should get their draft back. A user who never submitted and comes back a week later should start fresh (stale context is misleading).

**Step status storage:** The `useDraft` value for this key includes both the `IProjectSetupRequest` partial fields AND the step statuses. This is required for the step-wizard to restore progress (T01 governs step restoration; T05 provides the storage).

```typescript
interface ISetupFormDraft {
  fields: Partial<IProjectSetupRequest>;
  stepStatuses: Record<string, StepStatus>; // stepId → status
  lastSavedAt: string; // ISO timestamp
}
```

---

### Key 2 — Clarification Response Draft

```typescript
const DRAFT_KEY_CLARIFICATION = (requestId: string) =>
  `project-setup-clarification-${requestId}`;
```

| Property | Value |
|----------|-------|
| **Key** | `'project-setup-clarification-{requestId}'` |
| **Surface** | Clarification response form (Estimating app, PWA) |
| **Stores** | `Partial<IProjectSetupRequest>` field changes (delta from submitted request) + `IStepRuntimeEntry[]` (step statuses for the clarification return wizard) + clarification response notes |
| **TTL** | 7 days |
| **Created** | When the requester first opens the clarification return form |
| **Cleared** | On successful clarification response submission; on explicit user discard; on TTL expiry |
| **Scope** | Per-request-ID |

**TTL rationale:** Clarification cycles can span multiple business days. The controller flags items; the requester may not immediately respond. A 7-day TTL ensures the response draft survives over a weekend. After 7 days without activity, the requester likely needs to reload from the current server state anyway.

**Delta storage note:** This draft stores only the changes the requester is making in response to clarification — it does not duplicate the entire request. On resume, the surface must load the server record and layer the draft delta on top.

```typescript
interface IClarificationDraft {
  requestId: string;
  fieldChanges: Partial<IProjectSetupRequest>; // only changed fields
  stepStatuses: Record<string, StepStatus>;
  clarificationResponses: Record<string, string>; // clarificationId → response note
  lastSavedAt: string;
}
```

---

### Key 3 — Controller Review Work-in-Progress

```typescript
const DRAFT_KEY_CONTROLLER_REVIEW = (requestId: string) =>
  `project-setup-controller-review-${requestId}`;
```

| Property | Value |
|----------|-------|
| **Key** | `'project-setup-controller-review-{requestId}'` |
| **Surface** | Controller review panel (Accounting app) |
| **Stores** | In-progress clarification annotations (before the controller formally submits them) + project number entry in progress |
| **TTL** | 24 hours |
| **Created** | When the controller begins entering annotations or the project number |
| **Cleared** | On successful clarification submission; on request approval; on TTL expiry |
| **Scope** | Per-request-ID |

**TTL rationale:** The controller review is a same-session or same-day activity. 24 hours is sufficient to recover from an accidental browser close or navigation away.

```typescript
interface IControllerReviewDraft {
  requestId: string;
  projectNumberInProgress?: string; // partial entry before validation
  pendingAnnotations: Array<{
    fieldId: string;
    stepId: string;
    message: string;
  }>;
  lastSavedAt: string;
}
```

---

## Auto-Save Specification

### Trigger Conditions

Auto-save fires on every field change in the form with a debounce of 1.5 seconds. This means:
- The user types in a field
- 1.5 seconds after they stop typing, `saveDraft(key, value)` is called
- If the user changes another field before 1.5 seconds, the timer resets

**Why debounce, not immediate:** Calling `saveDraft` on every keystroke would generate excessive IndexedDB writes. A 1.5-second debounce balances responsiveness (the user expects their data to be saved quickly) with performance (not thrashing the storage layer).

### What Is Auto-Saved

Auto-save must capture the complete `ISetupFormDraft` (or `IClarificationDraft` / `IControllerReviewDraft`) shape, not individual field values. This means the save event must serialize the entire form state at the time of the save.

Auto-save must NOT attempt to call any backend API. Auto-save is local storage only. Backend persistence happens on form submission (or clarification submission).

### What Is NOT Auto-Saved

- Validation error state (transient — re-derived on validate())
- Step-wizard navigation cursor (activeStepId) — this is restored to the last in-progress step on resume, not to the exact cursor position
- Scroll position (transient)
- Any UI state that does not affect the request data (expanded/collapsed panels, tooltip visibility, etc.)

---

## Visible Draft-Saved Feedback Requirements

G3-D4 requires visible draft-saved feedback. The following requirements are behavioral (not visual — G4/G5 owns visual design):

**Requirement 1 — Draft-saved indicator must appear after first successful auto-save.** The indicator must show "Draft saved [timestamp]" or equivalent. The timestamp must be human-readable relative time ("just now", "1 minute ago", "2 minutes ago").

**Requirement 2 — The indicator must update after each subsequent auto-save.** It must not remain permanently at "just now" — users use this indicator to gauge whether their data is safe.

**Requirement 3 — The indicator must show a warning state when offline.** When `useConnectivity()` returns `'offline'`, the indicator must change to "Draft saved locally — will sync when reconnected" (or equivalent phrasing).

**Requirement 4 — The indicator must be visible without user action.** It must not require hover or expand to see. It must appear in the form header or adjacent to the primary CTA.

**Requirement 5 — `HbcConnectivityBar` must be mounted at the app root.** For the offline warning in requirement 3 to be visible across all form surfaces, the `HbcConnectivityBar` component from `@hbc/session-state` must be mounted at the app or webpart root. This is the global connectivity status indicator. It is not per-form.

---

## Resume Behavior

### On Form Open (New Request)

```
1. Call useDraft<ISetupFormDraft>('project-setup-form-draft')
2. If draft exists and is not expired:
   a. Display: "You have a draft from [relative timestamp]. Continue or start fresh?"
   b. If user selects Continue: restore field values + step statuses into the wizard
   c. If user selects Start Fresh: clear draft; initialize empty form
3. If no draft exists:
   a. Initialize empty form; activeStepId = 'project-info'
```

**Why offer choice:** The user may have started a draft for one project and now wants to start a different project. Automatically restoring would be confusing. Offering the choice respects the user's intent.

### On Form Open (Clarification Return)

```
1. Load IProjectSetupRequest from server (authoritative source)
2. Call useDraft<IClarificationDraft>('project-setup-clarification-{requestId}')
3. If draft exists and is not expired:
   a. Layer draft.fieldChanges on top of server record values
   b. Restore step statuses from draft.stepStatuses
   c. Restore clarification response notes from draft.clarificationResponses
   d. Do NOT show "continue or start fresh?" — clarification return always continues
      (starting fresh in clarification mode would lose the requester's partial responses)
4. If no draft exists:
   a. Initialize from server record values only
   b. flaggedStepIds determined from open IRequestClarification items
   c. Step statuses initialized per T03 re-entry rules
```

**Critical difference from new-request resume:** Clarification return does not offer "start fresh." The requester is responding to specific controller annotations; starting fresh would clear their response progress and confuse the workflow. The server record is always the baseline; the draft is the delta.

### On Form Open (Controller Review)

```
1. Load IProjectSetupRequest from server
2. Call useDraft<IControllerReviewDraft>('project-setup-controller-review-{requestId}')
3. If draft exists: restore pendingAnnotations and projectNumberInProgress
4. If no draft: initialize empty review state
5. No "continue or start fresh?" — controller review always continues any in-progress work
```

---

## Transient vs. Durable State

The following classification governs what must be persisted vs. what is re-derived:

**Durable (must be persisted in draft):**
- All user-entered field values on `IProjectSetupRequest`
- Step completion statuses (`IStepRuntimeEntry.status` values — `complete` / `in-progress` / etc.)
- Clarification response notes (what the requester wrote in response to annotations)
- Controller project number in-progress (to survive accidental navigation away mid-entry)
- Draft creation timestamp (for TTL enforcement and "saved X minutes ago" display)

**Transient (must NOT be persisted — re-derived on load):**
- Validation errors (re-derived by calling `validate()` on form open)
- `activeStepId` (set to first in-progress or first not-started step on resume — not persisted)
- Notification state (already persisted in notification center — not part of form draft)
- BIC ownership state (derived from provisioning lifecycle at render time)
- Complexity tier (stored in `@hbc/complexity`'s own storage — not part of form draft)
- Form dirty/pristine state (re-derived from comparing draft to server values)

---

## Failure and Interruption Recovery

### IndexedDB Unavailable

If `@hbc/session-state` cannot access IndexedDB (browser restriction, private mode, storage quota exceeded), `useDraft` must return `null` (no draft available) without throwing. The form must function without draft persistence in this case — the user loses the auto-save benefit but the form still works.

The `HbcConnectivityBar` (or a degraded-mode indicator) should display a message if draft persistence is unavailable, so the user knows to be careful about navigation.

### Mid-Form Submission Failure

If the user completes the wizard and the API call to `ProjectSetupApi.submit()` fails:
- The draft must NOT be cleared (it is still needed if the user retries)
- The surface must display the submission error
- The user may retry submission; the form values are still available
- The draft is cleared only on successful submission

### Session Expiration During Form Fill

If the user's session expires while filling out the form (auth token expires), the form draft is still in IndexedDB. When the user re-authenticates and returns:
1. The surface must re-authenticate via `@hbc/auth`
2. The form re-initializes with the draft restored (if not expired)
3. The user continues from where they left off

---

## Required Outputs

| Artifact | Location | Description |
|----------|----------|-------------|
| Draft key registry and resume contract | `docs/reference/workflow-experience/draft-key-registry.md` | Complete registry with all 3 draft keys, TTLs, stores, creation/clearing rules, auto-save spec, resume decision trees |

The reference document must include:
- Draft key registry table
- Auto-save trigger spec (debounce timing, what triggers, what is excluded)
- Draft-saved feedback behavioral requirements (5 requirements above)
- Resume decision trees (new request, clarification return, controller review)
- Transient vs. durable state classification table
- Failure mode handling summary

---

## Acceptance Criteria

- [ ] All three draft keys are specified with key string, TTL, stored shape, and clearing rules
- [ ] Auto-save trigger spec is defined (debounce, what is saved, what is excluded)
- [ ] Five visible draft-saved feedback requirements are enumerated
- [ ] Resume decision tree for new-request is specified (offer continue vs. start fresh)
- [ ] Resume decision tree for clarification-return is specified (always continue from server + delta)
- [ ] Resume decision tree for controller review is specified
- [ ] Transient vs. durable state classification is explicit
- [ ] IndexedDB failure degradation behavior is defined
- [ ] Mid-form submission failure behavior is defined
- [ ] Reference document exists and is added to `current-state-map.md §2`

---

*End of W0-G3-T05 — Session State, Draft, Save, and Resume Contract v1.0*
