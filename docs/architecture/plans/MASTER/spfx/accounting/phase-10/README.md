# Phase 10 — Accounting SPFx Production Gap Closure Prompt Package

## Purpose

This package contains a comprehensive, implementation-ordered series of local-code-agent prompts to close the gaps identified in the Accounting SPFx `.sppkg` production-readiness audit.

The package is structured to address the work in the correct order:

1. establish repo-truth baseline and lock the implementation scope
2. modernize Accounting packaging/runtime injection
3. freeze the Accounting production auth model and audience contract
4. align SharePoint API approval posture and package declarations
5. implement Accounting runtime config and backend provider behavior
6. align shell, theme, and environment-state UX with Project Setup
7. clean or explicitly quarantine the latent `/api/users/me/*` dependency surface
8. reconcile docs and connected-service posture
9. validate with tests, artifact inspection, and release evidence
10. perform final reconciliation and produce a Phase 10 closure report

## Prompt Status

| # | Prompt | Status | Output |
|---|--------|--------|--------|
| 01 | Repo-Truth Baseline and Scope Freeze | Complete (2026-04-02) | `P10-01_Repo-Truth-Baseline-and-Scope-Freeze.md` |
| 02 | Accounting Packaging and Runtime Injection Closure | Complete (2026-04-02) | `P10-02_Accounting-Packaging-and-Runtime-Injection-Closure.md` |
| 03 | Accounting Auth Model and Audience Contract Freeze | Complete (2026-04-02) | `P10-03_Accounting-Auth-Model-and-Audience-Contract-Freeze.md` |
| 04 | SPFx Package Permissions and Approval Path Alignment | Complete (2026-04-02) | `P10-04_SPFx-Package-Permissions-and-Approval-Path-Alignment.md` |
| 05 | Accounting Runtime Config and Backend Provider Implementation | Complete (2026-04-02) | `P10-05_Accounting-Runtime-Config-and-Backend-Provider-Implementation.md` |
| 06 | Accounting Project Setup UX and Shell Alignment | Not started | — |
| 07 | Latent Users Me Dependency Reconciliation | Complete (2026-04-02) | `P10-07_Latent-Users-Me-Dependency-Reconciliation.md` |
| 08 | Documentation and Connected Service Posture Reconciliation | Not started | — |
| 09 | Testing Artifact Inspection and Release Evidence | Not started | — |
| 10 | Final Reconciliation and Closure Report | Not started | — |

## Included Files

- `Phase-10_Gap-Closure-Summary.md`
- `README.md`
- `P10-01_Repo-Truth-Baseline-and-Scope-Freeze.md`
- `Prompt-01_Phase-10_Repo-Truth-Baseline-and-Scope-Freeze.md`
- `Prompt-02_Phase-10_Accounting-Packaging-and-Runtime-Injection-Closure.md`
- `Prompt-03_Phase-10_Accounting-Auth-Model-and-Audience-Contract-Freeze.md`
- `Prompt-04_Phase-10_SPFx-Package-Permissions-and-Approval-Path-Alignment.md`
- `Prompt-05_Phase-10_Accounting-Runtime-Config-and-Backend-Provider-Implementation.md`
- `Prompt-06_Phase-10_Accounting-Project-Setup-UX-and-Shell-Alignment.md`
- `Prompt-07_Phase-10_Latent-Users-Me-Dependency-Reconciliation.md`
- `Prompt-08_Phase-10_Documentation-and-Connected-Service-Posture-Reconciliation.md`
- `Prompt-09_Phase-10_Testing-Artifact-Inspection-and-Release-Evidence.md`
- `Prompt-10_Phase-10_Final-Reconciliation-and-Closure-Report.md`

## How To Use

- Run the prompts in sequence.
- Do not skip ahead unless the repo truth proves a later prompt is already fully satisfied.
- Carry forward findings and changed-file lists from one prompt to the next.
- Where a prompt asks for evidence, require the agent to cite exact repo files, tests, and artifact-inspection output.
- Where a prompt asks for a fresh `.sppkg`, require a real rebuild and inspection of the packaged shell asset rather than relying only on source code.

## Important Operating Note

These prompts assume the code agent has access to the HB Intel monorepo and can execute the build/test commands needed to produce and inspect SPFx `.sppkg` artifacts.
