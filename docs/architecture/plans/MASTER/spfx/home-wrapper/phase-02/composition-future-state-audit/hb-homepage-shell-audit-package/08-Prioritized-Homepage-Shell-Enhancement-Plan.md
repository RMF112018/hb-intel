# Prioritized Homepage Shell Enhancement Plan

## Priority 1 — Introduce a governed shell layout contract
### Gap it closes
The shell currently has fixed JSX order and no declarative orchestration model.

### Product-grade solution
Create a shell schema that defines:
- bands
- slots
- slot roles
- allowed footprints
- breakpoint resolution
- default presets

### Impact on user experience
Higher-quality hierarchy and a less sequential, more intentional homepage.

### Impact on adaptability / responsiveness
Foundational. Enables real shell-owned responsive behavior.

### Cross-layer implications
- `hbHomepageContract.ts`
- `HbHomepageShell.tsx`
- shell registry/config files
- future persistence model

### Timing
Implement now

### Type
Structural redesign

---

## Priority 2 — Add a homepage module capability registry
### Gap it closes
The shell cannot safely reason about module fit, resizing, or adjacency.

### Product-grade solution
For each shell-eligible module, define:
- compatible slot roles
- minimum comfort width
- allowed footprints
- compact mode support
- collapse support
- prominence eligibility
- incompatible neighbors

### Impact on user experience
Prevents broken or awkward compositions.

### Impact on adaptability / responsiveness
Essential for future control-panel safety.

### Cross-layer implications
- homepage shared contracts
- shell resolution logic
- future admin UI

### Timing
Implement now

### Type
Structural redesign

---

## Priority 3 — Replace simple vertical sequencing with band-based composition
### Gap it closes
The shell still reads like a premium stack rather than a flagship composition.

### Product-grade solution
Create explicit bands:
- primary awareness
- context/leadership
- recognition
- future operational

### Impact on user experience
Stronger scan path and reduced attention conflict.

### Impact on adaptability / responsiveness
Enables different band behavior by breakpoint.

### Cross-layer implications
- `HbHomepageShell.tsx`
- shell CSS and/or layout primitives
- module slot variants

### Timing
Implement now

### Type
Structural redesign

---

## Priority 4 — Create shell-owned breakpoint behavior
### Gap it closes
Current shell only changes spacing, not composition.

### Product-grade solution
Implement breakpoint-specific shell layout resolution:
- wide pairing rules
- medium demotion/reordering rules
- narrow summary/collapse rules

### Impact on user experience
Better use of wide screens and calmer narrow-screen behavior.

### Impact on adaptability / responsiveness
Very high

### Cross-layer implications
- shell layout engine
- slot contracts
- module compact variants

### Timing
Implement now

### Type
Structural redesign

---

## Priority 5 — Define code-governed vs future-configurable decisions
### Gap it closes
No future-safe admin boundary currently exists.

### Product-grade solution
Explicitly mark:
- protected layout decisions
- configurable decisions
- invalid config fallbacks

### Impact on user experience
Protects homepage quality over time.

### Impact on adaptability / responsiveness
Prevents future control panel from degrading the page.

### Cross-layer implications
- shell schema
- future admin model
- documentation/governance

### Timing
Implement now

### Type
Structural redesign

---

## Priority 6 — Rebuild / realign People & Culture for shell fit
### Gap it closes
People & Culture is the maturity outlier among intended shell modules.

### Product-grade solution
Refactor `PeopleCulturePublicSurface` into a more governed, tokenized, shell-fit surface family with:
- stronger shared primitive discipline
- reduced inline-style dependence
- explicit compact and standard modes
- better shell compatibility

### Impact on user experience
Improves visual consistency and band quality.

### Impact on adaptability / responsiveness
High

### Cross-layer implications
- people/culture webpart folder
- homepage shared primitives
- possible `@hbc/ui-kit/homepage` promotion decisions

### Timing
Implement now

### Type
Structural redesign

---

## Priority 7 — Prepare Safety Field Excellence for shell insertion
### Gap it closes
A likely future operational module is not yet accounted for in shell orchestration.

### Product-grade solution
Add shell registry metadata and determine:
- target band
- width rules
- pairing rules
- responsive role before inserting it

### Impact on user experience
Avoids future “append one more module” degradation.

### Impact on adaptability / responsiveness
Medium-high

### Cross-layer implications
- shell registry
- safety module variants
- future layout presets

### Timing
Prepare now, insert later or in Wave 02

### Type
Refinement plus structural groundwork

---

## Priority 8 — Improve shell-level degraded-state behavior
### Gap it closes
Zone failures currently disappear silently at the visual level.

### Product-grade solution
Replace null-only zone failure behavior with authored fallback shells for high-value slots.

### Impact on user experience
Maintains trust and page coherence under partial failure.

### Impact on adaptability / responsiveness
Moderate

### Cross-layer implications
- `ZoneErrorBoundary`
- shell fallback components
- monitoring hooks

### Timing
Implement now

### Type
Refinement

---

## Priority 9 — Add hosted validation for shell composition states
### Gap it closes
The shell itself lacks proof-oriented responsive composition validation.

### Product-grade solution
Add hosted tests covering:
- wide / medium / narrow layouts
- invalid module configs
- missing-zone degradation
- preserved hierarchy
- focus behavior after re-layout
- future schema fallback behavior

### Impact on user experience
Higher confidence and fewer regressions.

### Impact on adaptability / responsiveness
High over time

### Cross-layer implications
- hosted Playwright suite
- closure artifacts
- shell state fixtures

### Timing
Implement now

### Type
Refinement and quality gate

## Final priority statement
The correct next move is not “make the shell prettier.”

The correct next move is:
1. build the shell contract
2. make composition governable
3. align the outlier surfaces
4. then layer on future configurability
