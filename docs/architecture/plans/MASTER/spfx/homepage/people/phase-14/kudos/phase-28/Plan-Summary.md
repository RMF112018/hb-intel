# Plan Summary

## Objective
Raise HB Kudos to a state that is genuinely doctrine-aligned, premium, maintainable, and production-ready without throwing away the good architecture already present.

## What must be corrected first
1. **Doctrine/token closure**
   - The current code claims stronger closure than it actually has.
   - Raw literals remain in ordinary webpart CSS source.
   - This must be corrected before any “premium” claims are credible.

2. **Companion workspace quality**
   - The companion is the main underperforming surface.
   - It needs structural improvement, not decorative improvement.

3. **Moderation efficiency**
   - Too many common actions require detail-panel dependency.
   - Queue ergonomics must improve.

4. **Accessibility semantics**
   - Nested dialog semantics must be removed.
   - The strong shared flyout shell should remain.

5. **Packaging / validation discipline**
   - Manifest/full-bleed intent needs cleanup.
   - Static doctrine-drift guardrails need to be added.

## Sequencing logic
- Prompt 01 closes benchmark/doctrine truthfulness first.
- Prompts 02–05 improve the companion in descending order of product impact.
- Prompt 06 cleans up manifest intent.
- Prompt 07 prevents regression.
- Prompt 08 validates closure end to end.

## What should remain intact
- Thin orchestrator structure in `HbKudos.tsx` and `HbKudosCompanion.tsx`
- Shared flyout shell mechanics in `HbcKudosComposerFlyout`
- Import discipline via `@hbc/ui-kit/homepage`
- Existing harness / hosted Playwright investment
- Public surface architecture unless a prompt explicitly requires a small refinement
