# Prompt 01 — Entry-Stack Vertical Budget and Hero Governance

## Objective

Re-budget the flagship homepage entry stack around the **real standard laptop baseline** so the first screen delivers:

1. premium brand presence
2. governed top actions
3. the beginning of the first meaningful shell lane

This prompt is about the **combined vertical budget** of hero + action layer + inter-surface spacing + shell start, not about tweaking the hero in isolation.

## Why this prompt exists now

The attached Wave 01 package was right that the entry stack is too ceremonial before it becomes useful.

What it under-explained is that the repo already contains formal shell entry-state policy and policy tests. The job now is to bring the rendered flagship experience into measurable conformance with that policy and to prove it.

## Repo-truth findings to respect

- `HbSignatureHeroHomepage` is already documented as governed by shell-owned entry-stack policy.
- `entryStackOrchestration` already exists and already centralizes the entry-stack seam.
- shell entry-state policy and tests already exist
- the flagship hero is not a generic banner and must not be flattened into one

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- existing entry-stack policy tests under the shell test surface

## External best-practice guidance to apply

- Treat reflow and constrained states as first-class acceptance cases.
- Preserve a stable first-screen layout without avoidable layout shifts.
- Do not let branding consume the entire decision screen at the laptop baseline.

## Exact files / seams to inspect first

- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/entryStackPolicy.test.ts`
- any flagship page provisioning / authoring artifact that materially determines hero → actions → shell sequence

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current problem state

The current flagship experience still reads too much like:

- hero first
- utility second
- homepage later

That violates the doctrine requirement that the first screen deliver brand + action + value together.

The likely issue is not one single line of CSS. It is the combined result of:
- hero minimum height
- content padding
- hero bottom spacing
- action-band spacing
- action-band density
- shell start position

## Required future state

- The hero remains premium and authoritative.
- The hero no longer consumes enough vertical budget to bury meaningful shell value at the laptop baseline.
- The first shell lane begins on first load at the standard laptop baseline.
- portrait and short-height protected rules remain intact.
- the implementation continues to respect the existing shell-owned entry-state policy model rather than inventing a parallel one.

## Implementation requirements

1. **Measure before changing anything.**
   - Capture the current laptop-baseline first-screen condition.
   - Identify the actual rendered budget consumed by hero, action layer, and spacing.

2. **Treat the entry stack as one system.**
   - Do not change hero height without considering actions and shell start.
   - Do not change shell start without understanding why the budget is currently oversized.

3. **Respect premium hero posture.**
   - No flattening into a generic enterprise banner.
   - No timid “just reduce everything” answer.

4. **Respect protected rules already encoded in policy/tests.**
   - portrait and phone states remain disciplined single-column states
   - short-height constrained behavior remains protected
   - no independent breakpoint vocabulary

5. **Preserve or improve stability.**
   - avoid new layout shift risk in the entry stack
   - keep any late-loading hero or action content from causing avoidable vertical jumpiness

## Definition of done

This prompt is done only when:

- the standard laptop baseline shows hero + action layer + the beginning of the first meaningful shell lane on first load
- the hero still feels flagship and premium
- portrait and short-height states still obey protected behavior
- the entry stack is demonstrably budgeted as one governed system
- any changed assertions/tests are updated to match the new measured truth

## Proof of closure required in the final response

Provide all of the following:

- exact files changed
- a brief explanation of the budget problem found
- before / after measured or inspectable evidence for the standard laptop baseline
- evidence that portrait and short-height protected states still behave correctly
- any test or harness updates made
- any remaining risk or follow-up required inside later prompts in this package

## Constraints

- Do not redesign the whole hero concept.
- Do not introduce unrelated aesthetic changes.
- Do not add a second entry-state or breakpoint authority.
- Do not defer the measurement problem.
- Do not declare success based on screenshots alone if inspectable policy/harness proof can also be produced.
