# 02 — Prompt: Shared `View All` CTA Contract Correction

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct the shared public-surface CTA contract so the public HB Kudos webpart can open a real slide-out browse/feed panel from `View All` instead of being constrained to href-only navigation.

## Mandatory scope

Audit and remediate at minimum:

- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- any related shared CTA usage inside that surface
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css` only if the CTA treatment requires a small adjustment

## Required outcomes

The shared surface must support a clean, ownership-correct `View All` interaction model that can:

- still support href-based consumers where appropriate
- support callback-driven `View All` opening for HB Kudos
- avoid breaking existing public-surface consumers
- preserve premium CTA styling and interaction quality

## Required implementation direction

1. Audit the current `viewAllHref` contract.
2. Determine the minimal durable contract update needed for callback support.
3. Implement the updated shared CTA seam.
4. Preserve backward compatibility where possible.
5. Ensure the `View All` CTA can now open a slide-out feed experience from the HB Kudos consumer.

## Explicit prohibitions

Do not:
- hardcode HB Kudos logic directly inside the shared surface
- break existing href-based behavior unnecessarily
- add a one-off local button outside the shared surface and call the issue fixed

## Deliverables

Return:
- files changed
- updated shared CTA contract
- backward compatibility note
- explanation of how HB Kudos now consumes the new seam
