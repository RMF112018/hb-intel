# Testing, Validation, and Closeout Gates

## General Test Philosophy

Every prompt should leave the repo more deterministic and easier to audit.

Prefer targeted tests tied to the modified files. Avoid broad/unrelated test churn.

## Required Validation Commands by Area

### Shared Models

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
md5 pnpm-lock.yaml
```

### Backend Functions

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
md5 pnpm-lock.yaml
```

### SPFx PCC App

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
md5 pnpm-lock.yaml
```

### JSON Artifacts if Edited

```bash
python3 -m json.tool path/to/file.json >/dev/null
```

### Markdown if Edited

Run Prettier only on touched markdown, or use repo-standard targeted command if present. Do not run broad full-repo formatting unless explicitly requested.

## Required Test Coverage

### Models / Fixtures

- vocabulary tuple coverage;
- URL policy helper coverage;
- no secret-like fixture values;
- composite read model serialization;
- degraded/unknown-project shapes;
- HBI allowed/refused fixture states;
- role/action matrix fixture projection where implemented.

### Backend

- GET-only route registration;
- provider known project / unknown project / backend unavailable;
- no prohibited imports;
- route response envelope shape;
- no POST/PATCH/DELETE route registrations for Wave 15.

### SPFx Client

- route registry includes Wave 15 routes;
- backend client builds correct URLs;
- blank query parameters are not serialized unless intended;
- viewer persona is not serialized into URLs unless existing route explicitly supports it;
- fallback envelope behavior works;
- fixture client mirrors backend provider degraded shapes.

### SPFx UX

- Launch Pad renders summary/cards from read model;
- blocked/degraded/empty states render;
- link cards show policy state and hostname;
- no iframe render;
- open link affordance is disabled/absent when policy blocked;
- drawer/panel focus behavior where feasible;
- HBI refusal/citation-ready states;
- audit history redaction;
- role/action disabled captions.

### Integration Seams

- Priority Action candidate generation is deterministic and deduped;
- Project Readiness rows are additive and preserve source ownership;
- Wave 14 approval/checkpoint handoff creates references only, not decisions;
- Project Home summary does not import heavy surface internals;
- HBI no-authority preserved.

## Guardrail Attestation Required in Final Response

Each implementation prompt final response must include:

```text
Guardrails confirmed:
- No package/lockfile mutation unless explicitly authorized.
- No SPFx manifest/Sppkg/version mutation.
- No tenant/list/group/security mutation.
- No live external-system API calls.
- No command/write routes.
- No SharePoint/Graph/PnP writes.
- No Procore/Sage/AHJ/camera writeback/sync/mirror.
- No iframe/current-image embed behavior.
- No secrets in fixtures, URLs, logs, docs, or tests.
- HBI no-authority preserved.
- Wave 14 ownership preserved.
```

## Closeout File Expectations

Prompt 09 may add a closeout file if authorized by the prompt. Suggested path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Implementation_Closeout.md
```

Do not edit canonical docs under `docs/architecture/plans/**` unless the specific prompt authorizes it.

## Stop Conditions

Stop and ask for guidance if:

- a required type seam forces unrelated package changes;
- package/lockfile mutation becomes necessary;
- SPFx manifest or SPPKG packaging becomes necessary;
- a runtime command/write route is needed to satisfy a UI requirement;
- tenant/list provisioning appears required;
- current repo truth materially conflicts with this package;
- validation reveals unrelated compile failures outside authorized scope.
