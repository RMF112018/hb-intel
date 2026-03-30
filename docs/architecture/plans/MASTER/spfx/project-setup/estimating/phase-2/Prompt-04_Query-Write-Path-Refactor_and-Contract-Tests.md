# Prompt 04 — Query/Write-Path Refactor and Contract Tests

## Objective

Refactor all active Project Setup persistence flows to use the canonical mapping layer, then add tests that prove the data contract is correct and regression-resistant.

## Context

This prompt begins only after Prompt 03 is complete and the field-map layer exists.

## Critical instructions

- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Keep all persistence paths routed through the new mapping layer.
- Do not leave transitional bypass paths in place.
- Make the tests specific enough to fail on field-name drift or partial rollback.

## Required work

1. Refactor all relevant read/list/create/update/state-transition paths to use the centralized mapping helpers.
2. Add tests for:
   - item-to-domain mapping
   - create payload mapping
   - update payload mapping
   - query/select/filter field resolution
   - null/empty normalization
   - missing expected fields
   - incompatible type inputs
3. Add regression tests that fail if old direct field assumptions reappear.
4. Update any related docs or comments needed to keep the new paths maintainable.

## Required deliverables

- Refactored persistence paths
- Unit tests
- Contract/regression tests
- Short implementation summary

## Acceptance criteria

- All active Project Setup persistence paths are exercised through the mapping layer.
- Tests fail loudly when the field contract is broken.
- The old unsafe assumptions are gone, not merely bypassed.
