# Financial Route / Context Contract — Prompt 01
## Objective
Complete the first route/context contract workstream for the Financial module by implementing and normalizing the canonical project-scoped Financial route family in the repo.

## Context
You are working inside the HB Intel repo. Your task is focused on route and context contract implementation for the Financial module. This is not a broad product redesign. This is not a generic routing cleanup pass. This is a targeted execution pass to move the Financial module onto canonical, project-scoped, implementation-safe route structure aligned to repo truth.

You must preserve alignment with the governing doctrine already established in repo truth and any completed doctrine-completion and runtime-governance passes.

## Critical Guardrails
- Follow repo-truth order strictly:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. authoritative target architecture / blueprint files
  3. master plans
  4. phase deliverables
  5. current implementation seams
- Do not overclaim implementation maturity.
- Do not create route patterns that conflict with existing Project Hub route doctrine.
- Do not leave behind parallel legacy patterns unless an explicit migration need requires them.
- If legacy routes must be preserved temporarily, make the transition behavior explicit and bounded.
- Do not re-read files already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Keep all UI and shell work governed by existing repo truth and route/context doctrine; this prompt is not permission to redesign the module UI.

## Files to Inspect First
Inspect the repo directly and ground your work in actual file content, especially:

### Core repo-truth / planning / doctrine files
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`
- any Financial doctrine control index created previously
- route/context contract files that govern Financial and Project Hub
- lane/cross-lane files only where they affect entry or launch behavior

### Likely implementation surfaces
- `apps/pwa/src/router/workspace-routes.ts`
- Financial route/page registration files
- Project Hub route host files
- project-scoped shell/router files
- navigation helpers, deep-link helpers, and route builders
- any tests that encode current route behavior

## Required Actions
1. Inspect the current Financial route posture.
   - Identify all existing Financial routes, aliases, temporary routes, and non-canonical entry points.
   - Determine which routes are canonical, which are legacy, and which are contradictory.

2. Implement the canonical project-scoped Financial route family.
   - Ensure Financial routes live under the correct project-scoped Project Hub posture.
   - Define or normalize canonical routes for major Financial surfaces, including where applicable:
     - module home
     - budget import
     - forecast summary
     - checklist
     - GC-GR
     - cash flow
     - buyout
     - review / PER
     - publication / export
     - history / audit
   - Route naming must be coherent, durable, and implementation-safe.

3. Preserve portfolio/root behavior where repo truth requires it.
   - Do not break broader Project Hub routing.
   - Ensure portfolio-level or non-project launch points route users correctly into project-scoped Financial surfaces where appropriate.

4. Normalize link-generation and route-construction helpers.
   - Remove ad hoc Financial path construction where found.
   - Ensure route builders and navigation helpers use the canonical route family.

5. Address legacy route handling.
   - If non-canonical Financial routes exist, determine whether they should:
     - redirect,
     - remain temporarily supported,
     - or be removed.
   - Make this behavior explicit in code and, if needed, documentation.

6. Add or update tests.
   - Add focused route tests that prove:
     - canonical project-scoped route generation,
     - valid entry to each major Financial route,
     - expected handling for legacy or invalid Financial paths,
     - preservation of broader Project Hub route posture.

7. Update route/context documentation only where needed.
   - If implementation reveals a small documentation drift, correct it.
   - Do not expand into a broad doctrine rewrite.

## Deliverables
1. Canonical Financial route family implemented or normalized.
2. Route builders / helpers aligned to canonical posture.
3. Legacy route behavior explicitly handled.
4. Focused route tests added or updated.
5. Minimal documentation updates if required.
6. A concise changed-files and route-migration summary.

## Definition of Done
This prompt is complete only when:
- the Financial module has one clear canonical project-scoped route family,
- major Financial surfaces route through that family,
- link generation no longer depends on ad hoc or conflicting patterns,
- legacy route handling is explicit,
- broader Project Hub route posture remains intact,
- and tests prove the route family works as intended.

## Output Format
Return:
1. objective completed
2. files changed
3. canonical route family implemented
4. legacy route handling decisions
5. tests added or updated
6. remaining route risks / follow-ups
