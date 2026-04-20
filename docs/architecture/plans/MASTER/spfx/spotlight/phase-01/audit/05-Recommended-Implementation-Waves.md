# Recommended Implementation Waves

## Wave 01 — Mode architecture and disclosure contract
**Goal:**  
Turn the Spotlight from a breakpoint-styled editorial card into a mode-governed surface.

### Scope
- add explicit layout-mode ownership
- add usable-space / container-aware mode resolution
- refactor featured rendering into essentials vs details
- introduce explicit details disclosure
- introduce explicit history disclosure
- reshape the component tree to support this cleanly

### Why this is Wave 01
Everything else depends on this contract. Without it, any spacing or cosmetic tuning still leaves the core compactness failure unresolved.

### Closure standard
- a mode system exists in code
- compact/minimal entry states show materially less information
- details and history are explicitly revealable
- default state behavior differs by mode
- keyboard/touch accessibility is preserved

---

## Wave 02 — Presentation tuning, validation, and docs closure
**Goal:**  
Finish the redesign so it is premium, credible, and provable.

### Scope
- tune media height and body spacing per mode
- promote and use `contentCompleteness`
- update storybook coverage
- update README and closure notes
- add regression-proof validation for narrow nested widths and disclosure states

### Why this is Wave 02
Once behavior ownership is correct, the second wave can tune and prove the finished contract without re-opening architecture.

### Closure standard
- wide/medium/compact/minimal states are visually coherent
- sparse-content cases remain premium
- README matches actual implementation
- Storybook demonstrates the full mode contract
- hosted validation shows tight states are selective rather than compressed
