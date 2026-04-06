# Prompt 08 — Project Spotlight Hardening, Accessibility, and Documentation

## Objective

Finish Project Spotlight to a release-ready standard with accessibility, validation, documentation, and final ownership decisions.

## Prerequisite

Complete Prompts 01 through 07 first.

Do **not** re-read files already in your current context or memory unless they changed, your context is stale, or the task scope expanded.

## Required Outcome

Close the work so Project Spotlight is:

- visually premium
- interaction-safe
- accessible
- maintainable
- documented
- properly scoped in terms of shared-vs-local ownership

## Specific Implementation Work

### 1. Accessibility pass
Validate and fix:
- keyboard behavior
- focus order and visible focus
- escape / close behavior
- hover-only dependencies
- reduced-motion handling
- semantic structure and labels

### 2. Performance and runtime realism pass
Validate:
- image handling behavior
- excessive DOM or interaction complexity
- SharePoint-safe interaction posture
- graceful runtime degradation

### 3. Ownership closure
Make final decisions on:
- what remains local
- what remains homepage-local shared
- what, if anything, should be promoted into `@hbc/ui-kit/homepage`

Do not promote anything that is still Spotlight-specific.

### 4. Documentation updates
Update the smallest correct authoritative set, including where appropriate:
- local README or implementation notes for Project Spotlight
- homepage shared ownership notes
- any developer-facing usage notes required by the new structure
- documentation for any newly promoted homepage-safe primitives

### 5. Final validation
Run the smallest credible final validation set appropriate to the touched scope and any promotion decisions.

## Required Deliverables

### A. Final Closure Summary
Explain what was completed and why the module is now ready.

### B. Ownership Closure Summary
State exactly what stayed local, what stayed homepage-local shared, and what was promoted.

### C. Documentation Update Summary
List the docs updated and why.

### D. Residual Debt Register
List any non-blocking follow-up items that remain.

## Validation Requirements

Before closing:

- verify accessibility behavior
- verify reduced-motion safety
- verify no hover-only requirement remains
- verify the final shared/local ownership decisions are defensible
- run lint/type/test validation appropriate to the changed scope
- report exactly what was validated

## Risk Exposure

Watch for:
- late accessibility regressions
- accidental over-promotion into shared kit
- stale documentation
- hidden responsiveness regressions
- “finished visually, fragile structurally” outcomes

## Standards / Best Practices

- release-ready means documented and validated
- accessibility is not optional
- runtime realism matters
- shared-kit promotion requires proof
- preserve the premium editorial hierarchy through the final mile

## Final Instruction

This prompt is complete only when Project Spotlight can credibly be treated as a premium homepage-standard webpart aligned with the Signature Hero and ready for sustained use.
