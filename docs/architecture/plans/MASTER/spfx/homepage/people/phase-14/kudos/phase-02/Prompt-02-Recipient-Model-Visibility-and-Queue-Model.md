# Prompt 02 — Recipient Model, Visibility, and Queue Model

You are working in the live repo at:
`https://github.com/RMF112018/hb-intel`

Branch: `main`

Treat live repo truth as authoritative.

## Objective

Close the largest remaining behavior gaps in HB Kudos:

- complete the final typed recipient model
- implement the actual employee associated-item visibility rules
- refactor the companion queue model to match the decision locks

## Governing files

- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Plan-Summary.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Schema-Reference-Appendix.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-05-Permissions-Notifications-and-Work-Management.md`

## Primary files in scope

- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
- `apps/hb-webparts/src/homepage/webparts/kudosContracts.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- any helper files needed for taxonomy resolution, associated-item access, or queue modeling

## Repo-truth defects this prompt must fix

1. Individual recipients are partially resolved, but team/department/project-group recipients are not persisted to their real fields.
2. Non-individual typed recipients are being parked in `ModeratorNotes`, which is not acceptable final-state behavior.
3. The employee surface does not truly implement submitter/recipient associated-item access after age-off/removal where allowed.
4. The companion tab model drifts from the locked operating model.
5. Queue ordering and ownership behavior are incomplete.

## Required outcomes

### A. Final typed recipient persistence

Implement final-state persistence for all supported recipient buckets:
- individual
- team
- department
- project group

Use the real target fields on the live list.

Do not leave taxonomy recipients as “captured for HR later” in final-state logic.

If supporting term resolution requires a resolver/helper seam, add it cleanly.

### B. Employee visibility model

Implement the real access model required by the decision lock:
- public users can open public items
- submitter can view all their own submissions/statuses
- submitter and recipients can still see allowed associated items after expiration/unpublish/removal from public view
- recipients do not see never-published rejected/withdrawn items
- before publish, recipients do not see the item at all
- associated no-longer-public items render a reduced history-safe view

Do not leave this as display copy without actual data-path support.

### C. Companion queue model

Refactor the companion to match the locked top-level queue model:
- Pending
- Revision Requested
- Flagged for Admin Review
- Approved
- Rejected
- Removed / Unpublished

Do not keep the current drifted tab model as final state.

### D. Queue ordering and work views

Implement the locked ordering behavior by queue/state.

Implement required work-management views:
- Assigned to me
- Unassigned
- Assigned to others

Hydrate and use real claim/assignment data where the schema supports it.

## Implementation rules

- Preserve `@hbc/ui-kit/homepage` entry-point discipline.
- Preserve list GUID binding.
- Do not weaken typed contracts to fit unfinished runtime shortcuts.
- Keep helpers thin and deterministic where possible.
- Do not re-read files that are still within your current context or memory unless a detail is genuinely uncertain.

## Deliverables

Return:

1. changed-file summary
2. recipient-model implementation summary
3. exact fields now written for each recipient bucket
4. associated-item visibility implementation summary
5. companion queue-model summary
6. queue ordering summary
7. work-view summary
8. validation performed
9. remaining issues, if any

## Important rules

- Do not claim completion while taxonomy recipients still rely on `ModeratorNotes` as the real storage path.
- Do not claim completion while associated-item access remains public/archive-only in practice.
- Do not claim completion while the companion still uses a drifted tab model.
