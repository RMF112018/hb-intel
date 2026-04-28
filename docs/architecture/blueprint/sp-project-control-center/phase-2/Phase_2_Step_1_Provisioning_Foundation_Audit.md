# Phase 2 Step 1 — Provisioning Foundation Audit

**Effort:** SP Project Control Center (PCC) — Standard Project Site Template
**Step type:** Audit, planning, and documentation only — no implementation
**Baseline commit:** `7c8df18508383aafc4f3f426217e42e03a09f2ca`
**Date:** 2026-04-28

---

## Objective

Establish a verified, repo-truth foundation for Phase 2 implementation work by:

1. confirming that the Phase 1 schema/contract gate is closed,
2. cataloguing existing provisioning, Graph, PnP, admin-control-plane, and proof-artifact patterns,
3. classifying which patterns are reusable for the new Standard Project Site Template provisioning path and which are not,
4. recording gaps, risks, and required gates that must be satisfied before any tenant mutation is attempted.

This audit does not introduce architecture decisions; it ratifies the schema-only boundary established in Phase 1 and the consumer-boundary direction proposed in the parallel execution-scaffold package under [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/).

---

## Scope

In scope:

- audit of the Phase 1 exit state for `@hbc/project-site-template`,
- audit of existing SharePoint, Graph, PnP, admin-control-plane, and PnP runner code paths,
- classification of reusable vs unsafe patterns,
- identification of gaps, risks, and gates,
- documentation that future implementation prompts can rely on.

Out of scope (explicitly):

- creating any new package (including `packages/project-site-provisioning/`),
- writing planner, manifest, dry-run, or executor code,
- mutating SharePoint, Graph, or any tenant resource,
- creating SPFx packages, web parts, backend endpoints, or PnP scripts,
- introducing Procore runtime code, secrets, or write-back paths,
- adding any runtime dependency to `@hbc/project-site-template`,
- new ADRs, SPFx solution version bumps, or repo-wide refactoring.

---

## Repo Areas Audited

### Governing PCC documents

- [`HB_Project_Control_Center_Target_Architecture_Blueprint.md`](../HB_Project_Control_Center_Target_Architecture_Blueprint.md) — strategic target architecture and operating model.
- [`Standard_Project_Site_Template_Contract.md`](../Standard_Project_Site_Template_Contract.md) — implementation source of truth for project site structure.
- [`Project_Control_Center_Development_Roadmap.md`](../Project_Control_Center_Development_Roadmap.md) — sequenced execution priorities.
- [`phase-0/`](../phase-0/) (8 closeout documents) and [`phase-1/`](../phase-1/) (5 closeout documents).
- [`procore_hbintel_data_model_package/`](../procore_hbintel_data_model_package/) — Procore integration boundary reference.

### Machine-readable contract

- `packages/project-site-template/package.json` — name `@hbc/project-site-template`, version `0.1.0`, private, devDeps only (`ajv@^8.17.1`, `ajv-formats@^3.0.1`), exports `template-contract.json`, `schemas/`, `fields/`, `docs/`, `README.md`. Scripts: `validate:schemas`, `validate:integrity`, `validate:all`.
- `packages/project-site-template/template-contract.json` — declares `templateName`, `templateFamily`, `templateVersion: "1.0.0-proposed"`, `phase: "Phase 1 Step 5 — full extraction gate closed"`, `status.fullExtractionComplete: true`, 14 `families` entries each `status: populated`.
- `packages/project-site-template/schemas/` — 15 JSON Schema files (Draft 2020-12): one root contract schema plus 14 family schemas.
- `packages/project-site-template/fields/` — 12 family field-map files plus shared `common-fields.json`, `family-field-dependencies.json`, and the 18-row `object-catalog-field-disposition.json`.
- `packages/project-site-template/validation/` — AJV validation harness (`validate-template-contract.mjs`), structural integrity harness (`contract-integrity-checks.mjs`), 14 valid + 7 invalid fixtures, deterministic JSON reports.

### Existing backend provisioning surfaces

- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/sharepoint-provisioning-service.ts`
- `backend/functions/src/services/safety-provisioning-service.ts`
- `backend/functions/src/services/graph-list-discovery-service.ts`
- `backend/functions/src/services/sharepoint-common.ts`
- `backend/functions/src/services/__tests__/`
- `backend/functions/src/services/admin-control-plane/{evidence-service,sharepoint-drift-service,pnp-orchestrator,config-resolution-service,safety-policy-registry,install-verification-service}.ts`

### Existing provisioning domain package

- `packages/provisioning/` — headless project-setup lifecycle (state machine `Submitted → UnderReview → … → Completed | Failed`), API client, BIC wiring; not React-bound; not Procore-bound.

### Local PnP runner

- `tools/pnp-runner-local/scripts/*.ps1` — `provision-platform-configuration-registry.ps1`, `validate-platform-configuration-registry.ps1`, `update-platform-configuration-registry-values.ps1`, `invoke-pnp-extraction.ps1`. Established `-DryRun` switch and timestamped proof folder under `docs/architecture/plans/MASTER/platform/config-registry/proof/`.

### Workspace boundary

- root `package.json`, `pnpm-workspace.yaml` (`packages/*`, `packages/features/*`, `apps/*`, `backend/*`, `tools/*` excluding `tools/spfx-shell`), `turbo.json`.
- `packages/project-site-provisioning/` — does **not** exist.

### Parallel execution-scaffold package (read-only reference)

- [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Audit_Report.md`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Audit_Report.md)
- [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Template_Consumer_Boundary.md`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Template_Consumer_Boundary.md)
- [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Implementation_Plan.md`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Implementation_Plan.md)
- [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Prompt_Package_Outline.md`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Prompt_Package_Outline.md)
- [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Risk_Register.md`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Risk_Register.md)
- [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Execution_Backlog.md`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/Phase_2_Execution_Backlog.md)

These remain the canonical *execution scaffolds* (dated, prompt-oriented). This audit is the *blueprint-layer* governance artifact and cross-references rather than duplicates them.

---

## Phase 1 Exit Verification

Validation re-run at baseline commit `7c8df18508383aafc4f3f426217e42e03a09f2ca` (`pnpm --filter @hbc/project-site-template validate:all`) reports:

| Check | Result |
|---|---|
| Schemas loaded | 15 |
| Contract instance (`template-contract.json`) | PASS |
| Valid fixtures | 14 / 14 PASS |
| Invalid fixtures correctly rejected | 7 / 7 PASS |
| `unexpectedOutcomes` | `0` |
| Integrity checks | 16 / 16 PASS |

Key integrity guarantees confirmed:

- `status.fullExtractionComplete = true` (check 4),
- all 14 families exist on disk and are listed and populated (checks 1–3),
- field maps present for the 12 Step 3 families (check 6),
- `object-catalog-field-disposition.json` has exactly 18 rows; OC-17 and OC-18 remain placeholder-only and Deferred (checks 7–8),
- Procore boundary constants intact: `noFullProcoreMirror: true`, `noProcoreSecrets: true`, `procoreWriteback_Deferred: true`, `ProcoreCompanyId` default `5280` (check 9),
- no secret-class field names or values outside invalid/ fixtures (check 10),
- no scaffold shorthand enums (`mvp` / `deferred` / `placeholder`) (check 11),
- no forbidden `ProjectType` tokens; no `Archived` in `ProjectStage` (checks 12–13),
- `modules.visibilityByStage` keys are exactly the six `ProjectStage` tokens (check 14),
- `seedRule` / `verticalSeeding` `keyedOn` is `"projectType"` wherever present (check 15),
- `package.json` declares no backend / SPFx / provisioning / Procore-runtime dependency markers (check 16).

**Conclusion:** Phase 1 exit gate is closed and Phase 2 implementation has not started. The contract is machine-readable, deterministic, and free of runtime leakage.

---

## Existing Provisioning Pattern Findings

### Reusable patterns

| Source | Pattern | Why reusable for Phase 2 |
|---|---|---|
| `backend/functions/src/services/safety-provisioning-service.ts` | `dryRun: boolean` flag + would-create / would-update outcomes + structured `ISafetyProvisionDiagnostic[]` | This is the only existing service that already separates planning from mutation cleanly. The Phase 2 planner should adopt the same shape for its dry-run output. |
| `backend/functions/src/services/graph-list-discovery-service.ts` | Read-only Graph discovery (`listExists`, `resolveListId`, `getWritableColumnNames`) with per-site client caching | Lets a planner determine current tenant state without ever invoking PnP mutation. Reusable as-is for plan-time diff against contract expectations. |
| `backend/functions/src/services/admin-control-plane/sharepoint-drift-service.ts` | Drift classification without automatic repair | Models the post-provision validation contract Phase 2 needs. |
| `backend/functions/src/services/admin-control-plane/evidence-service.ts` | Captures execution evidence for audit | Phase 2 proof-artifact contract should integrate with this pattern. |
| `tools/pnp-runner-local/scripts/provision-platform-configuration-registry.ps1` | `-DryRun` switch with timestamped Markdown + JSON proof emitted to a version-controlled `proof/` subfolder, reviewed before live run | Establishes the repo convention for "dry-run proof artifact precedes live mutation." Phase 2 must reuse this convention. |
| `backend/functions/src/services/sharepoint-common.ts` | Managed-identity token + PnP context construction + eventual-consistency `waitForSite` | The token/context construction can back a future executor adapter once the mutation gate is satisfied. |

### Patterns **not** reusable as-is

| Source | Problem | Required disposition |
|---|---|---|
| `backend/functions/src/services/sharepoint-provisioning-service.ts` `createSite()` | Site URL pattern `${tenantUrl}/sites/${projectNumber}-${slug}` does **not** match the PCC frozen convention `/sites/{ProjectBaseNumberNoHyphen}` (six-character base, non-numerics stripped). Site type defaults to communication-site rather than the team-site / M365-Group-connected default declared in the contract. | Do not call from the future Phase 2 path. URL derivation and site-type selection must be driven by the contract, applied by a new executor adapter only after the mutation gate is approved. |
| `SharePointProvisioningService` mutation methods (lists, fields, files, role assignments) | All execute immediately against the tenant; no dry-run mode; no audit pre-flight; `setGroupPermissions()` breaks role inheritance without an approval gate. | These must remain invisible to the planner. Any future executor adapter must pre-flight against an approved manifest, never call these directly from a planner or SPFx surface. |
| Hardcoded "Shared Documents" upload target | Couples the provisioning surface to an assumed library structure rather than to the contract's library family. | Library targets must come from the manifest, not from hardcoded service constants. |

### Existing package-boundary findings

- **`@hbc/project-site-template`** — schema-only; no runtime; `files` export limited to schemas, fields, contract, README, docs; devDeps only. Boundary is clean and must remain so.
- **`packages/provisioning/`** — mature, headless, project-intake lifecycle (Submitted → ReadyToProvision → Provisioning → Completed/Failed). It governs the *request* lifecycle, not the SharePoint *mechanics*. Reusing it for template-driven site provisioning would conflate two concerns and pollute its public surface. Phase 2 should not extend this package.
- **`packages/project-site-provisioning/`** — does not exist. This is the correct future home for the template consumer / planner / dry-run / proof-emission concern. Creation deferred to Phase 2 Step 2.
- **`backend/functions/`** — appropriate home for the future executor adapter only, after the mutation gate is satisfied. Must not host the planner.
- **`tools/pnp-runner-local/`** — appropriate home for operator-driven non-prod dry-run and apply runs against test tenants, reusing the existing proof-folder convention.

### Procore boundary

No SPFx → Procore code paths exist anywhere in the workspace. No Procore secrets are in source. The contract carries Procore integration as placeholder rows only (OC-17 / OC-18, both `extractionTreatment: placeholder-only`, `mvpTreatment: Deferred`), with `noFullProcoreMirror`, `noProcoreSecrets`, `procoreWriteback_Deferred` const-locked in `integrations.schema.json`. Phase 2 must continue to enforce this boundary; it is invariant.

---

## Gaps

1. **No manifest contract** — there is no machine-readable artifact representing "what the planner intends to provision on a specific tenant," with version, hash, frozen flags, and proof linkage. Phase 2 Step 2 must define this.
2. **No mutation lock primitive** — there is no shared TypeScript primitive enforcing `{ mutationLocked: true, liveMutationAllowed: false, requiresHumanApproval: true }` semantics. Required before any executor adapter is wired.
3. **No PCC-specific URL derivation utility** — `SharePointProvisioningService` derives URLs incorrectly for the PCC convention; the correct derivation does not exist anywhere in the workspace.
4. **No proof-artifact contract for site provisioning** — the config-registry proof convention is the only concrete precedent; Phase 2 must specify its own proof artifact shape consistent with that convention.
5. **No Phase 2 blueprint directory until this commit** — `docs/architecture/blueprint/sp-project-control-center/phase-2/` did not exist at the baseline commit and is created by this audit.
6. **No tenant-readiness rubric** — explicit non-prod tenant target, credential posture, rollback posture, and operator approval log are not yet codified. Phase 2 Step 3+ must address.

---

## Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Premature tenant mutation if a later step bypasses the dry-run / proof-artifact gate. | Mutation lock semantics codified in the consumer-boundary doc; executor adapter forbidden until gate passes. |
| R2 | URL drift — accidental reuse of `SharePointProvisioningService` URL pattern producing non-compliant site URLs. | Audit explicitly flags the mismatch; future planner must derive URL from contract, not from existing service. |
| R3 | Procore scope creep — a future planner step adding Procore runtime concerns. | `noFullProcoreMirror` / `noProcoreSecrets` / `procoreWriteback_Deferred` remain const-locked; consumer-boundary doc forbids Procore runtime in Phase 2. |
| R4 | Doc drift between blueprint phase-2 docs and plans-tree execution scaffold. | Blueprint cross-references plans-tree for execution detail; plans-tree treated as read-only reference; updates flow blueprint → plans, not bidirectionally. |
| R5 | Adding runtime deps to `@hbc/project-site-template` to "share types." | Boundary doc forbids it; types travel via the future consumer package or via `@hbc/models`, not via the template package. |
| R6 | Conflating `packages/provisioning/` (project-intake lifecycle) with the future template consumer. | Audit names the distinction; future package must be `packages/project-site-provisioning/`, separately scoped. |
| R7 | Hosted/tenant proof being conflated with package-scope validation. | Validation in this step is package-scope only; closeout doc explicitly labels hosted/tenant proof as operator-pending and out-of-scope until later steps. |

---

## Required Decisions

No new architecture decisions are introduced by this step. The audit ratifies existing invariants and the consumer-boundary direction already proposed in the plans-tree package. Items deferred to later steps (mutation-gate semantics, proof-artifact shape, executor-adapter contract) are decisions for Phase 2 Steps 2–4 and may warrant ADRs at that time if they prove durable.

---

## Recommended Phase 2 Path

Staged sequence, each gate documentation- or repo-evidence-bound before the next step is allowed to proceed:

1. **Step 1 — Audit & boundary documentation (this step).** Ratifies Phase 1 exit; freezes consumer boundary, mutation gate, and Procore/SharePoint/SPFx/backend seams in blueprint truth. No code.
2. **Step 2 — Scaffold `packages/project-site-provisioning/`.** Headless consumer package; loads `@hbc/project-site-template` contract; defines manifest contract + mutation-lock primitive + proof-artifact shape; pure planner; no Graph mutation; no PnP. Package-scope tests only.
3. **Step 3 — Deterministic dry-run mapper.** Produces JSON manifest + Markdown proof artifact for a given input. No tenant calls. Reuses Graph discovery only for read-only existence checks. Snapshot tests, not tenant proof.
4. **Step 4 — Dry-run proof artifact convention & operator review gate.** Codifies where proof artifacts live, what they contain, and what review is required before any live mutation.
5. **Step 5 — Non-production executor adapter under `backend/functions/`.** Consumes a frozen, signed manifest; calls Graph/PnP via existing token plumbing; never re-derives plan; emits drift / evidence via admin-control-plane services. Non-prod tenant only.
6. **Step 6 — Validation, drift, and rollback posture for non-prod runs.** Operator-pending hosted proof captured outside the repo; results referenced, never claimed, until operator confirms.
7. **Step 7 — Production gating.** Production mutation requires Step 6 evidence, ADRs for any durable decisions, and an explicit human approval log.

Only Steps 5–7 are allowed to mutate SharePoint. Steps 1–4 are documentation, planning, and read-only tooling.

---

## Validation / Proof Evidence

- **Validation command run:** `pnpm --filter @hbc/project-site-template validate:all`.
- **Result:** clean — 15 schemas loaded; contract + 14 valid fixtures pass; 7 invalid fixtures correctly rejected; `unexpectedOutcomes: 0`; 16/16 integrity checks pass.
- **Reports:** `packages/project-site-template/validation/reports/schema-validation-report.json` and `packages/project-site-template/validation/reports/contract-integrity-report.json` (deterministic, version-controlled).
- **Repo state:** baseline commit `7c8df18508383aafc4f3f426217e42e03a09f2ca`; only added paths in working tree are this Phase 2 blueprint directory and the small README cross-link.
- **Out-of-scope evidence:** SPFx build, backend test suite, tenant proof, hosted runtime proof — all operator-pending and explicitly not claimed in this step.

---

## Files Inspected

Schema package and reports:

- `packages/project-site-template/package.json`
- `packages/project-site-template/README.md`
- `packages/project-site-template/template-contract.json`
- `packages/project-site-template/schemas/` (15 schemas)
- `packages/project-site-template/fields/` (15 field-map files)
- `packages/project-site-template/validation/` (harness + 21 fixtures)
- `packages/project-site-template/validation/reports/schema-validation-report.json`
- `packages/project-site-template/validation/reports/contract-integrity-report.json`

Backend, admin, and tooling:

- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/sharepoint-provisioning-service.ts`
- `backend/functions/src/services/safety-provisioning-service.ts`
- `backend/functions/src/services/graph-list-discovery-service.ts`
- `backend/functions/src/services/sharepoint-common.ts`
- `backend/functions/src/services/__tests__/`
- `backend/functions/src/services/admin-control-plane/`
- `tools/pnp-runner-local/scripts/`
- `packages/provisioning/README.md` and `packages/provisioning/src/`
- root `package.json`, `pnpm-workspace.yaml`, `turbo.json`

Governing PCC docs and plans tree:

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` (headings only)
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` (headings only)
- `docs/architecture/blueprint/sp-project-control-center/phase-0/` (8 closeouts)
- `docs/architecture/blueprint/sp-project-control-center/phase-1/` (5 closeouts)
- `docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/` (7 planning files, treated as read-only reference)

---

## Cross-References

- Consumer boundary specification: [`Phase_2_Step_1_Consumer_Boundary.md`](./Phase_2_Step_1_Consumer_Boundary.md)
- Closeout and next-step readiness: [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md)
- Execution scaffolds (read-only): [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/)
