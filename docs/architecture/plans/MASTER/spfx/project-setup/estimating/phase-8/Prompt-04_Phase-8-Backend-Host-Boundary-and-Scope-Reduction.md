# Prompt-04 — Phase 8 Backend Host Boundary and Scope Reduction

## Objective

Reduce or explicitly hard-gate backend host surface area so the Project Setup release posture is not unnecessarily coupled to unrelated domain routes, stubs, or partially implemented features.

## Context

The audit found that the current Functions host still registers routes beyond the true Project Setup release surface. That may be acceptable temporarily, but not if it leaves avoidable production risk, confusing dependencies, or false readiness signals.

## Required Working Rules

- Prefer the narrowest production-correct boundary.
- Do not perform a broad platform rewrite.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction, inspect exact evidence, or resolve an ambiguity.
- If full host separation is not justified in this phase, implement the best scoped intermediate hardening and document why.

## Tasks

### 1. Audit the currently registered host surface
Map the current Functions host imports and routes into categories:
- required for Project Setup release scope
- adjacent but justified
- out of scope / legacy / stub / deferred
- production-risky to leave resident

### 2. Decide the correct Phase 8 boundary move
Choose and implement one grounded path:

#### Option 1 — Narrow the active host
Remove or stop registering routes that are not needed for Project Setup release scope.

#### Option 2 — Keep broader host, add explicit boundary controls
If removing routes now would be too disruptive:
- gate non-release routes clearly
- isolate stubs and non-release features
- harden comments, docs, and readiness logic so they cannot be mistaken for release-complete scope

### 3. Pay special attention to stubs and misleading surfaces
Audit and address:
- proxy routes
- any mock-only endpoints still present in a production host
- any admin-only routes that need stronger release posture treatment
- any routes whose presence implies capability that does not really exist yet

### 4. Reconcile startup/config implications
If broader host scope still forces broader config surface, reduce that as much as practical.
Where not practical, document exactly why.

## Deliverables

### Code / Repo Deliverables
- route registration cleanup and/or gating
- clearer host-scope boundaries
- reduced misleading surface area
- any related config/refactor changes justified by the selected path

### Documentation Deliverables
Update the Phase 8 report with:
- host-surface map
- chosen boundary path
- routes removed, gated, or intentionally retained
- files changed
- closure statement for Prompt-04
- carry-forward items for Prompt-05+

## Completion Standard

This prompt is complete only when the Project Setup release host no longer implies more production-ready capability than the repo actually contains.
