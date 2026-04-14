# Plan Summary

## Objective
Resolve the backend wiring, publish lifecycle, child-record, and workflow issues identified in the current `Article Publisher` audit by executing one bounded remediation prompt per issue.

## Recommended execution sequence

### Wave 1 — Highest risk operational integrity
1. `Prompt-02-Enforce-true-in-place-republish-targeting.md`
2. `Prompt-03-Reconcile-regeneration-and-binding-lineage.md`
3. `Prompt-01-Resolve-team-member-user-field-closure.md`

Why first:
- These are the most dangerous production seams.
- They affect public page identity, duplicate/stale page risk, binding truth, and required child-record integrity.

### Wave 2 — Workflow and authoring correctness
4. `Prompt-04-Close-the-stranded-scheduled-workflow-branch.md`
5. `Prompt-05-Remove-hard-coded-monthly-template-override.md`
6. `Prompt-06-Complete-or-scope-out-the-milestone-path.md`
7. `Prompt-07-Fix-workflow-history-failure-stage-classification.md`

Why second:
- These determine whether the workflow and template paths are actually executable and trustworthy.

### Wave 3 — Schema clarity and transport correctness
8. `Prompt-08-Align-team-member-descriptor-to-tenant-schema.md`
9. `Prompt-09-Reconcile-TargetSiteUrl-policy-vs-schema.md`
10. `Prompt-10-Hide-unsupported-destinations-until-implemented.md`
11. `Prompt-11-Explicitly-hydrate-team-member-user-fields-on-read.md`

Why third:
- These tighten correctness, reduce drift, and prevent future false confidence in the data seam.

### Wave 4 — Repo-truth cleanup
12. `Prompt-12-Normalize-comment-and-policy-language-to-repo-truth.md`

Why last:
- Comment normalization should follow implementation closure so the final language reflects actual repo truth.

## Key assumptions
- The live local repo is the implementation authority.
- The tenant list schema report is the schema authority.
- The current sprint is still effectively Project Spotlight only unless later prompts intentionally expand scope.

## Non-goals
- Broad redesign of the publisher architecture
- Unrelated UI refresh work
- Multi-destination implementation beyond the bounded issues in this package

## Completion standard
This package is successful only if each prompt closes its named issue end to end and leaves comments/contracts/tests consistent with the final behavior.
