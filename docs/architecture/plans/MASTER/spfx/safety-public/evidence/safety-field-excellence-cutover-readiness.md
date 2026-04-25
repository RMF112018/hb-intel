# Safety Field Excellence — Cutover Readiness (Wave 07)

| Field | Value |
|---|---|
| Date | 2026-04-25 |
| Branch | main |
| Commit (HEAD) | `3022358e6fe2b8acd3769d66c657f6b0f41b7618` |
| Wave | 07 (Phase 02) |
| Surface | Safety Field Excellence dynamic homepage surface |
| Source manifest version | `0.0.8.0` |
| Package-solution version | `1.0.3.0` |
| Wave 06 scorecard carry-forward | 55/56 (category 13 host-runtime resilience capped at 3/4 pending hosted runtime proof) |
| Authority docs | `cut-over-plan/06_Verification_and_Hosted_Proof.md`, `cut-over-plan/07_Risk_Register_and_Governance.md` |
| Sibling evidence | `safety-field-excellence-package-truth-proof.md`, `safety-field-excellence-hosted-runtime-proof.md`, `safety-field-excellence-rollback-runbook.md` |

## Overall readiness status

**Conditionally ready for hosted validation.** Source-side and local typecheck/test proofs are complete. Fresh `.sppkg` production is build-blocked on three pre-existing TypeScript errors in unrelated webparts (see `safety-field-excellence-package-truth-proof.md` → "Build status — BUILD-BLOCKED"). All hosted-runtime, deployment, and tenant-authenticated backend reachability proofs remain `OPERATOR-PENDING` in `safety-field-excellence-hosted-runtime-proof.md`.

## Acceptance gate (transcribed from `cut-over-plan/06_Verification_and_Hosted_Proof.md`)

| # | Gate | Current status | Evidence pointer |
|---|---|---|---|
| 1 | Backend rollup works | OPERATOR-PENDING | Wave 03 routes exist (`/api/safety-field-excellence/rollup/dry-run`, `/rollup/generate`, `/reporting-periods/{id}/candidates`); proven reachable in Wave 03 evidence; tenant-authenticated reachability for Wave 07 cutover not re-verified this wave |
| 2 | Published highlight exists | OPERATOR-PENDING | Owned by Wave 04 publish workflow; existence in target tenant must be confirmed by operator before forward cutover beyond `curated-only` |
| 3 | Homepage reads published artifact | OPERATOR-PENDING | Hosted runtime proof of `/homepage/current` returning `state: "published"` with mapped payload — runbook in `safety-field-excellence-hosted-runtime-proof.md` |
| 4 | Runtime proof confirms dynamic source | OPERATOR-PENDING | `JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)` capture per source mode — runbook |
| 5 | Preview fallback works | LOCAL PASS / OPERATOR-PENDING (hosted) | Source code path proven (`safetyFieldExcellencePreviewFallback.ts`, vitest 6 files / 52 tests pass); hosted preview render must be observed by operator |
| 6 | Scorecard target met | PASS | Wave 06 scorecard 55/56 (target ≥48/56) — see `safety-field-excellence-uiux-scorecard.md`; category 13 host-runtime resilience remains capped at 3/4 until hosted runtime proof closes |
| 7 | Package truth equals runtime truth | BUILD-BLOCKED / OPERATOR-PENDING | Source manifest is `0.0.8.0`; fresh `.sppkg` cannot be produced until the three pre-existing TS errors in `priorityActionsRail`/`hbKudos`/`homepageHero` tests are resolved by their owners. Once unblocked, operator must observe `runtimeProof.packageVersion === expectedPackageVersion` against the deployed bundle. |
| 8 | Rollback path documented | PASS | `safety-field-excellence-rollback-runbook.md` covers Path A (SPFx), Path B (config), Path C (backend content), Path D (curated-fallback verification) plus owner/action table |

## Hard-stop conditions (transcribed from `cut-over-plan/07_Risk_Register_and_Governance.md`)

| # | Hard stop | Current status |
|---|---|---|
| 1 | No published artifact exists | OPERATOR-VERIFY before forward cutover |
| 2 | Homepage endpoint exposes raw findings/workbook JSON | LOCAL PASS — `SafetyFieldExcellenceDataAdapter.ts:214-231` enforces redaction; payload mapper rejects forbidden fields; vitest negative-assertions confirm. Hosted re-verification on first deploy required. |
| 3 | One score can select a winner alone | OUT OF SCOPE for Prompt 07 — backend scoring policy owned by Wave 02/03; not changed in this wave |
| 4 | Preview fallback looks like production data without clear labeling | LOCAL PASS — `safetyFieldExcellencePreviewFallback.ts` summary explicitly labels "Preview — awaiting published weekly data"; ui-kit Preview chip survives compact/minimal modes; Wave 06 scorecard confirmed. Hosted re-verification required on operator deploy. |
| 5 | Scorecard below flagship target without accepted exception | PASS — 55/56 against 48/56 target; category 13 explicit accepted exception pending hosted runtime proof |
| 6 | Hosted runtime does not match package/source truth | OPERATOR-PENDING — only assertable after deploy + runtime-proof capture |

## Approval-required actions per `cut-over-plan/07`

| Action | Approver | Required for this wave? |
|---|---|---|
| Scoring model changes | Safety leadership + HB Intel | NO — Prompt 07 owns no scoring changes |
| New public homepage metric | Safety leadership + HB Intel | NO |
| Override of hard-excluded candidate | Safety leadership | NO |
| **`dynamic-only` cutover** | Safety leadership + HB Intel | **NOT RECOMMENDED at Prompt 07 closure** (see Cutover recommendation below) |
| **Removal of curated fallback** | Safety leadership + HB Intel | **NO** — curated fallback retained |

## Wave 06 scorecard carry-forward

| Category | Wave 06 score | Wave 07 status |
|---|---|---|
| Categories 1-12 (UI/UX, doctrine, accessibility, identity, etc.) | Full credit | Unchanged — Wave 07 introduces no UI changes |
| 13. Host-runtime resilience | 3/4 | Capped at 3/4 pending hosted runtime proof capture; will close to 4/4 once `safety-field-excellence-hosted-runtime-proof.md` operator-pending sections are populated and verified |
| 14. Closure discipline | Full credit | Unchanged |
| **Total** | **55/56** | **55/56 today; 56/56 once hosted proof closes** |

## Risks active at Prompt 07

| Risk | Source | Mitigation status at Prompt 07 |
|---|---|---|
| Backend weekly-timer target reporting period is env-var-only in v1 | Wave 04 known limitation | Active — constrains `dynamic-only` enablement until remediated. Documented in this readiness matrix as a follow-up before unattended weekly production operation. |
| `dynamic-only` production enablement risk | `cut-over-plan/07` "Approval Required" | Active — not recommended at this time. |
| Pre-existing TS errors block fresh `.sppkg` build | New (discovered Wave 07) | Owners (`priorityActionsRail`, `hbKudos`) must resolve in their own scope; documented in package-truth-proof and not patched here per scope discipline. |
| Hosted bundle / runtime ≠ source truth at first deploy | Standard cutover risk | Mitigated by `runtimeProof.packageVersion === expectedPackageVersion` assertion in hosted-runtime-proof gate. |

## Cutover recommendation

While hosted runtime proof remains `OPERATOR-PENDING`, the recommended source mode is one of:

1. **Remain on `curated-only`** (recommended default until the build is unblocked, a fresh `.sppkg` is deployed, and hosted runtime proof is captured).
2. **Enable `dynamic-preview`** *only if the operator is ready to capture hosted runtime proof in the same window.* `dynamic-preview` fetches the dynamic payload but the public homepage continues to render curated content unless diagnostics-only paths are explicitly opted in. This is the lowest-risk way to surface real-world `currentEndpointStatus`, runtime-proof shape, and network-panel evidence without changing user-visible content.

**Do not recommend** `dynamic-with-curated-fallback` for production until **all** of the following are captured in `safety-field-excellence-hosted-runtime-proof.md`:

- Fresh `.sppkg` deployed and `runtimeProof.packageVersion === expectedPackageVersion` observed.
- Hosted page loads the new bundle (DevTools Sources or runtime-proof match).
- `/api/safety-field-excellence/homepage/current` returns 200 (`published` or `no-published-highlight`) for a normal authenticated delegated user — no 401/403, no raw payload.
- Per-source-mode runtime proof JSON captured and pasted into the runbook.
- Network panel proof: only `/homepage/current` is called from the homepage surface.
- Console clean of safety-attributed runtime exceptions.
- Preview / curated fallback proof captured (no-published-highlight path).
- Rollback Path B (config) smoke-checked and recorded.

**`dynamic-only` is NOT RECOMMENDED for production at Prompt 07 closure.** Reasons:

- Backend weekly-timer target reporting period is env-var-only in v1; unattended weekly production operation is not yet validated.
- `cut-over-plan/07` requires Safety leadership + HB Intel joint approval for `dynamic-only` cutover; that approval has not been issued.
- `dynamic-only` removes the curated fallback, increasing blast radius if the publish workflow ever fails to ship a fresh artifact.

Once `dynamic-with-curated-fallback` is in production for at least one full weekly cycle and the timer current-period resolution is remediated (or governance accepts the env-var limitation in writing), `dynamic-only` can be reconsidered with explicit owner sign-off.

## Promotion gating

Promotion from the current curated baseline to `dynamic-with-curated-fallback` is gated on the operator running the post-deploy operator checklist in `safety-field-excellence-hosted-runtime-proof.md` and replacing every `OPERATOR-PENDING` marker with captured evidence. Once captured:

1. Update this readiness matrix to mark the relevant rows PASS.
2. Update final status from "Conditionally ready for hosted validation" to "Hosted runtime proof complete".
3. Recommend `dynamic-with-curated-fallback` as the production source mode.
4. Plan a follow-up readiness review at the end of the first weekly cycle.

## Out of scope (this wave)

- New backend route development (Wave 03 owns)
- Backend scoring or selection model changes (Wave 02/03)
- Timer redesign / publish workflow redesign (Wave 04)
- UI/UX redesign (Wave 06; carry-forward only)
- Production `dynamic-only` enablement (governance approval not present)
- Approval/publish admin UI (separate scope)
- Fixing `priorityActionsRail` / `hbKudos` / `homepageHero` test TS errors (owners' own scope; documented blocker only)

## Final status

**Conditionally ready for hosted validation — package truth complete locally; fresh `.sppkg` build-blocked on unrelated repo defects; hosted runtime proof pending operator capture.**
