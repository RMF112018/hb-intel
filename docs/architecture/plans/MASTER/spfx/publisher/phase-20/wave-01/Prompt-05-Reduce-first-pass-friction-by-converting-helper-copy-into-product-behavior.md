# Prompt-05 — Reduce first-pass friction by converting helper copy into product behavior

## Objective

Tighten the first-pass authoring experience so the product asks for fewer non-essential decisions up front and relies less on explanatory copy to compensate for behavior the system can now handle more directly.

This prompt comes **after** Prompt 04 on purpose. Do not treat it as a generic copy-trim pass.
It is a product-behavior refinement pass that should land only after the safer defaults and assistance behavior exist.

## Why this matters

Repo truth shows that the shell is already strong. The remaining Wave 01 friction is subtler: some of the first-pass flow still depends on careful narration instead of more self-evident structure and behavior.

That is the problem to solve here.

## Live repo authorities to inspect first

- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/article-publisher.module.css`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/MetadataPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/HeroPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/authoringPanels/StoryPanel.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useSaveStateTrust.ts`
- Prompt 04 output
- the SPFx governing doctrine for host-aware, accessible, structurally productized surfaces

## Current deficiency

The shell no longer needs a structural rescue. But some first-pass guidance still depends on copy that is only there because the product is not yet carrying enough of the ordinary workflow burden itself.

This prompt is about reducing that residue without disturbing the shell strengths already won.

## Required implementation outcome

1. Re-evaluate the first-pass path in practical author order:
   - project
   - headline
   - summary excerpt
   - story body / subhead
   - only then the secondary/advanced editorial controls
2. Remove or demote friction that still exists only because the system previously lacked stronger defaults/assistance.
3. Trim or demote helper narration where the UI state, ordering, placeholders, or defaults now communicate the same point more directly.
4. Preserve the current shell, rails, readiness truth, and trust model unless a very bounded change clearly improves first-pass flow without undermining them.
5. Keep accessibility, keyboard navigation, focus order, and readiness truth intact.

## What “reduced friction” should mean here

Good outcomes include things like:

- fewer advanced decisions visually competing with the first-pass path
- clearer primary-task sequencing without explanatory burden
- less repeated copy explaining defaults the system already performs
- stronger use of disclosure only where it genuinely helps
- a more obvious “start here, then continue” flow that does not require teaching the author how the product thinks

This does **not** mean superficial trimming that removes useful truth.

## Implementation posture

- preserve the current three-region shell
- preserve readiness and save-trust logic
- avoid broad layout churn unless a very specific bounded change improves first-pass flow
- favor product behavior and structure over prose where the behavior is now trustworthy
- prefer small precise interaction/layout improvements over decorative rewriting

## Closure proof requirements

The final implementation must prove all of the following:

- the first-pass path now surfaces fewer non-essential decisions up front
- helper narration was reduced only where product behavior now carries the meaning
- no regression occurred in readiness, save-state truth, preview trust, or accessibility
- any changed disclosure or ordering logic is explicitly justified
- the result is measurably lower-friction without becoming vague or under-explained where truth still matters

## Prohibited outcomes

- no shell redesign disguised as friction cleanup
- no weakening of trust/readiness signals
- no removal of helper text that still carries necessary product truth
- no generic style churn with no workflow benefit

## Final instruction to the code agent

Use this prompt to make the first-pass path feel more inevitable and less coached.
Do not attack the shell broadly.
Tighten the workflow where repo truth shows the product can now carry more of the burden itself.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
