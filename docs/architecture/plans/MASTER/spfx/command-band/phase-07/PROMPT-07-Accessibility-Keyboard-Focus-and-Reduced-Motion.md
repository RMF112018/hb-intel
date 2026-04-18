# PROMPT 07 — Accessibility, Keyboard Focus, Target Size, and Reduced Motion

## Implementation objective

Upgrade the flagship rail’s interaction quality so keyboard, touch, and reduced-motion users receive a premium but safe experience with correct semantics and credible target sizing.

## Work classification

**Refinement**

## Exact repo files / seams / symbols to inspect

- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRail.test.tsx`
- any affected homepage wrapper tests if focus/semantics change

## Current weakness

The live repo already includes focus management and reduced-motion handling in important places, which is good. But the redesign needs a stronger explicit closure pass on semantics, focus treatment, target size, and motion restraint.

## Why the current condition is inadequate

Flagship quality is not only visual. The surface must remain credible for keyboard users, touch users, and users who request reduced motion. A redesign that looks premium but weakens semantics or target size would be a regression.

## Required future state

Strengthen accessibility and interaction quality across the redesigned flagship path. The future state must:

- keep visible focus on all interactive elements
- keep focus order predictable
- preserve focus return from overflow
- ensure target sizes or spacing satisfy a credible minimum
- keep important cues available without hover
- keep reduced-motion users protected
- ensure role/function alignment for links, buttons, disclosures, and menu buttons

Where a simple semantic HTML solution is sufficient, prefer it over unnecessary ARIA.

## What done actually looks like

Done means:

- keyboard use feels deliberate, not merely tolerated
- target sizes and spacing remain credible even in compact states
- focus return and dismissal behavior remain correct
- reduced-motion users still receive a coherent interaction model
- semantics match actual behavior instead of visual appearance alone

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- WAI APG guidance for button/disclosure/menu button patterns
- WCAG 2.2 target-size expectations and focus visibility expectations

## Recommended dependencies / development concepts

- Use semantic links for navigation targets.
- Use semantic buttons for disclosure or menu triggers.
- Prefer restrained `motion` usage that still communicates state change.
- Preserve and test `prefers-reduced-motion` behavior.

## Required implementation and validation expectations

- Verify focus-visible styles across all interactive elements.
- Verify Enter/Space behavior where button patterns apply.
- Verify no important information is hover-only.
- Verify compact-state target spacing and touch credibility.
- Add or update tests for accessibility-sensitive behavior changed by the redesign.

## Prohibitions

- Do not add noisy theatrical motion.
- Do not hide core affordance behind hover only.
- Do not misuse ARIA to simulate patterns that semantic HTML already provides more cleanly.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
