# Prompt 08 — Upgrade the queue from inventory rail to momentum tool

## Objective

Make the queue better at moving authors toward completion by surfacing clearer “what next” and “stuck because” signals instead of behaving primarily as a grouped inventory list.

## Why this issue matters

Repo truth shows the queue is already functional and reasonably well-behaved:
- grouped by workflow state
- searchable
- keyboard navigable
- persistent collapsed state
- completeness chips and age/attribution summaries

But it still behaves more like a **well-organized inventory rail** than a **publishing-throughput tool**.
Wave 01 should close that gap because queue behavior directly affects whether authors re-enter stalled drafts and whether they can quickly decide what to work on next.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/workspace/QueueRail.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/draftCompleteness.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/authorAttribution.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/draftQueue/humaniseAge.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/workspace/useDraftWorkspace.ts`
- any directly coupled queue or completeness tests

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

The queue currently helps authors find drafts.
It does less to help authors decide:
- which draft is closest to publish
- which draft needs one or two fast fixes
- which draft is stuck and why
- what action is most useful when re-entering the workflow

## Required implementation outcome

Upgrade the queue so it contributes to publishing momentum.

At minimum:

1. keep the existing stable foundations
   - grouped workflow states
   - search
   - keyboard navigation
   - persisted collapse/search state
   - selection handoff into the canvas

2. surface better next-action signals
   - closest-to-publish / ready-state cues
   - stuck-because cues where meaningful
   - clearer interpretation of completeness beyond a generic chip alone

3. improve scan quality without overloading the rail
   - the queue should be more informative, but it must remain fast to parse
   - do not turn every row into a dense diagnostics block

4. preserve author-friendly language
   - no raw enum leakage
   - no technical jargon where an author-facing explanation is needed

5. keep the queue aligned with the rest of Wave 01
   - any queue messaging about readiness or next action must not contradict the readiness rail or preview truth model

## Dependencies / cross-surface considerations

- queue messaging must remain consistent with the final readiness model from Prompt 04
- changes to completeness or next-action cues must preserve existing grouping and selection behavior
- do not widen scope into a large workflow-state-machine rewrite unless genuinely required for closure and fully implemented now

## Validation / proof-of-closure requirements

Prove all of the following:

- the queue remains searchable and keyboard navigable
- selection behavior still works correctly
- queue state persistence still works
- the rail now makes it easier to spot what to work on next and why a draft is stuck
- queue language does not contradict the readiness rail or preview truth model

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates for queue behavior
- a concise closure note summarizing:
  - what momentum-oriented signals were added or improved
  - how scan quality improved without overloading the rail
  - what was done to preserve keyboard/state behavior

## Explicit non-goals

- do not replace the grouped queue architecture outright
- do not turn the queue into a full diagnostics rail
- do not make unrelated canvas or lifecycle changes
