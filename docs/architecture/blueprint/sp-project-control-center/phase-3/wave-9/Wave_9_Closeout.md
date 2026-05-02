# Wave 9 — Project Lifecycle Readiness Center Closeout

## 1. Executive summary

Phase 3 Wave 9 implemented the **Project Lifecycle Readiness Center** end
to end: backend GET-only read model, SPFx client/fixture/router seam,
9-region command surface inside the existing PCC Project Readiness
surface, item-level detail with full source traceability and degraded
states, and display-only readiness signals that prepare a future,
separately-authorized Priority Actions / Approvals integration.

Posture is **fixture-default, read-only, and operator-pending for hosted
proof**. No live Microsoft Graph, SharePoint REST, PnP, Procore, Sage,
Outlook, Document Crunch, Adobe Sign, Safety platform, approval
execution, queue mutation, notification, or workflow runtime was
introduced. No package, lockfile, manifest, workflow, deployment, or
tenant change was introduced. The lockfile MD5 baseline is preserved.

This closeout records the implementation evidence across five
implementation commits and hands off to **Wave 10 — Permit & Inspection
Control Center** (legacy: "Permit Log").

## 2. Files changed by prompt

| Prompt                                                        | Commit                                                                 | Implementation surface                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 02 — Shared lifecycle-readiness models and fixtures           | `eee62cf13 feat(models-pcc): add lifecycle readiness contracts`        | `packages/models/src/pcc/LifecycleReadiness.ts` + `packages/models/src/pcc/fixtures/lifecycleReadiness.ts` (new); index re-exports                                                                                                                                                                                                                                                                                                            |
| 03 — Backend mock read model and GET route                    | `1c13adde2 feat(functions-pcc): add lifecycle readiness read model`    | `backend/functions/src/hosts/pcc-read-model/**` — provider contract `getLifecycleReadiness`, mock provider, GET route `pcc/projects/{projectId}/lifecycle-readiness`, response-map registration                                                                                                                                                                                                                                               |
| 04 — SPFx client / fixture parity / router seam               | `afdc45137 feat(spfx-pcc): add lifecycle readiness client seam`        | `apps/project-control-center/src/api/pccReadModelClient.ts`, `pccFixtureReadModelClient.ts`, `pccBackendReadModelClient.ts`; narrow `IPccProjectReadinessReadModelClient` extension; co-located client tests; app-local `README.md`                                                                                                                                                                                                           |
| 05 — Project Lifecycle Readiness Command Surface              | `cee86c619 feat(spfx-pcc): build lifecycle readiness center surface`   | `apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessViewModel.ts` (new), `lifecycleReadinessAdapter.ts` (new), `lifecycleReadinessAdapter.test.ts` (new); `PccProjectReadinessSurface.tsx` extended with 8 lifecycle region cards as direct Fragment children; `PccProjectReadinessSurface.test.tsx` extended; app-local `README.md`                                                                                 |
| 06 — Item Detail / Evidence / Risk / Degraded States          | `0a61d53dd feat(spfx-pcc): add lifecycle readiness item detail states` | Lifecycle view-model gains `IPccLifecycleItemDetailViewModel` and per-region `cardState`; adapter gains `buildItemDetail`; surface gains inline `LifecycleItemDetailPanel` rendered via native `<details>/<summary>`; CSS minimal additions; tests extended                                                                                                                                                                                   |
| 07 — Readiness Signals (Priority Actions / Approvals posture) | `278a3a9df feat(spfx-pcc): surface lifecycle readiness signals`        | View-model gains `PccLifecycleReadinessSignalKind` union (7 kinds) + new region view-models + per-item `signals`; adapter gains `deriveSignals` + `buildReadinessSignals`; surface gains 9th lifecycle region card `lifecycle-readiness-signals`; per-item signal chips inside detail panel; fixture additive population on 4 existing optional fields (no model interface change); new `Wave_9_Readiness_Signals_Handoff.md`; tests extended |

Total: five implementation commits and one prior handoff doc, before
this closeout.

## 3. Implemented model / read-model / fixture posture

- `@hbc/models` exposes the lifecycle-readiness contracts via
  `packages/models/src/pcc/LifecycleReadiness.ts` and its fixtures via
  `packages/models/src/pcc/fixtures/lifecycleReadiness.ts`. All
  vocabulary tuples are published with literal `as const` arrays:
  families (3), phases (10), domains (12), item types (10), criticality
  (5), statuses (12), exception codes (10), gates (9), evidence policies
  (6), ownership classifications (4), external reference systems (9),
  recurrence cadences (5).
- The read-model interface `ILifecycleReadinessReadModel` exposes
  `summary`, `templateLibraryMetadata`, `sampleTemplateItems`,
  `sampleProjectItems`, `gates`, `domains`, `phases`, `evidenceSummary`,
  `blockerSummary`. `PccLifecycleReadinessReadModel` is the alias
  surfaced through `PccReadModelResponseMap['lifecycle-readiness']`.
- Sample fixture: 10 template items, 10 project items, 5 gate summaries,
  5 domain summaries, 5 phase summaries, 4 evidence-state buckets, 5
  blocker-state buckets, headline posture `at-risk`, total project items 10. Prompt 07 additively populated `approvalCheckpointReference` on
  `inst-startup-002` and `inst-safety-002`, and
  `relatedPriorityActionId` on `inst-startup-003` and
  `inst-closeout-001` — no new sample items, no removed fields, no
  vocabulary churn.
- The SPFx fixture client mirrors the backend mock provider's degraded
  envelope shape (`EMPTY_LIFECYCLE_READINESS_READ_MODEL` parity),
  preserving the canonical 157 / 55 / 32 / 70 library metadata in
  `source-unavailable` and `backend-unavailable` envelopes.

## 4. Backend route / provider posture

- Provider contract: `IPccReadModelProvider.getLifecycleReadiness(projectId, viewerPersona?)`
  returning `Promise<PccReadModelEnvelope<PccLifecycleReadinessReadModel>>`.
- Mock provider implementation:
  - **known project** → `available` envelope using
    `SAMPLE_LIFECYCLE_READINESS_READ_MODEL`;
  - **unknown project** → `source-unavailable` envelope using a
    backend-mock `EMPTY_LIFECYCLE_READINESS_READ_MODEL` that preserves
    canonical 157 / 55 / 32 / 70 `templateLibraryMetadata` and zeroed
    `summary.statusCounts` over `LIFECYCLE_READINESS_STATUSES`;
  - **backend-unavailable** → same empty payload with the
    `backend-unavailable` warning code.
- Route: HTTP **GET** `pcc/projects/{projectId}/lifecycle-readiness`
  registered alongside the prior nine PCC read-model routes (10 total
  PCC read-model routes after Wave 9). The handler unwraps the
  provider's envelope inside the standard `successResponse({ data:
envelope })` wrapper.

## 5. SPFx UI posture

- `IPccReadModelClient` exposes 10 read-model methods including
  `getLifecycleReadiness(projectId, viewerPersona?)`. Default mode
  remains `'fixture'`; backend mode is opt-in via `readModelMode:
'backend'` + `backendBaseUrl`.
- The PCC Project Readiness surface renders a Fragment of direct
  `PccDashboardCard` children — the bento direct-child invariant is
  preserved end to end. After Wave 9, the surface contains:
  - **8 Wave 8 framework regions** (unchanged): hero (carries the single
    `data-pcc-active-surface-panel="project-readiness"` marker),
    `lifecycle-gates`, `domains`, `blockers`,
    `ownership-accountability`, `priority-actions-preview`,
    `evidence-source-health`, `downstream-modules`;
  - **9 Wave 9 lifecycle regions**, each carrying
    `data-pcc-readiness-section="lifecycle-readiness-center"`:
    `lifecycle-hero`, `lifecycle-map`, `lifecycle-family-domains`,
    `lifecycle-my-actions`, `lifecycle-blockers-exceptions`,
    `lifecycle-evidence-readiness`, `lifecycle-future-closeout`,
    `lifecycle-source-traceability`, `lifecycle-readiness-signals`.
- Item-level progressive disclosure uses native `<details>/<summary>`
  inside My Actions, Blockers, and Future Closeout regions; each detail
  panel renders ~30 record-backed fields with honest `Not listed`
  placeholders for unpopulated optional values.
- All controls are inert: no `<a href>`, no enabled buttons, no
  `onClick` workflow handlers, no runtime API clients.

## 6. Canonical item-library coverage and source-traceability posture

- **`templateLibraryMetadata`**: total **157** items distributed across
  **3** canonical source documents — the startup, safety, and closeout
  HB checklists. The total and per-family counts are preserved in both
  the SPFx fixture client and the backend mock provider's degraded
  payload.
- **Source-traceability per item**: each lifecycle template item carries
  a `sourceTrace` with `family`, `sourceFile`, `page`, `section`,
  `sourceId`, `sourceItemId`, `itemKey`, `exactItemText`, optional
  `details` and `responseOptions`, and `sourceTraceabilityRequirement`.
  All fields are surfaced on the surface detail panel as record-backed
  `<dl>` rows with `data-pcc-lifecycle-item-detail-field="…"` markers.
- **Source traceability surface region** (`lifecycle-source-traceability`)
  renders the library total prominently, family totals (startup 55 /
  safety 32 / closeout 70), and the three canonical source-document
  references with their HB-published file names.

## 7. Startup, safety, and closeout family summary

| Family     | Library count | Sample template items       | Sample project items         |
| ---------- | ------------- | --------------------------- | ---------------------------- |
| `startup`  | 55            | 4 (`tpl-startup-001..004`)  | 4 (`inst-startup-001..004`)  |
| `safety`   | 32            | 3 (`tpl-safety-001..003`)   | 3 (`inst-safety-001..003`)   |
| `closeout` | 70            | 3 (`tpl-closeout-001..003`) | 3 (`inst-closeout-001..003`) |

Family-level posture is rendered in the lifecycle family/domain region
with library count, instance count, and a derived headline posture per
family. The closeout family includes the
`closeout-from-day-one` posture marker (template `activeByDefault ===
true && family === 'closeout'`) and the `future-closeout-exposure` item
type (`tpl-closeout-002`).

## 8. Evidence / document-control posture

- `LIFECYCLE_READINESS_EVIDENCE_POLICIES` literals: `none`, `optional`,
  `required-before-complete`, `required-before-approval`, `conditional`,
  `external-reference-only`. There is no plain `'required'` literal —
  derivation predicates use the actual literals throughout.
- Project items carry an optional `evidenceLink` with `policy`,
  `evidenceState`, `referenceLabel`, `documentControlSourceId`,
  `externalReferenceLabel`, and `externalReferenceUrl`. URLs are
  rendered as **text only** in the detail panel — never as `<a href>`.
- The `lifecycle-evidence-readiness` region renders 4 evidence-state
  buckets (`pending`, `submitted`, `approved`, `rejected`) with
  per-bucket `documentControlSourceId` reference counts and a Document
  Control reference caption. The detail panel exposes evidence policy,
  state, reference label, document-control source id, and external
  reference text per item.

## 9. Priority Actions / Approvals signals posture

- The 9th lifecycle region card `lifecycle-readiness-signals` renders
  **7 canonical readiness-signal buckets**, each derived from existing
  record-backed fields:
  - `blocked` — `posture === 'blocked'` or `blockerState ∈ {open,
escalated}`
  - `overdue` — `dueDateUtc < envelope.generatedAtUtc` and active status
  - `missing-evidence` — required-before-complete /
    required-before-approval policy with unsatisfied evidence (or
    activated `conditional` policy)
  - `failed-safety` — `family === 'safety' && status === 'failed'`
  - `gate-blocking` — `template.defaultGateImpact.length > 0` and active
    status with at-risk or blocked posture
  - `awaiting-approval` — `approvalCheckpointReference` set, status not
    terminal-decided
  - `external-reference-issue` — `awaiting-external-system-setup`
    exception, or external references present and currently blocked
- Two seeded approval-checkpoint posture entries (`inst-startup-002` →
  `apc-startup-insurance-coi-001`; `inst-safety-002` →
  `apc-safety-hot-work-permits-001`) and two seeded priority-action
  promotion entries (`inst-startup-003` →
  `pa-startup-systems-setup-003`; `inst-closeout-001` →
  `pa-closeout-owner-utility-setup-001`) render as inert text-only
  cards. Per-item signal chips appear inside each detail panel.
- **No execution path** is introduced. The adapter and surface contain
  no `executeApproval`, `submitApproval`, `enqueueApproval`,
  `mutateApproval`, `runWorkflow`, `approveItem`, `waiveItem`, or
  `returnItem` identifiers, and no anchors/buttons capable of running
  any of those concepts.

## 10. Explicit exclusions

Wave 9 did **not** introduce:

- live Graph / PnP / SharePoint REST runtime;
- SharePoint list / library / document storage mutation;
- Procore / Sage / Outlook runtime or writeback;
- Safety runtime or compliance engine;
- approval execution;
- Priority Action queue mutation;
- notification execution;
- workflow execution;
- tenant mutation or permission/group mutation;
- Document Crunch or Adobe Sign runtime / writeback;
- package / dependency / lockfile / manifest changes;
- SPFx packaging, deployment, or app-catalog upload;
- production rollout.

Pre-existing parallel docs work for Wave 11 (Responsibility Matrix) and
Wave 12 (Constraints Log, Risk & Exposure) appears in the commit log
between Wave 9 commits but is **not** part of this closeout's diff.

## 11. Validation results

Captured at HEAD `11a0197bb` immediately before this closeout file was
authored:

| Command                                                                                                | Result                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @hbc/models check-types`                                                                | **PASS**                                                                                                                                                                                                       |
| `pnpm --filter @hbc/models test`                                                                       | **PASS — 34 files, 270 tests**                                                                                                                                                                                 |
| `pnpm --filter @hbc/functions check-types`                                                             | **PASS**                                                                                                                                                                                                       |
| `pnpm --filter @hbc/functions test`                                                                    | **PASS — 138 files, 2283 tests passed + 3 skipped (2286 total)**                                                                                                                                               |
| `pnpm --filter @hbc/spfx-project-control-center check-types`                                           | **PASS**                                                                                                                                                                                                       |
| `pnpm --filter @hbc/spfx-project-control-center test`                                                  | **PASS — 39 files, 755 tests**                                                                                                                                                                                 |
| `pnpm --filter @hbc/spfx-project-control-center build`                                                 | **PASS** — `dist/project-control-center-app.js` 369.90 kB (gzip 97.25 kB), `dist/spfx-project-control-center.css` 33.01 kB (gzip 5.49 kB)                                                                      |
| `pnpm --filter @hbc/spfx-project-control-center lint`                                                  | **PASS — 0 errors, 2 pre-existing warnings unrelated to Wave 9** (`PccDocumentControlPermissionsCard.tsx:261` unused `IDocumentControlActionCodeMutable`; `PccApp.optIn.test.tsx:21` unused `TEAM_ACCESS_URL`) |
| `pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/*.md` | **PASS** — 4 docs green pre-closeout (Target Architecture, Item Library Crosswalk, Implementation Gate, Readiness Signals Handoff). Re-run after this file is written.                                         |
| `git diff --check`                                                                                     | clean                                                                                                                                                                                                          |
| `git status --short`                                                                                   | clean (no Wave-9 work uncommitted before this doc)                                                                                                                                                             |
| `git diff --stat`                                                                                      | empty pre-closeout; this doc is the only diff at commit time                                                                                                                                                   |

## 12. Lockfile MD5 before / after

- **Before all Wave 9 implementation commits:** `c56df7b79986896624536aab74d609f4`
- **After Prompt 07 (`278a3a9df`):** `c56df7b79986896624536aab74d609f4`
- **At this closeout:** `c56df7b79986896624536aab74d609f4`

Lockfile MD5 is **unchanged** across the entire wave.

## 13. Package / dependency / manifest status

- No `package.json` changes anywhere in the workspace across any of the
  five Wave 9 implementation commits or this closeout.
- No `pnpm-lock.yaml` changes.
- No SPFx `*.manifest.json` file is currently shipped from the
  `apps/project-control-center` Vite-built dev shell, and no manifest
  was introduced by Wave 9. The trailer's conditional manifest version
  bump is therefore not applicable.
- No `.github/workflows/**` changes.
- No tenant deployment, app-catalog, or environment configuration
  changes.

## 14. Remaining risks / operator-pending items

- **Hosted / tenant proof** of `GET pcc/projects/{projectId}/lifecycle-readiness`
  via the SPFx mount remains operator-pending. Capturing it requires a
  tenant operator with explicit authorization.
- **Persona-aware filtering** of the My Actions region exercises only
  fixture-default behavior. Live persona derivation (e.g., from auth
  context) is intentionally deferred.
- **Future Priority Actions / Approvals integration** (queue mutation,
  approve / return / waive flows, persistence, notifications) is
  intentionally deferred to a future, separately-authorized prompt. The
  display-only signals shipped in Wave 9 / Prompt 07 are the contract
  surface that future prompt will consume.
- **SPFx app-catalog packaging** for the PCC app remains operator-pending
  and depends on SPFx-manifest reintroduction in a later wave.
- **Pre-existing unrelated lint warnings** at
  `PccDocumentControlPermissionsCard.tsx:261` and
  `PccApp.optIn.test.tsx:21` are out of Wave 9 scope; they predate the
  wave and are not addressed here.

## 15. Wave 10 — Permit & Inspection Control Center handoff

Wave 10 is **Permit & Inspection Control Center** (legacy: "Permit
Log"). Its canonical planning corpus already exists under
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-10/` and its
target-architecture / scope-lock / decisions / workbook-mapping /
closeout package lives under
`docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/`.
This Wave 9 closeout commits no Wave 10 implementation scope; it only
hands off the following invariants the next wave should preserve:

- Bento direct-child card invariant (no `<section>` wrappers around
  surface cards);
- Single `data-pcc-active-surface-panel="project-readiness"` invariant
  (Wave 10 will introduce its own surface activation marker);
- Record-backed-fields-only rule for surface rendering (no invented
  status, compliance scores, or estimated dates);
- Native `<details>/<summary>` progressive disclosure pattern as the
  zero-dependency default;
- `data-pcc-readiness-section="…"` per-card group marker convention
  when grouping related cards;
- No `prettier --write` against directory globs — only against the
  specific files authored or edited;
- `@hbc/models` build runs after fixture/contract edits and before
  downstream SPFx/backend validation;
- Dormancy / forbidden-runtime test guards continue to enforce no
  `MSGraphClient`, `sp.web`, `_api/web`, `ProcoreClient`,
  `DocumentCrunchClient`, `AdobeSignClient`, `executeApproval`,
  `submitApproval`, mutation identifiers, or live runtime imports.

The Wave 10 implementation prompt package (`Wave 10 Permit & Inspection
Control Center`) is the next prompt the user invokes when authorized to
proceed.
