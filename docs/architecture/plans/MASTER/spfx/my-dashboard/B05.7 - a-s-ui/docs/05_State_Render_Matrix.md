# 05 — State Render Matrix

This matrix is authoritative for what the card must render in each state.

## Action Queue View

| State | Status Chip | Freshness | Summary Rail | State Panel | Activity List | CTA | Preview Context | Retry |
|---|---|---|---|---|---|---|---|---|
| loading | Loading | No | No | Loading panel | No | No | No | No |
| available-empty | Ready | Yes when valid | No | Queue clear empty panel | No | No | No | No |
| available-items | Ready | Yes when valid | Yes | No | Yes | No | Yes only if total > shown | No |
| partial | Partial data | Yes when valid | Yes | Partial caution message | Yes when rows exist | No | Yes only if total > shown | No |
| authorization-required | Connect required | No | No | Authorization panel | No | Connect Adobe Sign | No | No |
| configuration-required | Configuration required | No | No | Configuration panel | No | No | No | No |
| principal-unresolved | Account needs attention | No | No | Principal panel + supporting line | No | No | No | No |
| source-unavailable | Temporarily unavailable | No | No | Source unavailable panel | No | No | No | No |
| backend-unavailable | Temporarily unavailable | No | No | Backend unavailable panel | No | No | No | No |

## Completed View

| State | Status Chip | Freshness | Summary Rail | State Panel | Activity List | CTA | Preview Context | Retry |
|---|---|---|---|---|---|---|---|---|
| idle | Ready | No | No | None until selected | No | No | No | No |
| loading | Loading history | No | No | Loading history panel | No | No | No | No |
| available-empty | Ready | Yes when valid | No | Completed empty panel | No | No | No | No |
| available-items | Ready | Yes when valid | Yes | No | Yes | No | Yes only if total > shown | No |
| partial | Partial data | Yes when valid | Yes when count exists | Partial caution message | Yes when rows exist | No | Yes only if total > shown | No |
| authorization-required | Authorization required | No | No | Authorization panel | No | No | No | Yes |
| configuration-required | Configuration required | No | No | Configuration panel | No | No | No | Yes |
| principal-unresolved | Account needs attention | No | No | Principal panel | No | No | No | Yes |
| source-unavailable | Temporarily unavailable | No | No | Source unavailable panel | No | No | No | Yes |
| backend-unavailable | Temporarily unavailable | No | No | Backend unavailable panel | No | No | No | Yes |

## Summary Rail Rules

### Action Queue summary

Render three metrics when state is `available-items` or `partial`:

1. Pending agreements
2. Signature actions
3. Review actions

### Completed summary

Render one strong metric when state is `available-items` or `partial`:

```text
{count} completed in the last {windowDays ?? 30} days
```

Use the normalized value from the summary view model. If `windowDays` is not available, default display language to a guarded recent reporting window rather than inventing a precise period.

## Activity List Rules

### Queue rows

Render each row with:

- agreement title;
- required action label;
- sender label if present;
- expiration label if present;
- explicit `Open` link if `sourceOpenUrl` exists.

### Completed rows

Render each row with:

- agreement title;
- date label if present;
- sender label if present;
- explicit `Open` link if `sourceOpenUrl` exists.

Metadata fallback rule:

1. date;
2. sender;
3. `Completion metadata not reported.` only if both absent.

## Preview Context Rules

### Queue

When total pending count > visible queue rows:

```text
Showing {visibleCount} of {totalCount} agreements requiring action.
```

### Completed

When total completed count > visible rows:

```text
Showing latest {visibleCount} of {totalCount} completed agreements.
```

No preview context is rendered when visible count equals total count or count is unavailable.

## View Switch Visibility

The view switch renders only when the card is in a state capable of presenting both views:

- `available-empty`
- `available-items`
- `partial`

This preserves the existing established policy.

## Retry Scope

Retry is only for the Completed view's card-owned lazy read:

- not for Action Queue home-read failures;
- not for overall shell readiness failures;
- not for Adobe OAuth connect failures.
