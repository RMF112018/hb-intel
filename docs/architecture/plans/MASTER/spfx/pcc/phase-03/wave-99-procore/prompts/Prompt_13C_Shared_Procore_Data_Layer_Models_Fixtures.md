# Prompt 13C — Shared Procore Data Layer Models and Fixtures

## Objective

Add shared Procore data-layer contracts and deterministic fixtures for object links, curated summaries, sync health, source lineage, freshness, and derived signals.

## Required Work

1. Add the canonical model contracts listed in `artifacts/model_contract_requirements.json`.
2. Add fixture groups for mapping, sync health, object links, curated summaries, and derived signals.
3. Add pure utilities and tests.
4. Register read-model response-map entries only where required and justified.
5. Prove no runtime imports and no mutation helpers.

## Forbidden

No backend/SPFx edits unless strictly required for type exports. No live runtime.

## Validation

Run @hbc/models check-types/test/build and lockfile MD5 proof.
