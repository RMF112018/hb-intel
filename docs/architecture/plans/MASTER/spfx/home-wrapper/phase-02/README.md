# HB Homepage Shell — Enhanced Consolidated Audit and Prompt Package

## Purpose

This package replaces the two attached draft packages with one shell-only, repo-truth implementation package for `hbHomepage`.

The audited product is the homepage shell under:

- `apps/hb-webparts/src/webparts/hbHomepage/`

The hosted homepage webparts are discussed only as shell occupants or candidate occupants. They are **not** being audited here as standalone products.

## Scope lock

This package is explicitly bounded to:

- shell composition and orchestration
- shell layout authority
- shell responsiveness and container-fit behavior
- shell registry / slot / preset governance
- shell degradation and diagnostics
- shell readiness for a future controlled layout-admin surface

This package explicitly excludes:

- broad redesign briefs for hosted child webparts
- standalone quality audits of Company Pulse, Leadership Message, Project Portfolio Spotlight, People & Culture Public, HB Kudos, or Safety Field Excellence
- moving the independent flagship hero into `hbHomepage`

## Most important repo-truth correction

The earlier `basic-ui-audit` package overreached by treating a flagship top-band inside `hbHomepage` as a shell requirement.

Repo-truth says the opposite:

- `hbHomepage` is the **post-hero operating layer**
- `hbSignatureHero` remains an **independent webpart**
- the shell starts **after** the hero, not inside it

That means hero absorption is removed from this package. The shell must coordinate the post-hero operating layer correctly; it must not swallow the independent hero.



## Breakpoint-spec alignment update

This package is now explicitly aligned to the local repo spec:

- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

That spec is treated here as the governing entry-state target for how the post-hero shell should behave relative to the independent hero, the adjacent utility/actions layer, and the first shell lane.

### What that changes in this package

The package now explicitly requires the local code agent to implement shell decisions against:

- **practical shell design targets**, not raw hardware resolutions
- a named entry-state breakpoint model aligned to the spec’s usable-width ranges
- first-lane visibility on first load across major device classes
- conditional two-column first-lane behavior rather than automatic wide-screen pairing
- default single-column entry for tablet portrait, phone portrait, and phone landscape states
- shell-fit eligibility for first-lane occupants, including narrowest stable layout rules
- protected entry-state decisions that a future control panel may not override casually

### Boundary clarification

The shell package remains **post-hero**.

That means:
- the shell still does **not** absorb `hbSignatureHero`
- the shell still does **not** turn this package into a broad quick-links redesign
- but the shell **does** now need to coordinate its first-lane logic against the breakpoint spec’s hero/actions/value-density expectations

## Key repo-truth findings driving this package

1. `HbHomepageShell.tsx` currently renders a fixed vertical stack of five zones directly in JSX.
2. `HbHomepageShell.module.css` currently provides only flex-column rhythm and larger padding/gaps at wider breakpoints.
3. `hbHomepageContract.ts` uses broad `Record<string, unknown>` config typing and does not expose a typed shell layout schema.
4. `ZoneErrorBoundary.tsx` logs and returns `null`, which causes invisible shell degradation.
5. The shell has no module capability model, no slot comfort rules, no governed presets, and no invalid-layout fallback path.
6. `PeopleCulturePublicSurface.tsx` is the most obvious shell-fit outlier among current occupants because it keeps a strong local presentation island, including an internal `maxWidth: 1040` and extensive inline styling. That matters here only because it constrains pairing and slot flexibility.
7. The current packages defer too much shell work into wave sequencing. This replacement package consolidates the material shell work into one implementation track.

## What was preserved from the earlier packages

Preserved and strengthened:

- explicit shell schema / registry need
- module capability metadata
- band- or lane-based composition instead of pure stacking
- shell-level breakpoint orchestration
- shell-level fallback and diagnostics
- validation and closure proof

## What was rewritten or removed

Rewritten or removed:

- hero/top-band absorption into `hbHomepage`
- broad child-webpart redesign work that is not strictly required for shell compatibility
- shell prompts that talk about “future waves” for core shell work
- separate module-specific prompts where the real issue is missing shell metadata or shell-fit constraints

## File guide

### Audit / architecture files
- `00-Enhanced-Shell-Audit-Summary.md`
- `01-Shell-Repo-Truth-Gap-Register.md`
- `01A-Current-Occupant-Shell-Compatibility-Matrix.md`
- `02-Research-Informed-Shell-Architecture-and-UX-Implications.md`
- `02A-Shell-Entry-Breakpoint-Spec-Alignment.md`
- `03-Consolidated-Shell-Implementation-Plan.md`

### Local code-agent prompts
- `04-Prompt-01-Establish-Typed-Shell-Schema-Registry-and-Validation.md`
- `05-Prompt-02-Rebuild-HbHomepageShell-as-a-Registry-Driven-Orchestrator.md`
- `06-Prompt-03-Implement-Container-Aware-Responsive-Resolution-and-Slot-Comfort-Rules.md`
- `07-Prompt-04-Add-Shell-Level-Degraded-State-Invalid-Config-and-Diagnostics-Handling.md`
- `08-Prompt-05-Define-Occupant-Capability-Contracts-and-Shell-Fit-Adjustments.md`
- `09-Prompt-06-Encode-Governed-Presets-Protected-Decisions-and-Control-Panel-Ready-Persistence.md`
- `10-Prompt-07-Add-Shell-Validation-Conformance-and-Closure-Proof.md`

## Recommended execution order

1. Prompt 01 — typed shell schema, registry, and validation
2. Prompt 02 — registry-driven shell renderer
3. Prompt 03 — container-aware responsive orchestration
4. Prompt 04 — degraded-state, invalid-config, and diagnostics hardening
5. Prompt 05 — occupant capability contracts and bounded shell-fit adjustments
6. Prompt 06 — governed presets and control-panel-ready persistence boundaries
7. Prompt 07 — validation, scorecard, and closure proof

## Delivery intent

This is a shell implementation package, not a lightly revised audit. It is meant to give a local code agent enough context, structure, and closure criteria to implement the shell work cleanly in one serious pass.
