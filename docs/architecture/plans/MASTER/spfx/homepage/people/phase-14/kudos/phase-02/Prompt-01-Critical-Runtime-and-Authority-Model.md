# Prompt 01 — Critical Runtime and Authority Model

You are working in the live repo at:
`https://github.com/RMF112018/hb-intel`

Branch: `main`

Treat live repo truth as authoritative.

## Objective

Remediate the HB Kudos implementation so the core runtime is no longer broken and the authority model is real rather than simulated.

## Governing files

- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Plan-Summary.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-05-Permissions-Notifications-and-Work-Management.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-06-Validation-Packaging-and-Closure.md`

## Primary files in scope

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/helpers/kudosCapabilities.ts`
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- any new real SharePoint principal/group resolver you need under `apps/hb-webparts/src/homepage/helpers/` or `apps/hb-webparts/src/homepage/data/`

## Repo-truth defects this prompt must fix

1. `submitKudosGovernanceAction` is being called with an empty-string `siteUrl` from both the employee surface and the companion surface.
2. The current runtime still relies on `simulatedRole` as the effective role model.
3. The writer comments overstate authority enforcement relative to actual repo truth.
4. The same real authority model is not yet applied to both UI gating and mutations.

## Required outcomes

### A. Fix broken runtime mutation plumbing

Eliminate all empty-string `siteUrl` mutation calls.

Every call to `submitKudosGovernanceAction` must receive a real site URL sourced from the SPFx context pathway.

This includes at minimum:
- employee Celebrate action
- companion approve
- reject
- request revision
- flag admin review
- clear admin review
- schedule / unschedule
- pin / unpin
- feature / unfeature
- remove / restore
- claim / reassign
- bulk approve

### B. Replace simulated runtime role logic

The repo currently exposes webpart properties such as:
- `kudosAdminsGroup`
- `kudosReviewersGroup`
- `simulatedRole`

Implement the real runtime model so that:
- the effective production path resolves actual SharePoint principals/groups
- `simulatedRole` is dev/test-only if retained at all
- the implementation fails closed on missing/invalid group configuration

### C. Enforce the same authority model in both places

The same resolved role model must govern:
- whether the user can see the companion at all
- which actions are shown/enabled
- whether a mutation is allowed to execute

Do not leave authority enforcement only at the UI layer.

Do not leave authority enforcement only in comments.

### D. Writer-level authorization

Before any governance mutation executes, the writer or a shared preflight authorization seam must verify the caller can perform that exact action.

At minimum, enforce:
- reviewer vs admin distinctions
- admin-only actions
- viewer cannot mutate
- queue/state-sensitive restrictions where already locked by the decision appendix

## Implementation rules

- Preserve `@hbc/ui-kit/homepage` entry-point discipline.
- Preserve list GUID binding.
- Keep the authority model explicit and inspectable.
- Add concise inline comments only where a future maintainer would otherwise misunderstand the flow.
- Do not re-read files that are still within your current context or memory unless a detail is genuinely uncertain.

## Deliverables

Return:

1. changed-file summary
2. exact runtime defect(s) fixed
3. authority-model implementation summary
4. where the real SharePoint principal/group resolution now lives
5. proof that all governance and celebrate mutations now receive a real `siteUrl`
6. proof that writer-level authorization now exists
7. proof that `simulatedRole` is no longer the effective production path
8. validation performed
9. remaining issues, if any

## Important rules

- Do not claim completion if empty-string `siteUrl` calls remain.
- Do not claim completion if the production runtime still effectively trusts `simulatedRole`.
- Do not claim completion if mutation authorization still relies on UI gating alone.
