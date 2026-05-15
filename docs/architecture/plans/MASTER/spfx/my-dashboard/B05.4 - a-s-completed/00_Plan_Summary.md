# 00 — Plan Summary

## Objective

Implement a production-grade `Completed` view inside the existing My Dashboard Adobe Sign card without destabilizing the now-working `Action Queue` pending workflow.

## Final UX

The card header becomes:

```text
Adobe Sign
Action Queue    Completed
```

- `Action Queue` is active by default.
- The active label is visually pronounced and occupies the current card-title emphasis.
- The inactive label is smaller but intentional, adjacent, and clearly clickable.
- Selecting a label swaps the rendered card body.
- The header toggle replaces the current static `Action Queue` title; it is not an extra body tab bar.

## Final data architecture

### Pending lane

Remain unchanged:

```text
GET /api/my-work/me/adobe-sign/action-queue
```

DTO family remains unchanged:

```text
MyWorkAdobeSignActionQueue*
```

### Completed lane

Add a new sibling lane:

```text
GET /api/my-work/me/adobe-sign/recent-completions
```

DTO family:

```text
MyWorkAdobeSignRecentCompletions*
```

Definition:

```text
Completed = terminal-completed Adobe Sign agreements visible to the authenticated Adobe principal,
bounded to the last 30 days, ordered most recent first.
```

## Final fetch posture

- No completed request on dashboard cold load.
- First `Completed` selection triggers a completed-route fetch.
- Results stay in memory for the active page session.
- Toggling back to `Action Queue` is immediate.
- Reloading the page returns to `Action Queue` and does not preload completed data.

## Final backend posture

- Keep the same low-level Adobe search transport seam.
- Add an explicit query intent:
  - `action-queue`
  - `recent-completions`
- Add a recent-completions request builder, adapter, provider method, route, and telemetry event.
- Use provider-side Adobe `/v6/search` filters for completed status, recent-window date bound, and descending recency order.
- Do not ship an adapter-only completed filter that scans an unbounded mixed result set.

## Final copy posture

### Header labels

```text
Action Queue
Completed
```

### Completed empty state

```text
No completed Adobe Sign agreements were found in the last 30 days.
```

### Completed degraded state

```text
Recently completed Adobe Sign agreements are temporarily unavailable.
```

### Date labeling

- Use `Completed {date}` only when a true completion timestamp exists.
- Use `Updated {date}` when only a last-modified timestamp exists.
- Do not call a modified date a completion date.

## Final implementation sequence

1. Confirm exact current Adobe completed-search request-body syntax.
2. Add shared contracts, route IDs, fixtures, and exports.
3. Add backend request-builder and search-intent translation.
4. Add backend recent-completions adapter/provider/route/telemetry.
5. Add frontend client and lazy completed state/view-model layer.
6. Replace card title with dynamic header toggle and render completed panel.
7. Reconcile docs and perform closeout validation.
8. Run integrated regression review and remediate any scoped residual defects.
