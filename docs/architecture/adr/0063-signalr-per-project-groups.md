# ADR-0063: SignalR Per-Project Groups for Provisioning Progress

**Status:** Accepted
**Date:** 2026-03-07
**Decision Owners:** HB Intel platform engineering
**Traceability:** D-PH6-07, `docs/architecture/plans/PH6.7-SignalR-Hub.md` §6.7

## Context

Provisioning progress must be delivered in real time with strict scope boundaries:
project participants receive project-specific progress, while Admin users can monitor
all projects. The implementation must also support SPFx-hosted clients where negotiate
authentication uses Entra ID via `AadHttpClient`.

## Decision

Per-project SignalR groups named `provisioning-{projectId}` are used for real-time
provisioning progress delivery. Admin users are additionally added to `provisioning-admin`
to receive all project events. Groups are closed on terminal saga state (`Completed` or
`Failed`) to prevent stale project subscriptions.

## Consequences

Group membership management requires Azure SignalR data-plane management API calls.
SPFx web parts must call negotiate with `AadHttpClient` to acquire a Bearer token before
connecting. Client connection lifecycle behavior (automatic reconnect and re-negotiate for
fresh group assignment) must be handled client-side.
