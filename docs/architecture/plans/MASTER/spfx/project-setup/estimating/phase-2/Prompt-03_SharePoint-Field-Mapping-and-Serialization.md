# Prompt 03 — SharePoint Field Mapping and Serialization

## Objective

Implement the centralized field-map and serialization/deserialization helpers so every `Projects` list interaction passes through a single authoritative translation layer.

## Context

This prompt begins only after Prompt 02 is complete and the canonical type boundaries are defined.

## Critical instructions

- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not scatter new `field_*` references across service code.
- Keep all internal-name knowledge centralized.
- Do not preserve incorrect legacy display-name assumptions.

## Required work

1. Create a single authoritative field-map module for the production `Projects` list.
2. Implement helpers for:
   - SharePoint item -> domain object
   - domain object -> create payload
   - domain object -> update payload
   - field resolution for select/filter/query usage
3. Refactor existing adapter/service utilities to use the centralized field-map.
4. Remove direct-friendly-name and ad hoc internal-name usage where replaced.
5. Add inline documentation to the field-map so future contributors understand the contract.

## Required deliverables

- Field-map module
- Serialization/deserialization helpers
- Refactored adapter/service integration points

## Acceptance criteria

- A reviewer can find the full `Projects` list field contract in one place.
- Service-layer code no longer embeds the production list schema directly.
- The field-map is human-auditable and easy to update safely.
