# Prompt-06 — HB Kudos Public UI-Kit Promotion and Cleanup

```md
Objective

Conduct a focused pass on **shared-surface discipline, ui-kit/homepage promotion, local-vs-shared boundary cleanup, and reduction of bespoke premium styling drift** for the public HB Kudos UI work completed so far.

Primary Intent

The target is not just a good-looking public HB Kudos surface. The target is a good-looking surface that is implemented through the correct governance structure.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict compliance with `@hbc/ui-kit` and all applicable homepage doctrine.
- Be thoughtful, not mechanical, about promotion.
- Promote only what has durable reuse value or clearly belongs in the shared premium homepage system.
- Leave truly local feature-specific composition local.

Focus

Review and improve:
- public HB Kudos UI pieces that are still too bespoke
- shared patterns that should now live in `@hbc/ui-kit/homepage` or a better shared layer
- local components that should remain local
- hardcoded style drift that should be replaced with governed tokens/primitives/variants
- package boundary and entry-point discipline

Target Outcomes

The implementation should move toward:
- stronger governance compliance
- less accidental local premium styling
- better shared-surface reuse where it is genuinely warranted
- cleaner separation between ui-kit/homepage primitives, homepage-shared composition, and public HB Kudos local feature logic

Implementation Freedom

Choose the best path.

You may:
- move components
- split components
- create new homepage-safe primitives or surface variants
- tighten token usage
- reduce inline or bespoke styling
- keep some composition local when that is the correct decision

Do not assume that promotion is always the right answer.

Do Not

- leave durable repeatable patterns stranded in local feature code without justification
- over-promote highly specific feature logic into ui-kit
- preserve governance drift just because the rendered UI looks better

Deliverables

1. Implement the shared-surface/ui-kit cleanup.
2. Document what was promoted, what remained local, and why.
3. Provide a concise summary of what changed.
4. State which remediation-matrix rows were advanced or closed.
5. Call out any remaining governance debt explicitly.

Acceptance Standard

This prompt is successful only if the public HB Kudos UI is not just visually improved but also materially better aligned with shared-surface and ui-kit governance expectations.
```
