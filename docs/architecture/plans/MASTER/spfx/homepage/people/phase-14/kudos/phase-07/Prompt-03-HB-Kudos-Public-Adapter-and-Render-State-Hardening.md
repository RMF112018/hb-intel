# Prompt-03 — HB Kudos Public Adapter and Render-State Hardening

```md
Objective

Harden the public HB Kudos adapter logic and render-state behavior so sparse, partial, or legacy-compatible content cannot produce a visibly broken featured state.

Primary problem

Even after contract-level fixes, the public product may still be vulnerable to bad runtime outcomes if the adapter or render-state logic permits structurally incomplete featured content to flow into a premium public surface.

This prompt is for closing that vulnerability.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict focus on public adapter shaping and render-state behavior.
- Maintain strict `@hbc/ui-kit` and doctrine compliance.
- Do not hide legitimate data problems, but do ensure the public surface fails gracefully and credibly.
- Keep the target product explicit but avoid over-prescribing implementation.

Primary tasks

1. Audit the public adapter logic for featured and recent public recognition items.
2. Identify cases where incomplete or sparse data can still generate an invalid or visually broken featured state.
3. Implement appropriate hardening so the public surface:
   - renders the featured state when it is truly valid
   - degrades gracefully when it is not
   - avoids producing a large broken shell
4. Review fallback treatment and ensure it is visually credible and doctrine-aligned.
5. Keep the resulting behavior explainable and maintainable.

Required outcome

The public Kudos surface should:
- be more resilient to sparse or imperfect content
- avoid broken featured-shell outcomes
- present explicit and credible fallback behavior where necessary
- remain premium and governed

Required deliverables

- implementation changes
- concise explanation of the hardening choices made
- note of any fallback behavior introduced or refined
- rendered evidence for the restored public state and, if relevant, the safer fallback state

Acceptance standard

This prompt is successful only if the public HB Kudos render-state behavior can no longer easily degrade into the previously observed broken featured shell.
```
