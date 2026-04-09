# PnP Operations SPFx Webpart Prompt Package

## Purpose

This package instructs the local code agent to create a **production-safe SPFx admin webpart** that lets an authorized user run high-value, repeatable SharePoint/PnP extraction operations against a target site entered at runtime.

The webpart is intended to support:

- site "template" extraction suitable for cloning a new site starting point,
- list schema extraction,
- page / webpart layout extraction where feasible,
- and other repeatable high-ROI read-heavy PnP operations that produce downloadable output files.

## What this package is and is not

This package **is** for:

- repo-truth architecture lock,
- SPFx shell creation or extension,
- backend/service orchestration for PnP operations,
- a disciplined action catalog,
- download-file generation,
- validation, packaging, and operator guidance.

This package is **not** for:

- running PnP PowerShell directly in the browser,
- embedding privileged credentials in SPFx client code,
- full tenant backup/restore,
- or an unconstrained admin console that mutates SharePoint structure.

## Governing architectural stance

Unless local HEAD proves a narrow conflict, the agent should assume:

1. The user-facing surface is an SPFx webpart inside the existing SharePoint/webpart solution domain.
2. The actual privileged PnP extraction work must run **outside the browser** through a secured backend/execution seam.
3. The webpart should use `@hbc/ui-kit` for all application-visible styling and shell composition.
4. The first release should emphasize **read-only export operations** with deterministic downloadable outputs.
5. The operator supplies one or more target site URLs through the webpart UI.
6. Every run should create a clear artifact manifest and downloadable files.

## Recommended execution order

1. `Prompt-00-Repo-Truth-Architecture-and-Scope-Lock.md`
   - `Prompt-00-Repo-Truth-Architecture-and-Scope-Lock-Report.md`
   - `Prompt-00-V1-Action-Catalog-Note.md`
   - `Prompt-00-Deferred-Scope-Note.md`
2. `Prompt-01-SPFx-Shell-and-Action-Catalog-Foundation.md`
3. `Prompt-02-Backend-Orchestration-and-PnP-Execution-Seam.md`
4. `Prompt-03-Extraction-Workflows-and-Download-Artifact-Generation.md`
5. `Prompt-04-High-ROI-Additional-PnP-Operations.md`
6. `Prompt-05-Validation-Packaging-and-Operator-Guide.md`

## Package contents

- `README.md`
- `Plan-Summary.md`
- `Prompt-00-Repo-Truth-Architecture-and-Scope-Lock.md`
- `Prompt-00-Repo-Truth-Architecture-and-Scope-Lock-Report.md`
- `Prompt-00-V1-Action-Catalog-Note.md`
- `Prompt-00-Deferred-Scope-Note.md`
- `Prompt-01-SPFx-Shell-and-Action-Catalog-Foundation.md`
- `Prompt-02-Backend-Orchestration-and-PnP-Execution-Seam.md`
- `Prompt-03-Extraction-Workflows-and-Download-Artifact-Generation.md`
- `Prompt-04-High-ROI-Additional-PnP-Operations.md`
- `Prompt-05-Validation-Packaging-and-Operator-Guide.md`

## Prompt-01 repo truth note

Prompt-01 SPFx shell implementation is landed under:

- `apps/hb-webparts/src/webparts/pnp/`

This includes:

- Prompt-01 read/export action catalog foundation (4 visible actions)
- Target-site input + conditional list/page filters
- Preflight/launch/poll client adapter seam to `/api/admin/*`
- Result and artifact-manifest rendering with locked fallback catalog + mock mode

## Mandatory operating rules for the agent

1. Use local repo truth at HEAD as the final authority.
2. Do not re-read files that are still within active context/memory unless a specific uncertainty requires it.
3. Do not implement privileged PnP execution in client-side SPFx code.
4. Do not store secrets in the repo or expose tokens through the webpart UI.
5. Keep the first wave focused on high-value, repeatable export operations.
6. Do not claim success unless the built webpart, backend seam, and download outputs are all proven.

## Expected outcome after this package

After execution, the repo should contain:

- a locked architecture decision for the SPFx + backend PnP operations pattern,
- an SPFx admin webpart using `@hbc/ui-kit`,
- a secured execution seam for running PnP-based extractors,
- a first action catalog for repeatable exports,
- downloadable artifact generation for each supported action,
- and packaging / validation evidence.
