# HB Kudos Wave 1 — Plan Summary

## Objective

Correct the full Wave 1 foundation so HB Kudos is no longer out of compliance with the homepage doctrine and no longer reliant on weak, ad hoc UI-layer styling patterns.

## Wave 1 target outcomes

### 1. Remove direct doctrine violations
- Eliminate Unicode / pseudo-icon usage in homepage-facing Kudos UI.
- Replace with a governed icon system that fits the homepage doctrine.

### 2. Restore design-system discipline
- Stop treating `@hbc/ui-kit/homepage` as a technical import boundary only.
- Make the Kudos surfaces behave like a governed local surface family built on shared foundations.

### 3. Correct token discipline
- Reduce raw hex / rgba sprawl.
- Move toward theme-derived aliases and disciplined local token usage.

### 4. Replace styling drift with maintainable surface architecture
- Reduce giant injected style blocks.
- Reduce giant inline style objects.
- Create a formal variant posture for repeated patterns.
- Improve consistency between public and companion surfaces without making them identical.

### 5. Materially adopt the approved homepage premium stack where relevant
Use the approved stack intentionally where it directly improves compliance and maintainability:
- `lucide-react`
- `class-variance-authority`
- `clsx`
- `motion` only where it materially improves the homepage experience without fighting the SharePoint host

## Recommended sequence

1. Lock the authority, scope, and wave boundaries.
2. Replace non-compliant iconography and establish a real icon seam.
3. Refactor raw token usage into a theme-driven local alias system.
4. Rebuild the styling architecture around classes and variants instead of raw style sprawl.
5. Formalize Kudos as a governed local homepage surface family.
6. Validate Wave 1 and stop before Wave 2.

## What success looks like

Wave 1 is successful only if:
- direct doctrine violations are removed
- the public and companion surfaces still feel authored and premium
- the surface is meaningfully more governed and maintainable
- the styling posture is no longer dominated by raw local CSS definitions
- the implementation is ready for Wave 2 without needing to redo Wave 1 decisions
