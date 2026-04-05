# Phase 02 Risk Exposure — Homepage Design Foundation Upgrade

## Primary risks

### 1. Visual polish without structural reuse
Risk: The agent may improve visuals through isolated inline edits instead of strengthening the shared homepage primitive system.

Mitigation:
- favor shared primitive upgrades first
- require explicit documentation of primitive-family changes
- treat inline style reduction as a success metric where reuse is obvious

### 2. Breaking Phase 01 contracts while restyling
Risk: A styling pass accidentally changes empty/loading/stale/noResults semantics or breaks independent rendering.

Mitigation:
- preserve Phase 01 contract docs as a hard baseline
- run full package verification after each prompt
- do not change state semantics unless explicitly documented and re-approved

### 3. Drifting into shell scope
Risk: Premium homepage work starts to mimic or recreate shell-extension responsibilities.

Mitigation:
- keep the three-lane architecture explicit in every prompt
- prohibit shell chrome, nav bars, footer rails, and unsupported host takeover
- route shell-adjacent desires to later phases

### 4. Over-promoting homepage-local primitives into `@hbc/ui-kit`
Risk: The agent moves too much local homepage code into shared ui-kit before reuse is proven.

Mitigation:
- keep the Phase 00/01 promotion threshold in force
- only promote where reuse beyond homepage is clear and justified
- prefer strengthening `@hbc/ui-kit/homepage` surface constants and primitives over broad library expansion

### 5. Premium visual tricks harming accessibility or performance
Risk: Layering, overlays, motion, or media treatment make the homepage look better in demos but worse in production.

Mitigation:
- keep reduced-motion, focus, contrast, and host-awareness rules binding
- avoid parallax, theatrical animation, decorative-only motion, or fragile layout hacks
- require build/test/lint verification on every prompt

### 6. Reference composition confusion
Risk: Improving `ReferenceHomepageComposition` could accidentally blur its role into a production layout contract.

Mitigation:
- preserve its documented role as a dev/integration utility
- explicitly forbid promotion to production composition in Phase 02
- defer homepage-wide authored composition to Phase 03

### 7. Style drift across zones
Risk: Different zones become visually inconsistent in an uncontrolled way.

Mitigation:
- create a documented homepage visual-language reference
- allow zone-specific identity, but require shared typography, spacing rhythm, CTA language, focus treatment, and loading/empty-state polish
