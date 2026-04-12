# Prompt 03 — Public Runtime Inline and Injected Style Elimination
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

The public HB Kudos runtime still contains inline styling and at least one runtime-injected `<style>` block. Remove this styling debt and move the public runtime onto a cleaner, governed styling architecture.

## Primary files / areas to inspect

- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`

## Required work

1. Remove the runtime-injected `<style>` block from `KudosFeedBody.tsx` and replace it with a stable class-based or variant-based styling seam.
2. Eliminate avoidable inline style objects in the public runtime wherever the styling belongs in modules, variants, or another governed seam.
3. Preserve all current visual states and interactions while removing this styling debt.
4. Keep the code path easy to reason about; do not replace a small inline style with a worse abstraction unless it is genuinely governed and reusable.
5. After the cleanup, inspect the public runtime for any remaining obvious inline / injected styling hotspots and close them in the same pass if they fall within the same finding.

## Non-goals / guardrails

- Do not make the styling system more fragmented than it is now.
- Do not regress rendered behavior while removing style debt.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes
- `pnpm typecheck` passes
- targeted Playwright coverage for public feed, reader, archive, and composer interactions passes
- no runtime-injected `<style>` blocks remain in the public Kudos runtime unless an exceptional and documented reason exists

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
