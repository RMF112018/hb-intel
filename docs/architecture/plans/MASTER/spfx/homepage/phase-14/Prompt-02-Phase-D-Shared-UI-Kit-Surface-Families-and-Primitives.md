# Prompt 02 — Phase D Shared UI-Kit Surface Families and Primitives

## Objective

Implement the shared `@hbc/ui-kit` and/or `@hbc/ui-kit/homepage` changes required for Phase D so the five in-scope homepage surfaces can be visually and structurally differentiated without one-off duplication.

This prompt is about **shared primitives first**.

Do not fully redesign all target webparts in this prompt. Build the shared design language and reusable components they will depend on.

## Hard instruction

Do **not** re-read files already in your active context or memory unless needed to resolve uncertainty, verify a conflict, or confirm repo truth after edits.

## Required implementation scope

Based on repo truth and the Phase D contract from Prompt 01, add or refine the shared kit so it can support at minimum these surface families:

- Editorial / News
- Executive / Authored Message
- People / Recognition
- Operational / Project Intelligence
- Safety / Signal

## Required shared-kit work

Implement or refine the relevant subset of the following, grounded in repo truth:

### 1. Surface primitives / variants
Potential examples:
- editorial spotlight surface
- news brief list row
- leadership feature shell
- recognition card
- project spotlight shell
- KPI / milestone strip
- safety signal card
- safety recognition vs warning variant
- structured metadata row
- homepage section header / section shell improvements

### 2. Typography utilities
Strengthen support for:
- editorial headline
- byline / authored attribution
- timestamp / freshness row
- recognition label
- KPI label / value pairing
- safety signal label / severity metadata
- compact supporting text without flattening hierarchy

### 3. Badge / chip / metadata systems
Refine shared treatments for:
- category chips
- authored metadata
- freshness markers
- status chips
- KPI micro-surfaces
- signal severity / field excellence indicators

### 4. CTA / footer patterns
Support differentiated CTA models:
- editorial “Read more”
- executive “View message” / archive
- recognition “See all”
- operational “View project”
- safety “Review update” / “See field highlights”

### 5. Visual language controls
Add or refine token-safe support for:
- content-family-specific edge treatment
- subtle tonal background/material differences
- variant-safe icon containers where appropriate
- divider and rhythm improvements
- restrained depth/elevation differences

## Constraints

- Do not break existing consumers.
- Keep naming and API design clear.
- Prefer additive, documented changes over destructive churn.
- Do not create variant explosions without clear usage boundaries.
- Ensure light/dark behavior, contrast, focus, hover, and reduced-motion handling remain correct.

## Deliverables

At minimum:
- updated shared-kit code
- updated exports
- usage documentation or component notes
- clear examples or story/test fixtures if repo truth supports them

## Validation requirements

Prove:
- primitives compile and export correctly
- visual differences are meaningful but cohesive
- APIs are understandable and not over-engineered
- accessibility remains intact

## Risk Exposure

- Too many variants can degrade maintainability.
- Weak abstraction boundaries can recreate generic-card sameness.
- Style-only variants without structural differentiation will underdeliver.

## Standards / Best Practices

- Shared primitive before local duplication
- Clear ownership boundaries
- Accessible by default
- Cohesive but differentiated family design
- SharePoint/SPFx realistic
- Documentation included
