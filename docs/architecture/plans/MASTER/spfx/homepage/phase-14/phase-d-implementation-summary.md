# Phase D Implementation Summary — Editorial / Operational Differentiation

## Objective

Phase D implements the homepage redesign work required to differentiate editorial and operational content families that currently feel too visually similar.

This phase should move the homepage away from a generic “custom enterprise cards” feel and toward a more deliberate product experience where each content family is recognizable at a glance.

## In-scope homepage surfaces

### Editorial / narrative
- Company Pulse
- Leadership Message
- People & Culture

### Operational / signal
- Project / Portfolio Spotlight
- Safety & Field Excellence

## Current-state problem statement

The current homepage implementation is disciplined, but several of the mid-page modules share too much of the same surface language:
- same broad card posture
- similar featured/secondary composition rhythm
- insufficiently differentiated metadata treatment
- insufficiently distinct CTA presentation
- too much dependence on badges to create identity
- limited surface-specific hierarchy

That weakens both polish and usability. Users should not need to read the whole module to understand what kind of content they are looking at.

## Desired end state

After Phase D:
- Company Pulse should read as a true editorial/news surface.
- Leadership Message should read as an authored executive communication surface.
- People & Culture should feel warm, recognition-oriented, and more human.
- Project / Portfolio Spotlight should read as an operational project intelligence surface.
- Safety & Field Excellence should read as a signal-driven field/safety surface with stronger urgency and recognition differentiation.

## Primary implementation themes

### 1. Shared surface-family architecture
Create reusable surface families rather than solving each webpart in isolation.

### 2. Content-specific hierarchy
Different content types require different dominance models:
- editorial -> headline / byline / freshness
- leadership -> authored message / attribution / context
- people -> face / person / recognition moment
- project -> project title / status / KPI / milestone signal
- safety -> signal type / severity / freshness / field excellence cue

### 3. Better metadata and CTA systems
Replace weak appended metadata rows and generic text-link CTAs with structured, content-appropriate supporting elements.

### 4. Stronger differentiation without fragmentation
The homepage should still look like one product, but not like one repeated card.

## Recommended prompt sequence

1. Establish repo-truth contract and surface-family design language.
2. Build shared UI-kit primitives and variants needed by all five surfaces.
3. Implement editorial surfaces.
4. Implement people surface.
5. Implement project operational surface.
6. Implement safety surface.
7. Run integration pass, regression checks, accessibility validation, and docs updates.

## Risk exposure

### Main risks
- creating too many one-off local styles
- making the surfaces visually louder instead of more intentional
- over-indexing on decoration instead of hierarchy
- introducing duplicate primitives that overlap with existing shared kit abstractions
- reducing maintainability by bypassing shared homepage primitives
- failing to preserve accessibility and reduced-motion discipline

### Mitigations
- add reusable surface primitives first
- keep content semantics and data contracts stable where possible
- validate contrast, focus, hover, truncation, and responsive behavior
- document each new surface family and when it should be used

## Standards / Best Practices

- repo truth first
- shared kit before local duplication
- accessible by default
- reduced-motion aware
- strong hierarchy with restrained motion
- branded but not loud
- content-family-specific design language
- SPFx / SharePoint realism
- docs updated with intent and usage boundaries

## Definition of done

Phase D is complete when:
- all five target surfaces are materially differentiated
- shared kit additions are reusable and documented
- no target surface still reads like a lightly reskinned generic card
- homepage cohesion remains intact
- validation and documentation are complete
