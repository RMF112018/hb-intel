# 02 — Implementation Reality and Gap Analysis

## A. Dirty working-copy publish truthfulness

### Current implementation reality
The live shell already does all of the following:

- computes `isDirty` against a baseline snapshot
- protects browser unload while dirty
- caches a local working copy
- offers `Save and refresh preview` when preview is stale relative to in-memory edits
- centralizes publish/republish enablement in `useReadinessController.ts`

But the lifecycle path still lets `handlePublishAction(...)` call `orchestrator.run(...)` directly without a save-first handshake, and readiness enablement still does not incorporate dirty-state truth.

### Residual gap
The system still allows the most important incorrect path: ordinary Publish/Republish can remain reachable while the visible working copy differs from the saved backend draft.

### Why the prior prompt was insufficient
It described the problem too broadly and did not account for the already-landed preview/save truth loop. The rebuilt prompt therefore has to close the specific remaining inconsistency instead of re-auditing preview architecture from scratch.

---

## B. Template-contract governance

### Current implementation reality
The current repo already has:

- authoring-health preflight states such as `emptyRegistry`, `registryReadFailure`, `loading`, and `draftNoTemplateMatch`
- milestone legacy hard-block for publish/republish
- save-time system-managed template resolution

But `validationEngine.ts` still treats unknown `RequiredFieldSetKey` values as warnings and falls back to global rules.

### Residual gap
An operational template row can still weaken its own template-specific validation contract without converting that into a publish-blocking condition.

### Why the prior prompt was insufficient
It did not clearly separate the intentional milestone legacy boundary from the still-open operational fail-open seam, and it did not force replacement of stale tests that currently encode warning-only fallback.

---

## C. Read-model rejection diagnostics

### Current implementation reality
The repo already intentionally rejects malformed rows rather than coercing them. That strictness is good.

### Residual gap
Rejected rows still mostly disappear through `mapAll(...)` style filtering, with no coherent structured diagnostics surface for callers.

### Why the prior prompt was insufficient
It asked for visibility but did not force the code agent to choose and implement a concrete diagnostic pattern across repositories and callers.

---

## D. Key governance and schema authority

### Current implementation reality
The code uses a consistent text-key relationship model.
That architecture is valid if hardened.

### Residual gap
The repo still does not provide clearly proven authoritative checked-in ownership for uniqueness/index settings, and several control-plane reads/writes still accept first-match ambiguity.

### Why the prior prompt was insufficient
It was too tolerant about “hardening strategy” and did not force a clear answer to the question of who owns the key contract.

---

## E. Binding lineage

### Current implementation reality
The repo already captures `supersededBinding` on regenerate and stamps it into workflow-history note text.

### Residual gap
Durable machine-readable lineage is still too dependent on note text rather than structured fields.

### Why the prior prompt was insufficient
It correctly identified the issue, but did not reflect the partial mitigation already in place and therefore did not focus the agent on the exact remaining problem.

---

## F. Publishing-error operability

### Current implementation reality
The orchestrator already records failures best-effort and prefixes the error title with contextual stage information.

### Residual gap
The underlying error list schema remains too coarse. Detailed stage/subsystem meaning still depends too heavily on text formatting discipline.

### Why this must now be a real prompt
This affects backend observability, failure triage, and operability. It is in scope and should not remain a soft recommendation.
