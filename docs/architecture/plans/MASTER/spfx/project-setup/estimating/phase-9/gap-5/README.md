# README — Gap 5 Authorization Convergence Prompt Package

This package contains a comprehensive prompt series for a local code agent to fully implement the future-state resolution for Gap 5 in the HB Intel Project Setup / Estimating solution.

## Package Contents

- `Gap-5-Implementation-Summary.md`
- `README.md`
- `Prompt-1-01_Contract-Freeze-and-Baseline.md`
- `Prompt-1-02_Target-Architecture-and-Policy-Matrix.md`
- `Prompt-1-03_Entra-App-Role-and-Scope-Contract.md`
- `Prompt-1-04_Shared-Authorization-Policy-Engine.md`
- `Prompt-1-05_Oid-Migration-and-Data-Contract.md`
- `Prompt-1-06_Request-Lifecycle-Authorization-Convergence.md`
- `Prompt-1-07_Provisioning-and-Admin-Authorization-Convergence.md`
- `Prompt-1-08_Workload-and-App-Only-Authorization.md`
- `Prompt-1-09_Frontend-SPFx-Contract-and-Diagnostics.md`
- `Prompt-1-10_Telemetry-Break-Glass-and-Auditability.md`
- `Prompt-1-11_Tests-Release-Gates-and-Security-Hardening.md`
- `Prompt-1-12_Documentation-Cutover-and-Rollback.md`
- `Prompt-1-13_Final-Reconciliation-and-Closure.md`

## Execution Order

Run the prompts in numerical order.

Do not skip ahead unless a prompt explicitly says to branch or parallelize a subtask. The ordering is intentional:
- early prompts freeze target architecture and role policy,
- middle prompts implement the backend and data model,
- later prompts harden tests, docs, cutover, and closure evidence.

## Central Artifacts the Agent Should Maintain

Unless a prompt explicitly says otherwise, each prompt should update:

- `docs/architecture/reviews/project-setup-gap-5-implementation-report.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/gap-5-authz/`

## Repo-Truth Rules for the Agent

Every prompt assumes the agent will:

- treat the live repo as authoritative,
- not re-read files already in active context or memory unless needed to verify a contradiction or capture exact evidence,
- preserve existing behavior unless the prompt explicitly authorizes a breaking change,
- prefer official Microsoft documentation for platform guidance,
- keep authorization logic precise and testable,
- separate implementation facts from inferred conclusions in the report updates.

## What Success Looks Like

At the end of the package, the repo should show:

- one coherent claim-based authorization model,
- stable `oid`-based ownership and assignment semantics,
- app-role-driven privileged access,
- workload/app-only authorization for automation paths,
- explicit diagnostics and release gates,
- migration/cutover docs and a final closure report.

## Suggested Agent Operating Pattern

For each prompt:
1. inspect only the necessary repo areas,
2. make the targeted implementation changes,
3. add or update tests,
4. update the central implementation report with exact evidence,
5. stop only when acceptance criteria are met or the prompt documents a precise blocker.

## Expected External / Environment Dependencies

Some parts of the final cutover will remain environment-executed, such as:
- Entra app registration and app-role assignment execution
- delegated scope approval / consent
- break-glass group setup
- any live SharePoint schema or environment migration steps
- deployment-time secretless identity wiring and production validation

The code agent should still document these in repo-owned runbooks even if it cannot execute them.
