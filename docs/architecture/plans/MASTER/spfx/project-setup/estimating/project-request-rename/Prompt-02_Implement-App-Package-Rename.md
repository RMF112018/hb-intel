# Prompt 02 — Implement the app/package rename

You are continuing the rename effort in:

`https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the code/package/runtime rename of the current Project Setup SPFx app so it is no longer treated as the Estimating app and is instead definitively named **Project Setup Requests**.

## Critical intent

- This is not just a label update.
- The shipped app/package identity must reflect Project Setup Requests.
- The final `.sppkg` should no longer present itself as the Estimating app.
- Any SPFx IDs / GUID-backed package identities that should be changed to create a cleanly separated Project Setup Requests app must be changed carefully and consistently.

## Critical instructions

- Follow the rename plan from the prior audit.
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Preserve existing functionality and scope.
- Do not broaden routes or features.
- Do not reintroduce old Estimating surfaces such as bids/templates into this app.
- Keep the app functionally equivalent unless a rename-related technical adjustment is required.
- Be careful with SPFx packaging identity changes so manifests and package metadata stay internally consistent.

## Required implementation scope

1. Rename the app/package/runtime identity from Estimating to Project Setup Requests where this app is concerned.
2. Update all relevant SPFx/package metadata, including as applicable:
   - package-solution.json
   - solution name/title/description
   - webpart manifest title/description
   - package display strings
   - package name references
   - final artifact naming conventions
   - app catalog-facing metadata
3. Update IDs/GUID-backed identities if required for proper separation of Project Setup Requests from a future Estimating app.
4. Update any code comments, labels, logging strings, diagnostics, and runtime text that still frame this app as Estimating.
5. Preserve any internal technical namespaces that should remain temporarily unchanged only if changing them would create unnecessary breakage; in those cases, document them explicitly.

## Required output

1. Implement the changes.
2. Summarize every changed file grouped by:
   - SPFx/package identity
   - runtime/app naming
   - diagnostics/logging/comments
3. Call out any intentionally deferred rename remnants and why they were left in place.
4. Report any GUID/identity changes made and the rationale.
5. Confirm whether the resulting package now presents itself as Project Setup Requests in all final-package-facing surfaces.
