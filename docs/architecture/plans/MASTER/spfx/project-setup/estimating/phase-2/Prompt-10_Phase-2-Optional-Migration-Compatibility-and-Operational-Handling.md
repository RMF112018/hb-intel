# Prompt 15 — Phase 2 Optional Migration, Compatibility, and Operational Handling

## Objective
Evaluate and implement the minimum responsible compatibility strategy for old `Projects` list rows so the newly aligned Phase 2 contract does not create operational confusion or inconsistent historical behavior.

## Critical instructions
- Do not assume a full historical data migration is required unless repo truth and operational need justify it.
- Prefer a minimal, explicit strategy over a half-hidden one.
- Preserve system safety and operator clarity.
- Distinguish clearly between:
  - forward compatibility for new requests
  - read compatibility for old requests
  - optional historical backfill / migration

## Context
Once the list schema and mapper/repository are aligned, a practical question remains:
- What happens to older Project Setup requests created before the new columns and mapper support existed?

This prompt is about deciding and implementing the appropriate compatibility posture.

## Required work
1. Review the live operational surfaces that read Project Setup requests.
   - requester detail views
   - controller/accounting review views
   - admin oversight views
   - provisioning status / retry / clarification surfaces as relevant

2. Decide the minimum responsible compatibility strategy.
   Choose and implement the repo-truth-appropriate approach:
   - **Option A:** read-compatible only, no historical backfill
   - **Option B:** soft derived fallback for a few legacy fields
   - **Option C:** explicit migration/backfill utility or documented runbook

Do not guess. Make the decision based on actual usage and risk.

3. Implement the chosen approach.
   - Ensure old rows remain readable and operationally understandable.
   - If you add fallback derivation, keep it narrow and documented.
   - If you add a migration or backfill tool, keep it explicit, auditable, and out of the request hot path unless strongly justified.

4. Document operator expectations.
   - Make it clear which fields are guaranteed for newly created requests
   - which fields may be empty on legacy requests
   - whether any manual or scripted backfill is required

## Files likely in scope
Potentially:
- controller/admin pages that render Project Setup data
- repository normalization helpers
- scripts or operational docs if migration/backfill is chosen
- review docs and phase docs

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 2 compatibility progress note** that:
- states the chosen legacy-row strategy
- explains why that strategy was selected
- states whether migration/backfill is required, optional, or not recommended
- captures the operational implications clearly

Add a **closure statement draft** such as:
- “Legacy Project Setup rows are now handled by an explicit compatibility strategy, and the forward production path persists the canonical field set without requiring hidden assumptions.”

## Evidence requirements
The review doc update must include:
- exact surfaces reviewed
- chosen strategy
- code/docs changed
- any manual follow-up required outside code

## Acceptance criteria
- Legacy rows have a defined and implemented handling strategy.
- Operator-facing behavior is predictable.
- No hidden migration assumptions remain.
- The review doc is updated with truthful progress notes, closure language, and evidence.
