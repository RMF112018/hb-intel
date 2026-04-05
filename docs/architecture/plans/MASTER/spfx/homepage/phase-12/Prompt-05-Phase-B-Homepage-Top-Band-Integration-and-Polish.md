# Prompt 05 — Phase B Homepage Top-Band Integration and Polish

## Objective

Integrate the redesigned Personalized Welcome Header and HB Hero Banner into a coherent top-band composition, then complete spacing, hierarchy, responsive, motion, and polish work.

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
- top-band composition integration
- spacing and hierarchy tuning between welcome and hero
- responsive behavior across realistic widths
- motion/reduced-motion refinement
- final polish for the top-band experience

Out of scope:
- redesign of lower homepage zones
- unrelated shared-kit work beyond top-band needs

## Hard Requirements

- The welcome surface and hero surface must feel like part of one top-band language.
- They must still remain clearly differentiated in role and visual identity.
- Composition spacing and rhythm must be intentional.
- Responsive behavior must hold up in realistic SharePoint/SPFx hosting.
- Motion must remain restrained and reduced-motion-safe.

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

1. Integrate the redesigned top-band surfaces into the homepage composition.
2. Tune macro spacing, alignment, and hierarchy between the two surfaces.
3. Validate at multiple realistic widths and adjust:
   - spacing
   - stacking behavior
   - alignment
   - type scale where needed
   - CTA wrapping/placement
4. Ensure hover/focus/active states feel coherent across the top band.
5. Ensure reduced-motion preferences are respected.
6. Remove any leftover generic-card visual cues that weaken the premium top-band read.

## Deliverables

You must deliver all of the following:

1. The code changes required by this prompt.
2. A concise implementation summary.
3. A file-level change list.
4. Explicit assumptions.
5. Open issues or follow-ups, if any.
6. Acceptance evidence tied directly to this prompt.

## Acceptance Criteria

- The top band reads as one coherent authored experience.
- Welcome and hero are visually related but not redundant.
- Spacing, rhythm, and emphasis are materially better than before.
- Responsive behavior is stable.
- Motion and interaction polish are restrained and consistent.

## Risk Exposure

- Two individually strong surfaces can still clash when composed together.
- Responsive adjustments may require small refinements to earlier prompts.
- Interaction states can become inconsistent if tuned locally and not reconciled.

## Standards / Best Practices

- Optimize for composition, not isolated component screenshots.
- Preserve clear role separation between welcome and hero.
- Use rhythm, scale, and spacing to create hierarchy.
- Keep motion subtle and purposeful.

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
