# Prompt 04 — Strengthen readiness, publish diagnostics, and next-action clarity

## Objective

Turn the readiness rail into a clearer next-action system that tells the author, in plain and truthful language:
- what is blocking progress
- what will happen on publish
- what the most useful next step is
- what is merely informational versus truly action-relevant

## Why this issue matters

Repo truth already shows a strong readiness architecture.
The remaining problem is not “missing logic.”
It is that the product still spreads important status across several good-but-separate signals:
- save-state trust
- blocking issues
- warnings
- publish intent
- diagnostics details
- preview truth
- binding status

Wave 01 needs those signals to feel more like one coherent author decision surface.

## Governing authority / required references

- live local repo mirroring `main` in `RMF112018/hb-intel`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- the attached Wave 01 audit package, especially:
  - `00-Audit-Summary.md`
  - `01-Repo-Truth-Implementation-Map.md`
  - `03-UI-UX-Findings-Register.md`
  - `04-Prioritized-Enhancement-Plan.md`

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/readinessSurface/PublishReadinessDiagnostics.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useSaveStateTrust.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/lifecycleMessaging.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/findingAnchor.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/sectionFocus.ts`
- any directly coupled validation or readiness helper used by the right rail

Before making changes, conduct an exhaustive scrub of the full affected path and any directly coupled seams those files call into.

Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty after new findings.

## Current-state problem description

The readiness rail is already materially better than a typical internal authoring form.
However, the remaining signals are still not as unified or next-step-oriented as they should be.

The author should not have to mentally reconcile several separate “mostly good” cues to decide what to do next.

## Required implementation outcome

Strengthen the readiness surface into a more coherent next-action system.

At minimum:

1. align all readiness narration with the preview truth model established in Prompt 03

2. tighten the hierarchy of status
   - blocking issues must read as blocking
   - warnings must read as warnings, not hidden blockers
   - informational diagnostics must not compete visually with urgent action items

3. make next action explicit
   - when a draft is blocked, tell the author what to fix next
   - when it is ready, tell the author what publish will do next
   - when save state or preview freshness changes the recommended action, narrate that clearly

4. keep technical details available but subordinate
   - drift/versioning and machine-readable validation details can remain accessible
   - they should not crowd out the author’s immediate decision path

5. preserve jump-to-fix behavior
   - blocking and warning findings must still link reliably back to the correct section

## Dependencies / cross-surface considerations

- this prompt must use the preview truth model from Prompt 03 and must not contradict it
- any change to grouping, copy, or emphasis must preserve existing validation findings and focus-jump behavior
- do not create new raw enum leakage or technical jargon in author-facing copy
- do not change publish gating rules unless a genuine readiness-truth defect requires it

## Validation / proof-of-closure requirements

Prove all of the following:

- the readiness rail now makes the next best author action clearer than before
- blocking issues, warnings, and informational diagnostics are easier to distinguish
- jump links still land in the correct authoring section
- publish intent is easier to understand without losing technical truth
- save-state, preview-freshness, and publish-readiness narration no longer work against each other

## Deliverables / closure artifacts

- code changes required for closure
- any narrowly necessary tests or validation updates for readiness/jump behavior
- a concise closure note summarizing:
  - what changed in readiness hierarchy
  - how next-action clarity improved
  - what was done to preserve finding-jump and gating integrity

## Explicit non-goals

- do not widen this into a full visual redesign of the right rail
- do not create unrelated changes in lifecycle orchestration
- do not weaken technical diagnostics merely to simplify copy
