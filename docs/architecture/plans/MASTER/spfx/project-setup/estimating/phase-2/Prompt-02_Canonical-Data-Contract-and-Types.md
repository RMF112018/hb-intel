# Prompt 02 — Canonical Data Contract and Types

## Objective

Define the canonical Project Setup data contract and separate business/domain types from SharePoint persistence types so the backend no longer mixes business semantics with storage semantics.

## Context

This prompt begins only after Prompt 01 is complete and the baseline mapping matrix exists.

## Critical instructions

- Do not re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not change auth, token handling, or infrastructure in this prompt.
- Keep this prompt focused on type boundaries, mapping design, and normalization rules.
- Prefer a design that is easy to audit and hard to misuse.

## Required work

1. Define the canonical domain model(s) for Project Setup request/project data.
2. Define the SharePoint persistence DTO/model(s) for the production `Projects` list.
3. Define explicit translation boundaries between the two.
4. Decide and document normalization rules for:
   - null vs empty string
   - numbers
   - booleans
   - dates
   - enums/state values
   - URLs
   - people/user references
5. Create or update shared type definitions and adapter interfaces.
6. Produce a short design note explaining why this contract shape was chosen.

## Required deliverables

- Canonical domain type definitions
- Persistence type definitions
- Normalization rules markdown
- Updated architectural notes or inline docs where appropriate

## Acceptance criteria

- Domain logic no longer needs to know SharePoint internal field names.
- SharePoint persistence logic no longer masquerades as the domain model.
- The contract is explicit, typed, and maintainable.
