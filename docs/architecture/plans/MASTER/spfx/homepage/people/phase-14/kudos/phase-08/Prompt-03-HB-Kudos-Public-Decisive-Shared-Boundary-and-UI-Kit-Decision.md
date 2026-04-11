# Prompt-03 — HB Kudos Public Decisive Shared Boundary and UI-Kit Decision

```md
Objective

Force a hard architectural decision about whether the current shared/UI-kit path is actually fit for the public HB Kudos product.

Primary problem

Multiple prompt cycles have preserved a path that may still be structurally wrong for this specific public surface.

This prompt requires a decisive boundary judgment.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Focus on the public Kudos surface and its directly supporting surface dependencies.
- Maintain strict `@hbc/ui-kit` governance.
- Do not preserve an abstraction that continues to underdeliver in the rendered product.
- Keep the solution governed, but do not be timid.

Hard directives

1. Decide whether the current shared/UI-kit/public boundary is fit for purpose.
2. If it is not, change it decisively.
3. Do not leave the current structure in place just because it is conceptually elegant.
4. The rendered public outcome is the priority; the final architecture must support that outcome.
5. Make the smallest justified decisive change — but make a real change where needed.

Possible acceptable outcomes

- Keep current boundary only if it now clearly produces a strong rendered result.
- Split the current surface path.
- Fork or specialize the shared surface family for public Kudos.
- Move logic into UI-kit if durable reuse and doctrine justify it.
- Move logic back out of UI-kit/shared territory if over-generalization caused the failure.

Required outcome

After this prompt:
- the agent has made a real architectural decision
- the local/shared/ui-kit placement is more defensible
- the public UI is no longer being constrained by a weak abstraction

Required deliverables

- implementation changes
- explicit architectural decision note
- concise explanation of why the final boundary is more correct
- note of any deleted, replaced, split, or newly introduced surface path

Acceptance standard

This prompt is successful only if the agent makes a decisive and defensible shared-boundary choice that supports a visibly stronger public Kudos outcome.
```
