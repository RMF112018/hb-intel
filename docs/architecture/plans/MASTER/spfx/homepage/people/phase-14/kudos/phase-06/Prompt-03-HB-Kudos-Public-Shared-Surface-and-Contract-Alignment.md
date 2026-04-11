# Prompt-03 — HB Kudos Public Shared Surface and Contract Alignment

```md
Objective

Audit and tighten the boundary between the public HB Kudos webpart, its public view-model adapters, and any shared surface family / UI-kit dependencies so the public product behaves predictably and remains governed.

Primary problem

The latest rendered-state failure strongly suggests that the current public implementation may have a mismatch between:
- public Kudos data and adapter logic
- shared surface family expectations
- local composition assumptions
- or promotion decisions made during the remediation sequence

This prompt is for resolving those boundary and contract risks directly.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Stay tightly focused on public Kudos and its directly supporting surface dependencies.
- Maintain strict compliance with `@hbc/ui-kit`, homepage doctrine, and package-boundary rules.
- Do not promote UI into ui-kit merely to “clean things up.”
- Do promote, relocate, or tighten UI where the current boundary is clearly causing fragility or governance drift.

Primary tasks

1. Audit the public Kudos adapter/model path and identify any fragile or mismatched contract assumptions.
2. Review the current placement of public-surface UI logic across:
   - local public webpart code
   - homepage shared layer
   - `@hbc/ui-kit/homepage`
3. Correct any boundary decisions that are now creating:
   - rendering fragility
   - silent degradation
   - governance drift
   - duplicated premium styling
4. Keep or create the smallest justified shared/ui-kit surface necessary to stabilize the public Kudos product.
5. Ensure the final arrangement is explainable and governed.

Required outcome

After this prompt:
- the public Kudos data-to-surface path should be stable
- the public surface should no longer depend on fragile implicit assumptions
- local/shared/ui-kit territory should be more disciplined
- the rendered product should be more resilient and easier to reason about

Required deliverables

- implementation changes
- concise explanation of the final boundary decisions
- explicit note of any UI moved:
  - into ui-kit
  - back out of ui-kit
  - into shared homepage territory
- explanation of why those decisions better satisfy governance and product stability

Acceptance standard

This prompt is successful only if the public Kudos surface becomes materially more stable, governed, and explainable at the local/shared/ui-kit contract level.
```
