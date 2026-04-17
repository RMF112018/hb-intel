# Doctrine and Benchmark Assessment

## Governing authority applied
This assessment used the following governing sources:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. homepage benchmark package under `docs/architecture/plans/MASTER/spfx/benchmark/`
4. `docs/reference/ui-kit/homepage-webpart-benchmark.md`

## What the doctrine demands

Across the governing documents, the homepage standard is not merely:
- “make the modules look nicer”
- “use shared components”
- “avoid bugs”

The doctrine is much stronger. It requires:
- premium authored composition
- visibly non-generic homepage structure
- escape from timid enterprise card-grid outcomes
- structural rebuild where required
- host-aware but page-canvas-confident design
- proper empty/loading/error behavior
- premium stack usage where relevant
- persona-fit differentiation
- benchmark-grade implementation maturity

## Current shell against doctrine

### 1. Host awareness — passes
The shell is appropriately host-aware:
- it does not duplicate SharePoint shell chrome
- it stays inside page-canvas ownership
- it does not create fake app-shell furniture
- it respects the doctrine’s coexistence model

### 2. Authoring safety — partially passes
The shell does reasonably well on:
- optional props
- graceful module delegation
- reduced-motion shell rule
- fault isolation per zone

However, it is still thin in several areas:
- failed zones disappear rather than degrading gracefully in authored homepage language
- shell-level fallback behavior is underdeveloped
- there is no shell-owned composition behavior for partially absent high-value zones

### 3. Anti-safety-zone posture — mixed
The child modules are not generic white cards in the usual sense, and several are genuinely premium.

But the shell itself still risks a **safe stacked-modules outcome** because:
- all participating zones are sequenced linearly
- the shell does not create a clear dominant / secondary / tertiary structure
- the shell does not actively mediate between modules with similar visual authority

In other words:
- the modules are increasingly premium
- the shell composition is still cautious

### 4. Structural rebuild preference — not yet satisfied at shell level
The doctrine prefers structural replacement when the result still reads as a cautious enterprise assembly.

That remains true here:
- the child modules have seen structural investment
- the shell has not yet received a corresponding orchestration-level rebuild

The shell remains too close to:
- “stack mature modules in order”
rather than
- “author a flagship homepage composition system”

### 5. Premium stack posture — mixed but mostly positive
The best child modules show strong shared-surface discipline and premium behavior.

However:
- the shell itself barely uses those capabilities as a composition system
- `PeopleCulturePublicSurface` remains materially less aligned with the same premium-system rigor

### 6. Token discipline and shared-surface maturity — uneven
The benchmark material makes clear that homepage surfaces should be:
- governed
- token-driven
- consistent in maturity
- persona-fit rather than cloned

Strongest alignment:
- Company Pulse
- Leadership Message
- Project Spotlight
- HB Kudos

Weakest alignment:
- People & Culture Public

This is the current maturity outlier in the intended shell set.

## Benchmark posture

## HB Kudos benchmark implications
The benchmark package makes two critical points:
1. HB Kudos is the maturity benchmark
2. benchmark quality must **not** produce cloned modules

That means this audit should not conclude:
- “make every module look like Kudos”

Instead it should conclude:
- every homepage module should achieve **equivalent rigor**
- and the shell should orchestrate those differentiated surfaces into a coherent flagship page

## Current benchmark-grade strengths
- strong thin-consumer pattern in several modules
- meaningful use of shared premium surface families
- clear persona differentiation between newsroom, executive editorial, operational spotlight, and recognition
- strong interaction maturity in HB Kudos
- solid shell/module boundary hygiene

## Current benchmark-grade weaknesses
- no benchmark-grade shell orchestration layer
- no benchmark-grade responsive zone system
- no benchmark-grade future configuration contract
- no equal maturity across all intended shell modules
- shell composition still too dependent on historical stacking order

## Public benchmark principles applied

This audit also used public benchmark principles outside the repo:

### Scannability and content hierarchy
NN/g research emphasizes that web users scan rather than read linearly, and that dense or weakly organized pages reduce findability and comprehension. That directly supports stronger homepage hierarchy, tighter section purpose, and better shell-level sequencing.  

### Progressive disclosure
USWDS and GOV.UK both reinforce progressive disclosure as a way to reduce cognitive load and make pages easier to scan. That supports a homepage model where not every supporting module is fully expanded at all times.  

### Responsive layout systems
Material and Atlassian both reinforce breakpoint-aware layout systems, consistent spacing scales, and intentional grid behavior rather than passive collapse. That supports a shell that owns layout behavior, not just child spacing.  

### Container-query thinking
MDN’s container-query guidance is especially relevant: components can adapt to the size of their containing area, not just the viewport. That is the correct technical direction for a future shell that allows governed reconfiguration or resizing.  

## Doctrine verdict by area

### Shell-level composition quality
**Directionally correct, not yet flagship**

### Adaptive layout quality
**Underpowered at shell level**

### Individual module sophistication
**Mostly strong, but uneven**

### Control-panel future readiness
**Not ready yet**

### Benchmark-grade extensibility
**Needs structural groundwork now**

## Overall doctrine / benchmark verdict
The codebase is past the point where homepage quality is limited by child-module polish alone.

The next constraint is the **shell itself**.

The shell now needs to become:
- declarative
- semantically tiered
- layout-aware
- future-governed
- and compositionally authored

without becoming a chaotic freeform editor.
