# Phase 8 — Reliability, Testing, and Operational Readiness

## Purpose

This package governs **Phase 8 — Reliability, Testing, and Operational Readiness** for the Accounting-side Project Setup workflow, its connected backend lifecycle, and the SharePoint provisioning runtime.

The goal of this phase is to prove that the hardened workflow behaves correctly across normal, degraded, and failure conditions, and that the repo contains the verification evidence required to proceed into pilot / release activity.

This phase assumes the prior phases have already frozen or completed:
- workflow contract and boundary freeze
- backend lifecycle hardening
- Accounting app functional completion
- provisioning status and saga interaction hardening
- Admin exception-path integration
- data contract and SharePoint schema hardening
- security, connected services, and environment readiness

## What this phase covers

- unit, integration, and end-to-end verification coverage for the Project Setup workflow
- controller, requester, provisioning, and admin exception-path test behavior
- degraded-path validation for SignalR, polling fallback, backend/API failure, SharePoint/Graph throttling, and connected-service outages
- operational readiness checks for logging, telemetry, runbook completeness, and supportability
- documentation reconciliation and readiness signoff

## Ordered prompt sequence

1. `Prompt-01` — repo-truth reliability, testing, and operational-readiness audit
2. `Prompt-02` — lifecycle verification coverage hardening
3. `Prompt-03` — integration and end-to-end workflow validation hardening
4. `Prompt-04` — degraded-path, failure-mode, and observability validation hardening
5. `Prompt-05` — operational readiness, runbook, and support verification
6. `Prompt-06` — final documentation reconciliation and readiness report

## Expected outputs

By the end of Phase 8, the repo should have:
- clear evidence of verification coverage across request, review, launch, provisioning, failure, and recovery paths
- validated degraded-mode behavior for real-world operational failures
- updated runbooks and support documentation aligned to repo truth
- a closure report stating whether the solution is ready to enter pilot / release hardening

## Notes for the local code agent

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Prefer evidence-driven verification over aspirational documentation.
- Distinguish clearly between tests that already exist, tests that are partially present, and tests that must still be implemented.
