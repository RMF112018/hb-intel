# Prompt 02 — Split-runtime containment and drift-risk reduction

## Objective

Contain the remaining risk introduced by split-runtime coexistence so HB Kudos can persist long-term without unnecessary drift between public, companion, and legacy-adjacent seams.

## Files in scope

Primary targets:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`

Context / supporting seams if needed:
- shared local UI and behavior files only where a narrow containment improvement requires it

## Problems to correct

### 1. Split-runtime coexistence can drift over time
Public and companion surfaces are intentionally separate, but the repo should make their boundaries, responsibilities, and preservation rules clearer so the split does not become an ongoing source of confusion or silent divergence.

### 2. Legacy-adjacent coexistence needs explicit containment
Where older or adjacent runtime paths still exist in the wider homepage ecosystem, HB Kudos should not be left vulnerable to accidental cross-pollination or ambiguous ownership.

### 3. Correct seams must be explicitly preserved
Mount wiring, manifest adjacency, and runtime mapping should be treated as locked and verified.

## Required implementation direction

### 1. Clarify runtime boundaries
Make it explicit in source and adjacent comments/docs where helpful:
- what the public Kudos runtime owns
- what the companion runtime owns
- what must remain shared
- what must not be collapsed

### 2. Reduce drift risk without redesigning the product
Do not merge runtimes or create speculative abstractions.
Contain risk through clearer boundaries, source clarity, and explicit preservation of correct seams.

### 3. Preserve manifest and mount integrity
Do not destabilize:
- GUID mapping
- adjacent manifest expectations
- packaging assumptions
- SharePoint-hosted runtime behavior

## Constraints

- Do not rewrite the broader People & Culture split strategy.
- Do not turn this into a large architecture migration.
- Do not touch unrelated webpart runtime mapping.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not introduce fake abstraction layers that hide ownership instead of clarifying it.
- Do not alter correct manifest or mount behavior unless a small correction is truly necessary.

## Deliverable

Implement the containment improvements and report:
- what drift risks were reduced
- what runtime/ownership boundaries are now clearer
- what manifest/mount/package seams were explicitly preserved
