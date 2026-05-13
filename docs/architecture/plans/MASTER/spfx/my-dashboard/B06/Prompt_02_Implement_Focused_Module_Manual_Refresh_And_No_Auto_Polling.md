# Prompt 02 — Implement Focused-Module Manual Refresh and No Auto-Polling

## Role

Act as a senior SPFx/React implementation engineer. Implement only the B06 focused-module refresh posture.

## Objective

Harden the Adobe Sign Action Queue focused module so that:

- queue data loads on render as already governed by prior batches,
- a deliberate manual refresh control exists **only** in the focused Adobe queue module,
- repeated refresh actions are debounced,
- duplicate in-flight requests are prevented,
- no auto-polling or hidden refresh trigger is introduced,
- user-facing recency copy remains honest.

## Preconditions

Continue only if Prompt 01 reported:

```text
READY FOR B06 RUNTIME
```

## Implementation requirements

### A. Manual refresh control
Add or refine an explicit focused-module refresh action.

Requirements:
- visible only in the focused Adobe Sign Action Queue module,
- accessible via keyboard,
- uses a busy/disabled state while a request is active,
- does not create duplicate concurrent route calls.

### B. Debounce and in-flight protection
Implement a compact, testable protection strategy that prevents repeated clicks from generating overlapping refresh requests.

Acceptable approaches:
- explicit in-flight guard,
- short controlled debounce,
- a hook or state helper if that matches current component architecture.

### C. Honest freshness copy
Use the existing read-model freshness field(s) to show a “Last refreshed” style of copy where appropriate.

Do not use unsupported copy such as:
- “real-time,”
- “live continuously,”
- “instant updates.”

### D. Preserve state coherence
During refresh:
- do not flash empty state solely because a refresh request began,
- do not drop the current visible state prematurely,
- update the surface only when the new response is available or a deliberate source-state transition is necessary.

## Explicitly prohibited

Do not introduce:
- `setInterval` polling,
- `visibilitychange` refetch,
- window-focus refetch,
- hover-based refetch,
- resize-based refetch,
- animation-completion refetch,
- requerying the backend for every local filter toggle if current in-memory data can be used.

## Testing requirements

Add/update tests proving:
1. manual refresh button/action appears in the focused queue module,
2. no duplicate in-flight refresh occurs,
3. disabled/busy state is applied during refresh,
4. no auto-polling code path exists,
5. copy does not claim unsupported real-time semantics.

## Scope limits

Do not:
- implement backend retries,
- change OAuth/token logic,
- implement webhooks,
- add caching,
- alter unrelated shell choreography.

## Closeout

Report:
- files changed,
- refresh state model used,
- tests added/updated,
- how duplicate in-flight calls are prevented,
- proof that no auto-polling trigger was introduced.
