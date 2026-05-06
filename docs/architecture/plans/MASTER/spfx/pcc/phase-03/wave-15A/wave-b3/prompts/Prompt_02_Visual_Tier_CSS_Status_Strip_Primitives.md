# Prompt 02 — Visual Tier CSS and State / Deferred Treatments


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

Implement primitive-level CSS for tier and region visual hierarchy, and remove footprint-based dashed styling from `full` cards.

## Context


Use `03_VISUAL_HIERARCHY_AND_TOKEN_SPEC.md`. Do not migrate surfaces in this prompt.


## Required Work


1. Update `PccDashboardCard.module.css`.
2. Add selectors for card tiers.
3. Add selectors for card regions.
4. Make Tier 1 command cards visibly stronger than normal cards.
5. Make Tier 2 operational cards stronger than Tier 3 reference cards.
6. Make state/deferred cards visually honest and subordinate.
7. Remove the existing global dashed styling for `data-pcc-footprint='full'`.
8. Preserve compact density behavior.
9. Do not introduce hard-coded colors where PCC/HBC tokens exist.
10. Update primitive visual tests only if current tests need marker assertions.


## Validation


Run:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccDashboardCard
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm exec prettier --check apps/project-control-center/src/layout/PccDashboardCard.module.css
git diff --check
md5 pnpm-lock.yaml
```


## Closeout Response Required


Report:
- CSS selectors added
- full-footprint dashed styling removal confirmation
- test output
- lockfile hash
