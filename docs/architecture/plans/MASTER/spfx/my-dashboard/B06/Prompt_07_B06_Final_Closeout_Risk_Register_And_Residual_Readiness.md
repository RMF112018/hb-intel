# Prompt 07 — B06 Final Closeout, Risk Register, and Residual Readiness

## Role

Act as the final implementation closeout auditor for B06.

## Objective

Produce the authoritative final B06 closeout based on the actual completed repository changes and validation output from Prompts 00–06.

Do not introduce new feature code in this prompt unless a tiny closeout-only docs correction is absolutely necessary.

## Required closeout sections

### 1. Verdict
```text
PASS / FAIL
```

### 2. Branch / HEAD
- branch,
- starting HEAD,
- ending HEAD.

### 3. Work completed
Group by:
- docs authority correction,
- frontend refresh hardening,
- backend resilience behavior,
- telemetry/privacy error-boundary hardening,
- evidence sanitation posture,
- tests/validation.

### 4. Hard-gate confirmation
Explicitly state whether each B06 hard gate passed:

| Gate | PASS/FAIL | Evidence |
|---|---|---|
| No auto-polling |  |  |
| Manual refresh only in focused module |  |  |
| No durable queue cache |  |  |
| No browser queue persistence |  |  |
| 429 classified and bounded |  |  |
| Retry-After honored where applicable |  |  |
| Refresh failure → authorization-required |  |  |
| No token/code/callback leakage |  |  |
| No agreement/sender metadata telemetry leak |  |  |
| Evidence sanitation preserved |  |  |
| Section 18 taxonomy preserved |  |  |

### 5. Validation commands
List exact commands and results.

### 6. Residual risk register
Carry forward only real residuals, such as:
- hosted tenant validation not yet executed,
- B05 dependency still pending if applicable,
- future webhook architecture intentionally deferred,
- future cache architecture intentionally rejected for MVP.

### 7. Scope compliance
Confirm:
- no webhook runtime added,
- no queue cache added,
- no unrelated PCC refactor,
- no broadened Adobe scope,
- no client-side token handling,
- no raw evidence artifacts committed.

### 8. Recommended commit
Provide:
- commit title,
- commit description.

Recommended title:

```text
feat(my-dashboard): harden B06 resilience privacy telemetry and evidence posture
```

## Final instruction

Be exact. If any hard gate failed, emit FAIL and state why. Do not paper over missing proof.
