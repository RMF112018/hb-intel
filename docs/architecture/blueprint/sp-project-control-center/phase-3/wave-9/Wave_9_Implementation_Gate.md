# Wave 9 Implementation Gate — Project Lifecycle Readiness Center

**Status:** AUTHORIZED — GO
**Generated:** 2026-05-01
**Phase / Wave:** PCC Phase 3 / Wave 9
**Wave name:** Project Lifecycle Readiness Center
**Prompt:** 01 — Wave 9 Gate, Repo-Truth Audit, and Wave 8 Dependency Verification

This gate authorizes Prompts 02–08 of Wave 9 to proceed against current repo truth. It locks only primary, directly-verified facts. Detailed lifecycle taxonomy (phases, item types, statuses, exception codes, domains, gates, role/action authority, scoring posture, evidence policies) is governed by the Wave 9 target architecture, not this gate.

---

## 1. Repo-Truth Baseline

| Item                                    | Value                                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Branch                                  | `main`                                                                                       |
| Working tree at gate open               | clean (no untracked or modified files)                                                       |
| HEAD                                    | `c0725ead3 docs(pcc): Wave 10 Permit & Inspection implementation prompt package`             |
| Latest Wave 8 commit                    | `b7d8c3e03 docs(pcc): close wave 8 readiness framework`                                      |
| Latest Wave 9 planning commit           | `689a09483 docs(pcc): Wave 8 readiness shell prompts; Wave 9 implementation planning corpus` |
| Wave 9 architecture redefinition commit | `e972b1481 docs(pcc): redefine wave 9 lifecycle readiness architecture`                      |
| Wave 9 docs format pass                 | `8f7361da5 docs(pcc): format wave 9 lifecycle readiness docs`                                |
| `pnpm-lock.yaml` MD5 (gate baseline)    | `c56df7b79986896624536aab74d609f4`                                                           |

The lockfile MD5 must remain `c56df7b79986896624536aab74d609f4` for every Wave 9 prompt unless an explicit dependency authorization is requested and approved.

---

## 2. Wave 8 Dependency Status — CLOSED

Wave 8 (Project Readiness Module Framework) is **implemented and closed**. Wave 9 must consume the Wave 8 framework. Wave 9 must not reinvent it.

**Closeout authority:**
`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Closeout.md` — `Status: Closed` (generated 2026-05-01).

**Wave 8 implementation chain (seven commits):**

| Prompt | Commit      | Subject                                                          |
| ------ | ----------- | ---------------------------------------------------------------- |
| 01     | `51ddfc9ab` | docs(pcc): authorize wave 8 readiness framework implementation   |
| 02     | `992542f27` | feat(models-pcc): add project readiness framework contracts      |
| 02+    | `3d3e81250` | fix(models-pcc): require project readiness source lineage        |
| 03     | `17e727de5` | feat(functions-pcc): add project readiness mock read-model route |
| 04     | `aeeb61cfd` | feat(spfx-pcc): add project readiness read-model client parity   |
| 05     | `4749ff0e1` | feat(spfx-pcc): render project readiness center framework shell  |
| 06     | `5e43e5e15` | test(spfx-pcc): harden project readiness framework summaries     |

**Framework seams Wave 9 must consume (verified in repo):**

- `packages/models/src/pcc/ProjectReadinessFramework.ts` — `IProjectReadinessItem` (with required `sourceLineage`), `IProjectReadinessFrameworkSnapshot`, domain / gate / source-module / posture / severity / blocker-state / confidence / evidence-state vocabularies, roll-up shapes (DomainSummary, GateSummary, OwnershipSummary, EvidenceSummary, BlockerSummary, SourceHealthSummary). The source-module enum already includes `'project-lifecycle-readiness'`.
- `packages/models/src/pcc/fixtures/projectReadiness.ts` — `SAMPLE_PROJECT_READINESS_ITEMS` and `SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL` (generic Wave 8 framework samples; Wave 9 will introduce its own lifecycle-readiness fixtures).
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` — `getPccProjectReadiness` registered at `pcc/projects/{projectId}/project-readiness` with mock provider method.
- SPFx app `apps/project-control-center/src/api/**` — read-model client interface includes `getProjectReadiness(projectId, viewerPersona?)`; route id `'project-readiness'` listed in the SPFx route registry.
- `apps/project-control-center/src/surfaces/projectReadiness/**` — eight-region read-only Project Readiness Center shell (`PccProjectReadinessSurface.tsx`, `projectReadinessViewModel.ts`, `projectReadinessAdapter.ts`, `*.module.css`, `projectReadinessAdapter.test.ts`).
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` — `case 'project-readiness'` registered eagerly; `IPccSurfaceRouterReadModelClient` extends `IPccProjectReadinessReadModelClient`.

**Wave 8 scope explicitly deferred to Wave 9 (verified):** the Project Readiness Center adapter test marks the `'project-lifecycle-readiness'` source module as `'preview-deferred'`. Wave 9 owns lifting that module from preview-deferred to active.

**Operator-pending items inherited from Wave 8 (not addressed by Wave 9 implementation):**

- Hosted/tenant invocation of `getPccProjectReadiness`.
- SPFx hosted render in SharePoint host.
- SPFx backend opt-in for the readiness surface (`PccApp.optIn.test.tsx` continues to assert 3 fetch calls).

---

## 3. Wave 9 Source Item-Library Status — VERIFIED

The canonical default item library is present in the Wave 9 plan folder and counts reconcile.

**Authoritative location:**
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/`

| File                                            | Form           | Family / Total                                                                         |
| ----------------------------------------------- | -------------- | -------------------------------------------------------------------------------------- |
| `01_Project_Startup_Checklist_Items.md`         | Markdown table | startup = 55                                                                           |
| `01_Project_Safety_Checklist_Items.md`          | Markdown table | safety = 32                                                                            |
| `01_Project_Closeout_Checklist_Items.md`        | Markdown table | closeout = 70                                                                          |
| `02_Default_Item_Library.csv`                   | CSV            | total = 157 (158 lines = 1 header + 157 rows)                                          |
| `03_Default_Item_Library.json`                  | JSON           | `itemCount = 157`; `counts.startup = 55`, `counts.safety = 32`, `counts.closeout = 70` |
| `00_Documentation_Update_Package.md`            | Reference      | package summary                                                                        |
| `04_Local_Agent_Documentation_Update_Prompt.md` | Reference      | agent execution prompt                                                                 |

**Total: 157. Family split: startup 55 / safety 32 / closeout 70.** JSON ↔ CSV reconciled. Crosswalk authority:
`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Item_Library_Crosswalk.md`.

Lifecycle taxonomy (phases, domains, item types, statuses, exception codes, gates, role/action authority, scoring, evidence policies) is governed by the target architecture file:
`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md`. **Prompt 02 is the prompt that consumes those counts and turns them into model contracts; this gate does not lock secondary taxonomy counts.**

No code-side registry currently consumes the 157-item library. Wave 9 introduces it.

---

## 4. Authorized Posture for Prompts 02–08

Wave 9 is authorized as a **read-model-first, fixture-driven, no-runtime preview module** that extends the Wave 8 Project Readiness framework with lifecycle-readiness item content and a dedicated lifecycle-readiness command surface.

**Per-prompt posture (sourced from `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/prompts/`):**

| Prompt | Title                                                         | Authorized scope                                                                                                                                  |
| ------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 02     | Shared Lifecycle Readiness Models and Fixtures                | Add lifecycle-readiness model contracts and fixtures in `@hbc/models`, consuming Wave 8 framework primitives. No backend, no SPFx surface change. |
| 03     | Backend Mock Read-Model and GET Route                         | Add a mock provider method and GET-only read-model route in `@hbc/functions` for lifecycle readiness. No tenant, no Graph, no PnP, no live calls. |
| 04     | SPFx Client Fixture Parity and Router Seam                    | Add an SPFx read-model client method + router seam for lifecycle readiness; preserve existing surface routing. No app shell rewrite.              |
| 05     | Project Lifecycle Readiness Command Surface                   | Add the lifecycle readiness command surface UX inside the PCC SPFx app. Preview-only; affordances inert.                                          |
| 06     | Item Detail, Evidence, Risk, Degraded States                  | Add item-detail rendering, evidence reference posture, risk tagging, and degraded-state UX. Reference-only evidence; no upload, no execution.     |
| 07     | Readiness Signals, Priority Actions, Approvals (No Execution) | Add readiness signals, priority-action linkage, and approval display. **No execution semantics; no workflow runtime.**                            |
| 08     | Closeout, Validation, and Wave 10 Handoff                     | Wave 9 closeout, validation evidence, and Wave 10 handoff posture.                                                                                |

Each prompt opens with its own preflight, runs in a fresh local-code-agent cycle, validates in-scope, and commits explicitly.

---

## 5. Allowed File Scope for Prompts 02–08

Prompts 02–08 may modify only the following surfaces (each prompt restricts further to its own slice):

- `packages/models/src/pcc/**` — lifecycle-readiness contracts, fixtures, and tests; preserve Wave 8 contracts.
- `backend/functions/src/hosts/pcc-read-model/**` — lifecycle-readiness mock read-model and GET route; preserve Wave 8 route + provider.
- `apps/project-control-center/src/api/**` — read-model client interface and factory seam.
- `apps/project-control-center/src/surfaces/**` — lifecycle-readiness surface (file/folder layout decided in Prompt 05). Preserve the existing `projectReadiness/` Wave 8 framework shell.
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` — router seam additions only; no router-shell rewrite.
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/**` — closeout / decision-register / handoff docs only; do not rewrite the canonical target architecture or item-library files.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/**` — additive blueprint docs only; do not modify the existing target architecture, crosswalk, or this gate after approval.

Read-only evidence sources (must not be modified by Wave 9 implementation):

- `docs/architecture/plans/**` (outside Wave 9 plan folder).
- `docs/reference/example/**`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/**`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Item_Library_Crosswalk.md`.
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/**`.

---

## 6. Forbidden Scope — No Runtime, No Mutation

Prompts 02–08 must not introduce any of the following. Any need for these requires a separate, explicit authorization prompt and gatekeeper review:

- Live Microsoft Graph file operations.
- Live SharePoint / PnP / SharePoint REST operations.
- SharePoint list / library mutation or provisioning.
- Tenant mutation.
- Permission / group mutation.
- Procore runtime / API integration / writeback.
- Sage runtime / API integration / writeback.
- Outlook / calendar / email runtime mutation.
- Document Crunch or Adobe Sign runtime / writeback.
- Safety platform runtime integration.
- Workflow / approval execution.
- Power Automate flows.
- Notifications.
- Production persistence writes.
- Package / dependency / version / manifest changes (no `pnpm install`, `pnpm add`, `pnpm update`; no `package.json`/lockfile churn).
- SPFx packaging / deployment / app-catalog upload.
- `.sppkg` generation or upload.
- Secrets, app settings, OIDC inputs.
- Broad format rewrites outside touched files.
- Any cross-wave scope absorption — Wave 10 (Permit & Inspection Control Center) prompts already exist (`c0725ead3`, `5877ae693`, `17b14fd64`, `861314c74`, `d7d89522a`, `7183721f0`); Wave 9 must not absorb Wave 10 ownership.

The lockfile (`pnpm-lock.yaml`) MD5 must remain `c56df7b79986896624536aab74d609f4` for every Wave 9 prompt unless dependency authorization is granted.

---

## 7. Validation Commands for Prompts 02–08

Each Wave 9 prompt selects the smallest meaningful subset from the package-local commands below, scoped to the package(s) it actually modifies. Workspace-wide commands are not required.

**`@hbc/models` (when models are touched):**

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models lint
```

**`@hbc/functions` (when backend is touched):**

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions lint
```

**`@hbc/spfx-project-control-center` (when SPFx app is touched):**

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center lint
pnpm --filter @hbc/spfx-project-control-center build
```

**Cross-cutting hygiene (every prompt):**

```bash
git status --short
git diff --check
pnpm exec prettier --check <changed paths>
md5 pnpm-lock.yaml
```

Lockfile MD5 must equal `c56df7b79986896624536aab74d609f4` after every Wave 9 prompt.

Hosted / tenant / Azure / browser validation is **not** authorized within Wave 9 prompts. Hosted invocation, hosted render, and SharePoint-host parity remain operator-pending and inherit from Wave 8.

---

## 8. Operator-Pending and Residual Risk

- **Hosted invocation** of `getPccProjectReadiness` (Wave 8) and the new lifecycle-readiness route (Wave 9) is operator-pending. Package-local validation is not hosted proof.
- **Hosted SPFx render** of the Project Readiness Center and the Wave 9 lifecycle-readiness surface in a SharePoint host remains operator-pending.
- **SPFx backend opt-in** for the readiness surface is deferred; `PccApp.optIn.test.tsx` continues to assert 3 fetch calls. Wave 9 prompts must preserve that contract unless an opt-in change is explicitly authorized.
- **Lockfile drift** is a hard stop. If `pnpm-lock.yaml` MD5 changes inside a Wave 9 prompt, the prompt must stop and report.
- **Cross-wave absorption** (Wave 10 / Wave 11+ scope creep) is forbidden. Wave 10 has its own prompt package landed; Wave 9 must not pull from it.

---

## 9. Recommended Next Prompt

**Wave 9 / Prompt 02 — Shared Lifecycle Readiness Models and Fixtures.**

Path: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/prompts/02_Wave_9_Shared_Lifecycle_Readiness_Models_and_Fixtures.md`.
