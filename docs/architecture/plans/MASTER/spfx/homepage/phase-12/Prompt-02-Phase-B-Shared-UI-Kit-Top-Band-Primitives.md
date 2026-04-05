# Prompt 02 — Phase B Shared `@hbc/ui-kit` Top-Band Primitives

## Objective

Implement the shared `@hbc/ui-kit` additions and refinements needed to support a premium homepage top band without overloading the generic enterprise surface model.

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
- add or refine homepage/top-band shared primitives and variants
- create the minimum shared support required by both the welcome header and hero banner
- improve shared CTA, metadata, and surface language for top-band use
- add any narrowly scoped token/utility support required for top-band quality

Out of scope:
- redesign of the welcome header itself
- redesign of the hero banner itself
- broad shared-kit modernization beyond what Phase B requires

## Hard Requirements

- Keep the shared additions narrow and intentional.
- Prefer homepage-specific primitives or variants over weakening generic enterprise primitives.
- Avoid breaking existing shared-kit consumers.
- Document any new public exports and usage constraints.
- Support accessibility, responsive behavior, and reduced motion where relevant.

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

1. Using the contract from Prompt 01, implement the shared top-band support in `packages/ui-kit`.
2. Where appropriate, create or refine:
   - top-band/welcome surface variant(s)
   - hero surface variant(s)
   - premium CTA treatment for homepage use
   - metadata/signal row primitives
   - editorial eyebrow/kicker/byline helpers if needed
   - slot-based layout helpers for top-band composition
3. Keep naming explicit and maintainable.
4. Ensure homepage-only styling stays clearly scoped to homepage/top-band use.
5. Export the new primitives/variants cleanly.
6. Add or update documentation/comments sufficient for follow-on prompts.

## Deliverables

You must deliver all of the following:

1. The code changes required by this prompt.
2. A concise implementation summary.
3. A file-level change list.
4. Explicit assumptions.
5. Open issues or follow-ups, if any.
6. Acceptance evidence tied directly to this prompt.

## Acceptance Criteria

- Shared top-band primitives/variants exist and are reusable.
- The new shared support is clearly scoped to homepage/top-band use where appropriate.
- Existing consumers are not unnecessarily disturbed.
- CTA, metadata, and surface language are materially stronger for premium top-band use.
- Reduced motion, focus, and accessibility concerns are addressed where applicable.

## Risk Exposure

- Shared changes may leak into non-homepage surfaces if variants are scoped poorly.
- Overly generic abstractions may weaken maintainability.
- Under-scoped utilities may force duplication in later prompts.
- Styling changes can create theme or contrast regressions.

## Standards / Best Practices

- Use additive variants rather than brittle overrides.
- Favor slot-based composition for premium surfaces.
- Keep token usage intentional and consistent.
- Preserve semantic structure and accessible interaction states.
- Document public exports and intended usage.

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
