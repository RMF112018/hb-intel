# Tool Launcher Narrow Packaging / Remediation Package

## Purpose

This package instructs the local code agent to perform a **narrow packaging and deployment-fidelity remediation pass** for the Tool Launcher / Work Hub.

The objective is **not** to redesign the launcher and **not** to re-audit the full UI.

The objective is to **prove that the generated `hb-webparts.sppkg` actually contains the latest code from**:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`

before that package is uploaded to SharePoint.

## Why this package exists

Current evidence indicates a **partial package / deployment mismatch**:

- the newer composition work appears present in SharePoint
- but at least part of the later Tool Launcher implementation does not appear to have taken effect
- repo truth on `main` contains newer Tool Launcher source than what appears to be represented in the uploaded package

That strongly suggests a packaging-fidelity problem, stale artifact problem, incorrect package selection problem, or app-catalog upgrade mismatch.

## Scope

This package is intentionally narrow.

It covers only:

- packaging fidelity
- build artifact validation
- package-content proof
- deployment readiness proof
- exact command documentation
- narrow remediation if the package is proven stale or incomplete

It does **not** cover:
- new Tool Launcher feature work
- new UI redesign work
- broader homepage remediation
- speculative refactors outside what is required to prove package correctness

## Deliverables expected from the code agent

1. a packaging/remediation summary markdown
2. a package-proof validation markdown
3. a clean rebuilt `hb-webparts.sppkg`
4. evidence that the generated package includes the latest Tool Launcher code

## Files in this prompt package

- `README-Narrow-Packaging-Remediation.md`
- `Prompt-01-Tool-Launcher-Narrow-Packaging-Remediation-and-Package-Proof.md`
- `Completion-Notes-Template.md`
