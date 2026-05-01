# Wave 7 Closeout — HB Document Control Center

Phase 3 / Wave 7 (Project Control Center). Closeout written from current
repo truth at the head of this commit chain. Live Microsoft Graph / PnP /
SharePoint REST / external system runtime is not introduced anywhere in
this wave; hosted/tenant/browser proof is OPERATOR-PENDING.

## 1. Summary

Wave 7 added the **HB Document Control Center** as a six-card SPFx surface
inside `apps/project-control-center` (`apps/project-control-center/src/surfaces/documents/**`).
The surface is fully fixture/read-model driven via the existing
`document-control` envelope and the seven-method `IPccReadModelClient`
seam. Implementation landed across **Prompts 03A–07** as additive,
read-only rendering: SPFx ↔ backend mock fixture parity, three-lane UI
with adapter-side My Project Files (MPF) safety filtering, permission /
action guardrail card with Wave 7-scoped hard-no rules and EX04
forbidden posture, product-safe source/degraded-state messaging, and a
Reviews & Approvals read-only summary. The wave introduces no live
Microsoft Graph file operations, no direct broad SPFx Graph execution,
no PnP/SharePoint REST runtime, no OneDrive folder creation runtime, no
external system writeback / sync / mirror, no tenant or permission
mutation, no SPFx package or deployment changes, no dependency or
lockfile changes, and no secrets or app-settings changes.

## 2. Files changed

Source / test (PCC SPFx app):

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlLaneCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlPermissionsCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReviewsCard.tsx        (new — Prompt 06)
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts
apps/project-control-center/src/surfaces/documents/useDocumentControlReadModel.ts
apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts                   (new — Prompt 05)
apps/project-control-center/src/surfaces/documents/reviewMessaging.ts                        (new — Prompt 06)
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.module.css
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
```

Shared model:

```text
packages/models/src/pcc/DocumentControl.ts                                                    (additive enum extension — Prompt 05)
```

Backend mock provider:

```text
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
```

Documentation (Prompt 07):

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/Wave_7_Closeout.md     (this file)
apps/project-control-center/README.md                                                         (minimal Wave 7 closeout pointer added)
```

No edits under `docs/architecture/plans/**`. No edits to `package.json`,
`pnpm-lock.yaml`, SPFx manifests, or deployment / packaging files.

## 3. Implementation slices completed

Wave 7 is complete across **Prompts 03A–07**:

| Prompt | Commit SHA | Scope |
| --- | --- | --- |
| 03A — Read-Model Parity | `50e4d0724` | feat(pcc): align document-control fixture read model with wave 7 |
| 03B — Three-Lane UI | `17af4575f` | feat(pcc): render document control three-lane shell |
| 03B — Hardening follow-up | `e5ed886ec` | fix(pcc): harden document control degraded-state guards |
| 04 — Permission / Action Rendering | `9ea9e63c1` | feat(pcc): render document control action guardrails |
| 05 — Source / Degraded States | `ccae3f332` | feat(pcc): add document control source state rendering |
| 06 — Reviews & Approvals Summary | `a8b39bedc` | feat(pcc): add document control review summary |
| 07 — Closeout & Validation | (this commit) | docs(pcc): close phase 3 wave 7 document control implementation |

`52f575156` (`docs(pcc): restore unrelated wave 9 prompt edits`) is **not**
part of the Wave 7 implementation chain; it was a Wave 9 cleanup restore
landed alongside the wave and is excluded from this index.

## 4. Read-model parity summary (Prompt 03A)

The SPFx fixture client (`apps/project-control-center/src/api/pccFixtureReadModelClient.ts`)
and the backend mock provider
(`backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`)
publish the same literal values for the Wave 7 `document-control` envelope:

- `wave7LaneVocabulary` — `['project-record', 'my-project-files', 'external-systems']`.
- `sourceRegistry` — five deterministic entries (project-record-primary, my-project-files-current-user, external-procore, external-document-crunch, external-adobe-sign).
- `sourceHealth` — three deterministic entries (project-record-primary healthy, my-project-files-current-user healthy, external-procore warning).
- `sourceHealthStates` — published vocabulary including the two MPF-specific states added in Prompt 05 (`pending-initialization`, `folder-creation-failed`).
- `reviewStates` — six ids (`not-required`, `pending`, `in-review`, `approved`, `rejected`, `waived`).
- `reviewTypes` — five ids (`chief-estimator-review`, `legal-review`, `compliance-review`, `leadership-review`, `project-execution-review`).
- `hardNoRules` — Wave 7-scoped subset HN-01 / HN-02 / HN-03 (the universal `@hbc/models` registry contains a fourth rule HN-04 that is intentionally **not** published in this wave).
- `roleActionAvailability` — seven deterministic rows including the EX04 forbidden posture (`R01-EX04` availability `N`).
- `actionCatalog` — six action codes including `EX04` ("External Writeback/Sync/Mirror") with a forbidden description.
- `reviewQueueSample` — exactly two rows (`rvw-001` Estimate-Backup-April.xlsx / leadership-review / pending / R19; `rvw-002` Compliance-Package-001.pdf / compliance-review / in-review / R18).

Parity is asserted in `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`
("Wave 7 / Prompt 06 — known-project envelope publishes the canonical
review-type and review-state vocabularies plus the deterministic queue
sample" and the sibling source-health vocabulary assertion).

## 5. Three-lane UI summary (Prompts 03B + hardening)

The Documents surface renders six cards as direct children of the bento
grid (`[data-pcc-bento-grid]`):

1. Header (`PccDocumentsHeaderCard`).
2. Project Record lane (`PccDocumentControlLaneCard`).
3. My Project Files lane (`PccDocumentControlLaneCard`).
4. External Systems lane (`PccDocumentControlLaneCard`).
5. Permissions & Guardrails (`PccDocumentControlPermissionsCard`).
6. Reviews & Approvals (`PccDocumentControlReviewsCard`).

The bento direct-child invariant test in
`apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx`
("preserves bento direct-child invariant") asserts exactly six
`[data-pcc-card]` elements, each parented directly by the bento grid.

MPF safety filtering lives **adapter-side** in
`apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts`
(`isSafeMyProjectFilesEntry`). An MPF entry passes only when:

- envelope `sourceStatus === 'available'` (fail-closed for any degraded envelope);
- envelope `projectId` is defined;
- entry `binding.projectId` matches envelope `projectId`;
- entry `binding.projectFolderPath` equals the deterministic constant `/My Project Files/26-000-00-Stadium Enclave`.

The constant is **not** derived from the registry being filtered (memory
guardrail: `feedback_no_self_anchored_canonical.md`). Adversarial cases
are covered by the "MPF deterministic allow-path enforcement" describe
block: legitimate-first, tamper-first, and tamper-only registries all
collapse to either the single legitimate row or an empty MPF lane with
`[data-pcc-doc-lane-empty="true"]`. No root browsing; no other-project
folder leakage.

## 6. Permission / action guardrail summary (Prompt 04)

`PccDocumentControlPermissionsCard` renders three sections plus two
always-on legends from the read-model view-model:

- **Hard-no guardrails** — published `viewModel.hardNoRules` (HN-01 / HN-02 / HN-03 from the Wave 7 fixture) when present, otherwise a Wave 7-specific local fallback constant (HN-01..HN-03 only). The fallback is **not** sourced from `DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES` because that registry is a superset that contains HN-04; rendering the universal registry would surface a rule the wave does not publish (memory guardrail: `feedback_local_fallback_for_wave_specific_subset.md`).
- **Action catalog** — grouped by family (PR / MP / SB / EX / WF) preserving model-emitted order. `EX04` ("External Writeback/Sync/Mirror") renders with `data-pcc-doc-action-forbidden="true"` and a "Not allowed in Wave 7" guardrail line. The action element is intentionally **not** a `<button>` and contains no `<a href>` — proven structurally in the test "EX04 renders as forbidden / not allowed in the action catalog".
- **Role × action availability** — every published `roleActionAvailability` row renders with no persona / current-user filtering. The seven deterministic fixture rows (R05-PR01, R05-MP02, R14-PR10, R14-WF01, R01-SB06, R03-EX02, R01-EX04) all surface; the test "all 7 fixture roleActionAvailability rows render" enforces this.
- **Role legend** — all 23 codes (`R01..R23`) from `DOCUMENT_CONTROL_ROLE_VOCABULARY` always render, including in fallback / backend-unavailable / source-unavailable paths.
- **Availability code legend** — all nine codes (`Y / A / O / R / C / S / D / N / HARD-NO`) always render with safe labels.

The card emits zero executable buttons and zero external launch anchors
("permissions card renders no executable buttons or external launch
anchors").

## 7. Source / degraded-state summary (Prompt 05)

`DOCUMENT_CONTROL_SOURCE_HEALTH_STATES` was extended additively in
`packages/models/src/pcc/DocumentControl.ts` with two MPF-specific
states: `pending-initialization` and `folder-creation-failed`. Both the
SPFx fixture client and the backend mock provider mirror the new
vocabulary literally (asserted by "publishes the Wave 7 source health
vocabulary including pending-initialization and folder-creation-failed").

`apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts`
provides three pure resolvers:

- `resolveEntryHealthMessage(laneId, healthState)` — lane-aware product-safe label + tone for each of the nine health states.
- `resolveDisabledMessage(laneId)` — lane-aware product-safe disabled copy.
- `resolveLaneEnvelopeMessage(laneId, sourceStatus)` — lane-aware cue for each of six degraded envelope `sourceStatus` values (`backend-unavailable`, `source-unavailable`, `missing-config`, `stale`, `unauthorized`, `forbidden`); returns `undefined` for `available`.

In `PccDocumentControlLaneCard.tsx`, raw `· {state}` and `· disabled`
visible text was replaced with user-safe label/message spans:

- `[data-pcc-doc-source-health-message="<rawState>"]` carries the visible product-safe label + message.
- `[data-pcc-doc-source-disabled="true"]` carries the visible disabled copy.
- The raw enum value remains available **only** as `[data-pcc-doc-source-health="<rawState>"]` for machine inspection.

Per-lane envelope cue: `[data-pcc-doc-lane-degraded="<laneId>"]` renders
when envelope `sourceStatus !== 'available'`, in addition to (not
replacing) the existing empty-lane fallback. The "Wave 7 / Prompt 05
source-state rendering" describe block asserts no kebab-case enum
tokens (`missing-binding`, `access-denied`, `pending-initialization`,
`folder-creation-failed`) leak into visible lane `textContent`, and no
stack-trace / Graph-error patterns leak in any lane subtree under any
of the six degraded envelope sourceStatuses.

## 8. Reviews & Approvals summary (Prompt 06)

`PccDocumentControlReviewsCard` renders three sections from the read-model
view-model:

- **Review type vocabulary** — all five ids render via `[data-pcc-doc-review-type="<id>"]` with safe labels resolved by `reviewMessaging.ts`.
- **Review state legend** — all six ids render via `[data-pcc-doc-review-state-legend-code="<id>"]` with safe labels and explicit tone markers (`info` / `warning` / `error`) on `[data-pcc-doc-review-state-tone]`.
- **Review queue** — deterministic rows render via `[data-pcc-doc-review-queue-row="<itemId>"]` with the file name (`[data-pcc-doc-review-queue-file="true"]`), type label (`[data-pcc-doc-review-queue-type="<typeId>"]`), state label + tone (`[data-pcc-doc-review-queue-state="<stateId>"]`), and assigned role code + role label (`[data-pcc-doc-review-queue-role="<roleCode>"]`). The two fixture rows render with their canonical fields (`rvw-001` Estimate-Backup-April.xlsx / Leadership Review / Pending / R19 — Owner Client Viewer; `rvw-002` Compliance-Package-001.pdf / Compliance Review / In review / R18 — Contracts Reviewer).

The view-model was extended additively with `reviewTypes` and
`reviewStates`. The card is wired into both the read-model content and
the no-client fallback path so the bento card-count parity holds at six
across both paths. The card emits zero `<button>` elements and zero
`<a href="https?://...">` anchors. Backend-unavailable and
source-unavailable envelopes still publish full `reviewTypes` and
`reviewStates` vocabularies; only the queue is empty under those
envelopes (asserted by "backend-unavailable: card renders, types +
states still publish, queue empty" and the source-unavailable variant).

## 9. Validation results

Captured this run from a clean working tree at the close of the Wave 7
implementation chain (preflight HEAD `a8b39bedc`):

```
pnpm --filter @hbc/spfx-project-control-center test         → 641 passed (36 files)
pnpm --filter @hbc/spfx-project-control-center check-types   → clean
pnpm --filter @hbc/spfx-project-control-center build         → 2,223 modules, built in 2.00s
                                                             → dist/spfx-project-control-center.css 25.58 kB (gzip 4.46 kB)
                                                             → dist/project-control-center-app.js  272.75 kB (gzip 78.59 kB)
pnpm --filter @hbc/models check-types                        → clean
pnpm --filter @hbc/functions check-types                     → clean
git diff --check                                             → clean
md5 pnpm-lock.yaml                                           → c56df7b79986896624536aab74d609f4 (unchanged from preflight)
```

`pnpm --filter @hbc/models test` and `pnpm --filter @hbc/functions test`
were not in the prompt's required validation set and were not invoked
during this run; they were exercised earlier in the wave (Prompts 03A,
05) and remained green for those prompts.

Hosted/tenant/browser proof: OPERATOR-PENDING. Package-local
typecheck/test/build is package truth, not hosted truth (no `.sppkg`
generation, app-catalog upload, or tenant probe was authorized for this
wave).

## 10. Explicit exclusions

Wave 7 did **not** introduce any of the following:

- Live Microsoft Graph file operations.
- Direct broad SPFx Graph execution.
- PnP / SharePoint REST runtime.
- OneDrive folder creation runtime.
- Upload / download / copy-link runtime.
- Procore writeback.
- Adobe Sign agreement execution.
- Document Crunch runtime writeback.
- External sync / mirror.
- Tenant mutation.
- Permission mutation.
- SPFx package / deployment changes.
- Package dependency changes.
- `pnpm-lock.yaml` changes.
- Secrets / app-settings changes.

## 11. Remaining risks / open items

- **Live Microsoft Graph wiring** for Project Record and My Project Files lanes is deferred to a later approved wave with authorization model, tenant consent review, and security review.
- **Live external system launch / status** for Procore, Document Crunch, and Adobe Sign is deferred to a later wave with a deep-link policy and access-posture review.
- **Backend write routes** for review state transitions (approve / reject / return / reassign) are deferred. Current behavior is read-only summary rendering only.
- **Hosted SPFx package / app-catalog / tenant smoke proof** is OPERATOR-PENDING for this wave; package truth is established, hosted truth is not.
- **Surface card count is locked at six**. Future waves that introduce additional cards must update the bento direct-child invariant test (single-line constant) **and** the no-client fallback path together to preserve parity (lesson from Prompt 06).
- **Wave 7 hard-no scope is HN-01..HN-03**. The universal `@hbc/models` registry (`DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES`) contains a fourth rule HN-04; if a future wave intends to surface HN-04, it must explicitly publish it through the read model rather than fall through to the universal registry as a default.
- **Health-state vocabulary is now nine values** (extended additively in Prompt 05). Any future consumer that introduces an exhaustive `switch` over `DocumentControlSourceHealthState` must include the two new states.

## 12. Recommended next prompt or wave

Wave 8 planning recommended to proceed.
