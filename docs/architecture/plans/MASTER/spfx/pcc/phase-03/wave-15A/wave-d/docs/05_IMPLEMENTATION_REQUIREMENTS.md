# 05 — Implementation Requirements

## Objective

Define precise implementation requirements for local remediation.

## Scope

Included:

- `apps/project-control-center/src/layout/*`
- `apps/project-control-center/src/shell/*` only where layout/host fit requires it
- `apps/project-control-center/src/surfaces/**` for tier/pattern adoption
- `apps/project-control-center/src/tests/**` and colocated tests
- Wave D docs/evidence under the canonical Wave 15A blueprint/plans paths

Excluded:

- Backend/functions changes
- `@hbc/models` contract changes unless a type-only UI prop export already exists and is necessary
- Live integration behavior
- App-catalog upload or tenant deployment
- CI/workflow changes
- Package installs or lockfile changes
- Business logic changes to read models, adapters, data fixtures, roles, or permissions

## Required Implementation Sequence

1. Confirm local repo truth and clean worktree.
2. Confirm prior Prompt 03/04/05 closeouts and current source state.
3. Create/update Wave D docs and source file map.
4. Add or finalize primitive tier/region API.
5. Harden bento/grid/span/host-fit logic only where gaps remain after audit.
6. Apply tier and pattern props/markers to every current routed surface.
7. Add tests for primitive contract and every routed surface.
8. Capture screenshots/evidence.
9. Write closeout and handoff.

## Primitive Requirements

- `PccDashboardCard` must support a testable tier and region contract.
- Card titles must support an accessible heading level contract or documented alternative.
- Existing `data-pcc-card`, `data-pcc-footprint`, `data-pcc-card-hierarchy`, `data-pcc-card-density`, `data-pcc-column-span`, `data-pcc-row-span`, and `data-pcc-active-surface-panel` markers must not disappear without updating tests and closeout.
- `PccBentoGrid` must retain container-based measurement and direct-child card behavior.
- `useBentoRowSpan` collapse-resistance tests must remain green.

## Surface Requirements

For each routed surface:

- Identify Tier 1, Tier 2, Tier 3 cards.
- Apply tier/region markers through shared primitive props.
- Ensure first ready-state card is the Tier 1 command/context card.
- Ensure no unrelated content is equal-weight with the Tier 1 command card.
- Ensure no reference card visually competes with operational cards.
- Preserve read-model and preview/inert behavior.
- Preserve active-panel ownership.

## Surface Target Mapping

| Surface | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| Project Home | Project Intelligence | Priority Actions, Site Health, Documents, Readiness, Approvals | External systems, team snapshot, missing config, recent activity |
| Team & Access | Header/context | Access Manager, Permission Request, Team Viewer depending persona | Restriction notice, execution status, audit/status details |
| Documents | Header/context | Project Record, Reviews, Permissions | My Project Files, External Systems lane, source health/reference details |
| Project Readiness | Hero/readiness context | Blockers, lifecycle map, permit/inspection, responsibility matrix | evidence/source health, downstream modules, constraints/buyout/procore references |
| Approvals | Approvals home | queue, my approvals, escalation, admin verification | registry, policy, modules, decision history, lineage, HBI boundary |
| External Systems | Launch Pad header | project links, review queue, mapping status | registry, source health, audit history, HBI lineage, Procore config |
| Settings | Settings overview | scope/settings groups, missing setup | governance notes/reference lanes |
| Site Health | Overview | checks, drift, repair posture | Procore sync, repair requests/reference diagnostics |

## Required Validation Commands

Run from the repo root or app root as appropriate and record exact output:

```bash
git status --short
git rev-parse HEAD
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed files>
md5 pnpm-lock.yaml
```

If repo scripts differ locally, use the closest repo-truth commands and document the substitution.

## Lockfile Rule

Do not change `pnpm-lock.yaml`. If it changes unexpectedly, stop and document the cause before committing.
