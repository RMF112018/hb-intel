# Prompt 00 — Repo Truth, Architecture, and Scope Lock

Use the local repo at HEAD as the final authority.

## Objective

Establish the authoritative architecture and scope for a new SPFx admin webpart that surfaces repeatable PnP-based SharePoint extraction operations to authorized users.

## Core outcome required from this prompt

Lock the architecture before implementation begins.

The resulting decision note must explicitly confirm:

- where the SPFx webpart belongs in the repo,
- what backend/execution seam will run PnP operations,
- what the first action catalog includes,
- how downloads will be produced and surfaced,
- and what remains deferred.

## Mandatory assumptions unless repo truth proves a narrow conflict

1. The operator-facing UI is an SPFx webpart.
2. The webpart must use `@hbc/ui-kit` for styling and shell composition.
3. PnP PowerShell / privileged extraction must run outside the browser.
4. The first release is read-heavy and primarily export-oriented.
5. The operator enters one or more target site URLs directly in the webpart.
6. Output files are downloadable from the UI.

## Required audit steps

1. Inspect the repo for the best fit location for a new admin/operations webpart.
2. Inspect current SPFx patterns, package wiring, and `@hbc/ui-kit` usage conventions.
3. Inspect whether there is already an admin utility, backend helper, Azure Function pattern, or operations service that should be reused.
4. Determine the cleanest secure execution seam for PnP-based operations.
5. Lock the first-wave scope.

## Required decisions

At minimum, lock and document:

- webpart name and alias,
- repo location,
- backend location and runtime pattern,
- job execution model (sync request/response vs queued job),
- action catalog for v1,
- output artifact model,
- authorization model,
- mock/dev mode vs production mode,
- logging and audit expectations,
- and deferred scope.

## Architecture rules

- Do not implement PnP PowerShell in the browser.
- Do not expose tokens or secrets to the user.
- Do not create unnecessary new app/package domains if current repo structure can support the feature.
- Prefer reusing existing backend/service infrastructure if it is a legitimate fit.
- Keep the v1 action catalog narrow and high-value.

## Deliverables

Create:

1. A repo-truth architecture note for this feature.
2. A v1 action catalog note.
3. A concise deferred-scope note.

Suggested locations should align with repo conventions, but if no better fit exists, prefer documentation under a relevant SPFx/admin planning path and implementation under the existing SharePoint/webpart solution domain.

## Final response requirements

Report:

- locked architecture,
- chosen repo locations,
- chosen backend pattern,
- first-wave actions,
- key risks,
- and any unresolved prerequisites.
