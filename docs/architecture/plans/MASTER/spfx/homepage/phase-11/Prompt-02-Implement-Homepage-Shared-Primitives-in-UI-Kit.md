# Prompt 02 — Implement Homepage Shared Primitives in UI Kit

## Objective

Implement the actual **Phase A shared homepage primitives** inside `@hbc/ui-kit/homepage`.

This is the core shared-system uplift prompt.

You must create the reusable homepage-safe surface language that the local homepage package can consume in later prompts.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Required Starting Context

Work from the current repo truth as modified by Prompt 01.

At minimum, use the updated versions of:

- `packages/ui-kit/src/homepage.ts`
- any new homepage primitive files created in Prompt 01
- `packages/ui-kit/src/HbcCard/index.tsx`
- `packages/ui-kit/src/theme/typography.ts`
- `packages/ui-kit/DESIGN_SYSTEM.md`
- `apps/hb-webparts/src/homepage/shared/*`
- representative consuming webparts in `apps/hb-webparts/src/webparts/*`

Inspect other adjacent files as needed.

---

## Required Shared Primitives to Implement

Implement the strongest correct set of homepage-safe primitives needed to solve the current shared-system weakness.

At minimum, Phase A should address the following shared affordance categories where repo truth supports them:

### 1. Homepage surface / card variants
Create a stronger homepage-safe surface language than the current “generic card everywhere” posture.

This may include:
- hero/editorial/utility/operational/discovery-safe variants
- stronger section-intro or interior padding posture
- stronger hierarchy affordances
- stronger but still restrained depth treatment

Do **not** make this flashy.

### 2. Homepage CTA primitives
Implement a premium homepage CTA/action language that is stronger than plain text links.

This may include:
- inline CTA
- primary CTA
- secondary CTA
- section-level “see more” or “open destination” affordances where justified

### 3. Metadata / signal row primitives
Implement reusable metadata and signal-row primitives for:
- freshness / updated labels
- authored metadata
- contextual labels
- status/signal chips paired with text and/or icons

### 4. Icon treatment primitives
Implement a real homepage icon treatment layer suitable for:
- launcher/destination/action rows
- promoted discovery destinations
- small section or signal icon use

Eliminate the need for placeholder three-letter pseudo-icons in shared patterns.

### 5. Shared row/tile primitives where truly reusable
If repo truth shows repeated needs across multiple homepage webparts, implement shared:
- action rows
- destination rows
- destination tiles
- compact utility tiles

Only promote what is clearly reused.

---

## Styling and Interaction Requirements

The new shared primitives must:

- feel materially more premium than the current generic posture
- stay light-theme first and homepage-safe
- preserve visible focus
- preserve reduced-motion behavior
- preserve token discipline
- remain compatible with SharePoint-hosted page-canvas constraints
- avoid decorative over-animation
- avoid overly app-like domain-workspace styling

---

## Storybook / Authoring Requirements

For any new core shared ui-kit primitive that falls under the package authoring rules, add/update stories consistent with repo standards.

Where applicable, provide the required story coverage pattern:
- `Default`
- `AllVariants`
- `FieldMode`
- `A11yTest`

If a primitive is not story-worthy under current package conventions, justify that in the completion note.

---

## Documentation Requirements

Update the relevant ui-kit and homepage entry-point docs so the new shared primitive surface is accurately documented.

Do not leave the new export surface undocumented.

---

## Hard Constraints

- Do not redesign the top-band or individual webparts in a bespoke way in this prompt.
- Do not add shell chrome.
- Do not violate homepage entry-point import doctrine.
- Do not rely on scattered inline style fixes as the main implementation strategy.
- Do not regress generic ui-kit consumers outside the homepage domain.
- Do not over-generalize; this is a homepage-safe shared surface, not a giant new design system branch.

---

## Deliverables for This Prompt

By the end of this prompt, the repo should contain:

- implemented shared homepage primitives in `packages/ui-kit`
- homepage entry-point exports wired to those primitives
- stories/tests/docs updated as needed
- a materially stronger shared homepage visual language ready for local-shell and consumer migration

---

## Acceptance Criteria

- shared homepage primitives exist and are production-grade
- the new shared language materially improves on plain generic-card + text-link patterns
- token/accessibility/motion discipline remains intact
- stories/docs are updated where required
- build/lint/type-check remain viable

---

## Completion Note

At the end, produce a concise completion note that states:

- which shared primitives were implemented
- which candidate primitives were intentionally left local
- which consumers should migrate in Prompt 03 and Prompt 04

