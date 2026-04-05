# Prompt 03 — Phase B Personalized Welcome Header Redesign

## Objective

Rebuild the Personalized Welcome Header into a stronger, more personal, more premium signature welcome surface using the new shared top-band primitives where appropriate.

## Required Context

- Primary repo: `https://github.com/RMF112018/hb-intel`
- Treat **repo truth** as authoritative.
- Primary implementation targets are expected to be within:
  - `apps/hb-webparts`
  - `packages/ui-kit`
- Reconcile the exact target files and structure from the live repo before making changes.
- Do **not** re-read files that are already in your active context or memory unless needed to verify changed state.

## Scope

In scope:
- redesign the Personalized Welcome Header
- improve greeting hierarchy, support text, signal rows, and surface treatment
- differentiate the welcome surface clearly from a generic card
- integrate shared-kit top-band primitives from Prompt 02

Out of scope:
- hero banner redesign
- broader homepage restructuring below the top band

## Hard Requirements

- Emphasize time-of-day + user-first-name personalization clearly.
- Improve first-impression quality immediately.
- Introduce stronger hierarchy between greeting, support line, and any alert/focus context.
- Avoid making the welcome surface visually identical to the hero surface.
- Keep the surface realistic for SharePoint/SPFx hosting.
- Preserve semantic markup, readability, and accessibility.

## Design Intent

The top band must feel:

- premium
- confident
- elegant
- composed
- editorial in hierarchy
- operationally useful
- unmistakably branded
- materially above standard SharePoint page composition

Avoid flashy or gratuitous effects.

## Required Research / Audit Before Editing

Before editing code, perform a focused repo-truth review of the exact files you will touch and any directly related usage sites.

You must also verify:

- existing homepage composition and slot structure
- existing `@hbc/ui-kit` homepage exports and usage contracts
- current CTA, card, typography, metadata, and motion patterns
- theme/token constraints that affect top-band styling
- accessibility constraints relevant to this prompt

## Execution Instructions

1. Inspect the current welcome header implementation and its data model.
2. Rebuild the surface so it reads as a signature welcome experience rather than a standard card.
3. Improve:
   - greeting scale and emphasis
   - support/context line
   - metadata/signal row treatment
   - spacing rhythm
   - branded compositional cues
4. Use the new shared top-band primitives where appropriate, but keep truly local authored composition local.
5. Ensure the result works at realistic SharePoint canvas widths.
6. Add reduced-motion-safe interaction polish only where it improves perceived quality meaningfully.

## Deliverables

You must deliver all of the following:

1. The code changes required by this prompt.
2. A concise implementation summary.
3. A file-level change list.
4. Explicit assumptions.
5. Open issues or follow-ups, if any.
6. Acceptance evidence tied directly to this prompt.

## Acceptance Criteria

- The welcome header has materially stronger presence and hierarchy.
- The greeting reads as personal and intentional.
- Supporting/context content is better organized and easier to scan.
- The surface no longer reads like a generic enterprise card.
- Accessibility and responsive behavior remain acceptable.

## Risk Exposure

- Over-styling the welcome header could compete too heavily with the hero.
- Dense context rows can collapse poorly at narrow widths.
- Decorative treatment can reduce legibility if contrast is not managed carefully.

## Standards / Best Practices

- Keep the greeting as the dominant focal point.
- Use branded cues with discipline, not decoration.
- Favor strong hierarchy and composition over visual noise.
- Preserve semantic heading order and keyboard accessibility.

## Guardrails

- Do not widen scope beyond this prompt.
- Do not introduce brittle one-off styling when a clean shared variant is warranted.
- Do not break existing runtime realism for SPFx/SharePoint hosting.
- Do not degrade accessibility to gain visual polish.
- Prefer maintainable composition over short-term visual hacks.

## Final Output Format

Return your response in this structure:

```text
Implementation Summary
Files Changed
Key Decisions
Assumptions
Open Issues
Acceptance Evidence
```
