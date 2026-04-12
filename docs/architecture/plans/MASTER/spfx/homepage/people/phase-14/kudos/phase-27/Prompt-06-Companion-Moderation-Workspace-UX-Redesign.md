# Prompt-06 — Companion Moderation Workspace UX Redesign

## Objective

Close the finding that the HB Kudos companion is competent but still leaves major product-quality and moderation-efficiency upside on the table.

This prompt is about the **moderation workspace UX itself**:
- queue scanability,
- operator ergonomics,
- decision confidence,
- filter clarity,
- state visibility,
- detail-surface usefulness.

## Active finding only

Only remediate this finding:
- companion workflow leaves major UX upside on the table

Do not reopen the token-doctrine work or the primitive-split work except where the redesigned workspace needs the new shells/seams created by prior prompts.

## Repo-truth starting footprint

At minimum inspect the now-current companion runtime footprint after Prompt-05, including:
- queue region
- row model
- filter/control zone
- detail surface
- action-family surface
- related CSS / variant seams

## Required work

1. Reassess whether the existing card-list + flyout model is still the best production-grade answer.
2. Upgrade the workspace into a more intentional moderation product surface.
3. Improve:
   - scope clarity,
   - queue density,
   - visual parsing of workflow state,
   - ownership / flagged / scheduled / overdue visibility,
   - decision path ergonomics,
   - relationship between queue and detail context.
4. Prefer a stronger operational layout if the current model is structurally limiting quality.
5. Preserve the strong parts that already exist:
   - role-aware access handling,
   - degraded-state handling,
   - action-family grouping direction,
   - overdue / reminder concepts.

## Design posture

You are allowed to materially redesign the moderation surface.

That may include:
- split-view layout,
- denser queue anatomy,
- richer row metadata system,
- more durable filter presentation,
- stronger detail pane structure,
- less context switching,
- better action ordering.

## Exhaustive scrub requirement

- Remove stale queue markup and styling left behind by the previous model.
- Remove weak action placements that the new model replaces.
- Remove duplicated metadata presentation across row and detail surfaces where it no longer belongs.
- Verify that the redesign improves the actual workflow, not just the appearance.

## Not acceptable

- Cosmetic tightening of the current queue with the same underlying ergonomics
- Adding more chips and badges without improving scanability
- Preserving modal/flyout dependence because it is already wired

## Closure standard

Do not declare this finding closed until you provide:
1. the old workflow model vs the new one,
2. the files touched,
3. the operational pain points you removed,
4. the reasoning for the new moderation layout,
5. proof that the new workspace is faster to scan and clearer to operate.
