# Wave 14 Implementation Closeout

> Classification: Canonical Current-State — Wave 14 implementation closure record.
> Companion to `Wave_14_Documentation_Closeout.md` (planning/docs closure).
> Authority: implementation prompt package
> `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-14/prompts/`.

## Scope

Wave 14 — PCC-native Approvals & Checkpoints control layer. Implementation
prompts 01–07 mapped the approved Wave 14 contracts (target architecture,
domain/state machine, routing/permission, read-model/storage posture, source-
module integration, Wave 13G estimating checkpoint contract, HBI guardrails,
test/acceptance gates) into:

- `@hbc/models` PCC contracts and fixtures;
- `@hbc/functions` GET-only composite read-model route;
- `@hbc/spfx-project-control-center` read-model client + approvals surface
  shell + project home / project readiness integration seams +
  Wave 13G estimating checkpoint signals.

No live approval execution, command handlers, external-system writeback,
SharePoint/Graph/PnP mutation, package/dependency change, lockfile change,
manifest change, or tenant rollout occurred in Wave 14.

## Repo Truth

- Branch: `main`
- HEAD before Prompt 07: `fca4748bdc774c4e613b1f613f531aef6b8573d4`
- HEAD after Prompt 07: filled at commit time.
- Lockfile MD5 before: `c56df7b79986896624536aab74d609f4`
- Lockfile MD5 after: `c56df7b79986896624536aab74d609f4`

## Implementation Prompt 01–07 Commit Table

| Prompt | Commit        | Subject                                                                    | Date (UTC-04)    |
| ------ | ------------- | -------------------------------------------------------------------------- | ---------------- |
| 01     | `de0cd2a22`   | docs(pcc): Wave 14 Approvals/Checkpoints implementation prompt package     | 2026-05-04 19:14 |
| 02     | `6429aa91c`   | feat(models-pcc): wave 14 approvals & checkpoints contracts and fixtures   | 2026-05-05 03:18 |
| 03     | `c8be9337e`   | feat(functions-pcc): wave 14 approvals composite GET-only read-model route | 2026-05-05 03:52 |
| 04     | `99dcf8035`   | feat(spfx-pcc): wave 14 approvals read-model client + parity tests         | 2026-05-05 04:38 |
| 05     | `d55ef8fc0`   | feat(spfx-pcc): wave 14 approvals surface shell on read-model client       | 2026-05-05 05:25 |
| 06     | `fca4748bd`   | feat(spfx-pcc): wave 14 priority/readiness/wave-13G integration seams      | 2026-05-05 06:17 |
| 07     | (this commit) | docs(pcc): wave 14 prompt 07 implementation closeout and auditor handoff   | 2026-05-05       |

## File Scope Summary (Implementation Prompts 02–07)

### `@hbc/models` (Prompt 02 + supporting Prompt 03 edits)

- `packages/models/src/pcc/ApprovalCheckpoint.ts` — extended (Wave 14
  contract, decision shape, role-action, HBI refusal, redaction, stale-source,
  legacy-bridge helpers). Pure read-only.
- `packages/models/src/pcc/ApprovalCheckpoint.test.ts` — new (38 tests).
- `packages/models/src/pcc/CheckpointInstance.ts` — new + Prompt 03 extension.
- `packages/models/src/pcc/CheckpointInstance.test.ts` — new (29 tests).
- `packages/models/src/pcc/types.ts` — Wave 14 type extensions.
- `packages/models/src/pcc/index.ts` — public surface extensions.
- `packages/models/src/pcc/fixtures/approvals.ts` — new fixture set.
- `packages/models/src/pcc/fixtures/index.ts` — fixture index extension.
- `packages/models/src/pcc/fixtures/Fixtures.test.ts` — fixture-determinism
  coverage extension.
- `packages/models/src/pcc/NoMutationGuard.test.ts` — allowlist extension for
  Wave 14 pure helpers (`isTerminalApprovalRequestState`,
  `isApprovalRequestTransitionAllowed`, `isActionAllowedForRole`,
  `validateDecisionShape`, `isSupersededRequest`, `requiresEvidenceForAction`,
  `isHbiPrincipalKey`, `assertNoHbiAuthorityOnDecision`,
  `redactionContextPreservedFor`, `isStaleSourceReference`,
  `mapLegacyCheckpointToInstance`, `legacyCheckpointKind`).
- `packages/models/src/pcc/PccReadModels.ts` /
  `packages/models/src/pcc/PccReadModels.test.ts` — Prompt 03 read-model
  response-map extension.

### `@hbc/functions` (Prompt 03)

- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts` —
  GET-only composite approvals route registration.
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts` —
  routes test extension.
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts` —
  approvals composite mock provider.
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts` —
  new (97 lines). Known/unknown/backend-unavailable branches + envelope shape.
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts` —
  composite-route provider extension.

### `@hbc/spfx-project-control-center` (Prompts 04–06)

- `apps/project-control-center/src/api/pccReadModelClient.ts` /
  `pccBackendReadModelClient.ts` / `pccFixtureReadModelClient.ts` — narrow
  approvals read-model method extension. GET-only opt-in path. Fixture client
  is the synchronous default per `readModelMode` field.
- Corresponding `*.test.ts` files — parity tests, query-position proof,
  source-status mapping coverage.
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` — approvals
  added as fifth `readModelClient`-consuming surface (project-home,
  team-and-access, documents, project-readiness, approvals).
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx`,
  `PccApprovalsSurface.module.css`,
  `approvalsAdapter.ts`,
  `approvalsViewModel.ts`,
  `useApprovalsReadModel.ts` — approvals surface shell. Pure envelope-in
  adapter; loading state owned by hook only; structured action results.
- `apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx`,
  `PccProjectHomeReadModelContent.tsx`,
  `projectHomeAdapter.ts`,
  `projectHomeViewModel.ts`,
  `useProjectHomeReadModel.ts` — Wave 14 approvals/checkpoints summary card
  on Project Home (bento direct-child invariant preserved).
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`,
  `projectReadinessAdapter.ts`,
  `projectReadinessViewModel.ts` — readiness references seam.
- `apps/project-control-center/src/viewModels/approvalsPriorityActionsAdapter.ts`,
  `approvalsReadinessReferencesAdapter.ts` — new pure cross-surface adapters.
- Tests: `PccApprovalsSurface.test.tsx`,
  `PccApprovalsCheckpointsCard.readModel.test.tsx`,
  `approvalsAdapter.test.ts`, `useApprovalsReadModel.test.ts`,
  `approvalsPriorityActionsAdapter.test.ts`,
  `approvalsReadinessReferencesAdapter.test.ts`,
  `PccResponsibilityMatrixIntegration.test.tsx` (existing, integration
  preserved), `PccApp.optIn.test.tsx` (extended),
  `pcc-api-dormancy.test.ts` (extended router consumer-set assertion to
  include `approvals` as the fifth surface).

### Prompt 07 (this commit) — closeout-only

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/Wave_14_Implementation_Closeout.md`
  (new — this file).
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/Wave_14_Documentation_Closeout.md`
  (in-place edit — added Implementation Closeout cross-reference and
  refreshed auditor handoff; preserved prior planning/docs closure context).

No source files were modified in Prompt 07. The Wave 14 test inventory
already covers all fifteen Prompt 07 required guardrail categories
(model contract, state-machine, route-mode, reason-code/evidence,
stale-source/supersession, redaction/permission, HBI refusal, fixture
determinism, GET-only routes, fixture-first/backend-opt-in, rendering states,
disabled action reasons, import-boundary scans, structural no-runtime guards,
package/lockfile/manifest/workflow guardrails, bento direct-child invariant,
`readModelMode` field-name discipline). No targeted test additions were
required.

## Validation Command Table (Prompt 07)

All commands run from `/Users/bobbyfetting/hb-intel`. Lockfile MD5 sampled
before and after the run; identical, confirming no install or dependency
mutation occurred.

| Command                                                                                              | Result                                         |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `pnpm --filter @hbc/models check-types`                                                              | pass                                           |
| `pnpm --filter @hbc/models test`                                                                     | pass — 43 files, 695 tests                     |
| `pnpm --filter @hbc/functions check-types`                                                           | pass                                           |
| `pnpm --filter @hbc/functions test`                                                                  | pass — 139 files, 2354 tests, 3 skipped        |
| `pnpm --filter @hbc/spfx-project-control-center check-types`                                         | pass                                           |
| `pnpm --filter @hbc/spfx-project-control-center test`                                                | pass — 67 files, 1481 tests                    |
| `pnpm --filter @hbc/spfx-project-control-center build`                                               | pass — 740.12 kB JS / 54.64 kB CSS             |
| `pnpm exec prettier --check <Wave_14_Implementation_Closeout.md, Wave_14_Documentation_Closeout.md>` | pass                                           |
| `git diff --check`                                                                                   | pass                                           |
| `md5 pnpm-lock.yaml` (before/after)                                                                  | `c56df7b79986896624536aab74d609f4` (unchanged) |

## Required Test-Category Coverage Map

Mapping Prompt 07 required categories to existing repo coverage:

| Category                                      | Primary Coverage                                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| model contract coverage                       | `ApprovalCheckpoint.test.ts`, `CheckpointInstance.test.ts`, `Fixtures.test.ts`                                                                                              |
| state transition valid/invalid paths          | `ApprovalCheckpoint.test.ts` (`isApprovalRequestTransitionAllowed`)                                                                                                         |
| route-mode completion rules                   | `ApprovalCheckpoint.test.ts`, `CheckpointInstance.test.ts`                                                                                                                  |
| reason-code and evidence validation           | `ApprovalCheckpoint.test.ts` (`requiresEvidenceForAction`, `validateDecisionShape`)                                                                                         |
| stale-source and supersession blocking        | `ApprovalCheckpoint.test.ts` (`isStaleSourceReference`, `isSupersededRequest`)                                                                                              |
| redaction and permission visibility           | `ApprovalCheckpoint.test.ts` (`redactionContextPreservedFor`), `isActionAllowedForRole`                                                                                     |
| HBI no-authority/refusal behavior             | `ApprovalCheckpoint.test.ts` (`isHbiPrincipalKey`, `assertNoHbiAuthorityOnDecision`); SPFx `pcc-api-dormancy.test.ts` `FORBIDDEN_MUTATION_EXECUTION_IDENTIFIERS`            |
| fixture determinism                           | `Fixtures.test.ts`, `PccFixtureGuards.test.ts`                                                                                                                              |
| backend GET-only route behavior               | `pcc-mock-read-model-provider.test.ts`, `pcc-read-model-routes.test.ts`; SPFx `pcc-api-dormancy.test.ts` "backend HTTP client uses only GET"                                |
| SPFx fixture-first / backend opt-in           | `pccReadModelClient.test.ts`, `pccFixtureReadModelClient.test.ts`, `pccBackendReadModelClient.test.ts`, `pcc-api-dormancy.test.ts` factory-default `'fixture'` assertion    |
| SPFx rendering states                         | `PccApprovalsSurface.test.tsx`, `PccApprovalsCheckpointsCard.readModel.test.tsx`, `useApprovalsReadModel.test.ts`                                                           |
| disabled action reasons                       | `PccApprovalsSurface.test.tsx`                                                                                                                                              |
| no prohibited imports/runtime calls           | `pcc-import-guards.test.ts`, `pcc-api-dormancy.test.ts`, `NoRuntimeImports.test.ts`                                                                                         |
| no enabled mutation buttons/links             | `pcc-api-dormancy.test.ts` `FORBIDDEN_MUTATION_EXECUTION_IDENTIFIERS`; structural rendering tests                                                                           |
| package/lockfile/manifest/workflow guardrails | lockfile MD5 parity check above; no `package.json` / `*.manifest.json` / `package-solution.json` / `.github/workflows/**` was modified by any Wave 14 implementation prompt |
| bento direct-child invariant                  | `PccProjectHome.test.tsx`, `PccApp.bentoIntegration.test.tsx` (existing pattern preserved)                                                                                  |
| `readModelMode` field-name discipline         | `pcc-api-dormancy.test.ts` factory-mode assertion                                                                                                                           |

## Runtime Posture (preserved)

- Backend posture: GET-only composite read-model. No write routes,
  command handlers, or write-side state machines were registered.
- SPFx posture: fixture-first by default (`readModelMode: 'fixture'`).
  Backend opt-in path requires explicit consumer wiring; no production
  surface enables it as part of Wave 14.
- No live Microsoft Graph / PnP / SharePoint runtime.
- No Procore / Document Crunch / Adobe Sign runtime.
- No Power Automate runtime adoption (reference architecture only).
- HBI no-authority preserved at model, route, and SPFx layers.
- Wave 13G remains Estimating Workbench feature/UX authority. Wave 14 owns
  approval/checkpoint queue, routing, decision, and audit semantics; the
  Wave 13G estimating checkpoint contract is honored via signal seams,
  not by transferring source ownership.
- No `package.json`, `pnpm-lock.yaml`, SPFx `*.manifest.json`,
  `package-solution.json`, `.github/workflows/**`, CI config, deployment
  artifact, or tenant config was mutated by any Wave 14 implementation
  prompt.

## Residual Risks

- **Operator-pending hosted/tenant proof.** Package validation passes
  workspace-locally but does not constitute hosted SharePoint, app catalog,
  or tenant runtime evidence. Hosted browser proof, SPFx app catalog
  cataloging, and tenant smoke testing are operator-pending and out of
  scope for Wave 14.
- **No production rollout.** Wave 14 surfaces are mounted in the SPFx PCC
  app shell as preview/read-model consumers only. Production tenant
  exposure requires a separate authorization gate.
- **Live approval execution remains deferred.** No imperative action
  handlers, command bus, or write routes have been introduced. The
  approvals surface renders structured `{ opened, reason }` action
  results and refuses HBI-originated authoritative actions.
- **Source-system mutation deferred.** Wave 14 read-model never writes
  back to Procore, Document Crunch, Adobe Sign, Sage, Salesforce, or
  CRM. External systems remain authoritative for their own records.
- **Adapter scan limits.** Workspace-wide guards in
  `pcc-import-guards.test.ts` and `pcc-api-dormancy.test.ts` are
  substring/identifier-form scans. They cover the listed vendor and
  identifier set but cannot prevent novel attack vectors that do not
  appear in the configured allowlists/denylists. Future waves should
  extend these lists when introducing new external-runtime concerns.
- **HBI grounding posture.** HBI evidence summarization is preview-only
  and citation-bounded. No vector store, embedding model, or LLM SDK
  is wired in. Future Ask-HBI hardening must preserve no-runtime guards
  and the citation-only doctrine.

## Follow-On Hardening Recommendations

These are recommendations only; none are authorized in Wave 14.

1. Command-execution gate (separate authorization). Required before any
   live approval write. Must include: write-route registration, command
   bus, optimistic-concurrency guard, audit-event emission, redaction
   replay guard, and HBI refusal at the command-bus boundary.
2. Source-module integration gate. Required before a real
   `pcc-read-model-provider` adapter binds Procore, Document Crunch, or
   Adobe Sign. Each integration needs its own freshness, redaction,
   stale-source, and unauthorized-call guard test.
3. SharePoint list/library schema gate. Required before any audit
   persistence. Schemas, taxonomy, retention, and permission-set must
   be authored under the SharePoint schema authority and gated by the
   tenant deployment specialist.
4. Hosted/tenant proof gate. Required before claiming runtime parity.
   Includes SPFx app catalog cataloging, tenant smoke tests, and operator
   browser evidence with redaction review.
5. CI/CD wiring. Required before automated package/release flow. Must
   pass through workflow change review and tenant deployment review.

## Guardrail Attestation

- No external-system mutation introduced.
- No backend write routes registered.
- No tenant / SharePoint list / SharePoint group / security group / role
  assignment mutation.
- No `package.json`, `pnpm-lock.yaml`, SPFx `*.manifest.json`,
  `package-solution.json`, `.github/workflows/**`, CI config, deployment
  artifact, or tenant config mutation.
- No new dependency, install, or update command run.
- No broad `prettier --write` or repo-wide formatting churn.
- No `docs/architecture/plans/**` mutation outside the Prompt 07 prompt
  package itself (which was authored in an earlier commit, `de0cd2a22`).
- HBI no-authority preserved at model, route, SPFx adapter, and SPFx
  surface layers.
- Wave 13G estimating feature/UX ownership preserved.
- Power Automate not used as MVP runtime dependency.
- Lockfile MD5 unchanged across Prompt 07 (`c56df7b79986896624536aab74d609f4`).

## Auditor Handoff

- Implementation prompt package:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-14/prompts/`.
- Per-prompt implementation specs:
  `01_Wave_14_Implementation_Readiness_Audit.md` …
  `07_Tests_Guardrails_And_Implementation_Closeout.md`,
  plus `08_Fresh_Reviewer_Prompt.md`.
- Reference set:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-14/reference/`.
- Architecture authority:
  `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/`
  (this folder).
- Documentation/planning closure:
  `Wave_14_Documentation_Closeout.md` (companion artifact).
- Validation evidence: command table above; commit table above.
- Operator-pending proof: hosted/tenant/browser evidence is **not**
  captured in Wave 14 and remains operator-pending.

Auditor must independently verify Implementation Prompt 01–07 commits
and validation outcomes without introducing runtime, code, package, or
tenant mutations.
