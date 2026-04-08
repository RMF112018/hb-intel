# UI System Layer Model

## Purpose

Define the canonical structure of the HB Intel shared UI system so that reusable UI is placed in the correct layer, consumer code stays lean, and premium presentation work does not get forced into the same patterns as productive application UI.

## Core rule

HB Intel shared UI should be understood and evolved through four layers:

1. **Foundations**
2. **Primitives**
3. **Surface Families**
4. **Consumers**

All reusable UI decisions should first be evaluated against this model before new shared code is added.

---

## 1. Foundations

Foundations are the non-feature-specific visual and interaction rules that every other layer depends on.

### Includes

- design tokens
- semantic color roles
- typography scale and usage rules
- spacing scale
- radii
- elevation and shadow system
- motion timing and easing
- iconography rules
- responsive breakpoints
- density rules
- accessibility constraints that affect shared rendering

### Foundations do not include

- feature-specific layouts
- page sections
- branded spotlights
- business-specific compositions
- webpart-specific assemblies

### Key rule

Foundations define the approved raw materials of the UI system. They should not express individual page compositions or feature stories.

---

## 2. Primitives

Primitives are the reusable building blocks used to assemble larger UI surfaces.

### Includes

- text primitives
- button primitives
- input primitives
- field wrappers
- badges and status chips
- tabs
- dialogs
- drawers
- tooltips / popovers
- layout primitives
- navigation primitives
- tables and supporting table scaffolds
- media wrappers
- skeleton / loading states

### Primitive characteristics

- intentionally generic within the HB Intel system
- reusable across multiple features and surfaces
- strongly typed
- accessible by default
- visually driven by foundations, not local hardcoded values

### Primitives do not include

- hero banners
- homepage spotlight assemblies
- leadership message modules
- company pulse feature rails
- business-specific cards with locked content models

### Key rule

If a reusable object is a building block rather than a recognizable product section, it is usually a primitive.

---

## 3. Surface Families

Surface families are reusable section-level UI patterns that represent meaningful product experiences rather than raw building blocks.

### Includes

- signature hero surfaces
- command / launcher surfaces
- editorial / communications surfaces
- discovery / wayfinding surfaces
- operational / dashboard surfaces
- analytics surfaces
- spotlight / highlight surfaces
- people / culture / recognition surfaces

### Surface family characteristics

- larger than primitives
- composition-aware
- intentionally branded
- may differ materially between productive and presentation lanes
- should still be reusable across more than one consumer when centrally owned

### Surface families do not include

- entire pages
- app-specific data orchestration
- feature business logic
- one-off local assemblies that have no plausible reuse value

### Key rule

If a UI pattern is a recognizable section type with repeated strategic value, it is a candidate surface family.

---

## 4. Consumers

Consumers are local implementations that assemble foundations, primitives, and surface families into real feature experiences.

### Includes

- app pages
- feature package screens
- SharePoint webparts
- route-specific assemblies
- local composition logic
- feature-specific data wiring
- business rules and orchestration

### Consumer responsibilities

- use shared layers correctly
- keep business logic local
- avoid inventing new shared primitives casually
- avoid hardcoding alternative design systems inside feature code

### Key rule

Consumers should assemble the system, not replace it.

---

## Lane model within the layer model

The layer model supports two experience lanes built on the same foundations and primitives.

### Productive lane

Optimized for:

- forms
- tables
- workflow surfaces
- admin tools
- dashboards
- task-oriented application experiences

### Presentation lane

Optimized for:

- homepage hero content
- editorial storytelling
- company news and communications
- branded spotlight surfaces
- people and culture features
- highly visual or attention-grabbing content sections

### Important rule

The two lanes must share a common foundation but must not be forced into identical section-level visual behavior.

---

## Placement decision guide

### Put it in foundations when

- it is a token or core system rule
- it should influence many primitives and surfaces
- it should not carry business meaning

### Put it in primitives when

- it is a reusable building block
- it is smaller than a feature section
- it can support multiple consumers and both lanes

### Put it in surface families when

- it is a reusable section type
- it carries strategic brand or experience value
- multiple consumers benefit from a shared authored section model

### Keep it consumer-local when

- it is tightly tied to one feature's business logic
- it is route-specific with no durable reuse case
- it is a transitional assembly during migration

---

## Anti-patterns

Avoid the following:

- storing token decisions in consumer CSS
- building premium homepage sections out of generic application-card primitives only
- creating local reusable primitives inside feature packages
- forcing presentation surfaces to look like workflow cards
- moving business logic into shared UI packages
- creating one-off local premium surfaces when a reusable family should exist

---

## Migration guidance

When the existing codebase does not yet cleanly follow the layer model:

- prefer staged migration,
- preserve compatibility through adapters or wrappers,
- move shared responsibilities inward over time,
- do not use migration pressure as a reason to freeze weak legacy patterns.

---

## Review standard

Any meaningful shared UI proposal should be answerable in these terms:

- Is this a foundation concern?
- Is this a primitive?
- Is this a surface family?
- Is this consumer-local?
- Does it belong to the productive lane, the presentation lane, or both?

If the answer is unclear, review the repo truth, current exports, and affected consumers before introducing new shared code.
