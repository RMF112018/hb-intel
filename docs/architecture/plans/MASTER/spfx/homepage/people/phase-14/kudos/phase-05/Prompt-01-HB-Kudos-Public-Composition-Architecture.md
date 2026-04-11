# Prompt-01 — HB Kudos Public Composition Architecture

```md
Objective

Conduct a focused implementation pass on the **public-facing HB Kudos webpart UI only** with the goal of improving the top-level composition architecture so the rendered SharePoint homepage surface reads as a **single authored recognition product surface**, not as a stack of separate mini-modules.

Primary Intent

The public HB Kudos experience should feel like:
- a premium presentation-lane recognition feature
- a coherent homepage surface with stronger visual authority
- a warm, modern, clearly authored experience
- a host-aware SharePoint webpart that uses the page canvas confidently

It should not feel like:
- a decorated card stack
- a sequence of polite boxes
- a surface that only reads well when browser zoom is reduced

Critical Constraints

- This is a **UI-only** pass for the public HB Kudos surface.
- Do not treat backend/workflow/data changes as the main task.
- Use the live repo `main` branch as authority.
- Do not begin by re-reading files that are already in your active context or memory. First use what is already loaded; only inspect additional files where needed to close uncertainty.
- Maintain strict compliance with the current `@hbc/ui-kit` and `docs/reference/ui-kit/` governance.
- Update, create, or move UI into `@hbc/ui-kit` as necessary and appropriate, but do not force promotion where the pattern is still truly local.
- Do not import from prohibited homepage entry points.
- Do not solve this with cosmetic-only changes. Structural improvement is expected.

Focus

Focus on the rendered public HB Kudos composition including:
- overall surface architecture
- top-band / masthead authority
- relationship between the recognition masthead and featured recognition
- reduction of unnecessary container nesting
- stronger hierarchy and scan order
- better balance between warmth, authority, and efficiency

What to Improve

You should determine the most appropriate implementation path, but the rendered result must move materially toward these outcomes:

- the surface reads more like one cohesive recognition feature
- the top band has stronger authority and better spatial presence
- featured recognition is better integrated into the overall composition
- the module consumes height more efficiently
- the visual rhythm is less fragmented
- the overall result is more confident at ordinary homepage viewing conditions

Governance Requirements

The implementation must remain compliant with:
- homepage use of `@hbc/ui-kit/homepage` as the primary UI entry point
- presentation-lane expectations for premium authored surfaces
- SPFx homepage overlay guidance for stronger hierarchy, non-timid composition, and host-aware polish
- shared-surface promotion discipline

Implementation Freedom

Be explicit in the target outcome, but do not over-constrain yourself to one speculative layout too early.

You may:
- restructure the public HB Kudos composition
- change hierarchy and spacing
- change how the featured recognition is integrated with the masthead
- reduce or remove unnecessary wrappers or labels
- create or promote shared homepage-safe primitives if that is the cleanest path

You should not:
- leave the overall composition substantially unchanged and only restyle it
- accept a timid card-grid outcome
- introduce shell-like SharePoint-hostile chrome

Deliverables

1. Implement the composition upgrade.
2. Update any supporting shared UI layers if warranted.
3. Provide a concise change summary.
4. State which rows from `HB-Kudos-Public-UI-Remediation-Matrix.md` were advanced or closed.
5. Call out any follow-on items that should be handled in later prompts rather than here.

Acceptance Standard

This prompt is successful only if the public HB Kudos surface now reads materially more like a single authored recognition feature and materially less like a vertically stacked set of cards.
```
