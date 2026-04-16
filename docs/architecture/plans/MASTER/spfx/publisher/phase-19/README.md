# HB Publisher deployment/discovery remediation prompt package

## Purpose
Close the SharePoint deployment/discovery blocker identified in the audit.

This package is intentionally narrow. It is about:
- SPFx deployment model
- package/discovery semantics
- repo/package drift
- manifest/build truth

It is not a general product, UI, or architecture package.

## Package contents
- `Plan-Summary.md`
- `Prompt-01-Align-deployment-model-with-intended-sharepoint-workflow.md`
- `Prompt-02-Eliminate-manifest-and-package-truth-drift.md`
- `Prompt-03-Correct-toolbox-visibility-and-runbook-semantics.md`

## Required posture
- Do not make unrelated product changes.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Produce closure, not recommendations-only output.
- Every change must include proof of closure.

## Mandatory closure rule
The code agent must close the discovered deployment/discovery issue completely for the chosen target model. No soft deferrals.

## Recommended target model
Because the observed failure path is **site-level app addition / discovery**, the default recommended closure path is:
- make `hb-publisher` support **site-scoped install + page-picker discovery**
- unless product ownership explicitly confirms the package must remain a tenant-scoped governed host-page surface

If product ownership requires the governed host-page model instead, the agent must still close the issue end-to-end and remove any false site-install expectations.
