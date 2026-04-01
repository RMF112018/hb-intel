# Implementation Plan — Gap 3 Backend Boundary Enforcement Remediation

## Objective

Close the backend boundary enforcement gap by ensuring the Project Setup runtime uses the scoped Project Setup service container at handler level, not just at host artifact level.

## Ordered plan

### Step 1 — Make the coexistence decision explicit
Use Prompt 1 first to resolve the dual-host import conflict and decide whether Project Setup handlers should use the scoped factory in both hosts.

**Recommended outcome:** Option A unless repo truth reveals a concrete blocker.

### Step 2 — Implement scoped handler wiring
Use Prompt 2 to update the five in-scope Project Setup handler modules so they no longer resolve services through the monolithic factory.

This step should preserve:
- existing route surface
- existing auth posture
- existing request/saga behavior
- existing host split
- existing monolithic-host transition posture

### Step 3 — Add machine-checkable enforcement
Use Prompt 3 to extend tests and release gates so they verify:
- handler files do not import `createServiceFactory()`
- in-scope Project Setup handlers use the scoped factory
- dual-host coexistence remains intentional and tested

### Step 4 — Reconcile documentation and closure claims
Use Prompt 4 to update the relevant review/audit docs so repo truth is represented honestly.

## Guardrails

- avoid broad architecture changes outside this gap
- avoid creating new duplication unless the architecture decision explicitly requires it
- preserve DRY where possible
- prefer strict, typed boundaries over comments-only or convention-only controls
- keep the dedicated Project Setup host authoritative for Project Setup scope
- keep the monolithic host transitional unless repo truth requires a different conclusion

## Definition of done

This gap is only closed when:

1. the five in-scope Project Setup route modules no longer import the monolithic service factory
2. the chosen coexistence model is explicit in code and docs
3. tests prove handler-level boundary enforcement
4. reports no longer overstate closure
5. type-check, tests, and build all remain green
