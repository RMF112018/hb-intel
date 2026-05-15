# 02 — Outside Research Summary

## Objective

Summarize the research conclusions that govern the completed-agreements implementation without leaving product semantics open.

## Research conclusion 1 — correct endpoint family

The completed view should remain in the Adobe Sign `POST /api/rest/v6/search` family.

Reason:

- it is the bounded query surface already used by the current pending implementation;
- Adobe positions search as the filtered/paginated retrieval surface for agreement assets;
- it is the most coherent source for a read-only recent-completions list.

## Research conclusion 2 — completed view definition

The product must be implemented as:

```text
Recently completed agreements visible to the authenticated Adobe Sign principal.
```

Do not present it as:

```text
Actions completed by the user.
```

The public Adobe material retrieved during the audit supported completed terminal-state agreement retrieval concepts, but did not conclusively establish a bulk “actions I personally completed” query.

## Research conclusion 3 — date window

The implementation target is fixed:

```text
Last 30 days
```

The search intent must be provider-side bounded and sorted most-recent first.

## Research conclusion 4 — request-body shape verification gate

The local agent must confirm the exact current Adobe `/v6/search` request-body syntax for:

- completed status filter;
- bounded recent-date filter;
- descending recency sort.

This confirmation must be performed before code implementation.

This is not an open product decision. It is a required technical verification gate.

## Research conclusion 5 — fail-closed behavior

If the exact provider-side request syntax cannot be verified from official Adobe sources or safe repo/runtime evidence, the agent must:

1. stop before implementing the completed query body;
2. document what was confirmed and what was not;
3. return a blocker rather than inventing a body shape.

The package does not allow an adapter-only unbounded completed scan as a fallback.

## Research conclusion 6 — row labeling

Completed-row date copy must remain truthful:

- `Completed {date}` only for a true completion timestamp.
- `Updated {date}` when only modified-date data is available.
- No inferred actor-of-completion claims.
