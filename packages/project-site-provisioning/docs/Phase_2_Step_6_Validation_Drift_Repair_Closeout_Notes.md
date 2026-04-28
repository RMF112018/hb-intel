# Phase 2 Step 6 — Validation, Drift, Repair, and Closeout Notes

**Package:** `@hbc/project-site-provisioning@0.1.0-scaffold`
**Manifest version (unchanged):** `0.2.0-contract-coverage`
**Proof artifact version (unchanged):** `0.1.0-dry-run-proof`
**Apply-gate decision version (unchanged):** `0.1.0-apply-gate`
**Drift/repair posture version introduced:** `0.1.0-posture-doc`
**Phase:** SP Project Control Center — Phase 2 Step 6 (final)
**Baseline commit:** `9de1b403b03c0b3e577d77e98d13ebecc05082f2`
**Date:** 2026-04-28

---

## Objective

Validate the full Phase 2 chain end-to-end, document the future executor adapter's drift-detection and manual repair posture as bounded type-only contracts plus a pure validator, and produce the final Phase 2 closeout with Phase 3 entry conditions. No live execution. No tenant calls. No backend / SPFx / Graph / PnP / Procore code paths.

## Files Created

```
packages/project-site-provisioning/
  src/
    contracts/
      drift-repair.ts                                 ← types + enums + version + sentinel
    drift-repair/
      validate-repair-posture.ts                      ← validateRepairPosture, validateRepairPlan
  test/
    drift-repair.test.ts                              ← 19 tests
  docs/
    Phase_2_Step_6_Validation_Drift_Repair_Closeout_Notes.md   ← this file
```

## Files Modified

- `packages/project-site-provisioning/src/index.ts` — exports the new types, constants, and validators.
- `packages/project-site-provisioning/README.md` — Step 6 status, drift posture, repair posture, Phase 3 entry conditions; cross-link section updated.

No edits under `packages/project-site-template/**`, `backend/**`, `apps/**`, `tools/**`, SPFx manifests, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, or `pnpm-lock.yaml`. The committed proof baseline pair regenerated **byte-equal** — no diff.

## Full Validation Chain Summary

| Link in chain | Result |
|---|---|
| Template contract validation (`pnpm --filter @hbc/project-site-template validate:all`) | clean (15 schemas; contract + 14 valid fixtures pass; 7 invalid correctly rejected; `unexpectedOutcomes: 0`; 16/16 integrity checks pass) |
| Template integrity report | clean — 16/16 |
| Mapper produces all 14 family-level object plan entries | yes (verified by `contract-coverage.test.ts`) |
| PCC URL derivation deterministic | yes (`site-plan-derivation.test.ts`) |
| `plannedHash` deterministic and content-sensitive | yes (`contract-coverage.test.ts`) |
| Dry-run JSON/Markdown proof regenerates byte-equal | yes (`baseline-determinism.test.ts`; Step 6 regeneration produced no diff) |
| Proof artifact non-execution sentinel intact | yes (`dry-run-proof-artifact.test.ts`, `validate-dry-run-proof-artifact.ts`) |
| Apply gate validates a non-production request without execution | yes (`apply-gate.test.ts`) |
| Apply gate rejects production | yes |
| Apply gate returns `tenantMutationPerformed: false` | yes — literal-typed |
| Apply gate returns `nonProductionOnly: true` | yes — literal-typed |
| Drift/repair posture rejects automatic-repair flags | yes (`drift-repair.test.ts`) |
| No public export exposes live-operation verbs | yes (`no-mutation-guard.test.ts`) |
| No prohibited runtime imports in scope-relevant source | yes (`no-mutation-guard.test.ts`) |
| No backend / SPFx / tools-PnP / Procore / tenant / template-contract leakage | yes (final scope check) |

## Drift Detection Posture

- **Comparison inputs (canonical 11):** approved-manifest, approved-proof-artifact, apply-gate-decision, tenant-observed-state, sharepoint-site-url-and-title, lists-libraries-pages-groups-permissions, source-coverage, object-family-coverage, expected-vs-observed-fields, expected-vs-observed-settings, plannedHash-and-proofArtifactHash. Pinned in `DRIFT_COMPARISON_INPUTS`.
- **Categories:** `none, informational, configuration-drift, schema-drift, permission-drift, content-placement-drift, integration-boundary-drift, security-drift, blocking-drift`. Pinned in `DRIFT_CATEGORIES`.
- **Severities:** `info, warning, error, blocking`. Pinned in `DRIFT_SEVERITIES`.
- **Required evidence shape (`DriftEvidence`):** `manifestHash`, `proofArtifactHash`, `observedStateSummary`, `variances[]`, `detectedAt`, `operatorIdentity`, `environment ('non-production' | 'production-out-of-scope')`, `remediationRecommendation`.
- **Literal no-execution flags on `DriftDetectionPosture`:** `liveQueryAllowed: false`, `graphPnpCallAllowed: false`, `automaticRepairAllowed: false`. The TypeScript compiler refuses any value other than `false`.

Phase 2 non-goals (preserved): no live drift query, no Graph/PnP call, no tenant observation, no automatic repair.

## Repair Posture

- **Repair modes (full set):** `manual-review-only`, `manual-repair-plan`, `future-assisted-repair`, `future-automated-repair`. Pinned in `REPAIR_MODES`.
- **Phase 2 allowed:** `manual-review-only`, `manual-repair-plan` (`PHASE_2_ALLOWED_REPAIR_MODES`).
- **Phase 2 forbidden:** `future-assisted-repair`, `future-automated-repair` (`PHASE_2_FORBIDDEN_REPAIR_MODES`).
- **Literal-typed flags on `RepairPosture`:** `automaticTenantRepair: false`, `backgroundRepair: false`, `graphPnpRepair: false`, `spfxTriggeredRepair: false`, `newProofRequiredAfterRepair: true`, `newApplyGateDecisionRequired: true`.
- **`RepairPlan` required fields:** `repairRef`, `driftCategory`, `severity`, `owner`, `manualRepairRunbookRef`, `preRepairSnapshotRequired`, `postRepairValidationRequired`, `approvalRequired`, `rollbackImpact`, `knownIrreversibleActions`, `recommendedAction`, `lifecycleStage`.
- **Lifecycle stages:** `detected → triaged → approved → manually-repaired → revalidated → closed` (`REPAIR_LIFECYCLE_STAGES`).
- **Lifecycle reset rule:** any repair-impacting change resets the chain. A new dry-run proof artifact must be generated, and a new apply-gate decision must be issued. The previous operator approval does not carry forward to a materially changed manifest/proof.

## Future Executor Entry Conditions (Phase 3 prerequisites)

1. Non-production tenant target explicitly approved (operator + IT decision recorded).
2. Operator approval workflow defined (UI/CLI surface, audit-trail location, scope boundaries).
3. Audit-trail persistence location selected.
4. Future executor identity and permission model approved (managed identity / app registration scope, least-privilege Graph permissions).
5. Graph/PnP split finalized.
6. Rollback / manual repair runbook approved.
7. Drift detection contract accepted (this step pins it via `src/contracts/drift-repair.ts`).
8. Proof artifact hash / byte-match rule accepted (mandatory before any tenant call).
9. Non-production smoke environment available.
10. Production explicitly out of scope until a later phase.
11. Security review for tenant mutation path complete.
12. No Procore runtime or write-back introduced.

## What Was Intentionally Not Implemented

- Backend executor adapter, Azure Functions, PnP runner scripts, SPFx wiring, admin UI, deployment changes, CI/CD changes.
- Tenant mutations, Graph mutations, PnP calls, SharePoint creation.
- Live drift query, automatic repair, background repair.
- Audit-trail persistence (contract documented; implementation deferred to Phase 3).
- Procore SDK / HTTP client / secrets / mirror tables / write-back.
- Production approval, production apply readiness.
- New ADRs.
- SPFx solution manifest or version bumps.
- Edits under `packages/project-site-template/**`, `backend/**`, `apps/**`, `tools/**`, root workspace config.

## Tests / Validations Run

| Command | Result |
|---|---|
| `git status --short` (pre and post) | scope verified |
| `pnpm --filter @hbc/project-site-template validate:all` (pre and post) | clean both runs |
| `pnpm --filter @hbc/project-site-provisioning check-types` | clean |
| `pnpm --filter @hbc/project-site-provisioning generate:proof` | wrote pair byte-equal to committed (no diff) |
| `pnpm --filter @hbc/project-site-provisioning test` | **116/116 tests pass across 9 files** (`provisioning-manifest`: 6, `no-mutation-guard`: 9, `site-plan-derivation`: 7, `contract-coverage`: 10, `scans`: 18, `dry-run-proof-artifact`: 18, `baseline-determinism`: 2, `apply-gate`: 27, `drift-repair`: 19) |

## Known Limitations

- Per-instance object enumeration deferred (carried from Step 3).
- `enforcementLayers` per family entry not populated.
- `noSecretScan` value-content scanning still deferred.
- Apply-gate proof byte-match is opt-in for the package validator; future executors must enforce it.
- Audit-trail persistence is documented only; not implemented in Phase 2.
- Drift detection is documented contract only; live drift query lives in Phase 3+.

## Phase 2 Closeout Recommendation

**Phase 2 Complete.** All chain links validated, all literal no-execution flags enforced at compile time and runtime, full test suite green, baseline regenerated byte-equal, scope check clean.

## Phase 3 Readiness Recommendation

**Ready for Phase 3 Planning.** Phase 3 must open with planning and a risk-gate closure, not immediate tenant mutation. The recommended Phase 3 prompt is *"Phase 3 Planning — Non-Production Executor Adapter Implementation Roadmap and Risk Gate"*, which closes the entry conditions above before any executor implementation begins.
