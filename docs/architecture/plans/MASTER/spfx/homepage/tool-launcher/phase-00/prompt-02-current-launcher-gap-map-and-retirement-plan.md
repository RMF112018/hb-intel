# Prompt 02 — Current Launcher Gap Map and Retirement Plan

## Objective

Create a precise current-vs-target gap map for the Tool Launcher / Work Hub and identify the structural assumptions, surface behaviors, and local-contract patterns that must be retired before the premium marketplace launcher can be built correctly.

## Inputs you must use

Use the repo-truth audit output from Prompt 01 plus the following planning inputs:

- the Tool Launcher / Work Hub architecture and layout brief
- the current asset-manifest direction for platform logos and fallback strategy
- the updated implementation direction that the list already exists and is seeded

## Working rules

- repo truth first
- do not re-read files still in your current context unless needed
- no code changes in this prompt unless documenting narrowly scoped preparatory notes
- do not create speculative architecture detached from the actual repo
- do not waste time recreating the platform schema

## Required analysis

Build a gap map across the following categories:

1. **Content source**
   - current local grouped config
   - target live SharePoint list adapter

2. **Information architecture**
   - current grouped categories
   - target flagship stage + utility rail + workflow shelves + all-platforms layer

3. **Brand treatment**
   - current icon-led tiles
   - target platform-logo-led flagship treatment with governed fallback

4. **Support / utility actions**
   - current state
   - target help / access / notices treatment

5. **Search and discovery**
   - current state
   - target command/search behavior

6. **Authoring and resilience**
   - current empty/loading/error posture
   - target partial-data and live-field normalization posture

## Required output

Produce a markdown file named:

- `phase-00-gap-map-and-retirement-plan.md`

with these sections:

### 1. Current-vs-Target Gap Matrix
A practical matrix or equivalent structured format.

### 2. What Can Be Reused
Be disciplined and practical. Reuse is allowed if justified.

### 3. What Must Be Replaced
Be direct. Do not preserve weak structures just because they already compile.

### 4. What Must Be Retired
List the stale assumptions, local shapes, and composition shortcuts that should not carry forward.

### 5. Sequence Implication
Explain how this gap map changes the next phase ordering.

## Required conclusion

End with a compact recommendation of what Phase 01 must actually implement first.
