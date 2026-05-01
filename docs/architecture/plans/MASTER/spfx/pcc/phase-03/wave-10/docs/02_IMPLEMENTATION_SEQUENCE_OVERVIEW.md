# Implementation Sequence Overview

## Objective

Build the first controlled Phase 3 / Wave 10 Permit & Inspection Control Center implementation without unsafe runtime expansion.

## Sequence

| Prompt | Purpose | Primary Output |
| --- | --- | --- |
| 01 | Implementation readiness audit | Read-only local baseline, allowed file list |
| 02 | Shared models and fixture contracts | Wave 10 TypeScript contracts and deterministic fixtures |
| 03 | Backend GET-only mock read model | Read-only mock route/provider envelope |
| 04 | SPFx read-model client and fixture parity | Fixture/default and backend opt-in client parity |
| 05 | SPFx surface shell | Permit & Inspection Control Center command-center UI |
| 06 | Priority / readiness / approvals integration | Read-only signals into existing frameworks |
| 07 | Tests, guardrails, and closeout | Regression tests and implementation closeout |
| 08 | Fresh reviewer prompt | Independent review of implementation sequence |

## Build Philosophy

The module must be built in small, reversible commits:

1. Contracts before backend.
2. Backend read model before UI.
3. Fixture/default SPFx before backend opt-in surface.
4. UI shell before cross-module signal integration.
5. Tests and guardrails before closeout.

## Key Runtime Boundaries

Allowed:

- TypeScript model contracts.
- Deterministic fixtures.
- GET-only backend mock read model.
- Read-only envelopes.
- Fixture/default SPFx UI.
- Explicit backend opt-in following existing PCC pattern.
- Inert or disabled action affordances.
- Launcher/reference-only external posture.
- Priority Actions / Project Readiness / Approvals signal metadata only.

Not allowed:

- backend writes;
- AHJ runtime calls;
- AHJ scraping;
- AHJ scheduling/submission/status polling;
- Procore runtime;
- Microsoft Graph runtime;
- SharePoint REST/PnP runtime;
- evidence upload/storage/sync;
- external writeback/sync/mirror;
- approval execution;
- packaging/deployment/tenant mutation;
- production rollout.
