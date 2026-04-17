# HB Homepage Shell Composition Audit — Summary

## Executive position

The current `hbHomepage` implementation is a clean host shell, but it is not yet a flagship-grade homepage orchestration system.

It is currently best understood as:

- a **thin composed host**
- with **fixed linear zone order**
- delegating almost all visual and responsive intelligence to the child modules
- without a **declarative slot model**
- without a **governed shell layout contract**
- and without the structural seams needed for a future tenant-maintainer control panel

That means the work is directionally correct, but the shell itself is still too static and too lightweight to support the future state described in the audit brief.

## Core findings

### 1. The shell is intentionally narrow in scope
Repo truth shows that `HbHomepageShell.tsx` renders a fixed sequence of five zone wrappers:

1. Company Pulse
2. Leadership Message
3. Project Portfolio Spotlight
4. People & Culture Public
5. HB Kudos

The shell CSS is a single-column flex stack with breakpoint-only spacing changes. There is no shell-owned grid model, zone role metadata, density system, breakpoint-specific reordering, or container-aware placement logic.

### 2. The zone wrappers are clean but almost purely pass-through
Each zone wrapper extracts one config slice, wraps the child in a `<section>` with an `aria-label`, and isolates failures via `ZoneErrorBoundary`.

This is good fault isolation and good compositional hygiene, but it is not enough to support future governed layout reconfiguration.

### 3. Individual module quality is uneven
The homepage modules do not have equal maturity:

- **Strong / productized:** `CompanyPulse`, `LeadershipMessage`, `ProjectPortfolioSpotlight`, and especially `HbKudos`
- **Not currently embedded but promising:** `SafetyFieldExcellence`
- **Current outlier:** `PeopleCulturePublicSurface`

The strongest modules delegate into refined shared surfaces in `@hbc/ui-kit/homepage`, while `PeopleCulturePublicSurface` remains self-contained and relies heavily on inline style objects and hardcoded presentation values.

### 4. The biggest composition problem is not “bad cards”
The main composition problem is **equal-weight sequencing without shell orchestration**.

Even though several child modules are individually polished, the homepage still risks reading as:

- a premium stack of separate modules
- rather than a single authored homepage composition

The most notable conflict is between **Company Pulse** and **Project Portfolio Spotlight**. Both are dominant, featured-story-driven modules with strong visual authority. In a simple vertical stack they compete instead of composing.

### 5. The shell is not control-panel ready yet
The current structure is not suitable for a future homepage control panel in which a tenant-designated maintainer can safely:

- reorder apps
- resize apps
- change grouping
- adjust prominence
- manage breakpoint behavior within governed limits

That future state requires contracts that do not currently exist:
- zone roles
- allowed footprints
- per-module comfort ranges
- per-breakpoint layout behavior
- compatibility / exclusion rules
- system-authored vs maintainer-configurable boundaries

## Recommended end-state shell posture

The homepage should evolve into a **governed orchestration shell**, not a freeform parking lot editor.

### Recommended homepage hierarchy
- **Top band:** keep the flagship hero independent and system-authored
- **Primary shell band:** a dominant operational/editorial anchor band, led by Project Portfolio Spotlight and Company Pulse, with explicit orchestration rules
- **Secondary band:** Leadership Message + People & Culture, treated as a calmer human/context band
- **Recognition band:** HB Kudos as a persistent revisit-worthy recognition surface, not buried but also not allowed to overpower the page
- **Future operational band:** Safety Field Excellence introduced as a first-class operational/safety lane once ready

### Recommended composition principles
- not every module should be full-width and equal-weight
- shell ordering should be semantic, not historical
- some modules should be allowed to share a row or cluster at wide widths
- some modules should collapse, demote, or reframe at medium widths
- the shell should use **slot capability metadata** and **layout presets**, not hard-coded JSX ordering alone

## What to preserve
- thin consumer pattern for mature modules
- fault isolation via per-zone error boundaries
- shared premium surface families in `@hbc/ui-kit/homepage`
- strong module-level responsive behavior already present in Company Pulse, Leadership Message, and Project Spotlight
- HB Kudos as the implementation-maturity benchmark

## Highest-priority gaps
1. No declarative shell layout contract
2. No slot / zone metadata model
3. No governed resizing or breakpoint orchestration framework
4. No shell-aware module capability registry
5. People & Culture surface not aligned with the same level of productization as the best homepage modules
6. No future-safe distinction between configurable and non-configurable layout decisions

## Recommended delivery split

### Wave 01 — structural shell groundwork
Build the contracts that make future controlled layout evolution possible:
- shell schema
- slot roles
- placement metadata
- allowed footprints
- responsive orchestration engine
- safe defaults and fallback behavior
- shell-level degraded-state behavior

### Wave 02 — module fit and composition refinement
Use the new shell contract to:
- rebuild / realign People & Culture for shell-fit
- add shell-fit variants where needed
- introduce governed prominence/grouping presets
- prepare Safety Field Excellence for insertion
- refine cross-module composition and viewport behavior

## Conclusion
The current shell is **directionally correct but structurally early**.

It is close to being a strong host.
It is **not yet close** to being the flagship, adaptive, control-panel-ready homepage shell described in the prompt.

The next step should not be cosmetic tuning.
It should be a **governed shell-architecture upgrade** followed by **module-fit refinement**.
