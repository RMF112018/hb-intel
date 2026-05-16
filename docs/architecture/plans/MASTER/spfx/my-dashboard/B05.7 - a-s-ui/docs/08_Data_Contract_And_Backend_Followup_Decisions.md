# 08 — Data Contract and Backend Follow-Up Decisions

## Scope Decision

This implementation package is a **frontend/card remediation**. It does not authorize backend/functions changes.

## Current Contract Strengths

The existing client/view-model layer already supplies enough data to materially improve the UI:

- queue totals;
- signature/review counts;
- completed count;
- completion window days;
- last-refreshed generated timestamps;
- row titles;
- sender labels;
- optional date labels;
- optional row-level truthful Adobe Sign URLs;
- `hasMore` pagination indicator.

## UI Decisions That Use Existing Data Better

### 1. Freshness Rail

Use existing generated timestamp data to display:

```text
Last refreshed {timestamp}
```

when valid.

### 2. Preview Context

Use:

- total count;
- visible list count;
- list `hasMore` or summary count;

to render preview context when visible rows are fewer than total.

### 3. Completed Summary

Use:

- `completedAgreementCount`;
- `windowDays`;

to render:

```text
{count} completed in the last {windowDays} days
```

or a guarded recent-window fallback.

## Missing Date Handling Decision

### Current problem

The current UI shows repeated:

```text
Updated date unavailable
```

This visibly degrades perceived module quality.

### Locked remediation

Do not attempt backend edits in this package. The frontend must:

1. render a date label when one exists;
2. render sender-only metadata when the date is absent and sender exists;
3. render subdued:
   - `Completion metadata not reported.`
   only when both date and sender are absent.

## Backend Follow-Up Rule

If the local agent discovers, during read-only inspection, that:

- `completedAtUtc` or `modifiedAtUtc` data is already available but the frontend mapping discards it,

then the agent may correct only the **frontend view-model mapping** within the allowed files.

If the weakness originates in:

- backend adapter output;
- Adobe provider response normalization;
- Azure Functions read-model assembly;

the agent must **not** alter backend code in this package. Instead, record a follow-up item in the Prompt 08 closeout report.

## No Contract Broadening

Do not:

- add new response fields;
- redefine model interfaces;
- alter route schemas;
- change backend route behavior;
- rewrite fixture families except where frontend tests require expected display assertions against existing fixtures.

## Retry Scope Decision

Completed-panel retry is frontend card-owned behavior. It reissues the existing card-owned recent-completions request. It does not:

- clear OAuth state;
- mutate provider credentials;
- bypass backend fallback;
- alter backend contract.

## Integration Safety

Preserve:

- no synthesized URLs;
- no write paths;
- no Adobe mutation flows;
- no tenant mutation;
- no backdoor provider assumptions.
