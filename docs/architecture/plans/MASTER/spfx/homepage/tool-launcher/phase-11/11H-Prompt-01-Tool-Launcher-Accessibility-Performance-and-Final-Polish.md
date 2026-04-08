# Prompt-11H-01 — Tool Launcher Accessibility, Performance, and Final Polish

## Objective

Execute **Phase 11H** for the Tool Launcher / Work Hub.

This phase corresponds to the previously defined **Phase 07**.

Your job is to perform the final quality pass that locks the rebuilt launcher to production standard across accessibility, performance, interaction refinement, and final closure.

---

## Required Pre-Read

Use these first:

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- outputs from phases 11B through 11G
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

Then inspect the current Tool Launcher implementation and any validation artifacts from prior phases.

Do not re-read files that are already in current context or memory.

---

## Phase Goal

Finalize the launcher so it is:

- accessible
- performant
- refined
- production-grade
- ready for clean build and deployment validation closure

This phase should be a real closure phase, not a catch-all rewrite.

---

## Required Focus Areas

### 1. Accessibility
Validate and improve as needed:
- keyboard navigation
- focus indicators
- screen-reader labels
- semantic structure
- aria usage
- interactive affordances
- contrast and readability
- reduced-motion behavior

### 2. Performance
Review and improve:
- unnecessary re-renders
- expensive per-keystroke work
- duplicate computations
- oversized local state patterns
- unnecessary animation cost
- render cost in degraded and populated states

### 3. Interaction refinement
Refine:
- hover
- focus
- press
- transition timing
- microcopy
- no-results language
- partial-data polish
- CTA response quality

### 4. Final QA closure
Perform a final pass for:
- runtime regressions
- visual inconsistencies
- build integrity
- package readiness posture
- lingering incomplete seams from earlier phases

---

## Preserve These Seams

Preserve unless there is a narrow, clearly beneficial reason to refine them:

- the live list-driven model
- launch behavior
- completed composition, data, primitive, discovery, and support/status work
- host-safe and authoring-safe posture established in prior phases

---

## Required Deliverables

### 1. Code changes
Apply any bounded changes needed to close accessibility, performance, and refinement issues in the Tool Launcher domain.

### 2. Summary document
Create:
`docs/architecture/reviews/tool-launcher/phase-11h-accessibility-performance-and-final-polish-summary.md`

This file must describe:
- what final issues were addressed
- what accessibility and performance improvements were made
- what interaction refinements were made
- what remains intentionally out of scope

### 3. Validation document
Create:
`docs/architecture/reviews/tool-launcher/phase-11h-accessibility-performance-and-final-polish-validation.md`

This file must describe:
- what accessibility checks were run
- what performance concerns were reviewed
- what build / package readiness status exists at phase close
- whether the launcher is ready for deployment validation

---

## Validation Expectations

Before concluding, validate at minimum:

- keyboard behavior is strong across launcher surfaces
- focus treatment is clear and consistent
- reduced-motion behavior is appropriate
- no obvious contrast/readability issues remain
- search/discovery remains performant
- no obvious avoidable render work remains
- build still passes cleanly
- package readiness remains intact
- final runtime behavior is stable

---

## Important Constraints

- Do not re-read files that are already in current context or memory.
- Do not widen this into a fresh redesign.
- Do not regress earlier phase work while polishing.
- Do not ignore accessibility issues because the surface looks good.
- Do not ignore performance issues because the build passes.

---

## Required Completion Notes

When finished, provide concise completion notes covering:

- files changed
- files created
- accessibility improvements
- performance improvements
- final interaction refinements
- validation performed
- build status
- package readiness status
- whether the launcher is ready for deployment validation

---

## Final Instruction

Execute **Phase 11H** as the Tool Launcher accessibility, performance, and final-polish phase.

This is the closure phase for the rebuild sequence. The result should be production-grade, disciplined, and ready for deployment validation.
