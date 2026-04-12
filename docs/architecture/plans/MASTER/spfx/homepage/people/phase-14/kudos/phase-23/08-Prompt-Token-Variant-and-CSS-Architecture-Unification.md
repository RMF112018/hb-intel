# Prompt 08 — Token, Variant, and CSS Architecture Unification
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

The Kudos styling architecture is still too fragmented across shared tokens, local alias layers, CSS variables, CSS modules, variants, and inline styles. Rationalize the system so styling ownership is clearer and drift risk is lower.

## Primary files / areas to inspect

- `packages/ui-kit/src/homepage.ts`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

## Required work

1. Map the current styling layers and identify where the same visual intent is being expressed through too many mechanisms.
2. Reduce unnecessary alias duplication and clarify which tokens are canonical, which are local semantic aliases, and which variables are just transport mechanisms.
3. Keep a small number of styling layers with clear responsibilities rather than many overlapping ones.
4. Improve naming where the current names obscure ownership or intent.
5. Ensure variants are used for real variant behavior, not as wrappers over an unclear styling sprawl.
6. After refactor, the Kudos styling system should be easier for a future engineer to follow without re-auditing the whole feature.

## Non-goals / guardrails

- Do not perform a cosmetic rename-only pass that leaves the actual fragmentation intact.
- Do not over-abstract the token system into something harder to use.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes
- `pnpm typecheck` passes
- no visual regressions in core Kudos public and companion surfaces
- style ownership is materially clearer after the refactor

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
