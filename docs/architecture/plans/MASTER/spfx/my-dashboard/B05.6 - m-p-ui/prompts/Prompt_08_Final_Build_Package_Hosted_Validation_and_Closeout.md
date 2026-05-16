# Prompt — 08 Final Build, Hosted Validation, and Closeout

## Objective

Perform final repo validation and hosted SharePoint evidence closeout for the My Projects flagship UI/UX rebuild. This prompt is validation-first and documentation/reporting heavy. Implement code only if Prompt 08 reveals a small, specific defect required to satisfy already-locked acceptance criteria.


## Critical instruction — context efficiency

**Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.**

Use active context aggressively. Read only the files required for the current prompt, the tests you will update, exact type definitions needed to compile, and adjacent seams only when prompt truth requires it.


## Authoritative files

Reference package files:

- `README.md`
- `00_FULL_IMPLEMENTATION_PLAN.md`
- `01_TARGET_STATE_DECISION_LOCK.md`
- `06_TEST_VALIDATION_AND_EVIDENCE_MATRIX.md`
- `supporting/Hosted_Evidence_Capture_Checklist.md`
- `supporting/Acceptance_Scorecard_Worksheet.md`
- `supporting/Agent_Closeout_Report_Template.md`

Validate the final implementation under:

- `apps/my-dashboard/src/modules/myProjects/**`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx`
- `apps/my-dashboard/package.json`

## Critical instructions

- Do not reopen settled design decisions.
- Do not broaden scope into backend/auth/data.
- Do not change home-surface spans.
- Do not create speculative follow-on functionality.
- Only make narrow fixes if a concrete acceptance failure is discovered during final validation.

## Required working approach

1. Run final package validation:
   ```bash
   pnpm --filter @hbc/spfx-my-dashboard check-types
   pnpm --filter @hbc/spfx-my-dashboard lint
   pnpm --filter @hbc/spfx-my-dashboard test
   pnpm --filter @hbc/spfx-my-dashboard build
   ```
2. Review `git status --short` and identify exact changed files.
3. Validate the final UI against the target-state decision lock.
4. Capture or instruct the operator to capture the hosted evidence set from:
   - standard laptop;
   - desktop;
   - tablet landscape;
   - tablet portrait;
   - phone portrait;
   - short-height/phone landscape;
   - menu open;
   - browser open;
   - search and no-results states.
5. Complete a final closeout report using the supporting template.
6. Include a concise acceptance-verdict section:
   - Closed;
   - Partially Closed;
   - Not Closed.

## Specific questions you must answer

1. Are all final validation commands green?
2. Does the hosted rendering satisfy the locked design posture?
3. Is any hard-stop acceptance failure still present?
4. Are all changed files within expected scope?
5. What exact evidence is captured or still operator-dependent?

## Deliverables

- Final validation closeout report.
- Exact file-change inventory.
- Hosted evidence checklist status.
- Commit-ready summary and proposed commit message.
- No new large implementation tranche.

## Required report update

### Prompt-08 Progress — Final Validation and Hosted Closure

Include:
- validation command outputs summarized;
- hosted evidence status;
- final acceptance status;
- commit-ready summary;
- any remaining blocker with exact reason.

## Validation commands

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

## Final instruction

Close Prompt 08 only when the My Projects flagship UI/UX rebuild is fully validated, hosted evidence is accounted for, and no undisclosed scope drift remains.
