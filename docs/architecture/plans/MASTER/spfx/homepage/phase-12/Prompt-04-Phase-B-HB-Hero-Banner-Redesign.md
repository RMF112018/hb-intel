# Prompt 04 — Phase B HB Hero Banner Redesign

## Objective

Rebuild the HB Hero Banner into a flagship homepage hero surface with stronger editorial hierarchy, premium CTA treatment, cleaner metadata structure, and more deliberate media layering.

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
- redesign the HB Hero Banner
- strengthen hero hierarchy, content structure, CTA treatment, and surface treatment
- integrate the shared-kit top-band primitives from Prompt 02
- align visually with the redesigned welcome header without making the two surfaces feel identical

Out of scope:
- full homepage redesign outside the top band
- unrelated content webparts

## Hard Requirements

- The hero must read as a flagship homepage surface, not a standard content card.
- The headline must gain authority.
- CTA treatment must become materially stronger and more deliberate.
- Metadata and/or chip treatment must become more structured.
- Media/background layering must improve without harming legibility.
- Reduced-motion and accessibility handling must be explicit.

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

1. Inspect the current hero implementation and data model.
2. Rework the hero structure to support:
   - eyebrow/kicker if appropriate
   - stronger headline hierarchy
   - improved support copy rhythm
   - premium primary CTA
   - optional secondary CTA if justified by repo truth/content model
   - stronger metadata/chip row
3. Improve visual layering using realistic SPFx-friendly techniques.
4. Reuse shared primitives from Prompt 02 where appropriate.
5. Ensure the hero remains legible and premium across realistic viewport widths.
6. Add restrained interaction polish only where it improves quality meaningfully.

## Deliverables

You must deliver all of the following:

1. The code changes required by this prompt.
2. A concise implementation summary.
3. A file-level change list.
4. Explicit assumptions.
5. Open issues or follow-ups, if any.
6. Acceptance evidence tied directly to this prompt.

## Acceptance Criteria

- The hero no longer reads like a generic content card.
- Headline, support copy, metadata, and CTA hierarchy are materially stronger.
- The surface feels premium and branded.
- The hero complements, rather than duplicates, the welcome header.
- Accessibility, contrast, and reduced-motion handling are acceptable.

## Risk Exposure

- Heavy backgrounds or overlays can harm contrast and readability.
- CTA upgrades can become visually noisy if not disciplined.
- Hero-specific styling can become brittle if not anchored to shared structure.

## Standards / Best Practices

- Keep the hero editorial, confident, and controlled.
- Use layered composition, not gimmicks.
- Keep CTA treatment consistent and intentional.
- Test for contrast, truncation, and responsive stability.

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
