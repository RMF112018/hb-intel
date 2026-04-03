# README — Admin SPFx App-Binding / Backend-Setup Implementation Package

## What this package is

This is the implementation artifact set for **Phase 6A — Managed App Binding and Backend-Setup Configuration**. It delivers the first-class app-binding model that lets the Admin control plane publish backend runtime bindings for managed SPFx apps and lets those apps resolve the binding before making backend-dependent calls.

## What is included

### Architecture and design (Prompts 01–02)

| Document | Purpose |
|----------|---------|
| [Gap Audit](admin-spfx-app-binding-gap-audit.md) | P6A-01 — Repo-truth audit, confirmed gaps G1–G9, minimum slice definition |
| [Architecture](admin-spfx-app-binding-architecture.md) | P6A-02 — Layer responsibilities, source of truth, binding record model, API surface, Phase 10 compatibility |
| [Resolution Lifecycle](admin-spfx-app-binding-resolution-lifecycle.md) | P6A-02 — 7-stage binding lifecycle (create → publish → resolve → verify → drift → repair → retire) |
| [Repair and Drift Policy](admin-spfx-app-binding-repair-and-drift-policy.md) | P6A-02 — Drift categories, repair semantics, evidence expectations, anti-patterns |

### Implementation (Prompts 03–08)

| Document | Purpose |
|----------|---------|
| [Contract Slice](admin-spfx-app-binding-contract-slice.md) | P6A-03 — Shared contracts in `@hbc/models`, status vocabulary, Phase 10 forward-compatibility |
| [Store and API](admin-spfx-app-binding-store-and-api.md) | P6A-04 — Azure Table persistence, keying model, 5 API endpoints, service interface |
| [Install Binding Publication](admin-spfx-install-binding-publication.md) | P6A-05 — How install/bootstrap publishes bindings on completion |
| [Verification and Drift](admin-spfx-app-binding-verification-and-drift.md) | P6A-07 — 5 verification checks, drift classification, audit/evidence integration |
| [Binding UX](admin-spfx-app-binding-ux.md) | P6A-08 — Admin operator console page at `/setup/bindings` |

### Operations and closure (Prompt 09)

| Document | Purpose |
|----------|---------|
| [Operator Runbook](admin-spfx-app-binding-operator-runbook.md) | Practical operator guidance for binding review, repair, and escalation |
| [Final Reconciliation](admin-spfx-app-binding-final-reconciliation.md) | What was created, reused, validated, deferred, and recommended next |

## Code artifacts

| Package | File | Purpose |
|---------|------|---------|
| `@hbc/models` | `packages/models/src/admin-control-plane/IAppBinding.ts` | 12 shared types: record, status, publication, verification, drift, repair |
| `@hbc/functions` | `backend/functions/src/services/admin-control-plane/app-binding-store.ts` | Durable + mock binding store implementations |
| `@hbc/functions` | `backend/functions/src/services/admin-control-plane/binding-verification-service.ts` | 5 check functions + orchestration wrapper |
| `@hbc/functions` | `backend/functions/src/functions/adminApi/app-binding-routes.ts` | 5 API endpoints for binding CRUD |
| `@hbc/spfx-admin` | `apps/admin/src/pages/BindingStatusPage.tsx` | Operator UX for binding status and repair |

## Upstream reconciliation

The upstream reconciliation (Prompt 00A) updated the top-level plan and created addenda for Phases 1–5. Those artifacts live in their respective phase directories and are cataloged in `phase-06a/admin-spfx-phase-6a-upstream-reconciliation.md`.
