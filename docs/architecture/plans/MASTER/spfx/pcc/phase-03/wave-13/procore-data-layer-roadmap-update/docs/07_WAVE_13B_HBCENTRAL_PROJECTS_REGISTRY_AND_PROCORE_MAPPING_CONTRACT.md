# Wave 13B — HB Central Projects Registry and Procore Mapping Contract

> Active execution authority. Models / fixtures / docs only. No runtime
> source change. No backend routes, no SPFx clients, no fetch calls, no
> mounted surfaces, no route constants. The read-model envelope key
> `'procore-project-mapping'` is added as a typed future seam only.

## 1. Authority

| Item                            | Value                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Active execution authority path | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/`         |
| Active execution authority wave | `wave-13`                                                                                             |
| Prior planning context (only)   | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-99-procore/` and its `_doc-updates/` subfolder |
| Prior planning context status   | `historical_context_only_non_authoritative`                                                           |

## 2. Objective

Materialize the decision locked by Wave 13A: PCC owns the canonical
project-to-Procore mapping. The HB Central `Projects` list is the
registry context; its `procoreProject` text field is captured as
`legacyProcoreHint` and is never sufficient on its own to satisfy a
confirmed canonical mapping.

This prompt delivers the four `13A` execution-matrix outputs for `13B`:

1. `PccProcoreProjectMapping` contract (discriminated union keyed on mapping state).
2. Projects-list field mapping (logical-to-internal field-name registry).
3. Query / index recommendations (machine-readable typed registry plus narrative below).
4. Mapping ownership and repair model (vocabulary + remediation hints + boundary helper).

## 3. Files Changed

The authoritative file list is captured at commit time via
`git diff --cached --name-only` and `git diff --cached --stat`. The
in-package scope is:

- `packages/models/src/pcc/PccProcoreProjectMapping.ts` (new)
- `packages/models/src/pcc/PccProcoreProjectMapping.test.ts` (new)
- `packages/models/src/pcc/fixtures/procoreProjectMapping.ts` (new)
- `packages/models/src/pcc/index.ts` (additive barrel re-export)
- `packages/models/src/pcc/PccReadModels.ts` (additive `'procore-project-mapping'` typed envelope key)
- `packages/models/src/pcc/PccReadModels.test.ts` (additive cascade for the response-map literal)
- `packages/models/src/pcc/NoMutationGuard.test.ts` (allowlist for the four new pure helpers)
- `packages/models/src/pcc/fixtures/index.ts` (barrel re-export + `procoreProjectMapping` group on `PCC_FIXTURES`)
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/docs/07_WAVE_13B_HBCENTRAL_PROJECTS_REGISTRY_AND_PROCORE_MAPPING_CONTRACT.md` (this document)

## 4. Mapping State Vocabulary

`PccProcoreProjectMappingState`:

- `unmapped` — no canonical mapping; `legacyProcoreHint` may be present in registry context but is informative only.
- `mapping-proposed` — a Procore candidate has been proposed; awaits PM/PX/integration-admin confirmation.
- `mapping-confirmed` — structured `procoreCompanyId` + `procoreProjectId` are present and confirmed by an owner.
- `mapping-stale` — previously confirmed; freshness band has degraded to `stale` or `expired`.
- `mapping-conflict` — multiple Procore candidates returned for the same registry context.
- `mapping-archived` — terminal; mapping retired with archive reason.

Allowed transitions are encoded in
`PCC_PROCORE_PROJECT_MAPPING_ALLOWED_TRANSITIONS`. Tests
(`PccProcoreProjectMapping.test.ts`) prove every documented transition
is allowed and every undocumented transition is rejected.

## 5. Owner-Role and Remediation-Hint Vocabularies

Owner roles (`PCC_PROCORE_PROJECT_MAPPING_OWNER_ROLES`):

- `project-manager-primary` — PM is the primary mapping owner.
- `project-executive-fallback` — PX assumes ownership when PM is unavailable.
- `integration-admin-remediation` — Integration admin handles conflict triage and recovery.
- `inherited-from-registry` — Ownership inferred from registry context only; no human action recorded.

Remediation hints (`PCC_PROCORE_PROJECT_MAPPING_REMEDIATION_HINTS`):

- `request-pm-confirmation`
- `request-px-fallback-confirmation`
- `request-integration-admin-review`
- `reconfirm-mapping`
- `investigate-conflicting-procore-records`
- `archive-and-restart-mapping`

These are advisory labels only. They do not authorize any runtime
action; downstream prompts (13D backend mock boundary, 13E SPFx
fixture integration) decide how to surface them.

## 6. Freshness Bands and Derivation

`PccProcoreProjectMappingFreshnessBand`:
`fresh | recent | stale | expired | unknown`.

`derivePccProcoreMappingFreshnessBand(nowUtc, lastConfirmedAtUtc, bounds?)`
is a pure deterministic helper. Both `nowUtc` and `lastConfirmedAtUtc`
are caller-supplied; the helper never reads a clock. Default bounds
are exposed as `PCC_PROCORE_PROJECT_MAPPING_DEFAULT_FRESHNESS_BOUNDS_DAYS`:

- `freshUpToDays = 30`
- `recentUpToDays = 90`
- `staleUpToDays = 180`
- beyond `staleUpToDays` → `expired`
- missing / unparseable / future-dated `lastConfirmedAtUtc` → `unknown`

## 7. HB Central Projects Registry Field Mapping

Logical-to-internal field-name registry exported as
`PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES`. Source: HB
Central Projects list schema at
`docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`.

| Logical name          | Internal field name   | Notes                                                                                 |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| `pccProjectId`        | `field_1`             | Canonical project identifier (Text 255).                                              |
| `projectNumber`       | `field_2`             | Human-assigned reference key (Text 255).                                              |
| `projectName`         | `field_3`             | Display name (Text 255).                                                              |
| `projectLocation`     | `field_4`             | Optional location string (Text 255).                                                  |
| `projectType`         | `field_5`             | Optional vertical context (Text 255).                                                 |
| `projectStage`        | `field_6`             | Optional stage; typed as the existing `PccProjectStage` enum (six frozen MVP values). |
| `siteUrl`             | `field_23`            | Optional SharePoint site URL.                                                         |
| `projectManagerUpn`   | `projectManagerUpn`   | Optional PM UPN (Text 255; not a Person field).                                       |
| `projectExecutiveUpn` | `projectExecutiveUpn` | Optional PX UPN (Text 255; not a Person field).                                       |
| `legacyProcoreHint`   | `procoreProject`      | Mirror of the legacy free-text Procore hint. **Informative only; never canonical.**   |

## 8. Indexing and Query Recommendations

Production list usage should index `field_1`, `field_2`,
`projectManagerUpn`, and `projectExecutiveUpn` for direct-lookup
patterns. Filter shapes for the legacy-hint field
(`is-null` / `is-not-null`) support unmapped-row identification and
hint-present triage workflows; no index is recommended on
`procoreProject` itself because it is an unstructured text field whose
content does not satisfy canonical mapping by itself.

The full machine-readable recommendation registry lives in
`SAMPLE_PROCORE_PROJECT_MAPPING_QUERY_RECOMMENDATIONS` and is surfaced
inside the read-model envelope as
`PccProcoreProjectMappingReadModel.queryRecommendations`.

## 9. Ownership and Repair Model

System-of-Record posture (aligned with
`docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`):

- PCC owns the canonical mapping configuration.
- HB Central `Projects` is the registry context (read-only mirror to PCC).
- Procore-native records (RFIs, submittals, commitments, etc.) remain Procore-owned.
- No write-back from PCC into Procore. No write-back into HB Central from PCC.

Repair / recovery flow:

1. PM (`project-manager-primary`) is the primary mapping owner.
2. If the PM cannot reconfirm, the PX (`project-executive-fallback`) may confirm.
3. Conflict triage and structural recovery are handled by the
   integration admin (`integration-admin-remediation`).
4. The mapping itself records the owner role and UPN at confirmation
   time; the discriminated union enforces these required fields at
   compile time.

The terminal state `mapping-archived` requires an `archiveReason` and
preserves the prior structured Procore identifiers for audit. The
discriminated union plus
`validatePccProcoreProjectMappingLegacyHintBoundary` enforce the
boundary at compile time AND at runtime: a confirmed mapping with an
empty `procoreCompanyId` or empty `procoreProjectId` fails the boundary
check even when `legacyProcoreHint` is populated.

## 10. Read-Model Envelope (Typed Future Seam Only)

`PccReadModelResponseMap['procore-project-mapping']` is added as a
typed future seam:

- No backend route is registered.
- No SPFx client is added.
- No `fetch` is introduced.
- No mounted PCC surface is created.
- No route constant is exposed.

13D will decide whether to wire a backend mock provider against this
envelope. 13E will decide whether and how a SPFx surface consumes it.

## 11. Validation

Per the active package's `validation_gates.json` and the prompt's
explicit validation set:

- `git status --short` (pre and post)
- `md5 pnpm-lock.yaml` (pre and post; expected unchanged at `c56df7b79986896624536aab74d609f4`)
- `pnpm --filter @hbc/models check-types`
- `pnpm --filter @hbc/models test`
- `pnpm --filter @hbc/models build`
- `pnpm exec prettier --check` on every touched Markdown / TypeScript file
- `python3 -m json.tool` on touched JSON (none touched in 13B)
- `git diff --check`

## 12. Guardrails Preserved

- No live Procore HTTP, no SDK adoption, no write-back, no Sage posting.
- No SPFx-to-Procore direct path.
- No `package.json`, `pnpm-lock.yaml`, SPFx manifest, backend route,
  shared model contract outside `pcc/**`, SPFx surface, tenant /
  deployment file, CI file, or historical `wave-99-procore/**` artifact
  modified.
- No blueprint authority docs edited (deferred to 13F).
- All helpers are pure and deterministic; clocks are caller-supplied
  via a `Date` parameter, never read from `Date.now()`.
- Fixtures use deterministic IDs, fixed ISO timestamps, only
  `https://example.invalid` URLs, and only `@example.com` UPNs.

## 13. Residual Risk

- Hosted / tenant / browser proof: not applicable (model contracts only).
- Blueprint authority updates (System_of_Record_Matrix § Procore project
  mapping ownership; HB Project Control Center Target Architecture
  Blueprint § Project Procore Mapping; Standard Project Site Template
  Contract registry-context references) are **deferred to 13F**.
