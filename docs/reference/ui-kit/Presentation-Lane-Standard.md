# Presentation Lane Standard

## Purpose

Define the standard for HB Intel's **presentation lane**: the part of the UI system responsible for premium, attention-grabbing, branded content surfaces such as homepage hero bands, project spotlights, leadership messages, company pulse, recognition, and other editorial or showcase experiences.

The presentation lane exists to ensure that high-visibility product surfaces do not collapse into generic productive-card UI.

---

## What the presentation lane is for

The presentation lane is for UI that should:

- create first impressions,
- command attention,
- communicate brand identity,
- support storytelling or emphasis,
- direct the eye through strong hierarchy,
- feel authored rather than purely utilitarian.

### Typical examples

- signature hero banners
- project spotlight modules
- leadership message surfaces
- company pulse / news surfaces
- people and culture features
- command launcher bands with premium homepage emphasis
- editorial discovery sections

---

## What the presentation lane is not for

The presentation lane is not the default rendering mode for:

- forms
- tables
- CRUD views
- admin panels
- dense workflow tools
- ordinary dashboard tiles
- settings screens

Those belong to the productive lane unless there is a strong, explicit reason otherwise.

---

## Visual standard

Presentation lane surfaces should generally exhibit:

- stronger hierarchy than productive surfaces
- clearer focal points
- more deliberate composition
- larger and more confident typography where appropriate
- stronger use of scale and contrast
- richer image or media treatment when relevant
- more expressive but still disciplined motion
- more authored spacing and rhythm
- clearer branded identity

### They should not default to

- thin-border generic cards
- flat enterprise filler surfaces
- weak white-box compositions used only because they are convenient
- dashboard-style widget framing for editorial content

---

## Relationship to foundations

Presentation surfaces must still use the shared foundations:

- tokens
- semantic color roles
- spacing scale
- typography system
- motion rules
- accessibility standards
- responsive system

### Important rule

Presentation quality should come from how the system is composed, not from bypassing the system.

Premium does **not** mean uncontrolled local CSS with hardcoded visual values.

---

## Relationship to primitives

Presentation surfaces should be assembled from shared primitives where appropriate, but not reduced to primitive-level aesthetics.

### Rule

A presentation surface may use the same buttons, typography primitives, badges, and overlays as the productive lane, while still having a distinct section-level composition, visual hierarchy, and emotional presence.

---

## Surface family expectations

Presentation surfaces should be modeled as explicit surface families when the pattern has durable value.

### Candidate families

- hero
- spotlight
- editorial
- communications
- recognition
- discovery
- premium command band

Each family should have:

- a clear purpose
- composition guidance
- lane-specific visual rules
- responsive behavior
- accessibility expectations
- examples of correct and incorrect use

---

## Content and composition rules

Presentation surfaces should have:

- a defined focal hierarchy,
- a clear primary content region,
- a limited number of competing emphasis points,
- purposeful spacing,
- obvious scan order.

### Avoid

- equal visual weight everywhere
- too many small competing modules in one surface
- tiny typography with excessive empty space
- busy ornament with no content hierarchy
- trying to make a content surface behave like a dense app control panel

---

## Motion rules

Motion in the presentation lane may be more expressive than in the productive lane, but it must remain disciplined.

### Motion may be used for

- reveal choreography
- focal sequencing
- subtle depth and hover response
- editorial or spotlight emphasis

### Motion may not be used for

- decoration without purpose
- constant movement that competes with content
- blocking or disorienting transitions
- animation that undermines reduced-motion expectations

---

## Accessibility standard

Premium presentation work must meet the same accessibility baseline as the rest of the system.

### Required

- readable contrast
- keyboard-safe behavior for interactive elements
- reduced-motion respect
- zoom resilience
- semantic structure
- accessible alt or equivalent media treatment where needed

Presentation quality is not an excuse to lower accessibility rigor.

---

## Ownership rules

### Belongs in shared UI when

- the section type is strategically reusable
- multiple consumers would benefit from the same authored surface family
- the pattern represents a stable product experience type

### Belongs local to a consumer when

- it is a one-off composition with no durable reuse case
- it is tightly bound to feature-specific business logic
- it is transitional migration code

---

## Review questions

When reviewing a presentation-lane proposal, ask:

- Is this surface genuinely presentation-oriented?
- Does it feel authored and premium?
- Is the hierarchy materially stronger than productive UI?
- Is the visual language still grounded in shared foundations?
- Should this be a shared surface family or remain local?
- Is this content surface being incorrectly reduced to a generic card?

---

## Anti-patterns

Avoid:

- homepage sections built as low-emphasis dashboard tiles
- editorial modules rendered as generic table-adjacent cards
- local hardcoded “premium” styling that bypasses tokens
- presentation surfaces that visually blend into productive workflow UI
- using presentation polish only in one hero while everything else remains flat and generic

---

## Standard outcome

A correct presentation-lane implementation should feel:

- premium,
- branded,
- clearly composed,
- visually intentional,
- distinct from ordinary application UI,
- but still recognizably part of the same HB Intel system.
