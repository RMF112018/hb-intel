# Prompt 03 — Rebuild the Shared Surface and Breakpoint / Overflow System

## Objective

Upgrade the shared `HbcPriorityRail` surface family and the public rail’s breakpoint handling so the product finally behaves like the command-band system described by the spec, rather than a premiumized flat action list.

## Current issue / future-state gap

The live shared surface family still materially trails the spec:
- only coarse `rail | grid | compact` layout variants exist
- overflow is an inline expander, not a true anchored or device-appropriate overflow system
- grouping / segmented / hybrid behavior is modeled but not materially rendered
- viewport width is used directly for device resolution instead of a more shell-fit-aware approach
- phone behavior is still too close to a compressed desktop/list mental model

## Intended future state

The shared surface family becomes the real command-band system:
- breakpoint/device behavior is deliberate and, where needed, container-aware
- desktop/laptop overflow uses a real anchored floating interaction
- phone overflow uses an appropriate sheet / compact overflow model
- grouping / segmented / hybrid behavior is materially implemented where the config says it exists
- public and preview rendering share the same surface behavior foundation
- premium-stack libraries are used materially because the interaction model now actually warrants them

## Repo seams / files / symbols to inspect

Inspect at minimum:

- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailAction.tsx`
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- any new shared hooks/helpers you create for shell-fit or container-aware breakpoint behavior

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing files / doctrine / specs

- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- the spec sections describing required variants, overflow behavior, and public interaction model

## Required implementation outcomes

1. Replace the current inline overflow approach with a breakpoint-aware overflow system:
   - anchored overflow / popover on desktop and laptop
   - appropriate tablet treatment
   - phone-appropriate overflow pattern rather than a tiny in-flow accordion

2. Introduce or refine a shell-fit / breakpoint resolver that is not limited to naive viewport width assumptions where nested width materially matters.

3. Materially implement the modeled layout behaviors instead of collapsing them into a few weak equivalents:
   - `rail`
   - `segmented`
   - `hybrid`
   - any required compact/mobile modes

4. Honor grouping when group data is present rather than carrying it through the type layer unused.

5. Keep public interaction accessible:
   - dismissal behavior
   - focus handling
   - keyboard reachability
   - reduced-motion support

6. Use the approved premium stack materially where relevant:
   - `@floating-ui/react`
   - `@radix-ui/react-tooltip`
   - `@radix-ui/react-scroll-area`
   - `motion/react`
   - `class-variance-authority`
   - `clsx`

7. Ensure the public rail remains utility-first and subordinate to the hero rather than becoming another flagship surface.

## Supporting development concepts to apply materially

- anchored floating UI rather than inline overflow hacks
- container-aware responsiveness where slot width matters
- grouped/segmented command-band composition
- purpose-fit motion and interaction polish
- premium-stack usage only where it materially improves real behavior

## Proof of closure

Return:

- the new shared variant model
- the breakpoint/overflow behavior by device class
- how grouping is now rendered
- the exact premium-stack primitives now used materially
- the files changed
- any tests or targeted interaction assertions added
- confirmation that preview/public can share the same surface behavior foundation

## Boundaries / anti-drift rules

- Do not turn this into a general homepage-shell rewrite.
- Do not create fake shell chrome.
- Do not add decorative motion that fights SharePoint host-fit.
- Do not claim grouped/segmented/hybrid support unless the code now actually renders those modes.
- Do not solve mobile by shrinking desktop UI.
