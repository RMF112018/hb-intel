# Prompt 01 — Phase 3 Project Hub Routing Repo-Truth Validation

You are acting as a senior architecture, repo-truth, routing, PWA, SPFx, shell-composition, and delivery-readiness reviewer for HB Intel.

You are working inside the local HB Intel monorepo with direct file access.

## Objective

Validate the previously identified audit findings related to canonical PWA Project Hub routing before any routing refactor begins.

You must not assume the prior audit is correct simply because it was stated. You must validate it against current repo truth and explicitly classify each finding as:
- Confirmed
- Partially Confirmed
- Rejected
- Superseded by newer implementation

Your output must produce a precise implementation-ready view of what is actually true in the repository today.

## Critical Working Rule

Do not re-read files that are already within your current active context or memory unless you need to verify changed content, recover lost context, or inspect a newly relevant dependency.

## Audit Findings To Validate

Validate the following findings explicitly:

1. The PWA currently treats Project Hub as a flat workspace page rather than a canonical route family.
2. The current PWA Project Hub route is not yet modeled as:
   - `/project-hub`
   - `/project-hub/{projectId}`
   - `/project-hub/{projectId}/{section}`
3. The current `ProjectHubPage` behaves primarily like a portfolio summary/table page rather than a true project-scoped control center.
4. Project identity is not yet enforced through the route as the canonical source of truth.
5. Portfolio root behavior and project-scoped behavior are not yet separated into distinct runtime surfaces.
6. Project context continuity across launches, refreshes, and same-section project switching is not yet fully implemented.
7. The Phase 3 planning documents define a stronger canonical Project Hub routing model than the current runtime implementation.
8. The current lane definition implies SPFx should remain a companion lane and launch deeper/cross-project flows into the PWA rather than replacing canonical PWA routing.
9. The current codebase likely contains enough shell/session/navigation primitives to support this routing refactor without inventing a new architecture from scratch.

## Authority Order

Use this authority order unless direct code evidence requires a different interpretation:

1. Runtime code and actual route registration
2. Current-state-map and repo-truth governance files
3. Phase 3 master plan and deliverables
4. Supporting package README files and implementation notes

When documents and code disagree:
- identify the conflict clearly
- determine actual repo truth
- state whether the plan is ahead of code, behind code, or misaligned

## Minimum Required Files To Inspect

Inspect enough of the repo to ground your conclusions. At minimum, inspect the current versions of:

- `apps/pwa/src/router/workspace-routes.ts`
- `apps/pwa/src/pages/ProjectHubPage.tsx`
- any route tree or router composition files that control workspace registration
- any current project context store, project switcher, shell, or navigation state files used by the PWA
- `packages/session-state/*` or equivalent continuity/recovery primitives
- `packages/project-canvas/*` as relevant to control-center composition
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-B1-Project-Context-Continuity-and-Switching-Contract.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G1-Lane-Capability-Matrix.md`
- any additional routing, shell, or context files that are directly relevant

Also inspect the existing test stack and any current route or shell tests so the later prompts can align with established patterns.

## What To Produce

Produce a structured validation report with the following sections.

### 1. Validated Findings Matrix
For each audit finding above, provide:
- Status: Confirmed / Partially Confirmed / Rejected / Superseded
- Repo evidence
- Why the finding is or is not true
- Delivery significance

### 2. Current Route Topology
Describe the real current Project Hub route topology in the PWA.
Include:
- actual registered routes
- default redirects
- any nested route behavior
- whether project-specific routing already exists anywhere
- how the shell identifies the active workspace

### 3. Current Project Context Model
Describe how project identity currently flows through the PWA.
Include:
- route params
- store state
- shell state
- session/local persistence
- deep-link behavior
- whether URL, store, or shell currently wins when context conflicts occur

### 4. Gap Analysis Against Target Canonical Routing
Define the exact delta between current repo truth and the target routing model.
Focus on:
- portfolio root behavior
- project-scoped control center behavior
- same-section project switching
- durable launch/relaunch behavior
- SPFx launch compatibility
- invalid/unauthorized project handling

### 5. Implementation Prerequisites
Identify what must exist before the routing refactor begins.
Examples:
- route helpers
- layout boundaries
- project resolver utilities
- shell contracts
- continuity storage contract
- test fixtures

### 6. File-by-File Implementation Map
Produce a file-by-file map of what will likely need to be:
- created
- modified
- split
- retired
- left untouched

Be concrete.
Use exact file paths wherever you can.
If a path is unknown, identify the nearest confirmed file and the intended new file path.

### 7. Delivery Risks And Conflict Points
Call out the highest-risk implementation conflicts, including:
- route helper constraints
- shell coupling
- nav-state conflicts
- stale session-context precedence
- SPFx handoff ambiguity
- test fragility

### 8. Recommended Go/No-Go Decision
End by stating whether Prompt 02 can proceed immediately or whether one or more blockers must first be resolved.

## Constraints

- Do not start the routing refactor in this prompt.
- Do not make speculative architecture changes.
- Do not treat summary UI as control-center readiness.
- Do not assume missing behavior is intentional.
- Do not collapse PWA and SPFx responsibilities into a blended answer.
- Make lane ownership explicit.

## Success Standard

This prompt is complete only when a future implementation agent could start Prompt 02 with:
- a validated understanding of current repo truth
- a precise target delta
- a file-by-file implementation map
- clearly named risks and prerequisites
