# Prompt-03 — Implement Canonical Relational Core and Publication Contracts

## Objective
Introduce the first governed canonical relational storage layer and the first consumer-safe publication contracts for Procore.

## Governing authorities
- `docs/how-to/developer/native-integration-backbone-implementation-guide.md`
- `packages/data-access/src/factory.ts`
- `packages/query-hooks/**`
- `packages/models/**`
- Procore package files:
  - `03-Canonical-Entity-Inventory.md`
  - `08-Relational-Mapping-Concepts.md`
  - `canonical_model.json`
  - `entity_relationships.csv`
  - `star_schema_recommendation.md`

## Repo seams to inspect
- `backend/functions/src/services/**`
- `packages/models/**`
- `packages/data-access/**`
- `packages/query-hooks/**`

## Current gap to close
The repo has no canonical Procore relational layer and no publication contracts for Procore-backed read models.

## Required implementation outcome
1. Add a canonical relational schema foundation for:
   - company
   - project
   - user
   - vendor
   - WBS/sub-job or equivalent cost-code foundations
   - project-user/project-vendor bridge families
2. Add first-wave financial and project-health publication contracts.
3. Keep canonical storage distinct from raw custody.
4. Create publication/read-model tables or views that backend APIs can serve without exposing raw canonical internals.
5. Add shared contracts in `packages/models` only where cross-package use requires them.
6. Add repository and query-hook seams for the published read models, not for raw connector tables.

## Proof of closure
Return:
- canonical schema families introduced
- publication/read-model contracts introduced
- repository/query-hook contracts introduced
- explanation of what remains internal-only vs consumer-safe
- evidence that frontend consumers are not coupled to raw connector tables

## Guardrails
- Do not dump the full Procore model into SharePoint.
- Do not let feature packages call connector internals directly.
- Do not build a heavy “universal schema” beyond what first-wave joins require.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
