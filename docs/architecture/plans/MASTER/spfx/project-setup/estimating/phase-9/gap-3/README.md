# Gap 3 — Backend Boundary Enforcement Remediation Prompt Package

## Purpose

This package contains an ordered set of local-code-agent prompts to remediate the **Backend Boundary Enforcement Gap** for Project Setup.

The validated gap is:

- the dedicated Project Setup host exists
- the scoped Project Setup service factory exists
- but the retained Project Setup route handlers still resolve services through the monolithic `createServiceFactory()`
- so the boundary is enforced only at **route-registration level**, not at **runtime service-resolution level**

## Package contents

- `Gap-Summary.md` — concise summary of the validated gap, risk, target files, and recommended remediation direction
- `Implementation-Plan.md` — ordered execution strategy and recommended decision posture
- `Prompt-1-01_Architecture-Decision-and-Coexistence-Plan.md`
- `Prompt-1-02_Implement-Scoped-Service-Resolution-for-PS-Routes.md`
- `Prompt-1-03_Add-Regression-Tests-and-Release-Gates-for-Handler-Wiring.md`
- `Prompt-1-04_Documentation-Reconciliation-and-Closure-Report.md`

## Recommended execution order

1. `Prompt-1-01_Architecture-Decision-and-Coexistence-Plan.md`
2. `Prompt-1-02_Implement-Scoped-Service-Resolution-for-PS-Routes.md`
3. `Prompt-1-03_Add-Regression-Tests-and-Release-Gates-for-Handler-Wiring.md`
4. `Prompt-1-04_Documentation-Reconciliation-and-Closure-Report.md`

## Intent of the sequence

The first prompt forces the agent to resolve the **dual-host coexistence decision** before changing imports.  
The second prompt implements the chosen wiring model.  
The third prompt adds machine-checkable guardrails so this cannot silently regress.  
The fourth prompt reconciles prior reports that overstated closure and records final repo-truth status.

## Recommended default decision posture

Unless the repo truth disproves it, the recommended default is:

- **Option A**
- accept that Project Setup route modules use the scoped Project Setup factory in **both** the dedicated Project Setup host and the monolithic host
- keep the monolithic host transitional
- do **not** duplicate route handlers
- do **not** introduce ambient global host state unless clearly necessary

Why this is the preferred starting point:

- simplest remediation path
- least moving parts
- preserves DRY
- aligns with the transitional-host posture already documented in ADR-0124 and prior reports
- narrows Project Setup route behavior consistently regardless of host entrypoint

## Working assumptions

- The live repo is authoritative.
- Prior remediation reports may contain overstated closure language and must not be treated as authoritative when contradicted by code.
- The code agent should preserve the existing Project Setup release scope and avoid broad refactors outside this gap.
- The code agent should not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.

## Expected outputs

At the end of the sequence, repo truth should show:

- all in-scope Project Setup handlers resolve services through the scoped Project Setup factory
- dual-host coexistence is explicitly handled and documented
- boundary tests verify handler wiring, not just host artifact structure
- release gates and docs no longer overstate closure
