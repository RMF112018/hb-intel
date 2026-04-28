# Phase 2 Step 1 — Consumer Boundary Specification

**Effort:** SP Project Control Center (PCC) — Standard Project Site Template
**Companion to:** [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md)
**Baseline commit:** `7c8df18508383aafc4f3f426217e42e03a09f2ca`
**Date:** 2026-04-28

---

## Purpose

This document fixes the architectural boundaries that any Phase 2 implementation step must respect. It does not introduce new architecture; it ratifies the schema-only Phase 1 exit, names the future template consumer, and locks the gates between contract → planner → manifest → proof → executor → tenant.

Execution-level prompts and dated step backlogs live in [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/) and are referenced rather than duplicated here.

---

## 1. Source-of-Truth Hierarchy

When sources disagree, resolve in this order:

1. Verified live repo state (baseline `7c8df18508383aafc4f3f426217e42e03a09f2ca`) and the validation reports under `packages/project-site-template/validation/reports/`.
2. [`docs/architecture/blueprint/current-state-map.md`](../../../current-state-map.md).
3. [`docs/architecture/blueprint/package-relationship-map.md`](../../../package-relationship-map.md).
4. [`Standard_Project_Site_Template_Contract.md`](../Standard_Project_Site_Template_Contract.md) — implementation source of truth for site structure.
5. [`HB_Project_Control_Center_Target_Architecture_Blueprint.md`](../HB_Project_Control_Center_Target_Architecture_Blueprint.md) — strategic target architecture.
6. This document and the audit / closeout in `phase-2/`.
7. Plans-tree execution scaffolds in `docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/` (dated; subordinate to blueprint).

Plans-tree files are *execution scaffolds*, not architectural truth. If they conflict with this document, this document governs.

---

## 2. Package Responsibilities

| Package / Surface | Responsibility | Allowed | Forbidden |
|---|---|---|---|
| `@hbc/project-site-template` | Schema, contract, validation harness, fixtures, field maps, object catalog. | JSON Schema (Draft 2020-12), AJV-based validation, structural integrity checks, deterministic reports. | Runtime code. Backend code. SPFx code. Graph / PnP clients. Procore runtime. Secrets. Any dependency that is not a schema/validation tool. |
| `packages/project-site-provisioning/` (future, **not created in this step**) | Headless template consumer: load contract → produce deterministic provisioning manifest → emit dry-run proof artifact. | TypeScript planning logic; reads `@hbc/project-site-template`; reuses `@hbc/models` types where appropriate; uses `GraphListDiscoveryService` patterns for *read-only* tenant inspection only via an injected adapter; produces proof-artifact JSON + Markdown. | Direct tenant mutation. Direct Graph / PnP mutation. SPFx imports. Procore runtime. Secrets. React component exports. Any executor responsibility. |
| `backend/functions/` | Future executor adapter only — consumes a *frozen, signed, approved* manifest and applies it via Graph / PnP using existing managed-identity plumbing. Hosts admin-control-plane drift / evidence services. | Mutation only when the mutation gate is satisfied; reuses `SharePointCommon` token + context helpers; emits evidence via `admin-control-plane/evidence-service`. | Hosting the planner. Re-deriving plans inside the executor. Re-using `SharePointProvisioningService.createSite()` URL pattern (mismatched with the PCC frozen convention). Calling Procore directly without the existing backend integration boundary. |
| `tools/pnp-runner-local/` | Operator-driven non-prod tenant runs: dry-run + apply against approved manifests; reuses the established `-DryRun` switch and timestamped `proof/` folder convention. | Non-prod tenant mutations after operator review of proof artifacts. | Production tenant mutation. Use of unsigned manifests. Bypass of the proof-folder convention. |
| SPFx PCC surfaces (future `apps/project-control-center/`) | Read-only consumption of contract metadata exposed through approved typed surfaces; user-facing settings UI that writes via backend executor. | Reading template metadata via approved typed surfaces (e.g., generated from `@hbc/models` or the future consumer package). | Direct Graph mutation. Direct PnP mutation. Direct Procore calls. Bypassing PCC settings to use native SharePoint admin UI. |
| Admin / control-plane (`backend/functions/src/services/admin-control-plane/`) | Drift detection, evidence capture, install verification post-provision. | Reading approved manifests and live tenant state to classify drift; emitting evidence consumable by SPFx surfaces and PCC operators. | Performing repair without the mutation gate. Bypassing operator review for drift classified above an established severity. |
| SharePoint tenant resources | Mutation target only. | State changed exclusively via the executor adapter operating on an approved manifest. | Any other mutation path during Phase 2. |
| Procore | Out of scope for Phase 2 runtime. | Reference and placeholder schema only (OC-17 / OC-18). | Runtime API calls of any kind. Secrets. Mirror tables. Write-back. SPFx-direct calls. |
| Sage Intacct | Out of scope; remains accounting book of record. | Read-side references via existing integration paths. | Any provisioning-driven coupling in Phase 2. |

---

## 3. Allowed Dependencies (directional)

```
@hbc/project-site-template        (no upstream deps in repo; devDeps only)
        ▲
        │  read contract + fixtures
        │
packages/project-site-provisioning/   (future; loads contract, produces manifest + proof)
        ▲                                      ▲
        │  consume types                       │  read-only tenant inspection
        │                                      │
SPFx PCC surfaces (read-only types)     backend/functions executor adapter
                                                ▲
                                                │  approved manifest + evidence
                                                │
                                       SharePoint tenant (mutation)
```

- `packages/project-site-provisioning/` may depend on `@hbc/project-site-template` and `@hbc/models`.
- `backend/functions/` executor adapter may depend on `packages/project-site-provisioning/` *types only* (manifest shape) plus existing `SharePointCommon` and admin-control-plane services. It must not pull the planner.
- SPFx surfaces depend on read-only typed views; they must not depend on the executor.

## 4. Forbidden Dependencies

- `@hbc/project-site-template` → anything runtime, backend, SPFx, Graph, PnP, Procore.
- `packages/project-site-provisioning/` → tenant mutation, PnP mutation, SPFx, Procore runtime, secrets.
- SPFx PCC surfaces → Procore runtime, direct Graph mutation, direct PnP mutation.
- `backend/functions/` executor → re-deriving plans, calling `SharePointProvisioningService.createSite()` directly with its current URL pattern, mutating outside the approved manifest.
- Any package → adding Procore secrets to source, SharePoint, SPFx, markdown, or client config.

---

## 5. Allowed Data Flow

```
contract (template-contract.json + family schemas)
   │
   ▼
planner (project-site-provisioning)  ──► manifest (mutationLocked=true)
                                            │
                                            ▼
                                       proof artifact (JSON + Markdown, version-controlled)
                                            │
                                            ▼
                                       operator review + approval log
                                            │
                                            ▼
                                       executor adapter (backend/functions)
                                            │
                                            ▼
                                       SharePoint tenant (non-prod first)
                                            │
                                            ▼
                                       drift + evidence (admin-control-plane)
                                            │
                                            ▼
                                       SPFx PCC surfaces (read-only)
```

## 6. Forbidden Data Flow

- planner → tenant directly,
- SPFx → Procore directly,
- secrets through any layer of source, SharePoint, or client config,
- Procore → SharePoint as a full mirror,
- executor → tenant without an approved, frozen manifest.

---

## 7. Mutation Boundary

A manifest must be considered immutable once produced. The mutation gate consists of:

- `mutationLocked: true` — the manifest has been frozen by the planner.
- `liveMutationAllowed: false` until an explicit operator action sets it true alongside an approval log entry.
- `requiresHumanApproval: true` — the executor must refuse to run on a manifest where this is unset or false.
- A version-controlled proof artifact (JSON + Markdown) accompanying the manifest.
- A target-tenant declaration (non-prod first; production gated separately).

The mutation primitive itself will be defined in Phase 2 Step 2 inside `packages/project-site-provisioning/`. Any executor that mutates tenant state without honoring all of the above is a defect.

---

## 8. Dry-Run Boundary

The planner produces a deterministic manifest plus a Markdown proof artifact. Reading current tenant state via `GraphListDiscoveryService` is allowed for diff purposes. Mutating any tenant resource from the planner is forbidden. Repeated runs against the same input must produce byte-identical manifests and proofs (subject to declared timestamp fields).

---

## 9. Tenant Safety Gates

Before any live tenant mutation in any Phase 2 step:

1. Contract validation passes (`pnpm --filter @hbc/project-site-template validate:all`).
2. Mapper / planner determinism is demonstrated (snapshot tests).
3. A dry-run manifest exists and is version-controlled.
4. A proof artifact exists and is version-controlled.
5. Site URL convention compliance is verified against the contract: `/sites/{ProjectBaseNumberNoHyphen}` (six characters of the accounting project number with non-numerics stripped).
6. List / library / page / group / permission entries in the manifest match the contract families and respect the 10 MVP + 3 Deferred permission templates.
7. No-secret scan passes on manifest and proof.
8. No-Procore-mirror scan passes on manifest and proof.
9. Graph / PnP execution is confined to the executor adapter.
10. Rollback posture is documented for the manifest under review (manual repair if needed; documented in proof).
11. Target tenant readiness is confirmed: non-prod first; credential posture validated; operator approval logged.

Production gating requires every gate above plus durable architectural decisions captured as ADRs.

---

## 10. Procore Boundary

| Rule | Status |
|---|---|
| SPFx may call Procore directly | **Forbidden.** |
| Procore secrets may live in SharePoint, SPFx, markdown, repo source, or client config | **Forbidden.** |
| SharePoint may serve as a full mirror of Procore transactional data | **Forbidden.** |
| Procore write-back from PCC | **Deferred from MVP.** |
| Procore Company ID handling | `ProcoreCompanyId = 5280`; configuration, not a secret. |
| Procore API traffic | Routed exclusively through `backend/functions/`. |

These remain const-locked in `integrations.schema.json` (`noFullProcoreMirror: true`, `noProcoreSecrets: true`, `procoreWriteback_Deferred: true`) and are integrity-checked.

## 11. SharePoint / Graph / PnP Boundary

- Read-only Graph discovery is allowed in the planner via injected adapter.
- All mutation via PnP / Graph is confined to the future executor adapter under `backend/functions/`.
- Site URL derivation must follow the contract convention; the existing `SharePointProvisioningService.createSite()` URL pattern must not be reused.
- Library / list / page / permission targets come exclusively from the manifest.
- Eventual-consistency waits and managed-identity token construction may reuse `SharePointCommon` helpers.

## 12. SPFx Boundary

- SPFx surfaces read template metadata via approved typed surfaces only.
- SPFx surfaces do not call Graph or PnP for provisioning.
- SPFx surfaces do not call Procore.
- Normal users operate through PCC settings, not native SharePoint settings.

## 13. Backend Boundary

- The executor adapter is the only Phase 2 backend surface that mutates tenant state.
- The executor adapter consumes a frozen, signed, approved manifest; it does not re-derive plans.
- The executor adapter emits evidence via `admin-control-plane/evidence-service`.
- The executor adapter does not host the planner.

---

## 14. Proof Artifact Requirements

For every dry-run that may eventually drive a live mutation:

- A JSON manifest with the mutation-gate fields populated and a stable hash of normalized contract inputs.
- A Markdown proof document summarizing intent, derived URL, family-by-family target counts, integrity-check parity with the contract, and any read-only Graph discovery observations.
- Both artifacts version-controlled and stored consistent with the existing `tools/pnp-runner-local` proof-folder convention (timestamped, dated subfolder).
- A no-secret scan and a no-Procore-mirror scan attestation in the Markdown proof.
- Operator review notes recorded alongside the artifacts before any executor invocation that flips `liveMutationAllowed`.

The exact shape of these artifacts will be specified in Phase 2 Step 2 inside `packages/project-site-provisioning/`. This document fixes the requirement; the implementation step fixes the schema.

---

## 15. Cross-References

- Audit and reusable-pattern findings: [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md)
- Closeout and Phase 2 Step 2 readiness decision: [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md)
- Execution scaffolds (read-only): [`docs/architecture/plans/MASTER/spfx/pcc/phase-02/step-1/`](../../../plans/MASTER/spfx/pcc/phase-02/step-1/)
- Phase 1 closeouts: [`../phase-1/`](../phase-1/)
- Procore boundary reference: [`../procore_hbintel_data_model_package/`](../procore_hbintel_data_model_package/)
