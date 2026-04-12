# Prompt 05 — Governance Primitive Layer Hardening
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

The shared local governance primitive layer is only partially abstracted and still relies too heavily on style-object composition. Harden this layer so it becomes a cleaner, more reusable local system for Kudos governance surfaces.

## Primary files / areas to inspect

- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

## Required work

1. Audit `KudosGovernancePrimitives.tsx` and identify every primitive that still depends on large or repeated inline style objects for stable visual behavior.
2. Move stable visual grammar into classes, variants, or a tighter primitive seam instead of leaving it inside repeated style literals.
3. Preserve the local shared-layer placement unless there is a clear and justified reason to promote something into `@hbc/ui-kit`.
4. Make the primitive layer easier to reuse across future governance experiences without carrying forward inline-style debt.
5. Keep the consumer API ergonomic so companion code gets simpler rather than more complicated.
6. Add or refine minimal documentation comments where they materially clarify ownership and promotion boundaries.

## Non-goals / guardrails

- Do not promote governance-domain-specific primitives into the shared UI-kit package unless the reuse case is truly justified now.
- Do not turn the primitive layer into an over-engineered abstraction library.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes
- `pnpm typecheck` passes
- companion runtime still renders correctly after primitive hardening
- the primitive layer contains materially less inline-style composition than before

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
