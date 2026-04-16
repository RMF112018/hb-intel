# 07 — Research Notes

## Research posture used

The audit used live repo truth first, then checked-in tenant schema evidence, then external research to strengthen the remediation package with implementation-aware best practices.

## High-value external research used

### SharePoint uniqueness and indexing
Research confirmed that SharePoint unique value enforcement depends on indexed columns, and that uniqueness/indexing should be treated as an explicit field contract rather than an assumption hidden in app logic.

### SharePoint REST update behavior
Research confirmed the practical semantics of list-item updates through REST `MERGE` and the role of `If-Match`/ETag behavior. That matters because several publisher writes currently use `MERGE`-style semantics and should not silently target ambiguous first-match items.

### Compensating transaction / idempotent compensation guidance
Research reinforced that multi-step eventually consistent workflows should preserve enough information to compensate failed steps and should make compensation steps idempotent where possible. The current publish orchestrator already leans in this direction, which is why the rebuilt prompts preserve and extend that posture rather than replacing it.

### Test strategy
Research on Vitest mocking guidance was used to support stronger prompt instructions around targeted unit/integration-style tests for repository, controller, and orchestrator seams.

## How the research changed the rebuilt package

1. Prompt 04 now more explicitly requires uniqueness/index authority and duplicate fail-closed behavior
2. Prompt 05 now emphasizes structured lineage as durable compensation/audit state rather than merely cleaner note text
3. Prompt 06 now hardens the error surface into structured operational dimensions instead of leaving stage detail primarily in prose
