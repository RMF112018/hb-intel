# Prompt-01 — HB Kudos Public Featured Surface Restoration

```md
Objective

Restore the public-facing HB Kudos featured recognition / hero spotlight so it renders as a complete, premium, content-carrying public recognition surface in SharePoint.

Primary problem

The current post-remediation public surface appears materially degraded in its featured state. The spotlight/hero region is not carrying the recognition content with credible product integrity.

This prompt is for resolving that problem first.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict focus on the **public HB Kudos** surface only.
- Maintain strict compliance with `@hbc/ui-kit`, `docs/reference/ui-kit/`, homepage doctrine, and package-boundary discipline.
- Do not paper over the issue with placeholder content or cosmetic masking.
- Do not force local styling solutions when the real issue belongs in shared surface logic or a governed UI-kit surface contract.
- Keep the target product explicit, but keep implementation direction loose.

Primary tasks

1. Audit the current featured recognition rendering path end-to-end:
   - public Kudos read/model adapter
   - featured/spotlight view-model shaping
   - shared surface family consumption
   - any CSS/layout/slot assumptions that may now be broken
2. Identify why the featured public recognition is rendering as a partially empty or visually collapsed shell.
3. Implement the appropriate correction(s) to restore:
   - recognition content visibility
   - compositional integrity
   - premium hierarchy
   - public-surface credibility
4. Tighten any local/shared/UI-kit boundary issues that are directly responsible for the failure.
5. Preserve or improve doctrine compliance while resolving the defect.

Required outcome

The rendered public featured recognition must:
- visibly carry the recognition content
- feel intentional and premium
- read as the dominant public recognition moment
- coexist cleanly with the archive below it
- avoid regressions into stacked-card filler or broken-shell presentation

Required deliverables

- the implementation changes
- a brief root-cause explanation
- a closure note stating whether the fix belonged in:
  - local public webpart logic
  - shared public surface logic
  - a ui-kit surface/primitives contract
- updated evidence that the featured public recognition now renders correctly

Acceptance standard

This prompt is successful only if the public featured recognition area is restored as a credible, complete, premium surface rather than a visually broken or partially populated shell.
```
