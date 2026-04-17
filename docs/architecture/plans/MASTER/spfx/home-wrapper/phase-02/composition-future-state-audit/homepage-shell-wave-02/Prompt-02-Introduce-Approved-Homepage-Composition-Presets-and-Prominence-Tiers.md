# Prompt 02 — Introduce Approved Homepage Composition Presets and Prominence Tiers

## Objective
Encode homepage hierarchy into approved shell presets so future controlled variation does not flatten the experience.

## Governing authority
- shell schema and capability contracts from Wave 01
- homepage doctrine anti-safety-zone rules
- benchmark requirement for authored, premium composition

## Exact repo seams to inspect
- new shell schema files
- `HbHomepageShell.tsx`
- any new shell layout resolver from Wave 01

## Current gap
Even after the shell becomes data-driven, it still needs authored presets that define:
- what is dominant
- what is supporting
- what is optional
- what may demote/collapse

## Required implementation outcome
Create approved composition presets that define:
- band sequencing
- prominence tiers
- wide / medium / narrow behavior
- rules for optional tertiary modules
- compatibility-aware grouping

At minimum encode a strong default preset and at least one alternate approved preset that still protects flagship quality.

## Proof of closure required
Provide:
- preset definitions
- rationale for each tier
- proof that the presets are meaningfully different but still governed
- proof that the shell does not regress into equal-weight stacking

## Prohibited
- do not build freeform presets without guardrails
- do not let every module become full-width by default
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
