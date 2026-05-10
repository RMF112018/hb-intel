# Prompt 02 — Project Home Choreography and Gateways

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

## Objective

Apply Phase 06 Project Home card order, span choreography, and gateway actions to fixture and read-model paths.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not run broad repo scans when targeted reads are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Keep every bento card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense` as the primary layout fix.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.

## Scope

Implement Project Home first-fold choreography and gateway actions. Do not implement analytics in this prompt.

## Required Files

Modify:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccSiteHealthSummaryCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccDocumentControlCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectReadinessCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccMissingConfigurationsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccExternalSystemsCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccTeamSnapshotCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccRecentActivityCard.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
```

Create:

```text
apps/project-control-center/src/tests/PccProjectHome.phase06Composition.test.tsx
apps/project-control-center/src/tests/PccProjectHomeGatewayActions.test.tsx
```

## Target Project Home Order

Fixture and read-model paths must begin with:

```text
Priority Actions
Site Health Summary
Document Control Center
Project Readiness
Approvals & Checkpoints
Missing Configurations
External Platforms
Team Snapshot
Recent Activity
```

Move Lifecycle Timeline, Ask HBI, Procore Snapshot, Project Memory, Project Lens, and Related Records below this first nine-card operational sequence in the read-model path.

## Span Overrides

Apply this matrix:

| Card | 12-col modes | standardLaptop 10-col | tablet/phone |
|---|---:|---:|---|
| Priority Actions | 5 | 4 | use safe full-width/stack behavior |
| Site Health Summary | 3 | 3 | use safe full-width/stack behavior |
| Document Control Center | 4 | 3 | use safe full-width/stack behavior |
| Project Readiness | 4 | 4 | use safe full-width/stack behavior |
| Approvals & Checkpoints | 4 | 3 | use safe full-width/stack behavior |
| Missing Configurations | 4 | 3 | use safe full-width/stack behavior |
| External Platforms | 4 | 3 | use safe full-width/stack behavior |
| Team Snapshot | 3 | 3 | use safe full-width/stack behavior |
| Recent Activity | 5 | 4 | use safe full-width/stack behavior |

Map 12-col modes to:

```text
largeLaptop
desktop
ultrawide
```

Use the same 12-col override for `largeLaptop`, `desktop`, and `ultrawide`.

## Gateway Actions

Add card-level gateway actions through `PccDashboardCard.action` or an equivalent PCC-owned gateway component.

### Required mapping

| Card | Label | Behavior |
|---|---|---|
| Priority Actions | Open Action Center | select `action-center` |
| Site Health Summary | Open Site Health | select `site-health` |
| Document Control Center | Open Document Control | select `document-control-center` |
| Project Readiness | Open Startup Center | select `startup-center` |
| Approvals & Checkpoints | Open Approvals | select `approvals-checkpoints` |
| Missing Configurations | Open Settings | select `control-center-settings` |
| External Platforms | Open External Platforms | select `external-platforms` |
| Team Snapshot | Open Team & Access | select `team-access` |
| Recent Activity | View Activity Context | disabled/preview-only with visible reason |

### Wiring Guidance

If the existing Project Home cards do not receive state actions, introduce a narrow prop contract from `PccApp` / `PccSurfaceRouter` / `PccProjectHome` only as needed.

Avoid broad rewrites. Do not change `usePccShellState` unless necessary.

## Visible Copy Rules

Use product-grade reason copy for disabled Recent Activity:

```text
Activity context is preview-only in this release.
```

Do not use:

```text
not implemented
TODO
coming soon because dev work remains
```

## TODO Documentation

Add non-UI TODO comments in the composition or Project Home view-model layer:

```ts
// TODO(post-mvp): Implement stage/lifecycle-aware Project Home context using
// the PCC Product Architecture and User Journey Blueprint as the governing
// reference. Project Home should adjust card priority, analytics emphasis,
// gateway recommendations, and command context based on project stage,
// lifecycle signals, role/persona, and source-backed project readiness.
// This must remain read-model driven until a future command-model contract
// authorizes workflow execution or source-system writeback.
```

## Tests

Update and add tests proving:

- target fixture order;
- target read-model first nine operational order;
- `Project Intelligence` absent;
- target span overrides by mode;
- gateway actions render;
- enabled gateway actions change active module or trigger expected callback;
- disabled Recent Activity action is disabled and reason copy is visible;
- direct-child bento invariant remains intact.

## Acceptance

- Project Home visually starts with operational content.
- No first-row stranded horizontal gap by span composition.
- Gateways are truthful.
- No analytics added yet.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If Playwright evidence is in scope for this prompt, also run the requested Playwright commands.

## Closeout Report

Report:

- files changed;
- dependency/package/lockfile changes observed;
- validation commands and results;
- whether SPFx solution/feature version changed;
- risks or follow-up items;
- confirmation that you did not install dependencies;
- confirmation that `echarts-for-react` was not added.
