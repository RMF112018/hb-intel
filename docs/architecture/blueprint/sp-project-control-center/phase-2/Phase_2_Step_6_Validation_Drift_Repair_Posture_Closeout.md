# Phase 2 Step 6 — Validation, Drift / Repair Posture, and Closeout

**Effort:** SP Project Control Center (PCC) — Standard Project Site Template
**Companion to:** [`Phase_2_Step_1_Provisioning_Foundation_Audit.md`](./Phase_2_Step_1_Provisioning_Foundation_Audit.md), [`Phase_2_Step_1_Consumer_Boundary.md`](./Phase_2_Step_1_Consumer_Boundary.md), [`Phase_2_Step_1_Closeout.md`](./Phase_2_Step_1_Closeout.md), [`Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md`](./Phase_2_Step_2_Project_Site_Provisioning_Mapper_Scaffold_Closeout.md), [`Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md`](./Phase_2_Step_3_Provisioning_Manifest_Mapper_Expansion_Closeout.md), [`Phase_2_Step_4_Dry_Run_Proof_Artifact_Generation_Closeout.md`](./Phase_2_Step_4_Dry_Run_Proof_Artifact_Generation_Closeout.md), [`Phase_2_Step_5_Non_Production_Executor_Adapter_Boundary_Apply_Gate_Closeout.md`](./Phase_2_Step_5_Non_Production_Executor_Adapter_Boundary_Apply_Gate_Closeout.md)
**Final Phase 2 closeout:** [`Phase_2_Closeout.md`](./Phase_2_Closeout.md)
**Baseline commit (audit start):** `9de1b403b03c0b3e577d77e98d13ebecc05082f2`
**Date:** 2026-04-28

---

## Objective

Validate the full Phase 2 chain end-to-end, codify drift-detection and repair posture as bounded type-only contracts inside `@hbc/project-site-provisioning`, and produce the final Phase 2 closeout with Phase 3 entry conditions. No live execution.

## Files Created

- `packages/project-site-provisioning/src/contracts/drift-repair.ts`
- `packages/project-site-provisioning/src/drift-repair/validate-repair-posture.ts`
- `packages/project-site-provisioning/test/drift-repair.test.ts`
- `packages/project-site-provisioning/docs/Phase_2_Step_6_Validation_Drift_Repair_Closeout_Notes.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_6_Validation_Drift_Repair_Posture_Closeout.md` (this file)
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Closeout.md` (final Phase 2 closeout)

## Files Modified

- `packages/project-site-provisioning/src/index.ts` — exports the new drift/repair types, constants, and validators.
- `packages/project-site-provisioning/README.md` — Step 6 status; drift posture; repair posture; Phase 3 entry conditions; cross-link section updated.
- `docs/architecture/blueprint/sp-project-control-center/README.md` — surgical update to the Phase Closeouts table marking Phase 2 Complete and linking to `Phase_2_Closeout.md`; small cross-link section enumerating Steps 1–6.

No edits under `packages/project-site-template/**`, `backend/**`, `apps/**`, `tools/**`, SPFx manifests, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, or `pnpm-lock.yaml`.

## Validation Evidence

- **Phase 1 schema gate (pre and post):** clean — 15 schemas; contract + 14 valid fixtures pass; 7 invalid fixtures correctly rejected; `unexpectedOutcomes: 0`; 16/16 integrity checks pass.
- **`pnpm --filter @hbc/project-site-provisioning check-types`:** clean (`tsc --noEmit` exit 0).
- **`pnpm --filter @hbc/project-site-provisioning generate:proof`:** wrote committed baseline pair **byte-equal** to the existing files (no manifest content changed; `git diff packages/project-site-provisioning/proof/` produced no diff).
- **`pnpm --filter @hbc/project-site-provisioning test`:** 116/116 tests pass across 9 files (`provisioning-manifest`: 6, `no-mutation-guard`: 9, `site-plan-derivation`: 7, `contract-coverage`: 10, `scans`: 18, `dry-run-proof-artifact`: 18, `baseline-determinism`: 2, `apply-gate`: 27, `drift-repair`: 19).
- **Final scope check:** only files under `packages/project-site-provisioning/**` plus the three blueprint additions and the surgical README update.

## Drift Detection Posture

Codified in `src/contracts/drift-repair.ts`:

- `DriftDetectionPosture` carries `liveQueryAllowed: false`, `graphPnpCallAllowed: false`, `automaticRepairAllowed: false` as compile-time literal-typed constants.
- `DRIFT_COMPARISON_INPUTS` lists the 11 canonical inputs the future executor must compare.
- `DRIFT_CATEGORIES` (9 values) and `DRIFT_SEVERITIES` (4 values) pin the documented enums.
- `DriftEvidence` requires `manifestHash`, `proofArtifactHash`, `observedStateSummary`, `variances[]`, `detectedAt`, `operatorIdentity`, `environment` (`'non-production' | 'production-out-of-scope'`), `remediationRecommendation`.

The literal-typed flags make it a compile-time error to express any "live drift query", "automatic repair", or "Graph/PnP call" posture inside the Phase 2 contract surface.

## Repair Posture

Codified in `src/contracts/drift-repair.ts` and `src/drift-repair/validate-repair-posture.ts`:

- `RepairMode` enum: `manual-review-only`, `manual-repair-plan`, `future-assisted-repair`, `future-automated-repair`.
- `PHASE_2_ALLOWED_REPAIR_MODES`: `['manual-review-only', 'manual-repair-plan']`.
- `PHASE_2_FORBIDDEN_REPAIR_MODES`: `['future-assisted-repair', 'future-automated-repair']`.
- `RepairPosture` carries literal-typed `automaticTenantRepair: false`, `backgroundRepair: false`, `graphPnpRepair: false`, `spfxTriggeredRepair: false`, `newProofRequiredAfterRepair: true`, `newApplyGateDecisionRequired: true`.
- `validateRepairPosture` rejects any posture whose `currentMode` is forbidden, whose automatic-repair flags are not `false`, whose lifecycle reset flags are not `true`, or whose `allowedRepairModes` differs from the canonical Phase 2 set.
- `RepairPlan` requires `repairRef`, `driftCategory`, `severity`, `owner`, `manualRepairRunbookRef`, `preRepairSnapshotRequired`, `postRepairValidationRequired`, `approvalRequired`, `rollbackImpact`, `knownIrreversibleActions`, `recommendedAction`, `lifecycleStage`.
- `validateRepairPlan` enforces required fields, enum membership, and basic typing.

A repair-impacting change resets the apply-gate lifecycle: the manifest must be re-mapped, a fresh dry-run proof emitted, and a new apply-gate decision issued. Previous approvals do not carry forward.

## Phase 2 Shipped Summary

- **Step 1** (commit `5dea955f3`): Provisioning Foundation Audit + Consumer Boundary docs.
- **Step 2** (commit `66a9ef1b0`): `@hbc/project-site-provisioning` scaffold with manifest contract + mutation gate + minimal mapper.
- **Step 3** (commit `bbe2d92e0`): Contract-coverage mapper across all 14 contract families with deterministic `plannedHash` and three guard scans.
- **Step 4** (commit `33f80d58c`): Dry-run proof artifact generator + committed baseline pair + baseline-determinism gate.
- **Step 5** (commit `9de1b403b`): Non-production apply-gate boundary, decision shape, operator approval, target declaration, rollback posture.
- **Step 6** (this commit): Validation, drift/repair posture, Phase 2 closeout.

## Phase 2 Deferred Scope

- Backend executor adapter implementation (live Graph/PnP path).
- Live SharePoint apply.
- Tenant smoke test.
- SPFx admin workflow.
- Production approval / production provisioning.
- Automatic rollback / automatic repair.
- Procore runtime / write-back / mirror.
- Per-instance object enumeration beyond family-level coverage.
- Audit-trail persistence (contract documented; implementation deferred).
- `enforcementLayers` per object plan entry.
- Value-content secret scanning.

## Phase 3 Entry Conditions

1. Non-production tenant target explicitly approved.
2. Operator approval workflow defined.
3. Audit-trail persistence location selected.
4. Future executor identity and permission model approved.
5. Graph/PnP split finalized.
6. Rollback / manual repair runbook approved.
7. Drift detection contract accepted (pinned by `src/contracts/drift-repair.ts`).
8. Proof artifact hash / byte-match rule accepted.
9. Non-production smoke environment available.
10. Production explicitly out of scope until a later phase.
11. Security review for tenant mutation path complete.
12. No Procore runtime or write-back introduced.

## No-Mutation Confirmation

- All compile-time literal flags hold: `mutationLocked: true`, `liveMutationAllowed: false`, `requiresHumanApproval: true` (manifest); `dryRunOnly: true`, `tenantMutationAllowed: false` (proof artifact); `nonProductionOnly: true`, `tenantMutationPerformed: false` (apply-gate decision); `liveQueryAllowed: false`, `graphPnpCallAllowed: false`, `automaticRepairAllowed: false`, `automaticTenantRepair: false`, `backgroundRepair: false`, `graphPnpRepair: false`, `spfxTriggeredRepair: false` (drift/repair posture).
- Lifecycle reset flags hold: `newProofRequiredAfterRepair: true`, `newApplyGateDecisionRequired: true`.
- `src/drift-repair/**` and `src/contracts/drift-repair.ts` contain no `@pnp/`, `@azure/`, `@microsoft/sp-`, `spHttpClient`, or `GraphClient` reference.
- Public-export discipline scan continues to pass; new exports use posture/validation nouns and verbs (`validateRepairPosture`, `validateRepairPlan`, `DriftEvidence`, `RepairPlan`, etc.); no live-operation verb names exposed.

## Non-Production-Only Confirmation

- `DriftEvidence.environment` enum is `'non-production' | 'production-out-of-scope'`. Production drift is structurally out of scope.
- Apply-gate continues to reject `environment: 'production'`.
- Proof artifact's literal flags continue to enforce dry-run intent.
- No production approval can be expressed through the Phase 2 contracts.

## Procore Boundary Confirmation

- `noFullProcoreMirror`, `noProcoreSecrets`, `procoreWriteback_Deferred` const-locked in `integrations.schema.json`.
- `noProcoreMirrorScan` continues to gate every manifest passed through the apply-gate.
- No Procore SDK / HTTP client / secrets / mirror / write-back introduced anywhere in Phase 2.

## Backend / SPFx / Tools Boundary Confirmation

- No edits under `backend/**`, `apps/**`, `tools/**`, SPFx manifests.
- No new dependencies; no `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, or `pnpm-lock.yaml` changes.
- Future executor adapter boundary remains documented contract only; no backend code exists.

## Remaining Risks

- The committed baseline pair must be regenerated whenever any change touches manifest content (mapper, contracts, scans, renderer); CI's `baseline-determinism.test.ts` will catch drift but the regeneration step is human-initiated.
- The drift/repair contracts are documented posture, not active drift detection. Phase 3 must implement the executor adapter that actually compares observed tenant state against approved manifests.
- No production-readiness work is performed; production scope must remain out of bounds until a later, explicitly approved phase.
- Audit-trail persistence is contract-only; Phase 3 must select a storage backend and retention policy before any tenant call.
- The package's source-import discipline test relies on regex matching; sufficient for current scope but a future linting rule may want stricter coverage.

## Recommended Phase 3 Opening Prompt

> **Phase 3 Planning — Non-Production Executor Adapter Implementation Roadmap and Risk Gate**
>
> Open Phase 3 with planning, not implementation. Close the twelve entry conditions in order: non-production tenant target selection; operator approval workflow definition; audit-trail persistence selection; executor identity and permission model approval; Graph/PnP split finalization; rollback / manual repair runbook approval; drift detection contract acceptance against `@hbc/project-site-provisioning`'s drift-repair types; proof artifact hash / byte-match rule acceptance; non-production smoke environment provisioning; production-explicitly-out-of-scope ratification; security review for the tenant mutation path; explicit reaffirmation that no Procore runtime or write-back is introduced. Only after these gates close should Phase 3 begin executor adapter implementation under `backend/functions/`. Production approvals remain out of scope.

## Proposed Commit Summary

```
feat(pcc): add drift repair posture and close phase 2
```

## Proposed Commit Description

```
Manifest: SharePoint Project Control Center (Standard Project Site Template Contract)

Version: 1.0.0-proposed unchanged; this step validates and closes Phase 2 without changing the template contract surface.

Closes Phase 2 of the SP Project Control Center provisioning boundary
effort. Validates the full no-mutation chain end-to-end: template
contract validation, mapper determinism, dry-run proof artifact
regeneration (byte-equal to committed baseline), apply-gate validation,
locked mutation gate, non-production-only posture, and no tenant
execution evidence.

Adds bounded type-only drift-detection and repair-posture contracts plus
a pure validator inside @hbc/project-site-provisioning. Introduces
DRIFT_REPAIR_POSTURE_VERSION ('0.1.0-posture-doc') independently of the
manifest, proof artifact, and apply-gate versions. Compile-time literals
forbid liveQueryAllowed, graphPnpCallAllowed, automaticRepairAllowed,
automaticTenantRepair, backgroundRepair, graphPnpRepair, and
spfxTriggeredRepair. Lifecycle reset flags newProofRequiredAfterRepair
and newApplyGateDecisionRequired remain true.

Documents the future drift detection posture, manual repair posture,
future executor entry conditions, Phase 2 shipped scope, Phase 2
deferred scope, and Phase 3 planning prerequisites. Adds final Phase 2
closeout documentation and surgically updates the PCC blueprint README
to record Phase 2 completion.

Validation:
  - pnpm --filter @hbc/project-site-template validate:all (pre and
    post): clean (15 schemas; contract + 14 valid fixtures pass; 7
    invalid correctly rejected; unexpectedOutcomes: 0; 16/16 integrity
    checks pass)
  - pnpm --filter @hbc/project-site-provisioning check-types: clean
  - pnpm --filter @hbc/project-site-provisioning generate:proof: wrote
    baseline pair byte-equal to committed
  - pnpm --filter @hbc/project-site-provisioning test: 116/116 tests
    pass across 9 files

No tenant mutation. No backend route. No Azure Function. No SPFx
changes. No tools/PnP runner changes. No Graph/PnP operations. No
Procore runtime. No production apply readiness. No SPFx solution or
manifest version changes. No template contract version change. No edits
under packages/project-site-template/**, backend/**, apps/**, tools/**,
pnpm-workspace.yaml, turbo.json, tsconfig.base.json, or pnpm-lock.yaml.

Phase 2 status: Complete.
Phase 3 planning readiness: Ready.
```

---

## Cross-References

- [Phase 2 Closeout (final)](./Phase_2_Closeout.md)
- Step closeouts 1–5 listed at the top of this document.
- [`packages/project-site-provisioning/README.md`](../../../../../packages/project-site-provisioning/README.md)
- [`packages/project-site-provisioning/docs/Phase_2_Step_6_Validation_Drift_Repair_Closeout_Notes.md`](../../../../../packages/project-site-provisioning/docs/Phase_2_Step_6_Validation_Drift_Repair_Closeout_Notes.md)
- [PCC blueprint README](../README.md)
