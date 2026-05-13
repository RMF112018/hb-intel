# Prompt 07 — Discovery Writer Match-Truth Correction and Preservation Guardrails

## Scope
- Corrected legacy fallback discovery writer persistence to store truthful matching-engine output.
- Preserved existing discovery provenance fields (`recordKey` + matching notes + timestamps).
- Added regression tests for truthful match-state persistence and manual-field preservation posture.

## Before vs After
- Before: discovery writer hardcoded `MatchStatus='matched'`, `MatchConfidence='high'`, `MatchMethod='no-match'` in SharePoint payload.
- After: discovery writer writes values from matching decision input:
  - `input.matching.matchStatus`
  - `input.matching.matchConfidence`
  - `input.matching.matchMethod`

## Manual My Projects Field Preservation
- Discovery refresh payload remains write-minimal and does not include manual My Projects fields:
  - canonical role arrays (`leadEstimatorUpns` through `warrantyManagerUpns`)
  - `procoreProject`
- This prevents legacy-only operator-maintained values from being blanked by discovery refresh.
- Prompt 06 mirror/preservation backfill remains the authoritative lane for matched-row enrichment and legacy-only preservation semantics.

## Non-goal Adherence
- No schema changes.
- No list provisioning/backfill execution.
- No live tenant writes executed.
- No matching-engine decision-rule redesign performed.

## Residual Operator Notes
- Run discovery/backfill in tenant only via operator-gated lanes after readiness gates are met.
- Prompt 08 can proceed using truthful persisted match states.
