<!--
Planning package generated from repo-truth audit of RMF112018/hb-intel at commit b34238c4192dee35ca142b172d545a71cd4214c2.
Scope: Phase 2 planning only. No code implementation, repo mutation, tenant mutation, or provisioning execution.
Generated: 2026-04-28
-->

# Phase_2_Execution_Backlog.md

# Phase 2 — Execution Backlog

## P0 — Must Resolve Before Any Implementation

| ID | Item | Acceptance Criteria |
|---|---|---|
| P0-001 | Accept Phase 2 consumer boundary | Boundary doc approved; no executor work starts before it. |
| P0-002 | Confirm package ownership | Decide whether `packages/project-site-provisioning/` is approved as the planner package. |
| P0-003 | Resolve missing PCC README / roadmap posture | Create README update recommendation or actual README in a separate docs-only prompt. |
| P0-004 | Preserve schema package boundary | `@hbc/project-site-template` remains schema/validation only. |
| P0-005 | Define mutation lock | Manifest and executor design default to `liveMutationAllowed: false`. |
| P0-006 | Reconcile existing backend site creation mismatch | Document that current `SharePointProvisioningService` URL/site type logic is not PCC-compliant as-is. |
| P0-007 | Define proof artifact location | Decide whether dry-run proofs live under package reports, `phase-2/proof`, or both. |
| P0-008 | Confirm Procore boundary | No runtime Procore integration, secrets, write-back, or full mirror in Phase 2. |
| P0-009 | Confirm schema changes are out of scope | No schema rewrites unless a defect is proven. |

## P1 — Phase 2 Step 1 / Step 2 Foundation

| ID | Item | Acceptance Criteria |
|---|---|---|
| P1-001 | Create `phase-2/` documentation folder | Contains Step 1 audit, boundary, dry-run spec, mutation gate, closeout template. |
| P1-002 | Create local planner package scaffold | `packages/project-site-provisioning/` exists with package README, package.json, test harness, and no Graph/PnP/SPFx/backend deps. |
| P1-003 | Contract loader | Loads `template-contract.json` from repo-relative path and fails safely on missing path. |
| P1-004 | Validation reuse | Runs or reuses `@hbc/project-site-template validate:all` before plan generation. |
| P1-005 | Normalized model | Produces deterministic normalized template model. |
| P1-006 | Boundary tests | Tests assert no forbidden dependencies and no tenant env vars required. |

## P2 — Dry-Run and Validation

| ID | Item | Acceptance Criteria |
|---|---|---|
| P2-001 | Provisioning action taxonomy | All contract families map to action classes or explicit non-action classes. |
| P2-002 | Deterministic manifest generator | Same input produces byte-identical JSON manifest. |
| P2-003 | Blocker model | Missing runtime config, tenant targets, permissions, or deferred scope become blockers. |
| P2-004 | Dry-run markdown report | Produces readable report with action counts, blockers, warnings, and Procore boundary. |
| P2-005 | Planner fixtures | Valid/invalid fixture coverage for project type/stage/status, Procore guardrails, deferred rows. |
| P2-006 | Manifest schema | Optional local schema validates dry-run output shape. |
| P2-007 | No-tenant proof | Tests assert no network calls or env vars required. |

## P3 — Non-Production Mutation

| ID | Item | Acceptance Criteria |
|---|---|---|
| P3-001 | Mutation gate document | Target, auth, approval, rollback, and validator requirements documented. |
| P3-002 | Select non-prod target | Non-production tenant/site target identified and approved. |
| P3-003 | Executor adapter design | Adapter consumes approved manifest only; does not interpret raw contract directly. |
| P3-004 | Read-only tenant discovery | Graph/PnP discovery can compare state before mutation. |
| P3-005 | Non-production executor | Creates or updates only approved non-prod objects with explicit live flag. |
| P3-006 | Independent validator | Validates post-run state against manifest. |
| P3-007 | Rollback runbook | Manual rollback path exists before any live action. |

## Deferred — Phase 3+

| ID | Item | Reason Deferred |
|---|---|---|
| D-001 | Production project-site provisioning | Requires non-prod proof and operational approval. |
| D-002 | SPFx Project Control Center shell | Requires stable backend/provisioning contracts. |
| D-003 | Document Control Center app | Requires project-site IA and list/library provisioning. |
| D-004 | Procore runtime integration | Explicitly out of Phase 2; placeholders only. |
| D-005 | Procore write-back | Deferred by contract. |
| D-006 | External user provisioning | External templates deferred from MVP. |
| D-007 | Automated repair execution | Repair tiering must be proven first. |
| D-008 | Power Automate flow provisioning | Tooling and governance not selected. |
| D-009 | Production site health repair loop | Requires post-provision validation and approval model. |
