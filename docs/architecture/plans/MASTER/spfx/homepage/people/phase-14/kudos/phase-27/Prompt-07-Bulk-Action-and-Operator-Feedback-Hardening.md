# Prompt-07 — Bulk Action and Operator-Feedback Hardening

## Objective

Close the finding that bulk operations are present but operationally weak and not yet confidence-building enough for a premium moderation surface.

This prompt is about **bulk action quality only**.

## Active finding only

Only remediate this finding:
- bulk operations are functionally present but operationally weak

Do not blend this with unrelated workspace redesign work except where the new workspace needs to present improved bulk-action feedback.

## Repo-truth starting footprint

At minimum inspect:
- the current bulk selection / bulk approve flow in the companion runtime
- any related queue selection helpers
- any related action result / status presentation seams
- any related governance writer usage patterns
- any tests or harness seams relevant to bulk behavior

## Required work

1. Improve operator confidence in bulk execution.
2. Strengthen:
   - execution feedback,
   - partial-failure handling,
   - summary reporting,
   - retry / recovery posture where justified,
   - UI states during execution.
3. Preserve typed governance contracts and audit-writing expectations.
4. Keep the implementation understandable and testable.

## Exhaustive scrub requirement

- Remove weak or ambiguous loading states.
- Remove stale selection or completion behaviors that no longer match the hardened flow.
- Ensure there is only one authoritative bulk execution path.

## Not acceptable

- Leaving the current sequential loop with only superficial label changes
- Hiding partial failures behind a generic error string
- Improving internal logic but leaving the operator-facing status weak or ambiguous

## Closure standard

Do not declare this finding closed until you provide:
1. the full touched-file list,
2. the old vs new bulk execution behavior,
3. what failure/reporting gaps were closed,
4. why the operator experience is materially stronger now.
