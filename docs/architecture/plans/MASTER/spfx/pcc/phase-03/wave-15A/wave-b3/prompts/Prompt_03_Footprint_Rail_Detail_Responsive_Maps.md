# Prompt 03 — Footprint Expansion for Rail and Detail


# Operating Rules for the Local Code Agent

- Work only in the current repository.
- Do not re-read files that are still within your current context or memory. Use targeted reads only when verifying drift.
- Do not install packages.
- Do not change `pnpm-lock.yaml`.
- Do not modify backend/functions.
- Do not enable live integrations, mutations, saves, launches, approvals, repairs, sync, access changes, or HBI execution.
- Preserve read-only / preview-only / inert behavior.
- Preserve bento direct-child invariants.
- Preserve existing `data-pcc-*` markers unless the prompt explicitly instructs a replacement and test update.
- Run the required validation commands listed in this prompt.
- Close with commit-ready summary, files changed, validation output, and residual risks.


## Objective

Add `rail` and `detail` footprints across the responsive footprint system.

## Context


Use `05_FOOTPRINT_RAIL_DETAIL_SPAN_SPEC.md`. Do not migrate surfaces in this prompt except tests may render sample cards.


## Required Work


1. Update `apps/project-control-center/src/layout/footprints.ts`.
2. Add `rail` and `detail` to `PCC_CARD_FOOTPRINTS`.
3. Update:
   - `FOOTPRINT_COLUMN_SPANS`
   - `FOOTPRINT_MIN_COLUMN_SPANS`
   - `FOOTPRINT_MIN_INLINE_SIZE_PX`
4. Add/update `footprints.test.ts` to enforce exhaustive maps and span sanity.
5. Ensure `resolveFootprintColumnSpan` needs no special-case logic.
6. Do not change responsive mode thresholds.


## Validation


Run:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- footprints
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm exec prettier --check apps/project-control-center/src/layout/footprints.ts apps/project-control-center/src/layout/footprints.test.ts
git diff --check
md5 pnpm-lock.yaml
```


## Closeout Response Required


Report:
- footprint values added
- span map confirmation
- min inline map confirmation
- test output
- lockfile hash
