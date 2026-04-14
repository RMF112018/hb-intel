# 00 - Audit Summary

## Executive Summary

Overall verdict: **partially wired, not production-trustworthy**.

The current `Article Publisher` implementation is materially improved at the list-title and contract level. The code is now pointed at the correct tenant list set on `HBCentral`, and most core contracts, list descriptors, repository bindings, and enum values are aligned to the extracted `HB Article*` schema.

That said, the implementation is **not operationally sound overall**. The highest-risk gaps are not cosmetic:

1. **The team-member user-field seam is not correctly closed end to end.**
   The tenant requires `HB Article Team Members.PersonPrincipal` as a SharePoint **User** field, but the authoring surface creates rows with only a string principal and the writer emits `PersonPrincipalId`. No resolution step was found that guarantees a real SharePoint user id before save.

2. **The republish / in-place update path does not actually guarantee same-page updates.**
   The policy layer says `inPlaceUpdate` preserves `PageId` and `PageUrl`, but the page creation layer resolves pages by **page file name**, not by the existing bound `PageId`. If slug/page-name drift occurs, the implementation can create or bind to a different page while still reporting an in-place update.

3. **The regeneration / binding lineage story is internally inconsistent.**
   The republish policy and comments describe superseding or archiving prior bindings on regeneration, but the actual binding writer upserts a single row by `ArticleId`. There is no durable prior-binding preservation path.

4. **The scheduled workflow branch is incomplete.**
   The workflow state machine allows `approved -> scheduled`, but the UI only enables Publish from `approved`, and no scheduled publish executor was found.

## Production readiness opinion

**Not ready for production publishing operations.**

- List title wiring: mostly correct
- Field wiring: mixed
- Parent/child relationships: partially correct
- Publish / republish lifecycle: not trustworthy enough for production use
- Archive / withdrawal flow: better than earlier design, but still constrained by lossy binding semantics
- Workflow history / error logging: mostly present, but not fully accurate in failure classification

## Biggest risks

- Invalid or failed writes to `HB Article Team Members`
- Duplicate or stale destination pages during republish when page identity drifts
- No durable regeneration lineage for destination bindings
- Articles stranded in `scheduled`
- Template resolution effectively bypassed for new rows because creation hard-wires a monthly template key

## Audit method

- Reviewed the current `main` branch implementation surface for:
  - web part manifest
  - entry component
  - adapter barrel
  - list descriptors
  - contracts
  - enums
  - repositories
  - row mappers
  - writers
  - workflow state machine
  - resolution context
  - template resolver
  - preview builder
  - validation engine
  - republish policy
  - publish orchestrator
  - page shell / compositor / page creation services
- Cross-walked all findings against:
  - `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

## Closure recommendation

The next step should be a **tightly bounded remediation package for the highest-priority category first**, not a giant wave package.

Recommended first bounded category:
1. **Publish / republish / binding identity integrity**
2. **Team-member user-field closure**
3. **Workflow completion gaps**
