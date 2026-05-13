# Prompt 00 — Repo Truth and Deployed Artifact Parity Gate

## Objective

Before making any remediation edits, establish a reliable truth baseline for the current My Dashboard implementation and reconcile the apparent drift between:

1. the live repository source,
2. the locally working implementation state,
3. any recently built/uploaded `hb-intel-my-dashboard.sppkg` artifact available to the operator.

The prior audit found that the uploaded `.sppkg` appeared to expose a different version/code posture than the then-current `main` source. Do **not** proceed to implementation until this parity question is resolved and documented.

## Why this exists now

The read-only/non-ready render defect is partly a source-level implementation issue and partly a package/runtime-config issue. If source truth and package truth are not reconciled first, subsequent remediation may fix the wrong code state or produce another misleading package.

## Required current-state audit

Inspect the current live repo and document:

- branch,
- HEAD,
- working tree status,
- package-solution version for My Dashboard,
- webpart manifest version for My Dashboard,
- any uncommitted local changes affecting:
  - `apps/my-dashboard/`
  - `backend/functions/src/hosts/my-work-read-model/`
  - `tools/build-spfx-package.ts`
  - `tools/spfx-shell/`

## Required package parity investigation

If the operator-provided `.sppkg` artifact is locally available, inspect it sufficiently to answer:

1. What package version does it carry?
2. What My Dashboard solution ID / webpart ID does it carry?
3. Does it match the repo package-solution and manifest versions?
4. Does it contain runtime strings/markers indicating:
   - `functionAppUrl`
   - `apiAudience`
   - `backendMode`
5. Does it contain frontend seams not presently visible in the repository source, such as an Adobe OAuth initiation client/action pathway?

Do **not** assume the uploaded package is authoritative. Determine whether it was built from:
- current repo source,
- uncommitted local source,
- a different branch,
- or a stale/staged artifact.

## Exact files and seams to inspect

At minimum:

```text
apps/my-dashboard/config/package-solution.json
apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
apps/my-dashboard/src/mount.tsx
apps/my-dashboard/src/MyDashboardApp.tsx
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
tools/build-spfx-package.ts
tools/spfx-shell/gulpfile.js
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
```

Also search the current repo for:
- Adobe OAuth frontend start-client code,
- strings such as `authorizationUrl`, `oauth/start`, `adobeSignAuthorization`,
- any code seams present in the package but not in live repo source.

## Required deliverable

Create a markdown closeout artifact in an appropriate repo docs/evidence location that contains:

1. **Parity verdict**
   - `PASS — source and package posture reconciled`
   - or `BLOCKED — package/source drift remains unresolved`
2. Branch / HEAD / working tree status.
3. Source My Dashboard version truth.
4. Artifact version truth, if package was available.
5. Runtime-marker truth, if package was available.
6. Any drift found.
7. Clear decision on which source state is authoritative for the remediation prompts that follow.

## Completion gate

Do not proceed to Prompt 01 unless one of these is true:

- **PASS:** package and source truth are reconciled; or
- **CONTINUE WITH SOURCE AUTHORITY:** the package is conclusively stale/out-of-band and the operator directs that live repo source is the remediation authority.

## Non-scope

- Do not implement readiness wiring yet.
- Do not modify surface components yet.
- Do not repair build logic yet.
- Do not change backend OAuth code.

## Validation / proof

Run and capture:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Use targeted source inspection rather than broad repo re-reading.

## Agent Efficiency Directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
