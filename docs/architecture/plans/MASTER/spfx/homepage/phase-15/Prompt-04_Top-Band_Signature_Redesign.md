# Prompt 04 — Top Band Signature Redesign

## Objective

Redesign the Personalized Welcome Header and HB Hero Banner together as a single signature opening sequence for the homepage.

## Primary Scope

- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/`
- `apps/hb-webparts/src/webparts/hbHeroBanner/`
- relevant homepage shared primitives
- any new shared top-band primitives needed in `@hbc/ui-kit`

## Hard Instructions

- Do not reread files already in current context or memory.
- The current top band is not approved.
- Do not merely make the existing hero cleaner.
- Do not merely increase font sizes.
- The result must feel memorable, premium, and unmistakably intentional.

## Required Work

1. Treat the welcome header and hero as one designed system, not two adjacent cards.
2. Redesign the welcome header so it feels like a signature personalized opening, not a normal information card.
3. Redesign the hero so it no longer feels like a large empty blue rectangle with copy.
4. Introduce stronger hierarchy, asymmetry, layering, and authored composition.
5. Improve the relationship between:
   - greeting
   - contextual support line
   - operational context
   - urgent signal, if present
   - weekly or featured headline
   - CTA hierarchy
6. Use media, background, overlay, edge treatment, and internal composition more intentionally where appropriate.
7. Ensure the top band remains SharePoint-hosted and realistic, but visually much more premium.

## Required Validation

- Provide side-by-side before/after screenshots.
- Explain specifically how the new top band creates a stronger first impression.
- Confirm focus, contrast, and reduced-motion behavior.

## Deliverables

- redesigned top-band implementation
- any new shared top-band primitives
- token/style updates as needed
- closure note describing how the top band became a signature moment
