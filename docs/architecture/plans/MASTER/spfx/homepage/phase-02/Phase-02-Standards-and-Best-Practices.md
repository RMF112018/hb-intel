# Phase 02 Standards and Best Practices — Homepage Design Foundation Upgrade

## Binding standards to preserve

### SPFx and homepage doctrine
- Respect the host. Do not recreate shell chrome inside page-canvas webparts.
- Homepage webparts remain page-canvas surfaces only.
- `@hbc/ui-kit/homepage` remains the primary UI entry point.
- Accessibility, visible focus, reduced-motion support, token discipline, and authoring safety remain binding.

### Phase 01 product-lane guarantees
- Every webpart must remain independently renderable.
- Existing loading/empty/invalid/stale/noResults behavior must remain intact unless explicitly documented and retested.
- The mount/dispatch seam remains a controlled product boundary.
- Shared seam taxonomy and placement rules remain the baseline for new code placement.

## Best-practice implementation posture

### Prefer systematic upgrades over scattered polish
- strengthen shared primitives first
- upgrade zone families second
- use webpart-local styling only where it is genuinely specific

### Build a real homepage visual language
- consistent spacing rhythm
- clear typography hierarchy
- zone-specific but coherent density
- premium CTA treatment
- predictable badge and metadata behavior
- branded loading and empty states

### Keep zone identities intentional
- Top band: premium, signature, visually dominant
- Utility: compact, dense, action-first
- Communications: editorial, readable, featured vs secondary hierarchy
- Operational: status-forward, freshness-aware, spotlight capable
- Discovery: guided, scannable, interaction-forward

### Preserve maintainability
- avoid fragile CSS or one-off magic numbers
- prefer token-backed styling
- document any new primitive family or token alias added in Phase 02
- do not introduce abstraction that is more complex than the styling problem it solves

### Preserve proof-quality verification
Every prompt should end with:
- check-types
- lint
- test
- build when styling/runtime output changed materially

## Explicit non-goals for Phase 02
- no shell-extension implementation
- no async data integration
- no property-pane implementation
- no homepage composition promotion into a production-wide page spec
- no broad domain-data or platform-boundary work
