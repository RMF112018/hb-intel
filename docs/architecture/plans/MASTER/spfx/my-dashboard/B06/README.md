# HB Intel My Dashboard — B06 Runtime Hardening Implementation Prompt Package

**Package purpose:**  
This package instructs a local code agent to implement the runtime-hardening work governed by:

```text
B06 — My Dashboard Operational Resilience, Security, Telemetry, Privacy, and Risk Development
```

**Package posture:**  
This is a **runtime implementation and validation package**, not merely a documentation-alignment package. It is intended to follow the B05 runtime integration package and harden the My Dashboard / Adobe Sign Action Queue implementation against:

- aggressive polling,
- durable queue caching,
- throttling amplification,
- unsafe retry loops,
- unsafe error propagation,
- sensitive telemetry leakage,
- sensitive hosted-evidence leakage,
- route-taxonomy drift,
- and accidental conflation of OAuth credential persistence with queue-data caching.

---

## 1. Repo-truth basis used by this package

### Verified current repo conditions
The repository currently contains:

- the committed B06 planning artifact:
  - `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md`
- an existing My Dashboard app domain at:
  - `apps/my-dashboard/`
- an existing protected My Work backend read-model host at:
  - `backend/functions/src/hosts/my-work-read-model/`
- inherited backend telemetry/auth/correlation seams:
  - `withTelemetry(...)`
  - `withAuth(...)`
  - `extractOrGenerateRequestId(...)`
  - structured logger utilities
- a strong PCC evidence-redaction precedent:
  - `e2e/pcc-live/pcc-live.sanitization.ts`
  - `e2e/pcc-live/pcc-live.evidence-writer.ts`

### Important reference drift identified
The committed B06 planning artifact names a long-form B05 predecessor filename that does **not** match the active committed B05 dev-plan artifact name on current `main`.

**Correction target:**

```text
B05_Adobe_Sign_Integration_Architecture_Development.md
```

This package includes a narrow documentation-alignment prompt to correct that path drift and refresh the My Dashboard dev-plan authority index through B06.

---

## 2. Execution dependency

This B06 package is designed to run **after** the B05 runtime integration package has been executed or merged.

B06 assumes the working tree contains, or is actively converging toward, the B05 runtime seams for:

- Adobe OAuth start/callback flow,
- delegated grant persistence,
- provider/token service boundaries,
- Adobe queue read-model adapter flow.

If those B05 runtime seams do **not** exist in the working tree, the local agent must:

1. report that the B05 runtime predecessor is not present,
2. complete only the narrow B06 documentation alignment prompt where safe,
3. stop before inventing parallel OAuth/provider architecture.

---

## 3. Package contents

| File | Purpose |
|---|---|
| `README.md` | Package guide and execution order |
| `00_B06_Implementation_Package_Overview.md` | Scope, posture, repo findings, and package logic |
| `01_B06_Repo_Truth_Implementation_Plan.md` | Exact implementation lanes and sequencing |
| `02_B06_Resilience_Security_Telemetry_And_Evidence_Map.md` | Closed target architecture, matrices, and guardrails |
| `03_B06_Validation_And_Closeout_Requirements.md` | Validation commands, acceptance checks, and closeout format |
| `04_B06_Implementation_Gap_Register.md` | Gap-by-gap remediation register |
| `05_B06_Targeted_Web_Verification_Notes.md` | Current authoritative guidance preserved by the package |
| `Prompt_00_Reconcile_B06_Authority_Index_And_B05_Predecessor_Path.md` | Correct path drift and update planning index |
| `Prompt_01_Preflight_B06_Runtime_Seams_And_Predecessor_Gates.md` | Confirm B05 runtime predecessor posture before code work |
| `Prompt_02_Implement_Focused_Module_Manual_Refresh_And_No_Auto_Polling.md` | Frontend refresh hardening |
| `Prompt_03_Implement_Provider_Throttling_Retry_And_Source_State_Hardening.md` | Backend resilience / 429 / retry mapping |
| `Prompt_04_Implement_Sanitized_Telemetry_And_Error_Boundaries.md` | Privacy-safe logging and sanitized operational errors |
| `Prompt_05_Implement_My_Dashboard_Evidence_Sanitation_And_Hosted_Test_Guards.md` | Evidence privacy and curated proof rules |
| `Prompt_06_Validate_No_Durable_Cache_No_Metadata_Leakage_And_Section18_Taxonomy.md` | Cross-layer regression and contract validation |
| `Prompt_07_B06_Final_Closeout_Risk_Register_And_Residual_Readiness.md` | Final synthesis, risk closure, and handoff |

---

## 4. Recommended execution order

Execute sequentially:

1. `Prompt_00_Reconcile_B06_Authority_Index_And_B05_Predecessor_Path.md`
2. `Prompt_01_Preflight_B06_Runtime_Seams_And_Predecessor_Gates.md`
3. `Prompt_02_Implement_Focused_Module_Manual_Refresh_And_No_Auto_Polling.md`
4. `Prompt_03_Implement_Provider_Throttling_Retry_And_Source_State_Hardening.md`
5. `Prompt_04_Implement_Sanitized_Telemetry_And_Error_Boundaries.md`
6. `Prompt_05_Implement_My_Dashboard_Evidence_Sanitation_And_Hosted_Test_Guards.md`
7. `Prompt_06_Validate_No_Durable_Cache_No_Metadata_Leakage_And_Section18_Taxonomy.md`
8. `Prompt_07_B06_Final_Closeout_Risk_Register_And_Residual_Readiness.md`

---

## 5. Target end state

B06 is complete only when:

1. B06’s planning path references are internally consistent.
2. The My Dashboard dev-plan authority index is current through B06.
3. The focused Adobe module supports deliberate manual refresh only.
4. No auto-polling or hidden focus/visibility refresh trigger exists.
5. No durable queue cache or persisted queue replay layer is introduced.
6. The backend provider classifies rate limiting and transient failures safely.
7. `Retry-After` is honored where applicable and retry behavior is bounded.
8. Refresh-token failure maps to `authorization-required`.
9. Telemetry records classifications and operational dimensions only, not row metadata or credential material.
10. Provider errors cannot leak raw upstream bodies into generic telemetry/error-message paths.
11. Hosted/curated evidence rules block queue-row payload dumps and auth/session artifacts.
12. Section 18 HTTP/source-state taxonomy remains intact and is regression-tested.
13. Final closeout records residual risks, executed validation, and any deferred future-state webhook/caching opportunities.

---

## 6. Explicitly out of scope

The package must **not**:

- reopen the B05 delegated OAuth architecture,
- broaden Adobe scopes,
- create shared-principal fallbacks,
- add user/actor override query parameters,
- add browser token storage,
- add browser queue persistence,
- implement webhook runtime,
- introduce a durable queue cache,
- synthesize row-level Adobe URLs client-side,
- log agreement titles or sender identity,
- commit raw Playwright traces, HARs, videos, auth/session storage-state artifacts,
- refactor unrelated PCC telemetry doctrine,
- globally rewrite `withTelemetry(...)` unless a narrowly justified reusable safety improvement is proven necessary.

---

## 7. Validation posture

The final validation prompt must run, where repo truth supports them:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

It must also perform targeted searches and inspections for:

- forbidden auto-poll patterns,
- forbidden durable queue cache patterns,
- token/callback/provider-body logging risks,
- queue-row telemetry leakage,
- route taxonomy regressions,
- hosted evidence sanitizer coverage.

---

## 8. Final local-agent report shape

The final report should include:

1. Verdict: PASS / FAIL
2. Branch / starting HEAD / ending HEAD
3. Files changed, grouped by:
   - docs alignment,
   - frontend runtime,
   - backend runtime,
   - tests/evidence
4. Validation commands executed
5. Validation results
6. Proof that B06 hard gates were preserved:
   - no auto-polling,
   - no durable queue cache,
   - no token/provider-body/queue metadata leakage,
   - rate-limit behavior classified safely,
   - evidence sanitation preserved
7. Residual risks and intentionally deferred work
8. Suggested commit title and description

Suggested commit title:

```text
feat(my-dashboard): harden Adobe queue resilience, privacy, telemetry, and evidence posture
```
