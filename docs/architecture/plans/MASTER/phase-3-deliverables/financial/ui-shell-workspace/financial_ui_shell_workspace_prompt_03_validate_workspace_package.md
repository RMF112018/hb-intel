# Financial UI / Shell / Workspace — Prompt 03
## Objective
Validate that the Financial UI / shell / workspace package is now coherent, operational, route-safe, and implementation-safe after completion of the shell foundation and tool workspace implementation work.

## Context
Prompts 01 and 02 should already be complete.
This is a validation and hardening pass.
Do not broaden scope into unrelated architecture work unless a real contradiction or implementation break requires a bounded correction.

## Critical Guardrails
- Validate against actual changed files and current behavior, not memory alone.
- Do not overclaim operational completeness.
- Keep all UI aligned to `@hbc/ui-kit` and the governing UI doctrine.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Prefer bounded corrective changes over speculative redesign.

## Validation Scope
Validate that the implemented Financial workspace package now gives users a real, actionable operating surface and gives future developers a safe base for downstream refinement.

### Shell and module posture
- Does the Financial module render inside a canonical, governed shell posture?
- Is the module home actionable rather than passive?
- Is project / period / version posture visible and trustworthy?

### Tool workspace actionability
- Are the major Financial tools rendered as real workspaces?
- Are next-step actions, blockers, review state, stale state, published state, and other material posture elements visible where governed?
- Are passive-viewer regressions eliminated?

### Route/context safety
- Do deep-link entry, re-entry, and context restoration behave safely?
- Does switching between tool surfaces preserve the required context?
- Is the workspace package consistent with the canonical route/context contract?

### UI governance and consistency
- Are patterns governed through `@hbc/ui-kit`?
- Is the module visually and structurally coherent?
- Is the interaction model consistent across tool surfaces?
- Is theme-aware behavior correct?

### Tests and operational confidence
- Do tests assert meaningful workspace behavior?
- Are there obvious untested operational risks that should block claiming readiness?

## Required Actions
1. Re-read the changed UI / shell / workspace files as needed for validation.
2. Perform an implementation-coherence pass across:
   - module shell / layout
   - module home
   - shared workspace primitives
   - individual tool workspaces
   - route-aware behavior
   - theme-aware rendering
   - tests
3. Fix any final cross-surface inconsistencies, route/context leaks, trust-state omissions, or UI-governance violations.
4. Produce a final workspace-package closure summary.
5. Produce a recommended next-step list limited to:
   - operational workflow hardening
   - acceptance / staging / readiness work
   - testing / evidence / validation work
   - final polish only where operating behavior is already real

## Deliverables
1. final changed-files summary
2. workspace-package coherence verdict
3. route/context safety verdict
4. UI-governance verdict
5. remaining operational or acceptance gaps, if any
6. recommended next-step sequence

## Definition of Done
This prompt is complete only when:
- the Financial module has a coherent and actionable UI / shell / workspace package,
- the workspaces are route-safe and context-safe,
- the UI is governed and consistent,
- remaining risk is explicit and bounded,
- and the package is ready for downstream acceptance/readiness hardening.

## Output Format
Return:
1. objective completed
2. files changed
3. workspace-package coherence verdict
4. route/context safety verdict
5. UI-governance verdict
6. remaining gaps
7. recommended next-step sequence
