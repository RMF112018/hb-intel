---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 11 — Validation, Closeout, and Hard-Stop Checklist

## Validation Commands

The local agent should run, at minimum:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccShell PccHorizontalTabs PccProjectHeroBand PccSurfaceContextHeader PccApp
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml
```

If the repo uses a different checksum command on the local OS, document the substitute.

## Required Test Coverage

Add or update tests for:

- no tab icons;
- `external-systems` visible label becomes `External Platforms`;
- page title copy becomes `External Platforms Launch Pad` where relevant;
- hero excludes project number, client, source confidence, last updated, project status;
- hero includes location, estimated value, scheduled completion, project stage;
- shell uses selected fixture profile rather than generic placeholder;
- command preview is not an input;
- active panel has `role="tabpanel"`;
- tabs have `aria-controls`;
- active panel has `aria-labelledby`;
- surface context header removed/compressed in happy path;
- unavailable surface state is intentional;
- all eight surfaces still route;
- lockfile unchanged.

## Hard-Stop Failures

Stop remediation and report if any of the following are true:

- search looks enabled but is not functional;
- hero shows project number;
- hero shows client/source confidence/last updated/project status after locked exclusion;
- shell shows conflicting project facts;
- tab icons remain;
- `Apps` remains as the external platform tab label;
- `Systems` appears as a user-facing tab/product label;
- active tab is color-only;
- no tabpanel relationship exists;
- surface first view is blank;
- shell creates double-scroll;
- shell uses fake SharePoint chrome;
- source/reference language dominates the first impression;
- final docs claim 56/56 without evidence;
- lockfile changes without explicit approval;
- backend/API/live integration is introduced.

## Closeout Document Requirements

Create a closeout document with:

- files changed;
- decisions implemented;
- tests run;
- screenshot/evidence status;
- residual limitations;
- hard-stop checklist result;
- updated score estimate;
- next recommended prompt.

Do not claim benchmark-grade completion unless evidence supports it.
