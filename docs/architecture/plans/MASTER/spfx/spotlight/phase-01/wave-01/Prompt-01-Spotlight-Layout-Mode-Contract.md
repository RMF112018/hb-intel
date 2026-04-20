# Objective

Implement a real, explicit layout-mode contract for the shared `Project Portfolio Spotlight` surface so it no longer relies on breakpoint styling alone to determine information burden.

The current Spotlight is visually improved, but it still behaves like a full editorial card that compresses and stacks. That is not sufficient. The surface must become mode-governed, with intentional default visibility rules under tighter usable-space conditions.

# Governing repo authority

Use these as governing authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/reference/spfx-surfaces/benchmark/**`

Also respect the existing governed homepage entrypoint:
- `packages/ui-kit/src/homepage.ts`

# Inspect these files and seams first

- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HbcProjectSpotlightSurface.stories.tsx`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/README.md`

Do not re-read files that are still in your active context unless you need to confirm drift, dependencies, or uncertainty after changes.

# Current gap to close

The surface currently has:
- CSS breakpoint styling
- a single-column stacked composition
- a rich featured body
- an always-on supporting rail

It does **not** have:
- explicit layout modes
- a real mode resolver
- a visibility matrix tied to usable space
- a narrowest stable nested mode contract

# Required implementation outcome

Implement a real mode system inside the shared Spotlight surface.

Minimum expectation:
- add an explicit mode concept such as `wide | medium | compact | minimal`
- resolve mode from practical usable space, not from raw device labels alone
- encode which content regions are default-visible in each mode
- keep the mode logic inside governed Spotlight seams, not in unrelated homepage shell code
- preserve the thin SPFx consumer boundary

You may introduce a container-measurement helper, a layout resolver hook, or another clean equivalent if that is the most robust way to satisfy the requirement.

# Specific direction

1. Add a mode contract in shared Spotlight code.
2. Add a resolver/hook/helper that determines the active mode from usable width and, if needed, vertical pressure.
3. Add a visibility matrix or equivalent internal rule object describing:
   - whether details are open by default
   - whether history is open by default
   - media height posture
   - whether supporting metadata is visible inline
4. Keep the implementation maintainable and explicit. Do not bury mode behavior in scattered CSS-only conditions.

# Proof of closure

Provide:
- the new mode type / resolver location
- the visibility rules by mode
- the narrowest stable nested mode you implemented
- the files changed
- why the result is now mode-governed instead of merely breakpoint-styled

# Constraints

- Do not do unrelated homepage-shell work.
- Do not bloat the webpart consumer.
- Do not leave the mode behavior implicit.
- Do not rely on hover-only access to critical content.
