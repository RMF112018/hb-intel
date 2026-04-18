# PROMPT 10 — Manifest, Packaging, Hosted Validation, and Closure

## Implementation objective

Complete the final build/package/hosted validation pass required to prove the redesigned flagship rail survives beyond local development and satisfies the SharePoint-hosted closure bar.

## Work classification

**Refinement and closure**

## Exact repo files / seams / symbols to inspect

- relevant `apps/hb-webparts` build / package pipeline seams
- relevant manifests for the homepage webparts involved
- `apps/hb-webparts/src/webparts/priorityActionsRail/**`
- `apps/hb-webparts/src/webparts/hbHomepage/**`
- any repo runbook or closure docs used for homepage packaging/validation

## Current weakness

The attached package pair correctly refuses to accept local rendering as closure, but it still leaves too much implicit about the exact finish line. That is not strong enough for flagship SPFx work.

## Why the current condition is inadequate

SPFx work is only complete when the packaged, hosted result matches the intended structural upgrade. Without that proof, the redesign remains provisional.

## Required future state

Perform full closure. The future state must include:

- passing tests
- successful build
- successful package generation
- hosted SharePoint validation of the flagship rail above the shell
- explicit confirmation that wrapper order, flagship context, overflow behavior, and compact states still hold in the hosted result
- a concise residual-defects statement with no unjustified deferrals

If an in-scope issue appears during hosted validation, fix it now.

## What done actually looks like

Done means:

- `.sppkg` output is produced successfully
- hosted SharePoint render matches the intended flagship redesign
- closure evidence exists in plain language
- no meaningful in-scope defect is deferred under a vague future-work note

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`

## Recommended dependencies / development concepts

- Packaging/hosting are part of the product, not a separate afterthought.
- Preserve manifest intent and host-safe placement.
- Treat the hosted page as the final authority on closure, not the local preview alone.

## Required implementation and validation expectations

- Run and record the exact commands used.
- Validate hosted behavior across the required display classes.
- Record whether any packaging or hosted-only issues appeared and how they were resolved.
- Provide a concise closure note suitable for review.

## Prohibitions

- Do not stop at local rendering.
- Do not declare victory without hosted proof.
- Do not leave a meaningful in-scope hosted defect for a later pass.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
