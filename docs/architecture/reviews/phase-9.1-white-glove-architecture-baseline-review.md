# Phase 9.1 — White-Glove Architecture Baseline Review

**Date:** 2026-04-03
**Scope:** Architecture baseline freeze for white-glove employee device deployment (Prompt-01 / P9.1-01)
**Status:** Baseline frozen

## Decision summary

The white-glove device deployment architecture baseline has been created and frozen. All subsequent implementation prompts (Prompt-02 through Prompt-14) execute against this baseline.

### Boundaries confirmed

1. **Operator-console / privileged-backend split preserved.** SPFx owns operator interaction; backend owns all privileged execution, orchestration, and persistence. No privileged API calls from SPFx.

2. **Platform-specific adapter families locked.** Microsoft, Apple, and NinjaOne are distinct adapter families — no generic device adapter.

3. **Device platform lanes remain distinct.** Windows, macOS, iPhone, and iPad have separate enrollment paths, readiness rules, and evidence models. No flattening.

4. **NinjaOne scoped to post-enrollment.** NinjaOne handles standardization, software deployment, and validation. It is not an enrollment authority.

5. **Parent/child run model confirmed.** Each employee package produces one parent package run with one child device run per target device.

6. **Six governed package families locked.** VDC Personnel, Estimating Personnel, Office Personnel, Operations Management, Operations Management (alternate), Operations Field Staff.

7. **Connector governance required.** All connectors must be versioned, testable, health-tracked, and auditable.

### Reuse targets confirmed

- Admin shell routing, permission gating, alert/probe polling — reuse as-is
- Service factory, Table Storage, SignalR, managed identity — reuse as-is
- Provisioning saga patterns (orchestrator, failure classification, evidence, recovery) — reuse as patterns
- Admin control plane container, API routes, run/audit stores, connection registry — extend
- Graph service — extend or split by domain

### No-go constraints established

Seven no-go rules documented covering privileged SPFx execution, flattened workflows, flattened adapters, ungoverned connectors, duplicate docs, NinjaOne as enrollment authority, and premature implementation.

## Baseline artifacts

| Document | Location |
|----------|----------|
| Architecture Baseline | [white-glove-architecture-baseline.md](../plans/MASTER/spfx/admin/white-glove/white-glove-architecture-baseline.md) |
| Boundary Matrix | [white-glove-boundary-matrix.md](../plans/MASTER/spfx/admin/white-glove/white-glove-boundary-matrix.md) |
| Repo-Truth Reuse Map | [white-glove-repo-truth-reuse-map.md](../plans/MASTER/spfx/admin/white-glove/white-glove-repo-truth-reuse-map.md) |
| No-Go List | [white-glove-no-go-list.md](../plans/MASTER/spfx/admin/white-glove/white-glove-no-go-list.md) |

## Next step

Proceed to Prompt-02 (Domain Model and Package Template Baseline) with these boundaries locked.
