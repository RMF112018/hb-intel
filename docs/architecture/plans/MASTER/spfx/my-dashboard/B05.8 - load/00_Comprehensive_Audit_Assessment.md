# 00 — Comprehensive Audit Assessment

## Objective

This document captures the evidence-backed assessment of the My Dashboard load-time problem and converts the audit findings into remediation-ready conclusions.

The working problem statement is:

> My Dashboard and its primary modules feel slow, with user-observed load times of roughly 5+ seconds before the page becomes genuinely useful.

The assessment distinguishes:

1. **Proven frontend UX orchestration defects**
2. **Likely backend latency contributors**
3. **Observability gaps that prevent definitive root-cause ranking**
4. **Remediation priorities that should occur before broader architecture changes**

---

# Executive Verdict

## Verdict

The current My Dashboard load posture is a combined issue:

- **Proven user-experience defect:** My Projects is not mounted during initial home-envelope loading, which delays its separate backend request and makes the page feel more sequential than necessary.
- **Likely real backend latency contributors:** Adobe Sign’s home projection performs a sequential principal/token/search path, and My Projects can execute large Graph-backed source loads.
- **Unproven infrastructure hypothesis:** Azure Function cold start may contribute, but current repo truth and available telemetry do not prove it as the primary driver.
- **Required next move:** Correct frontend load choreography immediately, then instrument the system well enough to make an evidence-based backend optimization decision.

---

# Current Runtime Call Graph

## Initial page mount

```text
MyDashboardApp
  -> MyWorkReadModelClientProvider
  -> MyWorkShell
      -> MyWorkActiveEnvelopeProvider
          -> useMyWorkHomeEnvelope()
              -> client.getMyWorkHome()
                  -> GET /api/my-work/me/home

      -> MyWorkSurfaceRouter
          -> selectSurfaceReadiness(home envelope)

      -> MyWorkHomeSurface
          if readiness == loading:
              render Adobe card only
              do not mount My Projects
          else:
              render My Projects card
              render Adobe card

      -> MyProjectsHomeCard
          -> createMyWorkReadModelClient({ getApiToken })
          -> client.getMyProjectLinks()
              -> GET /api/my-work/me/project-links
```

## Deferred Adobe recent completions flow

```text
AdobeSignActionQueueCard
  -> initial activeView = action-queue
  -> completed read-model hook disabled

User switches to completed view
  -> useAdobeSignRecentCompletionsReadModel enabled
      -> GET /api/my-work/me/adobe-sign/recent-completions
```

This deferred behavior is correct and should remain intact.

---

# Proven Frontend Findings

## 1. My Projects is currently hidden during page-envelope loading

`MyWorkHomeSurface` branches on `readinessVariant`:

- `loading` → Adobe card only
- `error` → Adobe card only
- resolved variants → My Projects + Adobe card

This means My Projects does not mount while `/home` remains unresolved.

### Why this matters

My Projects does **not** depend on the home envelope for its data. It owns a separate `/project-links` read. Therefore, gating its mount behind `/home` is an avoidable sequencing defect.

### User-visible consequence

The user experiences:

```text
Wait for Adobe/home read to resolve
Then My Projects appears
Then My Projects starts loading
Then My Projects becomes useful
```

This stretches perceived page readiness and can also stretch actual dashboard usefulness.

---

## 2. Current tests lock in the weaker UX contract

Tests currently assert that while home is loading:

- the Adobe card is present,
- My Projects is absent.

This is not merely incidental behavior. It is a tested contract that must be intentionally revised.

### Required remediation implication

The remediation must update:

- production component logic,
- surface tests,
- router integration tests,
- any comments that incorrectly state that My Projects should not render in loading/error variants.

---

## 3. My Projects owns a local client factory seam

`MyProjectsHomeCard` currently creates a client through:

```ts
createMyWorkReadModelClient({ getApiToken })
```

while the app already provides a read-model client through context.

### Why this matters

This creates:

- inconsistent client ownership,
- avoidable surface-level data composition,
- possible request-refire sensitivity if `getApiToken` identity changes,
- a less centralized path for future dedupe/caching.

### Required remediation implication

My Projects should use the shared provider:

```ts
const client = useMyWorkReadModelClient();
```

and no longer require `getApiToken` to be threaded through:
- `MyWorkShell`
- `MyWorkSurfaceRouter`
- `MyWorkHomeSurface`
- `MyProjectsHomeCard`

for project-link loading.

---

# Backend Read-Model Findings

## 1. `/home` is Adobe-Sign dependent

The home route delegates to `getMyWorkHome()`, which calls the Adobe Sign action-queue adapter using a bounded preview query.

The Adobe queue adapter is sequential:

```text
principal resolution
  -> token acquisition
      -> possibly refresh
  -> Adobe /v6/search request
  -> map results
  -> build envelope
```

### Conclusion

If Adobe Sign is slow, `/home` can be slow. That is architecturally expected from the current home-envelope design.

---

## 2. `/project-links` performs potentially heavy source work

The Project Links provider:

- normalizes actor UPN,
- runs two loaders in parallel:
  - Projects list
  - Legacy Fallback Registry list
- each loader can retrieve up to `MAX_SOURCE_ROWS = 25000`,
- reconciles assignments in memory,
- builds launch actions and warnings.

### Conclusion

Project Links has a credible path to multi-second latency if:
- token acquisition is slow,
- Graph metadata resolution is slow,
- list item fetches are large,
- list paging is significant,
- in-memory reconciliation becomes expensive.

This is a strong optimization candidate if timing evidence confirms it.

---

# Observability Gap Assessment

## Current backend telemetry is helpful but insufficient

Existing telemetry already includes:

- auth success/error with durations,
- handler invoke/success/error with durations,
- Adobe result events,
- My Project Links loader failure events.

However, the current telemetry does **not** sufficiently isolate:

### Adobe
- principal resolution duration,
- grant lookup duration,
- token-service duration,
- refresh duration,
- Adobe search HTTP duration,
- mapping duration.

### Project Links
- Graph token duration,
- Projects source loader duration,
- Registry source loader duration,
- reconciliation duration,
- total row counts at source and post-match levels.

### Frontend
- shell rendered time,
- home request duration,
- project-links request duration,
- module useful-state timing,
- request overlap proof.

---

# Root Cause Classification

| Hypothesis | Classification | Rationale |
|---|---|---|
| My Projects is delayed by unnecessary frontend gating | Proven | It is not mounted during home loading/error variants. |
| Initial page loads are more sequential than necessary | Proven | `/project-links` cannot begin until My Projects mounts. |
| Adobe Sign home route can materially affect page usefulness | Proven | `/home` depends on Adobe queue read. |
| Project Links backend may be expensive | Likely | Large Graph-backed source reads and reconciliation path. |
| Cold start dominates the 5+ second load | Plausible but unproven | No hosting-plan or warm/cold timing proof. |
| Duplicate same-route requests occur on first load | Plausible but unproven | Potential refire risk; no runtime proof yet. |
| Caching should be implemented immediately | Not yet proven | Requires staleness policy and timing evidence. |
| Better instrumentation is required before larger refactor | Proven | Current telemetry lacks stage durations. |

---

# Recommended Target Architecture

## This package adopts a hybrid architecture

### Keep
- `/home` for Adobe Sign action-preview/home-specific data.
- `/project-links` for My Projects.
- deferred `/recent-completions` on user interaction.

### Change immediately
- Mount both primary cards during page loading and error variants.
- Start `/home` and `/project-links` as independently as possible.
- Centralize client ownership for My Projects.

### Instrument before larger changes
- frontend user timing,
- backend stage duration telemetry.

### Decide later, from evidence
- stale-while-revalidate,
- browser/session cache,
- backend response cache,
- user-project preprojection,
- Graph query narrowing,
- Function hosting changes.

---

# Expected Improvement from Immediate Remediation

## Before

```text
/home request
  -> My Projects mounts
      -> /project-links request
```

## After

```text
/home request
/project-links request
  -> cards resolve independently
```

## Expected effect

The perceived load time of the page should improve materially because:

- My Projects appears immediately.
- Its loading posture becomes visible immediately.
- Its request can overlap with the home request.
- The dashboard reads as intentionally composed rather than partially absent.

This does not guarantee that backend latency disappears, but it **removes avoidable frontend sequencing delay** and improves the experience even if backend calls remain multi-second.

---

# Final Audit Recommendation

Proceed with a remediation package in four code-affecting waves:

1. **Loading choreography correction**
2. **Client-seam ownership cleanup**
3. **Frontend load timing**
4. **Backend stage-duration telemetry**

Then stop and perform a measured evidence review before committing to:
- caching,
- server-side read-model projections,
- Graph source redesign,
- Function hosting or warm-path changes.
