# README — Admin SPFx IT Control Center Phase 13 Production Readiness Package

## What this package contains

This directory holds the **Phase 13 — Production hardening and expansion rails** deliverables for the Admin SPFx IT Control Center. Phase 13 is the final phase of the program.

Phase 13 is a documentation and readiness phase. It did not implement new features or change the architecture. It audited production posture, defined release gates, documented operational doctrine, created production runbooks, established the support model, and defined expansion rails.

## Canonical production-readiness documents

| Document | File | Purpose |
|----------|------|---------|
| Production Posture Audit | `admin-spfx-phase-13-production-posture-audit.md` | Present-truth audit of production readiness at Phase 13 entry (P13-01) |
| Release Readiness Baseline | `admin-spfx-phase-13-release-readiness-baseline.md` | 10 release gate categories with testable evidence (P13-02) |
| Environment, Identity, and Dependency Baseline | `admin-spfx-phase-13-environment-identity-and-dependency-baseline.md` | Environment model, identity posture, config tiers, dependency map (P13-03) |
| Support Model and Escalation Matrix | `admin-spfx-phase-13-support-model-and-escalation-matrix.md` | 4-tier support ownership, severity definitions, escalation triggers (P13-04) |
| Operational Doctrine | `admin-spfx-phase-13-operational-doctrine.md` | Service boundaries, degraded mode, change discipline, no-go behaviors (P13-07) |
| Expansion Rails Architecture | `admin-spfx-phase-13-expansion-rails-architecture.md` | Near-term and later expansion paths with invariants and no-go shortcuts (P13-08) |

## Production runbook set

| Runbook | File | Purpose |
|---------|------|---------|
| Deployment and Promotion | `runbooks/admin-spfx-deployment-and-promotion-runbook.md` | Pre-deployment, promotion sequence, post-deploy validation (P13-05) |
| Rollback and Recovery | `runbooks/admin-spfx-rollback-and-recovery-runbook.md` | Rollback triggers, decision tree, rollback procedures (P13-05) |
| Incident Triage | `runbooks/admin-spfx-incident-triage-runbook.md` | Symptom categories, first checks, evidence gathering, escalation (P13-06) |
| Service Recovery | `runbooks/admin-spfx-service-recovery-runbook.md` | 7 recovery classes with step-by-step procedures (P13-06) |
| Break-Glass Guidance | `runbooks/admin-spfx-break-glass-guidance.md` | 4 tightly governed emergency scenarios with audit requirements (P13-06) |

## Also in this directory (Phase 12 prompt artifacts)

This directory also contains Phase 12 prompt files and the Phase 12 summary plan. These are the prompt package that drove Phase 12 execution and remain as historical reference. They are NOT Phase 13 deliverables.

## What this phase claims

- The system has been audited for production readiness.
- Release gates, support model, runbooks, and operational doctrine are documented.
- Known gaps and deferrals are explicitly cataloged with mitigations.
- Expansion paths are defined without blurring current production scope.

## What this phase does NOT claim

- Phase 13 did not implement new features or fix code.
- Phase 13 did not deploy alert rules to Azure Monitor (that is a DevOps task).
- Phase 13 did not resolve implementation-dependent gaps (email relay, deferred monitors/probes, ApprovalAuthority persistence, SignalR).
- Phase 13 did not verify production environment configuration (that requires Azure Portal access).
- The presence of runbooks does not mean they have been exercised in a real production incident.

## Governing docs

- [End-State Plan](../admin-spfx-it-control-center-end-state-plan.md)
- [Phase 13 Summary Plan](../phase-13r/Admin-SPFx-IT-Control-Center-Phase-13-Summary-Plan.md)
- [Phase 13 Prompt Package](../phase-13r/README.md)
