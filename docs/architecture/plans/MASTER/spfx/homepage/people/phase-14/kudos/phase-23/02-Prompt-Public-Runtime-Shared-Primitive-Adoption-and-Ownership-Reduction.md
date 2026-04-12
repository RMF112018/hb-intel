# Prompt 02 — Public Runtime Shared Primitive Adoption and Ownership Reduction
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

The public HB Kudos runtime still owns too much bespoke presentation structure. Reduce local presentation ownership and push the public runtime toward a thinner consumer posture over governed shared primitives and a tighter surface-family contract.

## Primary files / areas to inspect

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurfaceFamily.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `packages/ui-kit/src/homepage.ts`

## Required work

1. Identify which public-surface presentation responsibilities are still local but should instead be expressed through a shared primitive, surface-family contract, or better-contained local seam.
2. Reduce ad hoc visual decision-making inside `PublicKudosSurface.tsx` and `ArchiveList.tsx` so those files become thinner composition layers.
3. Where a repeated or clearly reusable pattern exists, promote or reshape the primitive boundary instead of letting the public runtime continue to own it locally.
4. Keep the runtime-specific business decisions in the runtime, but move generic presentational mechanics out of high-level orchestration files.
5. Ensure the resulting public runtime is easier to read, easier to test, and more obviously aligned with the governed homepage system.
6. Document any final ownership decisions if a local presentation seam must remain local for a valid reason.

## Non-goals / guardrails

- Do not merge the public runtime into the companion runtime.
- Do not promote SharePoint-specific workflow logic into shared presentation primitives.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes
- `pnpm typecheck` passes
- public Kudos hosted Playwright specs continue to pass
- manual or automated proof shows the public surface still matches intended rendered behavior after the ownership reduction

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
