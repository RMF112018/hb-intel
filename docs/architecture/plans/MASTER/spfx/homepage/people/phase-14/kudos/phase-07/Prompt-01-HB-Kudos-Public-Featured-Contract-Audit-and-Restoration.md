# Prompt-01 — HB Kudos Public Featured Contract Audit and Restoration

```md
Objective

Audit and restore the contract path that drives the public-facing HB Kudos featured recognition / spotlight state.

Primary problem

The public featured recognition area is still rendering as a partially empty or visually broken shell.

This prompt is for identifying and correcting the exact contract-level cause of that failure.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict focus on the **public HB Kudos featured recognition path**.
- Maintain strict compliance with `@hbc/ui-kit`, `docs/reference/ui-kit/`, homepage doctrine, and package-boundary discipline.
- Do not mask the failure with placeholder padding, fake content, or decorative workarounds.
- Keep the target product explicit, but keep implementation direction loose.

Primary tasks

1. Audit the current featured-recognition contract end-to-end:
   - public Kudos list/read data
   - public adapter shaping
   - featured item model projection
   - shared featured-surface consumption
2. Identify the specific cause of the visible featured-shell failure.
3. Implement the appropriate correction(s) so the featured recognition once again:
   - carries real content
   - renders with compositional integrity
   - reads as the dominant public recognition moment
4. Keep or adjust the local/shared/ui-kit boundary only as needed to resolve the real cause.
5. Do not stop at “data exists” — verify that the rendered product is actually restored.

Required outcome

The public featured recognition must:
- visibly render meaningful recognition content
- no longer appear as a partially empty shell
- remain governed and explainable
- avoid regressions into fragile or implicit contract assumptions

Required deliverables

- implementation changes
- concise root-cause explanation
- note of whether the correction belonged primarily in:
  - local public webpart logic
  - homepage shared layer
  - `@hbc/ui-kit/homepage`
- updated evidence showing the featured public recognition rendered correctly

Acceptance standard

This prompt is successful only if the public featured recognition state is genuinely restored as a complete, content-carrying surface rather than a visually broken spotlight shell.
```
