# W0-G5-T05 — Completion Summary and Optional Project Hub Handoff

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 5
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`
> **Related:** `docs/explanation/feature-decisions/PH7-SF-08-Shared-Feature-Workflow-Handoff.md`; `apps/project-hub/`

**Status:** Proposed
**Stream:** Wave 0 / G5
**Locked decisions served:** LD-04, LD-05

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/provisioning` | `packages/provisioning/` | Reading terminal provisioning state (complete, failed) | Verify: provisioning package exports clear `provisioning-complete` and `provisioning-failed` state representations, and the API client supports polling or reading the final state. The failure-modes module should cover what a `provisioning-failed` state looks like from the requester's perspective. |
| `@hbc/workflow-handoff` | `packages/workflow-handoff/` | Cross-module handoff contract for optional Project Hub link | **Requires gate check.** The `@hbc/workflow-handoff` package exists with examples and e2e tests. Verify: does the package provide a mechanism for producing a typed handoff link/context from provisioning-complete state to a Project Hub record? If the handoff package is not yet relevant to the provisioning→Project Hub transition, the optional link may be implemented as a simple URL construction (using the provisioned project's SharePoint or Project Hub URL from the provisioning record) without the full workflow-handoff contract. Document the decision. |
| `@hbc/ui-kit` | `packages/ui-kit/` | Completion summary visual components | Verify: ui-kit has appropriate completion/success state components (confirmation card, success banner, or equivalent). If not, a new component may be needed in ui-kit — do not build it locally in the PWA. |

### Gate Outcome

If `@hbc/workflow-handoff` is not applicable to the provisioning→Project Hub transition in Wave 0, the optional handoff link may be a direct URL to the Project Hub destination using the URL from the provisioning record. Record this decision in the gate check outcome. The URL construction must use the provisioning package's data, not a hardcoded or guessed URL pattern.

---

## Objective

Implement the completion summary surface and the optional Project Hub handoff for the hosted PWA requester workflow. After this task, when a requester's project setup request reaches a terminal state (`provisioning-complete` or `provisioning-failed`), the PWA:

1. Shows a clear, informative completion summary
2. For successful completion: offers an optional, clearly labeled link to open Project Hub in a new tab
3. Does not force a redirect to Project Hub
4. Does not create a competing project-home concept in the hosted PWA

---

## Scope

### Completion Summary Surface

Implement a completion summary view that activates when a tracked request reaches a terminal state. The summary must include:

- **Outcome display:** Clearly communicate whether the request was successful (`provisioning-complete`) or failed (`provisioning-failed`). Use distinct visual treatments — success is green/affirming; failure is clearly problematic with actionable next steps.
- **Request context:** Show the project name (or identifier) and the submission timestamp so the requester knows which request this summary relates to.
- **Provisioning completion timestamp:** For successful requests, show when provisioning completed.
- **For `provisioning-complete`:** Show the optional Project Hub link (see below).
- **For `provisioning-failed`:** Show the failure reason (from `@hbc/provisioning` failure modes, appropriately translated for a requester audience — not raw error codes). Show what the requester should do next (e.g., contact the project coordinator, retry if the failure is requester-correctable, or wait for admin retry).

The completion summary is a view within the PWA — either a dedicated route (e.g., `/projects/:requestId/summary`) or a panel/overlay on the status list. The implementation detail is a local PWA concern. The key requirement is that the summary is prominent, clearly tied to the completed request, and does not require the requester to navigate through multiple layers to find it.

### Optional Project Hub Handoff

The completion summary for a `provisioning-complete` request must include an optional link to the Project Hub destination for the provisioned project.

**Behavioral rules:**
- The link is optional — the requester must click it deliberately; it is not auto-navigated
- The link opens in a new tab — `target="_blank"` with appropriate `rel="noopener noreferrer"`
- The link is clearly labeled: something like "Open project in Project Hub" — not just "Click here"
- If the Project Hub URL is not yet available at summary time (e.g., provisioning just completed and the URL needs a moment to stabilize), the link may be shown as pending/loading and resolved via a brief poll or delayed state update
- If the Project Hub URL cannot be determined from the provisioning record (data gap or error), the link must not appear rather than linking to an incorrect destination

**What the link does not do:**
- It does not redirect the PWA itself to Project Hub
- It does not close or navigate away from the PWA completion summary
- It does not log the requester out of the PWA or terminate their session
- It does not imply that the PWA is a "home" for the project going forward

### Canonical Destination Doctrine

The completion summary must not be designed to encourage the requester to stay in the PWA after project creation. The PWA's job at this point is complete. The visual and copy treatment of the completion summary should make it clear that Project Hub is where the project lives, and the PWA was the vehicle for requesting it.

Do not add navigation links from the completion summary to other PWA features, module areas, or future PWA surfaces. The only onward navigation from the completion summary is:
1. Back to the requester's request list (to start another request or check other requests)
2. Open Project Hub in a new tab (for the completed project)

---

## Exclusions / Non-Goals

- Do not implement any Project Hub content inside the PWA. The link goes to Project Hub; no Project Hub data is mirrored in the PWA (LD-04, LD-05).
- Do not force a redirect to Project Hub. Forced redirect violates LD-04.
- Do not implement coordinator-facing completion actions. LD-09 prohibits coordinator-specific Wave 0 behavior.
- Do not implement admin retry or failure remediation in the PWA. Admin actions belong to SPFx.
- Do not implement a "project home" or project detail view in the PWA. That would create a competing project-home concept (LD-04, LD-05).

---

## Governing Constraints

- The Project Hub link must open in a new tab (LD-04)
- No forced redirect (LD-04)
- The handoff URL must come from the provisioning record — no hardcoded URL construction (reliability and correctness)
- The completion summary must be honest about failures — do not use generic success language when provisioning failed
- No Project Hub data is pulled into the PWA to create a mini-project view (LD-05)

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/provisioning` | Required | Terminal state data (completion timestamp, failure reason, Project Hub URL) |
| `@hbc/workflow-handoff` | Conditional | Use if applicable to provisioning→Project Hub transition; otherwise use direct URL from provisioning record |
| `@hbc/ui-kit` | Required | Success/failure summary visual components |
| `@hbc/session-state` | Supporting | Clear draft on successful completion (completion clears the request draft) |
| T02 parity contract | Supporting | Completion states must match parity contract lifecycle table |

---

## Acceptance Criteria

1. **Completion summary renders for `provisioning-complete`.** A requester whose request has provisioned successfully sees a success summary with project name, completion timestamp, and the optional Project Hub link.

2. **Project Hub link opens in a new tab.** Clicking "Open project in Project Hub" opens a new browser tab pointing to the provisioned project's Project Hub URL. The PWA tab remains open.

3. **No forced redirect.** If the requester does not click the Project Hub link, they remain on the completion summary without any automatic navigation away.

4. **Completion summary renders for `provisioning-failed`.** A requester whose request failed sees a failure summary with the reason (user-readable, not a raw error code) and actionable next steps.

5. **Draft is cleared on completion.** After a request reaches a terminal state, the PWA-side draft for that request is cleared from `@hbc/session-state`. A returning requester does not see a "resume draft?" prompt for an already-completed request.

6. **No project-home content in PWA.** The completion summary does not display project documents, team members, tasks, or any other Project Hub content.

7. **Link is absent when URL unavailable.** If the Project Hub URL cannot be retrieved from the provisioning record, the link does not appear (no broken link, no placeholder "#" href).

---

## Validation / Readiness Criteria

Before T05 is closed:

- Manual test: complete a full provisioning flow (or simulate `provisioning-complete` state) and verify the summary renders correctly
- Manual test: simulate `provisioning-failed` state and verify the failure summary is honest and actionable
- Manual test: click the Project Hub link — new tab opens; PWA tab remains
- Manual test: verify draft is cleared after terminal state (IndexedDB check in DevTools)
- TypeScript compilation clean

---

## Known Risks / Pitfalls

**Project Hub URL availability timing:** The Project Hub URL may not be immediately available when provisioning first transitions to `provisioning-complete`. Implement a brief polling strategy (2–3 attempts, 2-second interval) before showing the link as "unavailable." Document the retry strategy.

**Workflow handoff applicability:** The `@hbc/workflow-handoff` package is designed for cross-module structured handoffs with BIC ownership transfer and context packages. The provisioning→Project Hub transition in the PWA completion summary is simpler: it just needs a URL. Do not force the full workflow-handoff ceremony onto a simple link. Use the handoff package only if it provides the correct URL lookup mechanism without excessive overhead.

**Draft clearing on completion:** The draft key strategy from T03 must be used consistently here. If the draft key includes the `requestId`, clearing it on completion is straightforward. If the draft key is user-scoped only, ensure the correct draft is targeted for clearing.

**Failure message quality:** The provisioning package's failure modes module contains error types and codes. These must be translated into requester-readable messages. A raw error code is not acceptable in the failure summary. Plan for a message mapping layer if the provisioning package does not already provide one.

---

## Progress Documentation Requirements

During active T05 work:

- Record the `@hbc/workflow-handoff` gate check decision (full handoff vs. direct URL from provisioning record)
- Record the Project Hub URL timing strategy (polling approach and retry count)
- Record the failure message mapping approach

---

## Closure Documentation Requirements

Before T05 can be closed:

- The completion summary behavior (what it shows, how the link works, new-tab rule) is documented in `apps/pwa/README.md` or the relevant feature README
- The Project Hub link behavior (new-tab, no forced redirect, URL-unavailable handling) is documented
- The workflow-handoff gate decision is recorded in this task file
- All acceptance criteria verified and checked off
- TypeScript compilation clean
- No broken Project Hub links in any test scenario
