# 07 — Copy Deck and Content Rules

This is the production copy lock for the Adobe Sign flagship remediation.

## Card Identity

```text
Eyebrow: Adobe Sign
Title: Agreement Activity
```

## View Switch Labels

```text
Action Queue
Completed
```

## Status Chip Copy

### Action Queue

| State | Chip |
|---|---|
| loading | Loading |
| available-empty | Ready |
| available-items | Ready |
| partial | Partial data |
| authorization-required | Connect required |
| configuration-required | Configuration required |
| principal-unresolved | Account needs attention |
| source-unavailable | Temporarily unavailable |
| backend-unavailable | Temporarily unavailable |

### Completed

| State | Chip |
|---|---|
| idle | Ready |
| loading | Loading history |
| available-empty | Ready |
| available-items | Ready |
| partial | Partial data |
| authorization-required | Authorization required |
| configuration-required | Configuration required |
| principal-unresolved | Account needs attention |
| source-unavailable | Temporarily unavailable |
| backend-unavailable | Temporarily unavailable |

## Freshness Copy

When a valid last-refreshed timestamp exists:

```text
Last refreshed {timestamp}
```

Suppress if invalid/unavailable.

## Action Queue — State Copy

### Loading

```text
Loading your Adobe Sign action queue…
```

### Empty Ready State

Title:

```text
No Adobe Sign agreements need your action.
```

Body:

```text
Your queue is clear based on the latest available Adobe Sign read.
```

### Partial

```text
Some queue details may be incomplete. Showing the latest available Adobe Sign results.
```

### Authorization Required

Title:

```text
Connect Adobe Sign to load your action queue.
```

Body:

```text
Agreements needing your review, signature, approval, or other action will appear here after authorization.
```

CTA:

```text
Connect Adobe Sign
```

Connecting CTA label:

```text
Connecting…
```

Connect failure alert:

```text
Unable to start the Adobe Sign connection. Please try again.
```

### Configuration Required

Title:

```text
Adobe Sign setup is required.
```

Body:

```text
This dashboard cannot load agreement activity until Adobe Sign configuration is completed.
```

### Principal Unresolved

Title:

```text
Adobe Sign account matching needs attention.
```

Body:

```text
Your HB account could not be matched to an Adobe Sign user for this activity panel.
```

Supporting line:

```text
Contact an administrator if this persists.
```

### Source Unavailable

Title:

```text
Adobe Sign is temporarily unavailable.
```

Body:

```text
Your action queue will resume once the source is reachable.
```

### Backend Unavailable

Title:

```text
The My Dashboard service is temporarily unavailable.
```

Body:

```text
Try again shortly.
```

## Completed — State Copy

### Loading

```text
Loading recent Adobe Sign completions…
```

### Empty Ready State

Title:

```text
No completed agreements were found in the last 30 days.
```

Body:

```text
Recent completion history will appear here when Adobe Sign reports completed agreements.
```

### Partial

```text
Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.
```

### Authorization Required

Title:

```text
Adobe Sign authorization is required.
```

Body:

```text
Connect Adobe Sign before recent completion history can load.
```

### Configuration Required

Title:

```text
Adobe Sign setup is required.
```

Body:

```text
Recent completion history cannot load until Adobe Sign configuration is completed.
```

### Principal Unresolved

Title:

```text
Adobe Sign account matching needs attention.
```

Body:

```text
Your HB account could not be matched to an Adobe Sign user for recent completion history.
```

### Source Unavailable

Title:

```text
Recent Adobe Sign completions are temporarily unavailable.
```

Body:

```text
The source is not reachable right now.
```

### Backend Unavailable

Title:

```text
Recent Adobe Sign completions are temporarily unavailable.
```

Body:

```text
The My Dashboard service could not load completion history right now.
```

### Retry CTA

```text
Retry
```

## Summary Rail Copy

### Action Queue metric labels

```text
Pending agreements
Signature actions
Review actions
```

### Completed metric label

Preferred rendered summary sentence:

```text
{count} completed in the last {windowDays} days
```

If `windowDays` is not available, use:

```text
{count} completed in the recent reporting window
```

Do not invent a 30-day window if the normalized summary does not prove it.

## Preview Context Copy

### Action Queue

```text
Showing {displayedCount} of {totalCount} agreements requiring action.
```

### Completed

```text
Showing latest {displayedCount} of {totalCount} completed agreements.
```

Render only when total count exceeds displayed count.

## Row Copy Rules

### Action Queue rows

Metadata order:

1. required action label;
2. sender label if present:
   - `From {sender}`;
3. expiration label if present:
   - `Expires {date}`.

Never render empty separators.

### Completed rows

Metadata order:

1. completed or updated date label if present;
2. sender label if present:
   - `From {sender}`.

Fallback behavior:

- if date missing and sender present, render sender only;
- if both missing, render:
  - `Completion metadata not reported.`

Do not render:

```text
Updated date unavailable
```

## Row Action Copy

Visible text:

```text
Open
```

Do not use:

- `Launch`
- `Go`
- `Open in Adobe Sign`

for the trailing row action in this remediation. The module context already establishes Adobe Sign; the shorter action improves scanability.

## Tooltip Copy

If an icon-only external-link treatment is introduced alongside `Open`, the visible text remains `Open`. No tooltip is required for text+icon.

If a purely icon-only action is ever proposed, stop. This package requires a visible text action.

## Copy Tone

Copy must be:

- plainspoken;
- operational;
- user-facing;
- non-developer;
- truthful;
- not overexplained.
