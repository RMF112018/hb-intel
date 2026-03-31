# Prompt 10 — Phase 4 Observability Operationalization and Readiness Proof

## Objective
Close the Phase 4 audit finding that observability artifacts and diagnostics are present in repo but do not yet automatically equal operationalized monitoring or proven deployment readiness for Project Setup.

## Critical instructions
- Truthfulness matters more than breadth.
- Repo artifacts are useful, but do not describe them as “operationalized” unless there is real repo-truth evidence supporting that claim.
- Keep the focus on Project Setup retained release/runtime scope.
- Prefer explicit proof, clear runbooks, and precise boundaries over broad “production-safe” language.

## Context
The audit found that:
- observability assets are checked into repo
- health/readiness diagnostics are materially real
- but no repo proof establishes that alerts, dashboards, queries, and workflows are fully operationalized for a retained Project Setup deployment posture
- and some readiness language is stronger than the evidence set supports

This prompt is about turning Phase 4 observability/readiness posture into something more explicit, accurate, and decision-useful.

## Required work
1. Audit the current observability/readiness evidence set for Project Setup.
   - Identify what is:
     - checked into repo
     - executable/verifiable from repo
     - documentary only
     - deployment/environment dependent
   - Separate “artifact exists” from “operationalized and proven.”

2. Improve the Project Setup observability posture.
   - Add or refine documentation/runbook/readiness evidence so it is clear what must be deployed/configured outside code.
   - Make Project Setup-specific observability assumptions explicit where appropriate.
   - Avoid broad/shared-host observability claims if the retained scope is narrower.

3. Tighten readiness proof.
   - Ensure tests, docs, and readiness language truthfully represent what can be proven from repo and what remains environment-gated.
   - Improve release/readiness artifacts if they are too broad, too vague, or too optimistic.

4. Add guardrails against overstated readiness.
   - Make it harder for future docs to treat “alerts.json exists” as proof that alerting is operationalized.
   - Prefer explicit evidence categories.

5. Preserve clear distinction between:
   - repo evidence
   - deployment prerequisites
   - operational runbook steps
   - post-deploy verification

## Files likely in scope
Likely:
- `backend/functions/observability/README.md`
- `backend/functions/observability/alerts.json`
- `backend/functions/observability/kql/**`
- health/readiness tests
- readiness/runbook docs touching Project Setup deployment proof
- any Phase 4/5 docs that overstate observability/readiness closure

## Required documentation update
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add a **Phase 4 observability/readiness progress note** that:
- states what is truly proven from repo
- states what remains deployment- or environment-dependent
- states what observability assets are now better scoped or better documented for Project Setup
- records any remaining operationalization gaps plainly

Add a **closure statement draft** such as:
- “Project Setup observability and infrastructure readiness evidence are now categorized truthfully across repo proof, deployment prerequisites, and post-deploy operational verification, reducing overstated readiness claims.”

## Evidence requirements
The review doc update must include:
- exact artifacts/docs/tests changed
- exact categories of readiness evidence
- any remaining deployment-only or operational-only gaps
- any follow-up still required outside code

## Acceptance criteria
- Repo evidence is clearly distinguished from operationalized monitoring.
- Project Setup observability/readiness posture is more explicit and truthful.
- Overstated readiness language is reduced or removed.
- The review doc is updated with progress notes, closure language, and evidence.
