# Prompt 06 — Validate Adobe Backend Runtime Readiness, Security, and Closeout

## Objective

Perform a final implementation audit and closeout of the Adobe Sign backend runtime remediation completed by Prompts 02–05.

This prompt must verify that the codebase now:
- truthfully supports a configured live delegated OAuth flow,
- persists state/grants/tokens safely,
- refreshes tokens safely,
- composes the live provider into protected read routes,
- preserves all B05/B06 guardrails,
- and documents the exact remaining operator-controlled configuration needed for actual tenant/live validation.

---

## Repo-truth references to inspect

Only inspect changed or directly related files unless a fresh verification pass is required.

### Required categories
- Prompt 02 changed files
- Prompt 03 changed files
- Prompt 04 changed files
- Prompt 05 changed files
- `docs/architecture/plans/MASTER/spfx/my-dashboard/B05/06_B05_Adobe_OAuth_Configuration_Runbook.md`
- Any runtime/config docs that were intentionally updated during remediation.

---

## Implementation scope

This prompt may:
- make narrow documentation/config-readiness corrections,
- make narrow test corrections found during final validation,
- make narrow code fixes only when necessary to close a direct prompt-sequence defect.

This prompt must not:
- introduce a new feature lane,
- broaden scopes,
- add UI polish,
- add webhook runtime,
- add queue caching,
- redesign the architecture.

---

## Required validation matrix

### A. Core build/test commands
Run the relevant commands supported by repo truth:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

If the app package/filter names differ, adapt to actual repo truth and report the exact commands used.

### B. Route and runtime grep checks
Run:

```bash
rg -n "service-not-wired|production-store-not-selected|MyWorkMockReadModelProvider\\(\\)|new MyWorkMockReadModelProvider|address:\\s*''" backend/functions/src/hosts/my-work-read-model
```

Interpret precisely:
- no placeholder `service-not-wired` should remain on the live default OAuth path,
- mock stores may still exist for test/mock mode,
- hard-wired route-level mock-only composition must be gone,
- empty refresh-token reference persistence must not remain on successful live callback paths.

### C. Secret-leak checks
Run targeted searches for suspicious leak paths:

```bash
rg -n "console\\.(log|error|warn)|logger\\.|trackEvent\\(|trackException\\(|client_secret|refresh_token|authorizationCode|stateValue|access_token" backend/functions/src/hosts/my-work-read-model
```

Review hits manually and classify:
- acceptable internal protocol/request-body use,
- unacceptable logging/telemetry/documentation exposure.

### D. Config/readiness checks
Verify:
- table-storage live mode is actually supported,
- unsupported/non-implemented modes do not report falsely ready,
- required settings are documented without secret values,
- missing settings map to governed configuration-required behavior.

### E. OAuth-doc alignment checks
Verify implementation remains aligned with the documented decisions:
- auth URL excludes client secret,
- code exchange uses server-side secret,
- code exchange path is `/oauth/v2/token`,
- refresh path is `/oauth/v2/refresh`,
- callback remains public and state-validated.

### F. End-to-end behavior assertions by test or controlled local composition
Where direct external Adobe validation is not available, use tests/composition checks to prove:
- authorization URL generation works,
- callback success path persists a usable grant reference,
- refresh-client success path returns access token and updates state safely,
- live provider can produce a typed read-model envelope from mocked successful source adapters,
- failure modes map to typed `authorization-required`, `configuration-required`, or `source-unavailable` outcomes.

---

## Exact docs/config updates allowed

Update docs only if needed to reflect the actual remediation result.

Potential allowed updates:
- remediation README or closeout note,
- environment/readiness table,
- operator action checklist for Azure Function App settings,
- note that client secret is not part of the auth link but is required for server-side exchange/refresh.

Do not rewrite unrelated B05/B06 planning artifacts unless they contain a direct contradiction with the implementation that must be corrected.

---

## Evidence requirements

Produce a closeout summary containing:
- changed-file map grouped by prompt/lane,
- validation command matrix,
- runtime gap closure table,
- residual operator dependency table,
- security guardrail checklist.

No raw logs containing tokens or real tenant values may be committed.

---

## Commit / closeout expectations

If remediation required final fixes/docs, create a closeout commit.

Suggested commit title:

```text
test(my-dashboard): validate Adobe Sign backend runtime completion and readiness gates
```

If no final edits are required, do not create a no-op commit.

Final response format:

```text
HB: Prompt 06 — Adobe Backend Runtime Readiness, Security, and Closeout

Verdict:
- PASS / FAIL

Branch / HEAD:
- Starting:
- Ending:

Runtime closure table:
1. OAuth code exchange:
2. OAuth callback grant persistence:
3. Durable state store:
4. Durable grant store:
5. Encrypted refresh-token persistence:
6. Refresh client:
7. Search client:
8. Principal resolver:
9. Live route provider composition:
10. Readiness truthfulness:

Validation matrix:
- Command:
  Result:

Security checks:
- Client secret in auth URL? yes/no
- Raw refresh-token plaintext persisted? yes/no
- Raw tokens/codes logged? yes/no
- Hard-wired route-level mock-only provider remains? yes/no
- Unsupported store mode can report ready? yes/no

Residual operator dependencies:
- ...

Files changed in closeout prompt:
- ...

Suggested commit / no-commit decision:
- ...
```

---

## Risks / guardrails

- Be explicit when full live Adobe round-trip is not runnable locally due to operator secrets or external tenant state.
- Do not claim production-live completion beyond what repo truth and available configuration support.
- Do not leak real configuration values in closeout docs or evidence.
