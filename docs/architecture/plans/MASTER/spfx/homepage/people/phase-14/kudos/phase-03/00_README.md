# HB Kudos Remediation Prompt Package

## Objective
This package converts the repo-truth HB Kudos audit into an execution-ready set of remediation prompts for a local code agent working directly in the live repo:

- `https://github.com/RMF112018/hb-intel`

The package is organized so the agent can close the highest-risk defects first, then move through workflow, UI/doctrine, accessibility, data freshness, packaging, and cleanup in a disciplined sequence.

## Governing authority
Every prompt in this package must be executed against repo truth and the current governing stack, including at minimum:

- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- current live `@hbc/ui-kit`
- current live `docs/reference/ui-kit/`
- current live `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- current live `apps/hb-webparts/src/mount.tsx`
- current live HB Kudos runtime files, manifests, helpers, writers, and supporting shared surfaces

## Critical findings this package is designed to close
1. HB Kudos Companion admin/reviewer assignment is not authorable from the SharePoint property pane.
2. The generic SPFx shell exposes property-pane fields only for the Signature Hero webpart.
3. The companion can self-lock in real SharePoint runtime because configured group properties default blank.
4. The runtime lifecycle is incomplete versus the Decision Lock Appendix.
5. The typed recipient model is still not compliant because non-individual-only recipient combinations are blocked.
6. The shared People & Culture cache is not invalidated after mutations.
7. The public/archive/detail surfaces do not fully honor reduced-history visibility rules.
8. Standard age-off and scheduled prominence collision handling are not fully implemented.
9. The companion and related Kudos surfaces are not in strict `@hbc/ui-kit` / doctrine compliance.
10. Accessibility semantics and focus treatment are not strong enough for a strict production-ready claim.
11. Packaging and generated shell artifacts show drift and require fresh proof.
12. Legacy remnants and stale commentary reduce closure confidence.

## Execution order
Recommended order:

1. `01_Remediation-Plan.md`
2. `02_Prompt-Property-Pane-and-Role-Assignment.md`
3. `10_Prompt-Data-Freshness-Cache-Invalidation-and-Live-Refetch.md`
4. Decision-lock closure prompts `03` through `06`
5. Shared-surface / UI / doctrine prompts `07`, `08`, and `15`
6. `09_Prompt-Accessibility-and-Interaction-Semantics-Closure.md`
7. `11_Prompt-Notifications-and-Operational-Reminder-Model.md`
8. `14_Prompt-Manifest-Claims-and-Configuration-Hygiene.md`
9. `12_Prompt-Packaging-Freshness-and-Shell-Artifact-Truth.md`
10. `13_Prompt-Legacy-Remnants-Comments-and-Repo-Drift-Cleanup.md`
11. `99_Prompt-Final-Verification-and-Closure-Report.md`

## Global guardrails for every prompt
- Use repo truth first.
- Do not re-read files that are already in your current context or memory.
- Do not treat comments, manifests, or test docs as proof by themselves.
- Do not treat “type exists” or “writer exists” as proof the workflow is reachable in runtime UI.
- Do not preserve bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, authoring behavior, tests, and packaging proof align.
- Where the Decision Lock Appendix conflicts with implementation convenience, the lock wins unless repo truth contains a newer authoritative replacement.

## Expected outputs from the agent
For each prompt, the agent should deliver:
- code changes
- any needed documentation updates
- verification steps and outcomes
- a concise closure note identifying what was fully closed, partially closed, or intentionally deferred

## Package index
- `01_Remediation-Plan.md`
- `02_Prompt-Property-Pane-and-Role-Assignment.md`
- `03_Prompt-Decision-Lock-Workflow-Lifecycle-Closure.md`
- `04_Prompt-Decision-Lock-Recipient-Model-Closure.md`
- `05_Prompt-Decision-Lock-Visibility-and-Reduced-History-Closure.md`
- `06_Prompt-Decision-Lock-Scheduling-Prominence-Age-Off-Closure.md`
- `07_Prompt-Companion-Governance-Workspace-UI-Kit-and-Doctrine-Closure.md`
- `08_Prompt-Employee-HB-Kudos-UI-Kit-and-Doctrine-Closure.md`
- `09_Prompt-Accessibility-and-Interaction-Semantics-Closure.md`
- `10_Prompt-Data-Freshness-Cache-Invalidation-and-Live-Refetch.md`
- `11_Prompt-Notifications-and-Operational-Reminder-Model.md`
- `12_Prompt-Packaging-Freshness-and-Shell-Artifact-Truth.md`
- `13_Prompt-Legacy-Remnants-Comments-and-Repo-Drift-Cleanup.md`
- `14_Prompt-Manifest-Claims-and-Configuration-Hygiene.md`
- `15_Prompt-Shared-Surface-Promotion-and-Boundary-Discipline.md`
- `99_Prompt-Final-Verification-and-Closure-Report.md`
