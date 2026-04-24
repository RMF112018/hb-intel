# 07 — Deferred Work Production Impact

## Azure Functions Sync Routes

Decision: **Production blocker for broad rollout.**

Reason: Foleon API authentication uses client credentials and must not run inside SPFx. Any governed sync of Docs, Projects, and Analytics must be backend-owned. Manual list maintenance may be acceptable for a narrow prototype but is not production-sufficient for a governed HB Central integration.

## `HB_FoleonProjectsRegistry`

Decision: **Recommended Wave 02; blocker if project filtering, ownership, or portfolio mapping is expected at launch.**

Reason: Without a project registry, the Content Hub and analytics model cannot reliably map Foleon content to HB projects, sectors, departments, or ownership.

## `HB_FoleonAnalyticsSnapshots`

Decision: **Recommended Wave 02; blocker if executive analytics are part of launch scope.**

Reason: Foleon Analytics should be queried server-side and stored as normalized snapshots for dashboard use, not derived exclusively from client Reader events.

## `HB_FoleonSyncRuns`

Decision: **Production blocker once automated sync exists.**

Reason: Sync runs provide health, support, failure classification, partial-run evidence, and stale-data diagnostics.

## Admin Panel Webpart

Decision: **Production blocker for delegated business administration; Wave 02 if launch is IT-managed only.**

Reason: Without an admin surface, list governance remains manual and error-prone. However, an IT-only controlled launch could defer it briefly if schema/provisioning and runbooks are strong.

## `@hbc/homepage-launcher` Card Registration

Decision: **Production blocker if the app must be discoverable from HB Central launch surfaces at release; otherwise Wave 02.**

Reason: The app can technically exist without launcher registration, but discoverability and governed navigation are part of HB Central production UX.

## Overall Deferred-Work Decision

The deferred work described in the commit summary is not inherently wrong for MVP, but because the base implementation is absent from `main`, deferral cannot be accepted as a reason to release. After source-of-truth is fixed, backend sync and schema proof should be classified as launch-critical; admin and analytics can be wave-two only if the launch scope is constrained.
