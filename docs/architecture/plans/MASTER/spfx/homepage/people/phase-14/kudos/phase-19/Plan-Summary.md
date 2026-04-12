# HB Kudos Wave 2 — Plan Summary

## Objective

Correct the full Wave 2 UI-layer architecture and shared-seam issues so HB Kudos becomes materially cleaner, more maintainable, more productized, and easier to extend in later waves.

## Wave 2 target outcomes

### 1. Decompose the oversized runtime files
- Thin out `HbKudos.tsx`
- Thin out `HbKudosCompanion.tsx`
- Move orchestration, row rendering, toolbar logic, panel composition, and action routing into smaller, focused local seams where appropriate

### 2. Make the public surface systemically premium
The public surface already has authored visual ambition.
Wave 2 should make it feel like a truly productized, system-backed recognition surface rather than a strong but hand-shaped composition.

### 3. Productize the companion workspace
The companion already has deep functional richness.
Wave 2 should improve its composition, readability, local governance, and maintainability without weakening the workflow model.

### 4. Harden the shared local UI layer
- Replace weak local token patterns with more disciplined aliases
- Formalize variants
- Strengthen shared local UI seams so the public and companion surfaces stop repeating local one-off patterns

### 5. Scrub and de-risk shared behavior seams
- remove production debug noise
- tighten hook discipline
- reduce shared service overgrowth where it materially improves maintainability
- preserve working behavior and SharePoint semantics

## Recommended sequence

1. Lock scope and preserve runtime invariants.
2. Decompose and clean the public runtime.
3. Decompose and clean the companion runtime.
4. Strengthen local shared Kudos UI seams and variant discipline.
5. Scrub shared hooks/services and remove production debug residue.
6. Validate Wave 2 and stop before Wave 3.

## What success looks like

Wave 2 is successful only if:
- the top-level runtime files are materially smaller and clearer
- the public and companion surfaces feel more productized
- shared local UI seams are stronger and more disciplined
- shared behavior seams are cleaner and quieter
- the implementation is ready for Wave 3 without needing to revisit Wave 2 structure
