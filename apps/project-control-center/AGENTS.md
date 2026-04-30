# Project Control Center Routing — Codex

## Primary rule

Project Control Center work must be routed through current PCC app truth and active phase/wave docs before implementation.

## Required starting sources

Use as applicable:

```text
apps/project-control-center/README.md
apps/project-control-center/package.json
docs/architecture/blueprint/sp-project-control-center/
docs/architecture/plans/MASTER/spfx/pcc/
docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png
docs/reference/developer/verification-commands.md
```

## Current posture classification

Before editing PCC, classify the work as one or more of:

- preview-shell/UI only;
- backend read-model planning;
- backend route/DTO implementation;
- SPFx host/wrapper work;
- tenant/provisioning/deployment work;
- documentation/closeout.

## Guardrails

Preserve the current no-runtime posture unless explicitly changed by the active wave:

- no live Microsoft Graph/PnP/SharePoint runtime;
- no Procore, Document Crunch, Adobe Sign runtime;
- no secrets, sync, mirror, or write-back;
- no app catalog deployment;
- no `.sppkg` generation;
- no auth runtime unless explicitly authorized;
- no backend/provisioning/tenant mutation unless explicitly authorized;
- no package/manifest version change unless explicitly authorized.

## Validation

Use package-local PCC commands before workspace-wide commands:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center lint
pnpm --filter @hbc/spfx-project-control-center build
```

Preserve no-runtime guard tests when runtime boundaries matter. Do not claim operational readiness if the change only updates fixture-driven preview behavior.
