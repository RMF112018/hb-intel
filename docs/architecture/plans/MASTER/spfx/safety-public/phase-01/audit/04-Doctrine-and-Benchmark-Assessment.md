# 04 — Doctrine and Benchmark Assessment

## Governing doctrine summary
The governing standard and homepage overlay require:
- premium, non-generic SPFx outcomes
- structural rebuild over decorative refinement where a surface is weak
- explicit shell-level and application-level breakpoint governance
- container-aware fit decisions
- strong first-screen homepage value
- authoring safety
- empty/loading/error state quality
- premium stack usage where relevant
- homepage surfaces that feel productized rather than “responsive enough”

The benchmark summary then raises the bar further by requiring benchmark-grade maturity comparable to HB Kudos in execution quality and proof discipline.

## Compliant areas

### 1. Adjacent manifest exists
The homepage overlay requires adjacent manifests for homepage webparts.
SafetyFieldExcellence complies here.

### 2. Homepage import posture is disciplined
The consumer imports from `@hbc/ui-kit/homepage` rather than using broad root imports.

### 3. Loading and empty states exist
This is compliant at a basic level.

### 4. Shared premium stack is in use
The shared surface uses `motion`, `clsx`, and Lucide iconography.

## Partial compliance

### 1. Better than generic card-grid, but not fully beyond it
The current surface is clearly better than a stock Fluent box.
However, it still resolves into a card-oriented hierarchy rather than a more productized operational surface.

### 2. Shell governance exists, but target-state governance is weak
The shell is explicit and inspectable.
The problem is not lack of shell governance; it is that the current shell governance classifies Safety too modestly.

### 3. Reduced-motion support exists
Good.
But accessibility proof still needs full focus-order and keyboard validation under the rebuilt interaction model.

## Non-compliance / underperformance areas

### 1. Structural rebuild posture not fully honored
The doctrine explicitly prefers structural replacement over decorative preservation when a surface underperforms.
The current result appears to have stopped at a stronger shared card surface, not a fully rethought safety application.

### 2. Application-level breakpoint doctrine is not truly satisfied
The doctrine requires every serious hosted homepage application to define:
- narrowest stable nested width
- supported modes
- what changes in compact/minimal states
- what content hides/collapses/reflows

The shell registry claims Safety supports compact mode, but the application itself does not expose a serious mode contract beyond CSS tightening.

### 3. Homepage target-state posture is not met
The overlay requires hosted surfaces to pair only when slot width supports a premium nested experience.
Safety’s current pairing contract is too optimistic for the actual product grammar.

### 4. Benchmark maturity is below standard
Compared with richer homepage consumers in the repo, Safety lacks:
- live data maturity
- error-state maturity
- deeper domain model maturity
- stronger productized interaction strategy
- stronger proof that the surface is benchmark-grade rather than merely improved

## Net doctrine/benchmark verdict
The current implementation is **directionally aligned** with doctrine intent, but **not compliant with the target quality bar** that the doctrine and benchmark together imply.

The next step is not incremental polish.
It is a guided structural rebuild.
