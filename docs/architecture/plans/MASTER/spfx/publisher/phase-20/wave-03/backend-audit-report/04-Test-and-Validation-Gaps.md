# 04 — Test and Validation Gaps

## Current repo-truth coverage observed

The live repo already contains meaningful backend tests, especially around:

- validation behavior
- readiness controller behavior
- publish-orchestrator lifecycle sequencing
- compensation and late-failure truthfulness
- republish policy behavior
- milestone legacy blocking
- some structured supersession capture in tests

This is important context.
The backend is not untested.

## Remaining coverage gaps relative to closure

### Dirty-state publish truth
The current readiness tests do not yet prove that dirty drafts cannot reach ordinary publish/republish through the primary rail contract.
That must be added.

### Operational `RequiredFieldSetKey` fail-closed behavior
Current validation tests still encode warning-only fallback for unknown keys.
Those tests must be updated or replaced to reflect the intended operational fail-closed posture.

### Read-model diagnostics
There is not yet strong evidence of tests proving structured mapper/repository diagnostics on malformed child/control-plane rows.
Those tests must be added.

### Duplicate ambiguity
I did not find strong evidence of tests proving duplicate fail-closed behavior on key control-plane reads such as current binding or template-key selection.
Those tests must be added.

### Structured lineage
Current orchestrator tests already prove `supersededBinding` capture and note-stamped history text.
Those tests must be upgraded to assert the new structured lineage destination.

### Structured publishing-error classification
Current orchestrator tests prove stage-aware error behavior in practice, but not through stronger list fields.
Those tests must be extended once the error schema is hardened.

## Audit conclusion

The rebuilt package should not ask for “more tests” generically.
It should ask for very targeted test upgrades that correspond to each still-open backend seam.
