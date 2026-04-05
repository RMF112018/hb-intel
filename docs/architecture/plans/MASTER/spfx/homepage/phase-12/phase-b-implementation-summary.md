# Phase B Implementation Summary — Top-Band Redesign

## Objective

Implement the **Phase B** premiumization work package for the homepage top band by redesigning:

- **Personalized Welcome Header**
- **HB Hero Banner**

and by introducing the minimum necessary shared support in **`@hbc/ui-kit`** so both surfaces can read as a cohesive, premium, branded top-band experience.

This package is derived from the deeper homepage audit objective and scope defined in the attached prompt. fileciteturn0file0

## Scope Boundary

Phase B includes:

- top-band shared primitives and variants in `packages/ui-kit`
- welcome-surface redesign
- hero-surface redesign
- top-band composition integration
- accessibility, motion, responsive, and documentation hardening for the top band

Phase B does **not** include:

- redesign of the full homepage
- redesign of lower-zone homepage webparts
- broad design-system modernization outside the top-band need
- SharePoint shell takeover or unsupported runtime assumptions

## Recommended Prompt Sequence

### Prompt 01
Establish repo truth, confirm exact target files, define the top-band contract, and produce the implementation plan.

### Prompt 02
Create or refine the shared `@hbc/ui-kit` top-band primitives, surface variants, CTA patterns, metadata rows, and styling contracts required by the redesigned welcome and hero surfaces.

### Prompt 03
Implement the Personalized Welcome Header redesign on top of the new shared primitives.

### Prompt 04
Implement the HB Hero Banner redesign on top of the new shared primitives.

### Prompt 05
Integrate both surfaces into the homepage composition and complete spacing, hierarchy, motion, responsiveness, and polish work.

### Prompt 06
Perform validation, hardening, documentation, and acceptance capture.

## Desired End-State Characteristics

The finished top band should feel:

- premium
- confident
- elegant
- composed
- editorial in hierarchy
- operationally useful
- unmistakably branded
- materially more polished than standard SharePoint composition

## Key Design Requirements

### Welcome Header
- stronger greeting hierarchy
- clear emphasis on time-of-day and user-first-name personalization
- more deliberate supporting/context line
- stronger signal row for alert, focus, or daily context
- less reliance on a generic card posture

### Hero Banner
- more authoritative headline structure
- stronger supporting copy rhythm
- improved metadata and/or chip treatment
- premium primary CTA treatment
- optional secondary CTA treatment where appropriate
- more deliberate media/background layering

### Shared Language Across Both
- common top-band visual grammar without making the two surfaces feel identical
- clear hierarchy between welcome and hero
- shared token/variant approach where practical
- responsive behavior that survives realistic SharePoint hosting widths

## Risk Exposure

### High
- allowing `@hbc/ui-kit` changes to leak into unrelated app surfaces
- introducing complex visual layers that hurt contrast or readability
- building hero-specific styling that cannot generalize to the welcome surface

### Medium
- excessive spacing or oversized typography at narrower canvas widths
- animation or parallax behavior that conflicts with reduced-motion preferences
- duplicated styling logic across homepage and shared-kit layers

### Low
- minor wording or content-density tuning after implementation

## Standards / Best Practices

- isolate homepage-specific surface variants rather than overloading generic enterprise cards
- preserve semantic headings and landmarks
- keep new shared primitives narrow, intentional, and documented
- prefer composable slots over brittle monolith components
- explicitly support hover, focus-visible, active, disabled, and reduced-motion states where applicable
- test the top band inside realistic SharePoint/SPFx hosting conditions
- keep the implementation readable for future follow-on phases

## Acceptance Gates

Phase B should be considered complete only when all of the following are true:

1. The welcome header is visibly stronger, more distinctive, and more personal.
2. The hero banner reads as a flagship homepage surface rather than a standard content card.
3. The two surfaces feel related but clearly differentiated.
4. Shared-kit changes are scoped, documented, and reusable.
5. The integrated top band holds up at multiple widths.
6. Keyboard access, contrast, focus, and reduced-motion behavior are acceptable.
7. Documentation captures the new top-band contract for future phases.

## Handoff Note

After Phase B is complete, the next logical phase is the premiumization of the utility/discovery band below the top band, while preserving the new top-band visual language as the homepage’s anchor.
