# Phase-00-03 — SPFx-Hosted Homepage Doctrine Overlay Plan

## Objective
Establish a durable SPFx-hosted homepage doctrine overlay that sits cleanly on top of the clarified UI-kit contract and protects the quality bar for HB Central homepage work.

This prompt should convert the repo from a generic or partially conflicting design-system guidance state into a clear doctrine posture for premium SharePoint-hosted homepage implementation.

This prompt should be run only after Prompts 1 and 2 are complete.

---

## Context
The repo already has meaningful design-system discipline.  
The problem is not lack of doctrine.  
The problem is that current doctrine/reference language is not yet cleanly shaped for premium SPFx-hosted homepage work.

The final doctrine posture must:

- preserve strong quality standards
- remain host-aware
- protect premium visual ambition
- avoid over-restrictive rules that suppress excellent homepage work
- avoid vague rules that allow inconsistency or unsupported host behavior

---

## Hard Rules
- Work from the repo state produced by Prompts 1 and 2.
- Do **not** re-read files that are already in your current context or memory unless needed to verify a specific change or resolve a contradiction.
- Do **not** widen scope into final homepage implementation or shell-extension feature work.
- Do **not** loosen standards merely to remove friction.
- Do **not** keep stale or generic doctrine language in a position where it can override the new homepage overlay.

---

## Primary Repo Areas In Scope
Likely focus areas include:

- UI-kit design-system doctrine/reference docs
- UI-kit entry-point docs
- homepage-related architecture docs
- any doc that currently acts as authority for:
  - design-system rules
  - homepage composition rules
  - SPFx-hosted constraints
  - shell/homepage differentiation

---

## Tasks

### 1. Define the doctrine structure
Make the doctrine structure explicit, including where the following live:

- binding design-system rules
- directional guidance
- SPFx-hosted homepage overlay rules
- shell-extension-specific guidance
- superseded or downgraded legacy guidance

### 2. Clarify what stays binding
Preserve strong mandatory rules where they still serve the quality bar, such as:
- accessibility
- token discipline
- host awareness
- clear package boundaries
- import discipline
- maintainability expectations

Write them clearly.

### 3. Clarify what becomes directional
Identify any rules that were too rigid or too app-generic for premium homepage work and reclassify them appropriately.

Examples might include overly rigid assumptions around:
- generic app composition
- visual uniformity that suppresses editorial hierarchy
- rules that belong to library-authoring discipline rather than homepage product design
- SPFx-irrelevant requirements applied too broadly

Use judgment and be exact.

### 4. Establish the SPFx-hosted homepage overlay
Create or update the doctrine so it clearly covers:

- page-canvas ownership vs shell-adjacent extension surfaces
- premium top-band / hero expectations
- editorial hierarchy
- utility-density expectations
- motion with discipline
- accessibility/readability expectations
- authoring-safe behavior
- media treatment expectations
- content and freshness guardrails where needed at doctrine level
- what homepage surfaces should and should not import from UI-kit

### 5. Make future usage obvious
A future agent beginning Phase 01 or Phase 02 should be able to answer these questions immediately from the repo:

- what is mandatory for premium homepage work?
- what is flexible?
- what is prohibited?
- what belongs in shared UI-kit vs what should remain local until reuse is proven?
- what host constraints are non-negotiable?

### 6. Remove shadow doctrine
Any stale file that could undermine the new doctrine posture should be updated, superseded, or explicitly downgraded.

---

## Required Deliverables
Leave the repo with the following outcomes:

1. A clearly defined SPFx-hosted homepage doctrine overlay
2. Clear labeling of binding vs directional guidance
3. Clear expression of homepage-specific constraints and freedoms
4. Clear statement of what remains shared UI-kit territory vs local homepage territory
5. Clean doc authority so later phases do not need to reinterpret doctrine

---

## Acceptance Criteria
This prompt is complete only when:

- the repo has a doctrine posture that clearly supports premium SharePoint-hosted homepage work
- future agents can distinguish mandatory rules from flexible guidance
- homepage quality is protected without unnecessary design suppression
- stale doctrine language no longer remains in an apparently authoritative position
- Phase 01 and Phase 02 can proceed without re-litigating doctrine fundamentals

---

## Required End-of-Prompt Output
At the end of your work, provide a concise closure summary that includes:

- doctrine files created/updated
- which rules remain binding
- which rules were relaxed or reclassified
- where the SPFx-hosted homepage overlay now lives
- what later phases should treat as locked assumptions going forward
