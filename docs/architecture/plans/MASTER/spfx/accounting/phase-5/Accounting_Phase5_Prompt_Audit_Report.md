# Accounting Phase 5 Prompt Package Audit Report

## Executive Summary

The attached Phase 5 package is directionally strong, but it is **too narrow and too Admin-centric in a few critical places** to safely reflect the live repo without revision.

The package correctly understands that Phase 5 is about the exception path and that it must preserve the Accounting/Admin boundary. It also correctly treats this as a production-readiness phase rather than a broad workflow redesign phase.

However, the live repo currently shows a more nuanced exception-path model than the uploaded package assumes:

- Accounting can route failed cases into Admin, but that current handoff is only a **navigation handoff** with `projectId` query context.
- Estimating still participates materially in the exception path through **bounded retry** and **escalation to Admin**.
- Not every exception action is Admin-only today.
- The Admin route-in logic currently matches by `projectId` only, which is potentially ambiguous when multiple provisioning runs exist for the same project.
- Some Admin-side status mutations appear to update provisioning status without clearly reconciling the linked request record, which creates a real request/status drift risk.

Because of those facts, the original package needed revision in five areas:

1. source coverage
2. cross-app handoff precision
3. Admin-only versus shared exception-action precision
4. request/status drift checks after recovery actions
5. operator-ownership language across Accounting, Admin, and Estimating

The revised package preserves the six-stage structure but hardens those seams.

---

## Overall Assessment

## What the uploaded package gets right

The uploaded package correctly does all of the following:

- treats Phase 5 as an exception-path phase rather than a broad redesign phase
- keeps the app-boundary concept intact
- preserves the idea that Accounting should not become the recovery console
- preserves the idea that Admin should not become the controller approval surface
- uses a good six-stage dependency order
- correctly centers routing, context handoff, authorization, lifecycle integration, UX verification, and final reconciliation

## What the uploaded package gets wrong or leaves too vague

The uploaded package becomes too abstract or too rigid in the following ways:

- it frames the exception path as primarily **Accounting → Admin**, when the live repo still includes an **Estimating → Admin escalation path** and a shared retry path
- it does not force enough scrutiny on the **actual route-in payload** and how Admin resolves the target run
- it does not explicitly separate:
  - true Admin-exclusive recovery actions
  - shared or non-Admin exception actions
  - backend routes that are broader than the Admin UI implies
- it does not force enough verification of **request lifecycle versus provisioning status drift** after Admin-side exception actions
- it risks making Prompt-03 too simplistic by assuming all meaningful recovery actions should be Admin-only without first confirming the repo’s current shared retry/escalation model

---

## Current Repo-Truth Exception Path Summary

## 1. Accounting-to-Admin handoff is currently navigation-only

The Accounting controller detail page only renders “Send to Admin” when the request state is `Failed`. That action opens the Admin app at:

`{adminUrl}/provisioning-oversight?projectId={request.projectId}`

There is no richer payload, no explicit correlation ID handoff, no request ID handoff, and no explicit backend-side handoff record written by that action.

That means the current exception handoff is a **UI navigation handoff**, not a strongly correlated operational handoff contract.

## 2. Admin route-in currently keys off `projectId` only

The Admin oversight page reads `?projectId=` from the query string and auto-opens the first provisioning run whose `projectId` matches.

This is a real repo-truth risk because the durable provisioning model stores **multiple runs per project**, keyed by `projectId + correlationId`.

If multiple runs exist for one project, the current Admin deep-link contract does not prove that the intended run will be opened.

That is the single most important Phase 5 handoff gap.

## 3. Estimating still participates in the exception path

The live repo does not make Admin the sole owner of all exception initiation.

The Estimating requester experience still includes:

- bounded retry for coordinator-retryable transient failures
- escalation to Admin for non-retryable failures
- “Open Admin Recovery” deep-link behavior

That means the true Phase 5 scope is not only Accounting/Admin. It is **Admin exception-path integration anchored by Accounting, but still intersecting the Estimating failure path**.

The revised package reflects that reality without letting Phase 5 drift into a requester redesign phase.

## 4. Retry is not purely Admin-only in backend contract terms

The Admin surface presents retry as an Admin-class action, but the backend `retryProvisioning` route is not currently protected by `requireAdmin()`.

That is not automatically wrong, because the Estimating requester surface also uses retry for bounded transient recovery. But it means the package must not collapse “retry” into a blanket Admin-only category without checking the intended role and failure-class gating.

## 5. Escalation is not purely Admin-owned

Similarly, the backend `escalateProvisioning` route is not admin-only. The requester-side retry/escalation component can escalate to Admin when coordinator retry is no longer appropriate.

This means escalation is currently a **shared exception-path concept**:
- initiated outside Admin
- acknowledged and governed inside Admin

That distinction matters and the revised prompts now force it.

## 6. Admin does own several stronger recovery actions

The current Admin surface and backend do support a clearer Admin-exclusive class of actions, including:

- archive failure
- acknowledge escalation
- force state transition
- full runs visibility
- failure queue visibility
- expert-tier diagnostics

Those are the true center of the Admin recovery boundary.

## 7. Request/state drift risk remains real after some Admin actions

The saga and timer handlers reconcile the request record when provisioning starts, succeeds, or fails.

But some Admin-side recovery/status actions appear to mutate provisioning status directly without clearly reconciling the corresponding request record.

The most obvious candidates are:

- archive failure
- acknowledge escalation
- force state transition

That means Phase 5 must not stop at UI routing and authorization. It must also verify post-action **request/status consistency**.

## 8. Reopen is a lifecycle concept, but not a strongly surfaced Admin action

The backend lifecycle model still allows `Failed -> UnderReview`, and admins are broadly authorized for valid transitions. But the current Admin oversight surface is oriented around provisioning-status recovery actions rather than an explicit “reopen request” action.

That is an important nuance:
- reopen exists in lifecycle terms
- reopen is not yet a clearly surfaced Admin recovery affordance
- later prompts must handle this carefully instead of assuming it is already cleanly integrated

---

## Package ↔ Repo Alignment Analysis

## Prompt sequence

The six-prompt order is correct and should be preserved.

### Keep as-is in order

1. Prompt-01 — audit
2. Prompt-02 — cross-app handoff
3. Prompt-03 — recovery boundary and authorization
4. Prompt-04 — escalation / reopen / retry lifecycle integration
5. Prompt-05 — operator UX verification
6. Prompt-06 — final reconciliation and readiness

The problem is not ordering. The problem is precision inside the prompts.

---

## Detailed Gap Analysis

## Gap 1 — Source list is too narrow for real exception-path truth

**Severity:** High

The uploaded package focuses mainly on Accounting, Admin, and backend provisioning routes. That is not enough.

It must also explicitly review:

- Estimating failure-path files
- cross-app URL helpers in both affected apps
- backend lifecycle/state-machine logic
- failure-class logic that determines bounded retry versus Admin recovery
- request/status storage and mutation points

Without that, the prompts can misclassify shared exception behavior as Admin-only behavior.

## Gap 2 — Cross-app route contract is underspecified

**Severity:** High

The uploaded Prompt-02 is right to ask for stable routing and context handoff, but it is not explicit enough about the actual current risk:

- Accounting currently passes only `projectId`
- Admin currently resolves only by `projectId`
- the durable model allows multiple runs per project

The revised package now makes that ambiguity a first-order audit and hardening target.

## Gap 3 — Prompt-03 overstates “Admin-only” unless carefully qualified

**Severity:** High

The uploaded Prompt-03 is close, but in its original form it risks pushing a local code agent toward an inaccurate simplification:

- retry is not purely Admin-only in current backend contract terms
- escalation is not purely Admin-only in current repo truth

The revised prompt now separates:

- true Admin-exclusive recovery actions
- shared exception initiation
- backend route posture versus UI posture

## Gap 4 — Lifecycle integration prompt needs stronger request/status drift checks

**Severity:** High

The uploaded Prompt-04 is correctly focused on escalation / reopen / retry interaction, but it does not force enough verification of whether Admin-side recovery/status actions reconcile the request record.

That is now a required check in the revised package.

## Gap 5 — UX verification prompt should be more ownership-aware

**Severity:** Medium-High

The uploaded Prompt-05 properly focuses on Accounting/Admin operator clarity, but the repo truth shows that operator ownership messaging for exceptions spans:

- Accounting controller routing
- Estimating requester/coordinator retry-escalation language
- Admin recovery ownership

The revised package keeps the phase centered on Accounting/Admin, but it forces verification of adjacent Estimating ownership cues where they intersect the exception path.

## Gap 6 — Some current living docs are partially stale or overly absolute

**Severity:** Medium

The current living docs are useful, but several statements are too absolute for current repo truth, especially where they imply:

- Admin exclusivity over all recovery actions
- a stronger handoff contract than `?projectId=` currently provides
- a backend maturity level that fully closes request/status drift risk

The revised package forces classification instead of silent acceptance.

---

## Main Repo-Truth Findings That Changed the Package

## Finding A — `projectId`-only handoff is not strong enough for multi-run durability

This is the most important change driver.

Because provisioning runs are persisted per `projectId + correlationId`, a Phase 5 package cannot treat `?projectId=` as a fully sufficient context-handoff contract without explicit justification.

The revised Prompt-02 now requires the agent to decide whether to:

- preserve `projectId`-only route-in intentionally and document it
- or strengthen the handoff with run-specific context

## Finding B — Admin exclusivity must be split from shared retry/escalation behavior

The revised Prompt-03 now explicitly asks the agent to inventory:

- Admin-exclusive UI actions
- Admin-exclusive backend routes
- shared backend routes used by other surfaces
- mismatches between surface language and route authorization

## Finding C — Phase 5 must test for request/provisioning drift after Admin actions

The revised Prompt-04 now explicitly checks whether Admin exception actions leave:

- request state stale
- provisioning status updated
- ownership semantics contradictory
- reopen semantics ambiguous

## Finding D — Estimating failure escalation remains part of the exception path

The revised README and implementation plan now call this out so later prompts do not incorrectly rewrite the phase around a false two-app model.

---

## Revised Package Decisions

## Decision 1 — Preserve the six-stage order

Kept.

## Decision 2 — Expand repo-truth sources

Added / emphasized:

- `apps/estimating/src/pages/RequestDetailPage.tsx`
- `apps/estimating/src/components/project-setup/RetrySection.tsx`
- `apps/estimating/src/utils/failureClassification.ts`
- `apps/accounting/src/utils/crossAppUrls.ts`
- `backend/functions/src/state-machine.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `docs/reference/spfx-surfaces/estimating-requester-surface.md` when needed
- relevant Admin tests

## Decision 3 — Reframe Admin boundary as “Admin-exclusive recovery + shared exception interfaces”

This is the biggest conceptual revision.

## Decision 4 — Make route-in ambiguity explicit

Prompt-02 now forces explicit verification of whether `projectId`-only preselection is sufficient.

## Decision 5 — Make post-action request/status consistency a required check

Prompt-04 and Prompt-05 both now include this.

---

## Priority Refinements

## Priority 1

Strengthen Prompt-02 around deep-link payload sufficiency and multi-run ambiguity.

## Priority 2

Strengthen Prompt-03 so it separates:
- Admin-exclusive actions
- shared exception actions
- backend route authorization posture
- UI ownership presentation

## Priority 3

Strengthen Prompt-04 so Admin mutations are checked for request/status drift.

## Priority 4

Update README and implementation plan to reflect Estimating’s continued exception-path role.

## Priority 5

Update final readiness criteria so closure is not claimed unless run/context handoff and ownership semantics are explicit.

---

## Final Assessment

The uploaded Phase 5 package is **worth keeping**, but it was not yet precise enough to safely drive implementation against the live repo.

The revised package keeps the strong overall structure while correcting the main repo-truth mismatches:

- Admin-only versus shared exception behavior
- weak cross-app route-in context
- multi-run ambiguity
- request/status drift checks
- ownership language across surfaces

That makes the revised package a safer Phase 5 execution guide.
