# Prompt 02 — Close republish approval bypass

## Objective

Close the workflow-control defect that allows the **Republish** action to push already-bound articles live from an ineligible state. This is a control failure and must be fixed in a bounded, provable way.

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`

## Files and code paths to inspect

- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `any associated tests covering publish/republish gating`

## Exact defect to close

The current UI enables republish whenever a binding exists and validation passes. That allows a bound article in `draft`, `review`, or another non-published state to re-enter the live publish path and be stamped back to `published` without using the intended approval gate.

## Required implementation outcome

Implement hard republish gating so republish is only available from the intended republishable lifecycle state.

Recommended closure direction:
- gate the UI action itself
- add server/controller-side enforcement in the orchestrator path so UI drift cannot reintroduce the bypass
- keep the ordinary Publish path as the route for `approved` content, even when a binding already exists
- do not weaken existing regenerate/in-place update behavior for legitimately published articles

## Validation / proof of closure requirements

You must prove:
1. a bound article in `draft` cannot republish
2. a bound article in `review` cannot republish
3. an `approved` bound article still has a valid live publish route through the intended control flow
4. a legitimately `published` bound article can still republish
5. no archive/withdraw logic was changed in this prompt

Add or update tests to cover the exact state combinations.

## Deliverables / closure docs to create

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/closure-close-republish-approval-bypass.md`
- include test cases, files changed, and before/after behavioral table

## Guardrails

- Work in the live local repo.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Conduct an exhaustive scrub of the affected code path before making changes.
- Prove closure of this issue before moving to the next prompt.
- Do not make unrelated changes.
