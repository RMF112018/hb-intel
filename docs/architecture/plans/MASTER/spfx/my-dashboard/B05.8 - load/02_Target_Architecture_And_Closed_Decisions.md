# 02 — Target Architecture and Closed Decisions

## Purpose

This document defines the intended post-remediation architecture for the My Dashboard load path. It closes implementation choices so the code agent does not invent a new architecture while making the changes.

---

# Target Architecture

## Primary page composition

```text
My Dashboard primary page
  -> Hero / command shell renders immediately
  -> My Projects card renders immediately
  -> Adobe Sign Agreement Activity card renders immediately
```

No primary card should disappear merely because another module's backend data is still loading.

---

# Target Data-Loading Model

## Hybrid model retained

```text
/home
  -> Adobe Sign home projection

/project-links
  -> My Projects module data

/adobe-sign/recent-completions
  -> deferred until completed view is activated
```

This package does **not** collapse all modules into one page envelope and does **not** split the Adobe home preview further.

---

# Closed Decision 1 — Render Card Chrome Independently of Data

## Required behavior

### During `/home` loading
- Hero visible.
- My Projects visible in its own local loading state.
- Adobe visible in its own home-envelope loading state.

### During `/home` error
- Hero visible.
- My Projects visible and independently resolving if its own backend path is available.
- Adobe visible in backend-unavailable state.

---

# Closed Decision 2 — My Projects Must Use Shared Client Context

## Current anti-pattern

```ts
createMyWorkReadModelClient({ getApiToken })
```

inside the card.

## Target pattern

```ts
const client = useMyWorkReadModelClient();
```

The app root already owns client creation through:

```text
MyWorkReadModelClientProvider
```

My Projects must consume that seam instead of constructing a second ownership path.

---

# Closed Decision 3 — Remove Obsolete Token Plumbing

After My Projects moves to shared client context, remove `getApiToken` from the internal path used only to support that card.

## Remove from
- `MyProjectsHomeCardProps`
- `MyWorkHomeSurfaceProps`
- `MyWorkSurfaceRouterProps`
- `MyWorkShell -> MyWorkSurfaceRouter` prop pass

## Keep where still needed
- `MyDashboardApp`
- `MyWorkReadModelClientProvider`
- `MyWorkShell` OAuth connect callback

---

# Closed Decision 4 — Instrument, Do Not Prematurely Cache

No persistent or session cache is added in this package.

## Why
Caching may be valuable, but it requires decisions on:
- freshness,
- invalidation,
- sensitivity of cached project/Adobe payloads,
- service boundaries.

The current remediation package should produce evidence needed to decide responsibly.

---

# Closed Decision 5 — Preserve Current Adobe Completed-View Deferred Fetch

The existing completed-view request should remain:

```text
disabled until the user activates the completed view
```

This is a good example of deferring non-critical work until needed.

---

# Closed Decision 6 — Performance Instrumentation Is Privacy-Safe

No emitted mark/event/telemetry payload may include:
- names,
- emails,
- UPNs,
- project identifiers,
- agreement titles,
- external URLs,
- tokens,
- raw payload fragments.

Allowed fields:
- route IDs,
- module IDs,
- enum status values,
- boolean bounded flags,
- counts,
- durations.

---

# Closed Decision 7 — Backend Telemetry Should Reuse Existing Diagnostic Channels

## Adobe
Prefer adding `durationMs` fields to existing events.

## Project Links
Use the existing Project Links diagnostic reporter for new summary timing events.

Do not create a disconnected one-off logging system.

---

# Closed Decision 8 — Tests Must Encode the Improved User Experience

The updated test contract must prove:

1. Both cards render in loading/error.
2. My Projects initiates its own read while home remains unresolved.
3. Adobe remains in its appropriate local state.
4. No false “ready” marker is emitted during unresolved home reads.
5. Existing compact two-card layout remains intact across breakpoint modes.

---

# Recommended Post-Remediation Runtime Flow

```text
MyDashboardApp mounts
  -> shell renders immediately
  -> home envelope request begins
  -> My Projects card renders immediately
      -> project-links request begins
  -> Adobe card renders immediately
      -> shows loading state from home envelope readiness
  -> whichever request resolves first updates its card first
```

This is the target runtime model for this package.

---

# Deferred Decisions

These decisions remain intentionally deferred until evidence exists:

- sessionStorage stale cache,
- server-side cache,
- Graph query rearchitecture,
- user-project projection store,
- Graph metadata request promise memoization,
- Function hosting plan / always-ready / prewarm change.

The agent may mention these in Prompt 06, but must not implement them in Prompts 01–05.
