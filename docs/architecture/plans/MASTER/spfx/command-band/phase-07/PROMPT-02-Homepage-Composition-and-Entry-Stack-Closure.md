# PROMPT 02 — Homepage Composition and Entry-Stack Closure

## Implementation objective

Protect and refine the wrapper-owned homepage composition so the flagship rail keeps the right order, authority, and page-canvas behavior above the shell.

## Work classification

**Refinement plus redesign**

## Exact repo files / seams / symbols to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/**` only as needed to confirm boundaries

## Current weakness

The live repo already contains a meaningful entry-stack composition contract and gutter/width governance. The current package pair references composition, but it does not preserve these exact seams forcefully enough.

## Why the current condition is inadequate

A redesign that ignores the existing wrapper-owned composition contract risks unnecessary churn: breaking the order contract, widening shell responsibilities, or regressing the top band into a timid centered module. That would weaken the product even if the rail itself looked better.

## Required future state

Refine the homepage composition while preserving its ownership model. The future state must:

- keep the rail wrapper-owned and pre-shell
- preserve explicit `homepage-flagship` threading
- preserve wrapper config extraction as the integration seam
- keep the actions region left-authoritative and intentional on wide displays
- preserve the narrow-gutter top-band behavior that makes the rail read as a band, not a padded shell module
- protect first-view continuity from hero → actions → first shell lane

If spacing, gutters, vertical rhythm, or band envelope need tuning, do it from the wrapper-owned entry-stack seam, not by leaking shell responsibilities into the rail or vice versa.

## What done actually looks like

Done means:

- DOM order remains correct
- no shell-occupant migration occurs
- the entry-stack still feels like one authored transition zone
- the actions band remains confident on wide displays and disciplined in constrained ones
- existing wrapper-boundary tests still pass and are expanded where needed

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/architecture/blueprint/current-state-map.md`

## Recommended dependencies / development concepts

- Treat `HbHomepageEntryStack.module.css` as an architectural seam, not as disposable styling.
- Preserve container-aware posture.
- Keep the shell boundary clean: the shell owns post-hero lane orchestration, not rail placement.

## Required implementation and validation expectations

- Revalidate wrapper order and explicit flagship context tests.
- Verify no accidental centered/timid fallback emerges on wide displays.
- Verify the shell still begins immediately after the actions region in the intended stack.
- Keep scope tightly bounded to wrapper composition and top-band authority.

## Prohibitions

- Do not broaden this into shell redesign.
- Do not move spacing authority into unrelated shell CSS.
- Do not reintroduce over-padded module framing that makes the rail feel detached from the top band.

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
