# Prompt 04 — Rebuild Hero Responsive Modes and Crowding Controls

## Objective

Rebuild the flagship homepage hero so it de-escalates deliberately across standard laptop, tablet, phone, and short-height states instead of remaining too desktop-biased for too long.

## Why this matters

The user-visible quality failure is not just that the hero is large. The real defect is that the hero remains in the wrong composition mode too long: large text zone, strong left/right split, generous padding, and logo/text tension all persist past the point where they feel premium and start to feel crowded.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- any hero layout-mode helper introduced from Prompt 03
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- `apps/hb-webparts/src/homepage/entryStack/entryStackContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css` where wrapper spacing alignment is required

## Current implementation problem

The current hero still behaves like a desktop-first masthead with later shrink-down adjustments. That is not strong enough for the required state matrix, especially where real usable width is lower than raw viewport width or where height is constrained.

## Required implementation outcome

Rebuild the hero around explicit layout modes tied to shared entry-state truth. At minimum, provide clear posture changes for:
- premium wide desktop,
- compressed laptop,
- guided single-column portrait,
- compact short-height.

Address all of the following:
- earlier padding reduction,
- earlier typography de-escalation,
- earlier logo budget reduction,
- reduced text/logo competition,
- reduced first-screen dominance,
- no ordinary horizontal overflow,
- and preservation of a premium branded reading rather than a crude collapse.

## Specific constraints / guardrails

- Do **not** reduce this to generic “make things smaller.”
- Do **not** add visual noise to compensate for smaller states.
- Do **not** break the hero’s premium brand posture on wide states.
- Do **not** violate entry-stack height budgets.
- Use container-aware behavior where it improves correctness; do not rely only on viewport media queries.

## Proof of closure

Closure requires all of the following:

1. Hero posture changes are mode-based, not just value-based.
2. The hero no longer feels overbearing on standard-laptop and constrained portrait/mobile states.
3. Logo and text do not crowd each other.
4. Short-height behavior is explicitly compact.
5. No ordinary horizontal overflow occurs.
6. The resulting hero still reads as a premium branded flagship surface on wide states.

## Explicit prohibition on unrelated changes

Do not:
- redesign unrelated article-mode presentation,
- widen this into a homepage-wide visual overhaul,
- or change unrelated shell lanes beyond what is required for spacing/budget alignment.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:

1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria above.
