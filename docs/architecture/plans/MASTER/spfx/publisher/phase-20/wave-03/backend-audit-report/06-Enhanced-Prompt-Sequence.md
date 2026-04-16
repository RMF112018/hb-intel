# 06 — Enhanced Prompt Sequence

## Recommended closure order

### 1. Dirty-draft publish truthfulness
This remains the highest user-facing correctness issue.

### 2. Operational template-contract fail-closed behavior
This is the next highest governance issue because a misconfigured template row can still weaken validation.

### 3. Read-model diagnostics
This improves backend truthfulness and will also make later schema hardening easier to validate.

### 4. Key governance and schema authority
This is the first deeper list hardening step and should land before lineage/error-surface expansion.

### 5. Structured binding lineage
Once key authority is firmer, lineaging the current-binding supersession becomes less fragile.

### 6. Structured publishing-error classification
This completes the backend operability loop and makes failure triage durable.

## Why this order is correct

- Prompt 01 first because stale-state publishing is the most visible correctness defect
- Prompt 02 second because control-plane contract weakness can still allow under-governed publish readiness
- Prompt 03 before 04 because structured diagnostics help prove later hardening work rather than hiding malformed states
- Prompt 04 before 05 and 06 because key authority should stabilize before adding more schema structure on top of it
- Prompt 05 before 06 because lineage hardening is more central to the one-row current-binding model
