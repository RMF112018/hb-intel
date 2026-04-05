# Phase 03 Standards and Best Practices — Homepage Composition and Template Hardening

## Governing standards

### 1. Respect the Phase 01 product boundary
`apps/hb-webparts` remains the homepage / page-canvas product lane.

Do not:
- introduce shell-extension behavior,
- create shell chrome,
- or blur homepage composition with navigation governance.

### 2. Build on the executed Phase 02 visual system
Phase 02 already created the local homepage token layer and premium surface styling.

Phase 03 should:
- compose from those tokens,
- extend them carefully where warranted,
- and avoid reintroducing scattered hardcoded visual values.

### 3. Preserve import discipline
Keep the homepage lane aligned with the established import policy.

Primary entry point:
- `@hbc/ui-kit/homepage`

Use supplementary entry points only when truly needed:
- `@hbc/ui-kit/theme`
- `@hbc/ui-kit/icons`

Do not reintroduce:
- `@hbc/ui-kit`
- `@hbc/ui-kit/app-shell`

### 4. Prefer local composition hardening over shared-package expansion
Phase 03 is about the homepage lane becoming more coherent. Prefer local package solutions for:
- composition wrappers,
- preview/template governance,
- homepage interaction states,
- and layout rhythm,
unless cross-package reuse is already proven.

### 5. Keep motion restrained
Homepage motion should remain:
- light,
- fast,
- purposeful,
- and reduced-motion aware.

Avoid decorative animation or motion that fights the host environment.

### 6. Make focus states obvious and intentional
Keyboard-visible focus treatment is part of homepage quality, not an optional add-on.

If you introduce a local styling mechanism for interactive states, ensure it provides:
- clear focus-visible behavior,
- not just hover polish.

### 7. Keep semantics honest
Use:
- links for navigation,
- buttons for actions.

Do not let branded CTA styling obscure actual semantics.

### 8. Treat preview/template code as governed infrastructure
If a preview/composition surface remains in the package, it must be:
- intentional,
- documented,
- and kept in sync with repo truth.

Do not allow it to drift into undocumented demo-only residue.

### 9. Test structural behavior, not only visuals
Phase 03 should add or update tests that prove:
- interaction-state wiring where practical,
- mount/contract preservation,
- reduced-motion logic where applicable,
- and composition-related structural guarantees.

### 10. Close the phase with documentation and verification
A Phase 03 completion is not real unless:
- docs match the code,
- verification passes,
- and the package has a clean handoff into the next phase.

## Verification minimum

Every prompt in this phase should end by reporting:

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts test`

Run build whenever the change affects composition, styling assets, or package behavior:

- `pnpm --filter @hbc/spfx-hb-webparts build`
