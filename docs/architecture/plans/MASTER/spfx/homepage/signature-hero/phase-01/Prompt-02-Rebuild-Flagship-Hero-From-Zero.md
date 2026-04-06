# Prompt 02 — Rebuild the Flagship Hero From Zero

## Objective

Design and implement a completely new flagship homepage hero from scratch.

The current hero should not be used as a visual baseline.
Start over.

The new hero must be a single premium identity surface built specifically for a SharePoint full-width section.

## Locked Content Scope

The new hero may include only:
1. Hedrick Brothers logo / brand lockup
2. Tagline: `Build with GRIT.`
3. Personalized welcome message

Nothing else belongs in the flagship hero.

Explicitly exclude:
- CTA buttons
- metadata
- update timestamps
- supporting paragraphs
- cards inside the hero
- alert chips
- badges
- quick links
- secondary modules
- editorial marketing copy
- duplicated “HB Central” labels unless compositionally necessary

## Design Intent

The hero should feel:
- premium
- quiet
- confident
- architectural
- brand-forward
- contemporary
- spacious without feeling empty
- more like a premium brand plate than a webpart banner

The hero should not feel:
- like an intranet promo banner
- like a dashboard card
- like a stock corporate masthead
- like a giant logo on a blank slab
- like a gradient-heavy legacy enterprise hero

## Full-Width Requirement

The hero must utilize the full available width of the SharePoint full-width section.

That means:
- no artificial internal max-width bottleneck that makes the hero read like a centered narrow rail
- no timid content band floating in excessive unused canvas
- no hero composition that relies on SharePoint margins to create the layout

Use the available width confidently while keeping the content cluster intentionally composed.

Preferred composition approach:
- strong asymmetry
- content anchored left or left-of-center
- deliberate negative space
- balanced visual weight across the full-width canvas

## Background Direction

The gradient approach is rejected.

Use a new background system with this priority order:

### Preferred
Wide-format authored photography from real project work, jobsite materiality, architecture, construction craft, or premium built-environment imagery.

Requirements:
- low clutter
- wide crop
- minimal focal competition with text
- premium tonal range
- strong readability under text
- not obviously stock-photo generic

### Fallback
A dark matte material field:
- graphite / charcoal / mineral / architectural surface character
- subtle physical grain or texture
- restrained tonal variation
- edge vignetting only if extremely subtle
- no obvious glow gimmicks
- no synthetic tech gradients

### Absolute Prohibitions
- blue/orange gradient washes
- obvious radial glows
- loud lens-flare behavior
- cheesy “premium” effects
- decorative noise for its own sake

## Visual Hierarchy

### Logo
- reduce its dominance substantially relative to the current failed version
- it should support the composition, not overwhelm it

### Tagline
- `Build with GRIT.` should be the primary typographic statement
- it should set the emotional tone immediately

### Personalized greeting
- should feel human and welcoming
- should remain subordinate to the tagline
- should not feel like a separate card or module

## Technical Requirements

- use a dedicated CSS module or equivalent class-driven styling system
- avoid inline visual styling except where absolutely necessary
- support responsive reflow cleanly
- maintain `prefers-reduced-motion`
- preserve accessibility contrast
- keep the hero non-interactive unless a future phase explicitly changes that

## Implementation Direction

You may replace:
- the entire hero markup structure
- the entire CSS module structure
- local helper usage if needed
- the internal motion choreography
- the background handling strategy

You may introduce:
- a new internal composition structure
- new CSS custom properties or token aliases
- new background asset handling rules
- a new reduced-motion-safe reveal treatment

You may not:
- add new hero content categories
- preserve old CTA logic “just in case”
- fall back to the old visual language

Do not re-read files that are still within your current context window or memory. Re-open files only when necessary to verify changed or unresolved details.

## Deliverables

- a brand-new flagship hero implementation
- a fully rebuilt hero stylesheet/module
- any necessary local helpers for background handling
- concise notes describing the chosen composition and background strategy

## Validation

Provide proof that:
- the hero is a total redesign, not a mild restyle
- the hero uses the full SharePoint full-width section effectively
- the gradient has been fully removed
- the content scope is locked to the three allowed elements
