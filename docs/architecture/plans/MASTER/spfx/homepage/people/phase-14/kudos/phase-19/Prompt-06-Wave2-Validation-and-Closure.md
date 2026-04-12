# Prompt 06 — Wave 2 validation and closure

## Objective

Validate that all Wave 2 issues have been comprehensively addressed and that the HB Kudos implementation is ready to move to Wave 3 without revisiting Wave 2 foundations.

## Validation checklist

### 1. Structural validation
Confirm:
- `HbKudos.tsx` is materially smaller / clearer
- `HbKudosCompanion.tsx` is materially smaller / clearer
- extraction boundaries are meaningful and not cosmetic
- shared local UI seams are stronger
- shared behavior seams are quieter and cleaner

### 2. Productization validation
Confirm:
- the public surface feels more clearly like a productized recognition system
- the companion feels more clearly like a mature governance workspace
- neither surface lost its role-specific identity
- Wave 1 doctrine and design-system posture remains intact

### 3. Runtime integrity validation
Confirm:
- `mount.tsx` wiring remains correct
- manifest IDs and adjacency remain intact
- list-binding model remains stable
- role/capability semantics remain stable
- audit-event semantics remain stable
- dev-harness assumptions remain compatible

### 4. Quality validation
Run and/or verify:
- lint
- typecheck
- any relevant local tests
- relevant Kudos harness/runtime checks that confirm no major regression was introduced by the refactor

### 5. Output
Produce a concise closure note with:
- files changed
- Wave 2 findings closed
- any remaining Wave 2 gaps, if any
- explicit statement on whether Wave 2 is ready to close and Wave 3 can begin

## Guardrails

- Do not turn this into Wave 3.
- Do not begin the broader experience-cohesion / accessibility wave here.
- Validate Wave 2 thoroughly and stop cleanly.
