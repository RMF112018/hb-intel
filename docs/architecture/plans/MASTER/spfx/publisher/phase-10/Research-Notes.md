# Research Notes

## Why compensation, not simplistic rollback, matters here
The Publisher is not writing to one transactional database row. It is coordinating:
- SharePoint list writes
- SharePoint page mutation / publish / demotion operations
- UI-observable workflow state
- audit/error rows

That means the correct end state after failure is **application-specific**. A “rollback” that restores only one surface can be worse than no rollback because it creates contradictory truth. The updated prompts therefore require one explicit consistency model per seam rather than ad hoc best-effort reversal.

## Research takeaways applied to this package

### SharePoint write posture
- In SPFx, non-GET SharePoint REST calls require a valid request digest. `SPHttpClient` is the recommended path because it handles request digests automatically; `DigestCache` is the fallback when direct fetch-based code must be retained.  
- SharePoint REST also supports `$batch`, which can reduce round trips, but batching alone does not solve higher-level business consistency across page operations, list writes, and compensation.

**How that affects this package**
- Do not expand raw ad hoc fetch/digest handling unless a prompt explicitly needs it.
- Prefer localized orchestration and explicit outcome modeling over pretending the whole workflow is transaction-safe.

### Compensating transaction / idempotency posture
- Compensating work should be designed around the application’s real truth model, not assumed to be a literal reverse of prior steps.
- Compensation steps should be idempotent or safely retryable.
- The system needs a clear record of what step failed and what compensating action did or did not happen.

**How that affects this package**
- Prompts 02 and 03 explicitly require a chosen consistency model and explicit outcome matrix.
- Prompts must not accept partial rollback that leaves page, binding, master, and history disagreeing.

### Vitest testing posture
- Vitest recommends isolated mock control and reset/restore discipline.
- For network-heavy tests in Node, Vitest recommends Mock Service Worker (MSW) when request interception is needed without rewriting application code.

**How that affects this package**
- Prefer narrow seam tests with `vi.fn` / `vi.spyOn` where the seam is already injectable.
- Use MSW only if the implementation change genuinely benefits from request-level interception; do not add it as ceremony where current seam injection is already sufficient.

## Dependency guidance
This package does **not** force new dependencies by default. Current repo seams are already injectable in the high-value places. Add a dependency only when it materially improves execution quality for this codebase, not because it is fashionable.

Potentially justified additions only if implementation truly benefits:
- **MSW** for higher-fidelity request-path tests if direct fetch interception becomes cumbersome.
- No generic transaction library recommendation; SharePoint/page coordination still needs application-specific orchestration logic.
