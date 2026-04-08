# Prompt-11D-01 — Tool Launcher Premium Primitives and Surface Layer

## Objective

Execute **Phase 11D** for the Tool Launcher / Work Hub.

This phase corresponds to the previously defined **Phase 03**.

Your job is to build or refine the launcher-owned primitive layer so the rebuilt surface is coherent, premium, reusable, and maintainable.

This phase should convert the launcher from a set of isolated component-level styling decisions into a stronger surface system.

---

## Required Pre-Read

Use these first:

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- `docs/architecture/reviews/tool-launcher/phase-11b-composition-rearchitecture-summary.md`
- `docs/architecture/reviews/tool-launcher/phase-11b-composition-rearchitecture-validation.md`
- `docs/architecture/reviews/tool-launcher/phase-11c-presentation-model-and-data-hardening-summary.md`
- `docs/architecture/reviews/tool-launcher/phase-11c-presentation-model-and-data-hardening-validation.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

Then inspect:

- `packages/ui-kit/`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- any launcher-adjacent helpers introduced in prior phases

Do not re-read files that are already in current context or memory.

---

## Phase Goal

Create a premium launcher primitive layer that is:

- visibly stronger
- more reusable
- better structured
- easier to evolve
- aligned with the approved premium stack
- not trapped in inline-style sprawl or weak legacy wrappers

---

## Required Focus Areas

### 1. Launcher-owned primitive strategy
Build or refine launcher-specific primitives where justified, such as:
- command surface primitives
- stage / featured surface primitives
- support/status primitives
- shelf / secondary-launch primitives
- discovery / overlay primitives
- launcher-specific heading, metadata, and CTA patterns

Do not force everything through generic wrappers if that weakens the result.

### 2. UI-kit extension vs wrapping vs bypass
Make explicit, grounded decisions on where to:
- extend `@hbc/ui-kit`
- wrap `@hbc/ui-kit`
- bypass weaker legacy usage patterns
- keep launcher-owned implementation local

The result should be technically clean and strategically clear.

### 3. Premium stack usage
Use the doctrine-approved premium stack where justified, including:
- `motion`
- `lucide-react`
- `@floating-ui/react`
- relevant Radix primitives
- `class-variance-authority`
- `clsx`

Do not install them symbolically. Use them deliberately where they materially improve the launcher.

### 4. State and variant quality
The primitive layer should support serious handling of:
- hover
- focus
- press
- selected / active states
- notice emphasis
- degraded states
- sparse-data states
- responsive behavior

### 5. Maintainability
Reduce brittle one-off styling and improve:
- variant reuse
- state consistency
- readability
- future extension safety

---

## Preserve These Seams

Preserve unless there is a narrow, justified reason not to:

- live data and presentation seams already hardened in earlier phases
- working launch behavior
- host-safe SharePoint posture
- authoring-safe degraded states
- core composition intent already established in 11B

---

## Required Deliverables

### 1. Code changes
Update launcher-owned primitives and related Tool Launcher rendering files under:
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`

Update shared UI-kit files only if a narrow, justified reusable improvement is clearly warranted.

### 2. Summary document
Create:
`docs/architecture/reviews/tool-launcher/phase-11d-premium-primitives-and-surface-layer-summary.md`

This file must describe:
- what primitives were added or refactored
- what remained launcher-local
- what, if anything, was extended in `@hbc/ui-kit`
- why the resulting primitive layer is stronger

### 3. Validation document
Create:
`docs/architecture/reviews/tool-launcher/phase-11d-premium-primitives-and-surface-layer-validation.md`

This file must describe:
- what states and variants were validated
- how primitive consistency was checked
- whether any maintainability risks remain
- whether build integrity was preserved

---

## Validation Expectations

Before concluding, validate at minimum:

- launcher still renders correctly from existing data seams
- primitive reuse is improved
- inline-style sprawl is reduced where practical
- premium stack usage is deliberate and justified
- hover / focus / press states are stronger and consistent
- degraded states remain professional
- build still passes cleanly
- no regressions to accessibility basics

---

## Important Constraints

- Do not re-read files that are already in current context or memory.
- Do not widen this phase into a full search/discovery rewrite.
- Do not treat this as a token-only style pass.
- Do not regress the working composition or data work from prior phases.
- Do not create a launcher primitive layer that is over-engineered relative to actual need.

---

## Required Completion Notes

When finished, provide concise completion notes covering:

- files changed
- files created
- primitives added / refactored
- UI-kit extension vs local primitive decisions
- validation performed
- build status
- recommended next phase
- residual issues for later phases

---

## Final Instruction

Execute **Phase 11D** as the Tool Launcher premium-primitives and surface-layer phase.

The goal is a durable, premium, maintainable launcher surface system that can support the remaining rebuild phases cleanly.
