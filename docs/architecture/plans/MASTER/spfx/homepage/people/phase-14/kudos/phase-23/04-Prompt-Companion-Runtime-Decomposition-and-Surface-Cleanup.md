# Prompt 04 — Companion Runtime Decomposition and Surface Cleanup
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

`HbKudosCompanion.tsx` still carries too much responsibility. Decompose the companion runtime into clearer workflow, filter, detail-panel, and queue-rendering seams so it is maintainable and easier to validate.

## Primary files / areas to inspect

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosRoleResolver.ts`

## Required work

1. Break `HbKudosCompanion.tsx` into smaller, named, testable units with clean responsibility boundaries.
2. Separate queue filtering, row rendering, detail-panel action routing, and dialog orchestration where that separation improves clarity.
3. Reduce oversized in-file helper clusters when they belong in dedicated local modules.
4. Keep the public/companion ownership boundary intact and explicit.
5. Preserve all governance behavior and role checks while restructuring.
6. Use this pass to clean up any obviously redundant inline rendering complexity that becomes unnecessary after decomposition.

## Non-goals / guardrails

- Do not reintroduce cross-runtime coupling.
- Do not weaken role-based governance behavior.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes
- `pnpm typecheck` passes
- companion hosted Playwright / workflow validation still passes after decomposition
- top-level companion runtime file is materially smaller and easier to reason about

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
