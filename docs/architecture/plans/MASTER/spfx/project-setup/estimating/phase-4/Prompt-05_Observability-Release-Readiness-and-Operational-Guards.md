# Prompt 05 — Observability, Release Readiness, and Operational Guards

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 4 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **observability / release-readiness / operational-guard** work required for a production-safe Project Setup deployment.

This prompt is focused on diagnostics, monitoring, deployment gates, and operator-facing infrastructure readiness.

## Critical instructions

- Use the prior Phase 4 prompt outputs as governing context.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** treat monitoring or readiness notes as optional polish; they are part of production readiness.
- Do **not** broaden scope into unrelated feature work.

## Required working approach

1. Add or tighten diagnostics around startup, configuration, storage, identity, and connected-service failures.
2. Document what operators must verify before release and during incident triage.
3. Add infrastructure-focused readiness checks and regression protections where practical.
4. Ensure runtime mode, degraded state, and blocked state are diagnosable.
5. Produce deployment/support handoff materials.

## Specific outcomes required

By the end of this prompt:
- operators should be able to tell whether infrastructure is healthy, degraded, or blocked
- release readiness should have explicit go/no-go criteria
- infrastructure failures should be diagnosable without deep tribal knowledge
- the repo should contain durable handoff notes for deployment/support teams

## Required implementation outputs

Make the code and documentation changes necessary to:
- improve infrastructure diagnostics
- add readiness and release checks
- document operational runbook expectations
- create infrastructure-focused handoff notes

Update or create markdown summarizing:
- diagnostics added
- readiness checks added
- operator runbook notes
- remaining operational blind spots

## Acceptance criteria

- Infrastructure health and failure states are diagnosable.
- Release readiness has explicit infrastructure gates.
- Deployment/support teams have durable handoff documentation.

## Required summary back to me

When done, report:
- files changed
- diagnostics and readiness checks added
- runbook/handoff docs created or updated
- any remaining operational blind spots that must be addressed later
