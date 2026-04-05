# Prompt 05 — Phase D Project / Portfolio Spotlight

## Objective

Redesign **Project / Portfolio Spotlight** so it reads as an operational intelligence surface rather than a generic feature card.

It should feel intentional, project-centered, and more analytically useful at a glance while still fitting the premium homepage system.

## Hard instruction

Do **not** re-read files already in your active context or memory unless needed to resolve uncertainty or confirm repo truth after edits.

## Target design intent

Project / Portfolio Spotlight should feel like:
- project intelligence
- operationally important
- confident and informed
- visually clearer than a report fragment
- distinctly different from editorial, people, and safety surfaces

## Required implementation outcomes

Implement repo-truth-grounded improvements such as:
- stronger project title / entity hierarchy
- clearer status, phase, sector, or region metadata if available
- more structured KPI or metric lane if supported by data
- improved milestone / progress / timeline presentation
- better strategic emphasis treatment
- stronger action footer / CTA model
- more disciplined operational metadata rhythm

## Specific guidance

### Hierarchy
- entity first: project / portfolio item
- operational status and KPI signal second
- summary third
- milestone/progress lane fourth
- CTA footer last

### Surface treatment
- use an operational spotlight shell rather than a generic feature card
- allow KPI, status, or milestone micro-surfaces where supported
- avoid overloading the card into a mini dashboard

### Metadata
- use structured metadata rows, not appended text scraps
- badges should support hierarchy, not carry all of it

### Differentiation
- this surface must not look like Company Pulse with different content
- it must also remain distinct from Safety & Field Excellence

## Constraints

- Keep data handling realistic to repo truth.
- Do not invent analytics that the surface cannot reliably support.
- Preserve scanability and responsive behavior.
- Avoid bloated layouts or overly dense metrics.

## Deliverables

At minimum:
- updated Project / Portfolio Spotlight implementation
- any needed shared-kit refinements
- docs/comments/tests/story fixtures as appropriate

## Validation requirements

Prove:
- the surface is operationally stronger at first glance
- project identity is clearer
- KPI/milestone/status structure is more intentional
- the module is clearly differentiated from editorial and safety surfaces
- accessibility remains correct

## Risk Exposure

- Over-densifying the card can reduce elegance and scanability.
- Under-differentiating the card can keep it feeling generic.
- Reusing the same shell as Safety will blunt the value of both.

## Standards / Best Practices

- operational clarity
- disciplined metric use
- entity-first hierarchy
- structured metadata
- premium but restrained surface design
