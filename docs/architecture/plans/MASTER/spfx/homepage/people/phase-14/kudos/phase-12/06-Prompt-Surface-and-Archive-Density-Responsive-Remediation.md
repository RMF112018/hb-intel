# 06 — Prompt: Surface and Archive Density Responsive Remediation

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Apply final density and responsive refinements to the main HB Kudos surface and archive zone after the shared hosting and composer issues are corrected.

## Mandatory scope

Audit and remediate at minimum:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css`

## Required outcomes

- main card surface remains premium
- archive zone no longer feels unnecessarily cramped
- search field sizing and spacing feel appropriate
- local density is corrected without masking shared-hosting problems
- no regression to the Kudos hero/spotlight styling

## Required implementation direction

Review:
- archive search width and spacing
- footer/archive transition spacing
- card-to-archive rhythm
- desktop and standard zoom responsiveness
- homepage-fit density balance

## Explicit prohibition

Do not use this workstream to compensate for unresolved shared sheet defects.
Shared hosted issues must already be fixed before this workstream is considered complete.

## Deliverables

Provide:
- files changed
- density issues corrected
- proof that the main surface remains visually strong
