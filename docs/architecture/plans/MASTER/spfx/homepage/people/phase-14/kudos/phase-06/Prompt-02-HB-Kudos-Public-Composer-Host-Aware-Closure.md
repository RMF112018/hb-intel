# Prompt-02 — HB Kudos Public Composer Host-Aware Closure

```md
Objective

Make the public HB Kudos composer fully resilient to real SharePoint runtime conditions, especially persistent host-owned controls that occupy the lower-right page canvas area.

Primary problem

The issue is **not** that SharePoint-owned runtime controls exist.

The issue is that the public Kudos composer/footer/action zone is not yet sufficiently **host-aware** to preserve clean, trustworthy action-space behavior under those conditions.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict focus on the **public HB Kudos composer** and the public-surface runtime around it.
- Keep the target product explicit but do not over-prescribe implementation.
- Design for coexistence with SharePoint host controls rather than attempting to defeat or suppress them.
- Maintain strict `@hbc/ui-kit` and homepage-doctrine compliance.

Primary tasks

1. Audit the open-composer layout under real SharePoint runtime assumptions:
   - footer placement
   - CTA spacing
   - bottom safe-area handling
   - constrained-width behavior
   - right-edge pressure
2. Implement the appropriate host-aware changes so the composer action zone remains:
   - legible
   - visually separated
   - click-confident
   - premium
3. Validate that the composer continues to feel compact and intentional, not over-padded or awkwardly displaced.
4. Tighten any footer/action-row/flyout-shell logic required for robust coexistence.
5. If a better shared primitive or ui-kit promotion is warranted for durable footer/flyout safety, make that decision carefully and govern it properly.

Required outcome

The public composer must:
- coexist cleanly with persistent lower-right SharePoint host UI
- preserve a strong primary-action zone
- remain visually premium and compact
- avoid action overlap, crowding, or low-trust footer presentation
- behave credibly in constrained page conditions

Required deliverables

- implementation changes
- brief rationale for the chosen host-aware solution
- evidence from at least one constrained-width / realistic runtime screenshot
- note whether any reusable host-aware flyout/footer behavior was moved into shared or ui-kit territory

Acceptance standard

This prompt is successful only if the public composer/footer/action zone remains production-credible under real SharePoint host coexistence conditions.
```
