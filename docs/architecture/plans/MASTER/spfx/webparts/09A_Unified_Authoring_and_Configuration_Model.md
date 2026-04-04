# 09A — Unified Authoring and Configuration Model

## Purpose

Lock Prompt-09 authoring discipline across all first-release homepage webparts so site owners can maintain content without developer intervention for routine updates.

## Unified Configuration Pattern

- Property-pane authored configuration remains first-release default for routine content updates.
- Config models must support deterministic ordering, optional audience visibility, and explicit CTA/media validation.
- Shared normalization seams perform malformed/partial filtering before rendering.
- No webpart may fail silently; loading, no-data, invalid, and no-result states must be explicit.

## Shared Governance Seam

- Contract: `authoringGovernanceContracts.ts`
- Runtime registry + message resolver: `authoringGovernance.ts`
- Required metadata per webpart:
  - zone intent
  - owner role
  - freshness cadence
  - rotation expectation
  - allowed content scope
  - no-data/invalid authoring messages (plus no-result where applicable)

## Site-Owner Authoring Expectations

- Routine content updates: property pane edits and list-backed source refreshes where configured.
- Weekly governance review: promoted items, CTA relevance, audience targeting, and stale content checks.
- Escalation to developers is reserved for structural contract or integration changes, not standard content rotation.
