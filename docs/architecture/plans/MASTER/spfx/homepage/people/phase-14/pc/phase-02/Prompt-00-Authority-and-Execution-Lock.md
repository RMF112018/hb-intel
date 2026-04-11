# Prompt 00 — Authority and Execution Lock

## Use

Run this first. This prompt establishes the authority stack, the locked constraints, the gap register, and the execution plan for the remediation work.

## Prompt

```text
You are working in the live local `hb-intel` repository with direct file-system access.

Your mission is to establish the authoritative execution baseline for bringing the People & Culture application to full compliance across the board. This is not limited by any historical prompt package. Use current repo truth, current governing docs, and current split-boundary requirements.

IMPORTANT OPERATING RULE:
Do not re-read files that are still in your active context or memory. Reuse current context first. Only open additional files when needed to progress, verify, or resolve uncertainty.

Primary objective:
Create a precise authority lock, repo-truth reconciliation, and executable gap register for full People & Culture remediation.

Authority order:
1. Current repo truth in the live local repository
2. Current governing plan/docs for People & Culture split architecture and decision locks
3. Current packaging/runtime truth for `apps/hb-webparts`
4. Historical prompt packages only as background, never as the authority

Minimum files/areas to inspect and reconcile:
- `apps/hb-webparts/src/webparts/peopleCulturePublic/`
- `apps/hb-webparts/src/webparts/peopleCultureCompanion/`
- `apps/hb-webparts/src/webparts/peopleCulture/`
- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/`
- `apps/hb-webparts/src/homepage/webparts/peopleCultureSplitContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureSplitModel.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureMilestoneGenerator.ts`
- `apps/hb-webparts/src/homepage/helpers/peopleCultureNotificationBuilder.ts`
- `apps/hb-webparts/src/homepage/data/`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/config/package-solution.json`
- `tools/build-spfx-package.ts`
- `scripts/testing/people-kudos/`
- `packages/ui-kit/src/homepage.ts`
- the current Phase-14 People & Culture governing docs under `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/pc/`
- relevant People & Culture / UI-kit review docs under `docs/architecture/reviews/`

Locked constraints:
- Do not recouple HB Kudos into People & Culture Public or People & Culture Companion.
- Do not delete or repoint the legacy merged People & Culture seam unless the repo already contains an explicit approved migration-completion path.
- Preserve manifest identities and packaging integrity unless a change is explicitly required and justified by repo truth.
- Do not deepen local inline visual drift where a governed shared surface or shared primitive should exist.
- Do not leave simulated reducer-only behavior in place for workflows that are supposed to be durable operating workflows.

Your tasks:
1. Reconcile the current implementation against the current governing docs.
2. Produce a gap register grouped by:
   - architecture / boundaries
   - persistence / contracts
   - workflow closure
   - UI / premium surface doctrine
   - accessibility / responsive behavior
   - packaging / validation / release proof
3. For each gap, classify it as:
   - critical
   - high
   - medium
   - low
4. Convert that gap register into an execution plan that can be implemented in the next prompts.
5. Update any stale or misleading comments/docs that clearly conflict with current repo truth and can be corrected safely in this pass.
6. Add or update a closeout review doc under `docs/architecture/reviews/` summarizing the final authority lock and execution plan.

Required outputs in this pass:
- a concise execution summary
- a prioritized gap register
- explicit locked constraints
- the planned implementation sequence for the next workstreams
- the doc(s) you updated or added

Do not stop at analysis only. Make the repo changes needed for the authority lock and plan handoff.
```