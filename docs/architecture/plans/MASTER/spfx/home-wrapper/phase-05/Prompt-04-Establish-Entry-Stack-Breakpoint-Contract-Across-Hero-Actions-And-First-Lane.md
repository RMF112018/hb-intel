# Prompt 04 — Establish Entry-Stack Breakpoint Contract Across Hero, Actions, and First Lane

## Objective

Close the largest shell-only gap by giving the homepage entry sequence a shared shell-owned breakpoint contract across the flagship hero, priority actions band, and first shell lane.

## Why this issue exists in the current code

The doctrine and breakpoint spec govern the homepage entry sequence as one composed stack:

1. flagship hero
2. top actions / utility band
3. first shell lane

The current runtime does not actually coordinate that full sequence through one shell-owned contract.
Instead, the hero, priority actions rail, and `hbHomepage` shell are mounted as separate surfaces.
This creates a gap between doctrine and runtime governance.

## Current repo-truth evidence

- `mount.tsx` mounts the hero, priority actions rail, and homepage shell as separate webparts.
- `HbHomepageShell.tsx` governs container-aware band layout for the shell lanes, but not the hero or actions layer.
- `PriorityActionsRail.tsx` already has breakpoint-aware behavior, but it uses its own viewport/device-class logic.
- `HbSignatureHeroHomepage.tsx` owns the hero render, but the shell does not yet expose a shared entry-state contract across the whole entry stack.
- The breakpoint spec and homepage overlay explicitly require first-screen delivery of brand + action + value, hero height control, visible-action budgets, and first-lane visibility rules.

## Required future state

The homepage entry stack should have a shared shell-owned contract that coordinates:

- breakpoint / entry-state naming
- hero height or height-budget expectations
- visible-primary-action budgets and overflow expectations
- first-lane stacking or pairing eligibility
- short-height constrained-state behavior
- first-view visibility expectations for the first shell lane

The goal is not to merge all three surfaces into one webpart.
The goal is to make them obey the same shell-entry rules.

## Files / seams / symbols to inspect

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Implementation requirements

1. Introduce a shared shell-entry contract or vocabulary that can govern the hero, actions rail, and first-lane shell.
2. Preserve existing separation of webparts unless a minimal seam change is required.
3. Align visible-action budgeting with the shell-entry doctrine and breakpoint spec.
4. Align short-height constrained behavior with the shell-entry doctrine and protected rules.
5. Ensure the contract is shell-owned and reviewable.
6. Avoid speculative module redesign; solve the governance and coordination problem.
7. Where existing viewport logic must remain, map it cleanly to the shared shell-entry vocabulary rather than leaving it independent.

## Validation / proof of closure

Return all of the following:

- the shared entry-stack contract and its integration points
- evidence that hero / actions / first-lane behavior now align to one shell-owned vocabulary
- tests or preview artifacts covering representative entry states
- explicit proof that tablet portrait, phone, and short-height states obey protected single-column or constrained behavior rules where required

## Out-of-scope guardrails

- Do not redesign the visual identity of the hero.
- Do not redesign the priority actions rail as a product.
- Do not collapse the entire entry stack into one implementation just to avoid coordination work.
- Do not leave the entry-stack contract implicit after this prompt.

## Active-context discipline

Do not re-read files that are already in active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## No-deferral requirement

Do not leave this prompt in a “future wave,” “follow-up later,” or “optional if time permits” state.
If a shell-only issue must be solved now to close the shell correctly, solve it now and prove it now.
