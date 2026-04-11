# Prompt 02 — Workflow, Ownership, and Operating-Model Closure

## Use

Run this after Prompt 01. This prompt closes lifecycle, role, approval, milestone, intake, and homepage-governance workflow behavior.

## Prompt

```text
You are working in the live local `hb-intel` repository with direct file-system access.

Your mission is to close the remaining operating workflow gaps in People & Culture so the application behaves like a real operating console rather than an advanced scaffold.

IMPORTANT OPERATING RULE:
Do not re-read files that are still in your active context or memory. Reuse current context first. Only open additional files when needed to progress, verify, or resolve uncertainty.

Primary objective:
Make the People & Culture companion and public runtime fully consistent across lifecycle, approval, ownership, milestone, intake, homepage, and notification flows.

Minimum focus areas:
- `apps/hb-webparts/src/webparts/peopleCultureCompanion/`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureSplitModel.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureMilestoneGenerator.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureNotificationBuilder.ts`
- `apps/hb-webparts/src/homepage/data/`
- supporting tests

Required remediation goals:

1. Role resolution and capability safety
- remove any permissive default that effectively treats an unknown user as an approver/admin equivalent
- ensure the companion resolves role/capability in a safe and explicit way
- fail closed when role resolution is absent or incomplete

2. Approval workflow closure
- ensure approve / reject / claim / reassign are based on first-class modeled state
- ensure claim/reassign are approval-work concepts only and do not leak into unrelated live/scheduled semantics
- ensure approval-trigger classification stays consistent after tier/pin/audience changes

3. Homepage governance closure
- ensure pin/unpin and tier changes update the correct approval/homepage state consistently
- eliminate stale or contradictory trigger outcomes after mutation
- ensure conflict detection and homepage state presentation are coherent

4. Milestone closure
- accepting a milestone candidate must be able to create and link a real People & Culture item or the closest durable equivalent supported by the repo
- suppressing a milestone candidate must be durable and reflected correctly
- linked item ids must be populated where expected

5. Intake closure
- promoting intake into draft must create and link a real draft item or the closest durable equivalent supported by the repo
- return-for-changes and decline must be durable and coherent
- linked item ids must be populated where expected

6. Notification coherence
- ensure notifications are derived from durable transition truth
- keep the rule that featured subjects are not auto-notified by default
- remove any dependency on weak pseudo-owner tags once first-class ownership exists

7. Public/companion consistency
- ensure the public runtime and the companion agree on lifecycle and homepage truth
- do not allow conflicting derivation rules between surfaces

Implementation requirements:
- preserve the split boundary from HB Kudos
- do not introduce a new pseudo-workflow hidden in tags or freeform strings
- keep the lifecycle/approval model explicit and deterministic
- update tests where helper behavior changes
- update stale docs/comments if needed

Required validation:
- no unsafe role default remains
- approval ownership is first-class and durable
- milestone acceptance path is closed
- intake promotion path is closed
- homepage/pin/tier mutations recompute the right derived state
- notifications still follow the intended recipient rules
- build/tests pass for changed scopes

Required output:
- summary of workflow closures completed
- files changed
- validation performed
- any residual edge case still open
```