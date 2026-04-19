# Prompt 05 — Prevent Duplicate Hero During Flagship Hosted Cutover

## Objective

Close the real hosted rollout risk that the old standalone hero remains authored on the flagship page while the hero is also embedded into `HbHomepage`. The end state must be one flagship hero, not two competing hero surfaces.

## Why this matters

This is not hypothetical. The repo’s current flagship model explicitly expects a separate standalone hero webpart. A runtime cutover alone can therefore create duplicate rendering during deployment or authoring transition.

## Exact repo seams to inspect

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- any hosted verification or package/runbook doc tied to homepage deployment
- any page-authoring assumptions or comments that still imply a separate flagship hero webpart

## Current implementation problem

The current and future flagship models overlap during rollout. Without a deliberate cutover posture, the hosted page can end up with both:
- the old standalone hero webpart,
- and the new wrapper-owned hero region inside `HbHomepage`.

## Required implementation outcome

Implement a transition-safe cutover path that makes the single-hero requirement explicit and verifiable.

That must include:
- a clear single-hero flagship runtime story in code,
- hosted verification guidance that the old standalone hero is removed from the flagship page,
- and, if reasonably implementable, a runtime diagnostic or guard that detects duplicate flagship hero conditions during transition rather than silently allowing them.

## Specific constraints / guardrails

- Do **not** break non-flagship standalone hero reuse.
- Do **not** hide duplicate-hero risk in comments only.
- Do **not** assume authoring cleanup will always happen correctly without proof.
- Keep any runtime detection narrowly scoped to flagship conditions.

## Proof of closure

Closure requires all of the following:

1. The flagship homepage has a clear single-hero composition rule.
2. Hosted validation instructions explicitly require removal of the old standalone hero from the flagship page.
3. Duplicate-hero risk is either prevented or clearly and inspectably detected during transition.
4. Non-flagship standalone hero reuse still works.
5. Closure proof includes evidence that the hosted flagship page renders one hero path only.

## Explicit prohibition on unrelated changes

Do not:
- remove reusable standalone hero support for non-flagship contexts,
- widen this into unrelated authoring-surface work,
- or invent a heavy new page-governance system when a focused cutover guard and verification path is enough.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:

1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria above.
