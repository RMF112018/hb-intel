# Doctrine, Breakpoint, and Benchmark Assessment

## Overall judgment

The current homepage shell is **mostly aligned with the architectural spirit** of the doctrine and breakpoint spec, but it is still only **partially aligned with the intended homepage outcome**.

Put plainly:

- the architecture is increasingly correct
- the composition is not yet assertive enough
- the entry stack is not yet governed end-to-end
- one major module family still drifts from the benchmark standard

## 1. SPFx Governing Standard assessment

### Strongly aligned
The shell and its strongest occupants are clearly aligned with the doctrine’s preference for:
- structural rebuild over decorative polish
- confident width usage
- productized premium surfaces
- strong surface families rather than ad hoc cards
- author-safe loading / empty / error handling

The strongest examples are:
- Company Pulse
- Leadership Message
- Project Portfolio Spotlight
- HB Kudos
- Safety Field Excellence

These components are not generic Fluent-feeling modules. They are productized surfaces.

### Partial gaps
The shell is still more cautious than the doctrine wants in two areas:
- **width authority**
- **orchestration boldness**

The governing standard favors strong asymmetric composition and confident use of the page canvas.
The current default preset still behaves more like a disciplined vertical stack than a flagship asymmetric homepage.

## 2. Homepage Overlay assessment

### What is clearly compliant
The shell respects the homepage overlay in important ways:
- no fake shell chrome
- page-canvas ownership rather than SharePoint-chrome duplication
- full-width manifest support where needed
- real use of `@hbc/ui-kit/homepage` for the strongest modules
- professional empty/loading/error states in the major consumers

### Main doctrine drift
The biggest local doctrine drift is **People & Culture Public**.

It remains outside the same quality discipline in three ways:
1. local self-contained surface composition
2. inline presentation objects with raw color/spacing literals
3. weaker token and variant governance than the strongest homepage families

The overlay allows homepage-local primitives, but it does not waive token discipline or premium-surface rigor.

## 3. Breakpoint spec assessment

### What is now directionally correct
The shell now has real breakpoint policy and single-column fallback logic.
That is a major improvement.

Current code already expresses:
- tablet/phone single-column discipline
- pairing restrictions for the first lane
- height-aware phone-landscape behavior
- container-measured layout state instead of naive viewport assumptions

### What is still missing
The shell does **not** yet fully satisfy the breakpoint spec because the full entry stack is not governed in one place.

The spec expects:
1. flagship hero
2. top actions / utility band
3. first shell lane

to behave as one intentional entry sequence.

Current implementation reality:
- hero logic lives separately
- utility band logic lives separately
- shell logic starts after that

So breakpoint conformance is currently:
- **good inside the post-hero shell**
- **incomplete at the whole-homepage level**

### Specific breakpoint mismatch
The ultrawide breakpoint policy is ahead of the physical shell layout.
The shell defines an ultrawide state but caps the canvas below that state’s minimum threshold.

That is a direct gap between policy and realized layout.

## 4. Benchmark package assessment

### What matches the benchmark posture
The benchmark package treats HB Kudos as the quality bar for rigor rather than visual cloning.
The current shell’s best modules follow that rule correctly:
- they do not clone Kudos
- but they do match its implementation seriousness more closely than earlier homepage work did

### What still misses the benchmark
The benchmark posture expects:
- surface-family seriousness
- token discipline
- accessibility and interaction completeness
- product-grade implementation quality relative to purpose

People & Culture Public is still the clear lagging surface against that benchmark.

## 5. Public benchmark reference assessment

### Apple HIG / Layout
Apple’s guidance emphasizes:
- clear visual hierarchy
- progressive disclosure
- grouping related content
- keeping essential information immediately visible
- adapting to usable window context, not just raw device class

The shell now reflects the **adaptability** part more than it reflects the **hierarchy and immediate-value** part.

### Material responsive layout guidance
Material’s breakpoint logic reinforces:
- one-level vs two-level hierarchy changes by width
- explicit breakpoint-based layout shifts
- flexible grids instead of passive scaling

The shell has begun to do this through presets and pairing rules, but the default homepage composition still underuses it.

### Atlassian responsive grid guidance
Atlassian’s grid guidance reinforces:
- breakpoint-based column systems
- deliberate content spans
- consistent margins and gutters
- purposeful multi-column composition at medium/large widths

The shell has the beginnings of this, but its current paired mode is still too narrow:
- only one `3fr / 2fr` template
- limited effective use of column-span metadata
- no richer band grammar yet

### GOV.UK content grouping guidance
GOV.UK’s guidance is useful here because it is ruthless about:
- grouping by user need
- feature-slot discipline
- not featuring everything
- top-task clarity

That is highly relevant to the homepage:
- not every module should be visually equal
- not every module should be always exposed at full emphasis
- the shell should feature less, but more deliberately

## 6. Net assessment

### Strong
- shell architecture
- manifest posture
- post-hero breakpoint thinking
- benchmark alignment of the strongest occupants

### Directionally correct but incomplete
- entry-stack behavior
- first-lane composition
- wide-canvas exploitation
- future control-panel preparedness

### Materially weak
- People & Culture Public surface discipline
- default preset ambition
- practical realization of the ultrawide policy
