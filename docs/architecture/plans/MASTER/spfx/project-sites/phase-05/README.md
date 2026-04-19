# Legacy Fallback Backend — Enhanced Combined Audit and Remediation Prompt Package

This package replaces the attached `legacy-fallback-backend-audit-package.zip` and `legacy-fallback-backend-prompt-package.zip` with one combined deliverable that is more repo-truth aligned, more explicit about active blockers, and more forceful about closure.

## Purpose

This package is for the **legacy fallback backend lane only**. It is meant to drive a local code agent through the exact work required to make the hosted legacy fallback backend correct, deployment-safe, operationally coherent, and provably closed.

It does **not** preserve the assumptions, prompt count, or sequencing of the attached packages. It keeps what was materially correct, corrects what was stale or underdeveloped, and adds findings the attached packages missed.

## What this package audited

- the attached audit package,
- the attached prompt package,
- the live `main` branch of `RMF112018/hb-intel`,
- current Azure Functions / deployment / pnpm / Node runtime guidance relevant to this backend lane.

## What materially changed versus the attached packages

This package upgrades the work in five important ways:

1. It distinguishes **previously closed blockers** from **currently active seams**.
2. It maps findings to concrete repo seams instead of staying at high-level package language.
3. It adds missed active issues, including registration-surface mismatch, schema/observability gaps, and field-resolution defects.
4. It forces remediation prompts to define the intended future state and closure proof in practical terms.
5. It removes the attached packages' habit of drifting into “future cutover” language for defects that still affect correctness now.

## Package structure

- `summary/01-Executive-Summary.md`
- `audits/01-Package-vs-Repo-Truth-Reconciliation.md`
- `audits/02-Architecture-and-Runtime-Seam-Analysis.md`
- `audits/03-Build-Deploy-and-Artifact-Assessment.md`
- `audits/04-Expanded-Findings-Register.md`
- `audits/05-Research-Informed-Recommendations.md`
- `plan/01-Prioritized-Remediation-Plan.md`
- `prompts/*.md`
- `references/01-Evidence-Basis-and-Limitations.md`
- `references/02-Source-Index-and-Research-Map.md`

## Required execution order

Execute the prompt set in order.

1. Prompt 01 — close the SharePoint persistence boundary and hosted writes.
2. Prompt 02 — correct project-index field resolution and matching inputs.
3. Prompt 03 — reconcile host composition and route registration truth.
4. Prompt 04 — reconcile hosting model, IaC, and deployment method truth.
5. Prompt 05 — minimize artifact composition to the actual runtime graph.
6. Prompt 06 — harden sync-run schema, observability, and operational evidence.
7. Prompt 07 — standardize hosted validation and closure proof.

Do not skip forward merely because a later prompt seems easier. Several later prompts depend on earlier truth being closed first.

## Closure standard

The legacy fallback backend is **not** closed when any of the following remain unproven:

- the hosted function surface registers all required legacy fallback endpoints and only the intended ones,
- `startSyncRun()` succeeds in the hosted environment,
- the project index is loaded using the real field-resolution contract rather than hard-coded assumptions,
- the deployment method matches the actual hosting model,
- the deploy artifact contains only the runtime graph that the chosen host actually requires,
- sync-run and registry evidence exists for a real hosted run,
- and the operator runbook reflects the actual deployment and verification path.

“Deployment succeeded” is not closure.
“Functions appear in `/admin/functions`” is not closure.
“The code looks right” is not closure.

Closure means the lane is **hosted, executable, persistent, observable, and repeatably verifiable**.

## Local code agent rule

Every prompt in this package intentionally repeats one operational instruction:

> Do **not** re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, uncertainty, or post-change impact.

## Intended outcome

When the prompt set is complete, the repo should have one coherent story for:

- what the legacy fallback host is,
- which routes it registers,
- how it is packaged,
- how it is deployed,
- what it writes to SharePoint,
- how operators validate it,
- and what evidence is required before anyone declares it fixed.
