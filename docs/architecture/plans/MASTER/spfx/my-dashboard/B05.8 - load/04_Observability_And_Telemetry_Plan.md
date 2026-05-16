# 04 — Observability and Telemetry Plan

## Objective

Provide a minimum sufficient timing instrumentation layer to answer the next-order questions:

1. Did frontend choreography remediation reduce time-to-useful?
2. Which backend stage is materially contributing to `/home` latency?
3. Which backend stage is materially contributing to `/project-links` latency?
4. Is there evidence that infrastructure cold-start investigation is warranted?

---

# Part 1 — Frontend User Timing

## Why User Timing

The immediate need is deterministic, browser-visible timing instrumentation that can be inspected locally and in captured Performance traces without requiring a new frontend telemetry pipeline.

---

## Proposed Utility

File:

```text
apps/my-dashboard/src/runtime/myWorkPerformanceMarks.ts
```

Recommended API:

```ts
export type MyWorkPerformanceDetail = Record<string, string | number | boolean | undefined>;

export function markMyWork(
  name: string,
  detail?: MyWorkPerformanceDetail,
): void;

export function measureMyWork(
  name: string,
  startMark: string,
  endMark: string,
  detail?: MyWorkPerformanceDetail,
): void;
```

Requirements:
- if `globalThis.performance` is unavailable, return silently;
- catch API errors rather than throwing;
- accept only safe primitive details;
- no PII or payload data.

---

# Part 2 — Frontend Mark Registry

## Shell marks

| Mark | Timing |
|---|---|
| `my-dashboard:shell:mounted` | `MyWorkShell` mount effect |

## Request marks

For route ID `<routeId>`:

| Mark | Timing |
|---|---|
| `my-dashboard:request:<routeId>:start` | just before token acquisition / backend read call starts |
| `my-dashboard:request:<routeId>:end` | after success/fallback return path settles |
| `my-dashboard:request:<routeId>:duration` | measure from start to end |

Route IDs:
- `home`
- `project-links`
- `adobe-sign-recent-completions`

## Module useful-state marks

| Mark | Meaning |
|---|---|
| `my-dashboard:module:my-projects:useful` | My Projects has exited pure loading |
| `my-dashboard:module:adobe-sign-action-queue:useful` | Adobe card has exited pure loading |

## Recommended useful-state policy

A module is “useful” when it has transitioned to any intentional user-facing state:
- data available,
- empty but confirmed,
- partial,
- auth required,
- configuration required,
- principal unresolved,
- source unavailable,
- backend unavailable.

The goal is not “success only.” The goal is “user can now understand what happened.”

---

# Part 3 — Backend Stage Timing

## Existing posture

The backend already has:
- auth timing,
- handler timing,
- safe result telemetry.

This plan adds **stage-level timing**, not a new parallel logging platform.

---

# Part 4 — Adobe Timing Fields

## Event: `adobeSign.read.principalResolution.result`
Add:
- `durationMs`

## Event: `adobeSign.read.tokenAcquisition.result`
Add:
- `durationMs`

## Event: `adobeSign.read.refresh.result`
Add:
- `durationMs`

## Event: `adobeSign.read.search.result`
Add:
- `durationMs`

## Event: `adobeSign.read.actionQueue.result`
Add:
- `durationMs`

### Why these stages
These provide enough granularity to distinguish:
- lookup/configuration problem,
- grant/token problem,
- refresh problem,
- provider HTTP search problem,
- post-search mapping cost.

---

# Part 5 — Project Links Timing Events

## Event: `myProjectLinks.read.sources.result`

### Required fields
```text
projectsDurationMs
registryDurationMs
projectsStatus
registryStatus
projectsRowCount
registryRowCount
projectsBounded
registryBounded
```

Status values should be closed enums such as:
- `available`
- `partial`
- `source-unavailable`

or align to the source-readiness statuses already in the read-model domain.

## Event: `myProjectLinks.read.reconcile.result`

### Required fields
```text
durationMs
matchedItemCount
sourceStatus
```

Optional safe fields if already easily available:
```text
assignedProjectCount
dualLaunchReadyCount
sharePointReadyCount
procoreReadyCount
```

---

# Part 6 — What This Pass Does Not Add

Do **not** add in this package:
- browser telemetry export,
- GraphListClient per-HTTP-request custom events,
- host-startup synthetic probes,
- cache hit/miss telemetry,
- rate-limited alerting,
- dashboards.

Those are post-evidence decisions.

---

# Part 7 — How the Timing Evidence Will Be Read

## If `/home` is slow and Adobe search duration dominates
Next package should focus on:
- Adobe provider latency,
- API request tuning,
- token refresh interaction,
- user-facing stale/readiness posture.

## If `/project-links` is slow and source loaders dominate
Next package should focus on:
- list query narrowing,
- preprojected assignments,
- server-side short TTL caching,
- Graph metadata resolution and page counts.

## If backend stage durations are low but total network wait is high
Investigate:
- Function host startup,
- plan posture,
- network/platform delay,
- App Service / Functions host scaling behavior.

## If after Prompt 01 the two requests overlap and UX improves materially
Keep the frontend architecture correction regardless of the later backend diagnosis. It is beneficial independently.

---

# Part 8 — Privacy Discipline

All telemetry must remain safe.

Never log:
- token values,
- refresh token refs,
- raw headers,
- raw payloads,
- agreement names,
- project titles,
- actor UPN/email/OID,
- SharePoint or Procore URLs.

---

# Part 9 — Evidence Needed Before Any Hosting Change

Do not recommend a Function plan change until you can compare:

1. first request after idle,
2. warm follow-up request,
3. backend handler stage totals,
4. total network time.

If first-after-idle adds meaningful overhead unexplained by handler stages, then hosting / always-ready evaluation becomes justified.
