# Prompt 04 — Wave 9 SPFx Client Fixture Parity and Router Seam

## Objective

Extend the SPFx PCC client/fixture seams so the Project Readiness surface can consume Wave 9 lifecycle readiness data in fixture-default mode, with optional backend seam only if prior prompts authorized it.


## Mandatory Preflight

Run before any edits:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated pre-existing changes and do not stage or modify them. Do not use `git add .`. Stage only explicit paths approved by this prompt.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.


## Preconditions

- Prompt 02 approved.
- Prompt 03 approved if backend route was authorized.
- Existing Project Readiness surface/router state verified.

## Allowed Files

```text
apps/project-control-center/src/api/
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/tests/
apps/project-control-center/README.md
```

## Implementation Requirements

- Extend fixture read-model client with lifecycle-readiness data from `@hbc/models/pcc`.
- Extend backend client type/path only if Prompt 03 added the route.
- Keep fixture mode as default.
- Thread read-model client to the Project Readiness surface using existing structural typing patterns.
- Do not switch Project Readiness to backend by default.
- Add tests proving fixture-default behavior and no fetch call in default mode.
- Add tests for client method route path if backend seam exists.
- Preserve existing Project Home, Team & Access, Documents, External Systems, Site Health routing behavior.


## Forbidden Scope

Do not implement or introduce:

- live Microsoft Graph file operations;
- live SharePoint/PnP/SharePoint REST operations;
- SharePoint list/library mutation or provisioning;
- tenant mutation;
- permission/group mutation;
- Procore runtime/API integration or writeback;
- Sage runtime/API integration or writeback;
- Outlook/calendar/email runtime mutation;
- Document Crunch or Adobe Sign runtime/writeback;
- Safety platform runtime integration;
- workflow/approval execution;
- Power Automate flows;
- notifications;
- production persistence writes;
- package/dependency/version/manifest changes unless this prompt explicitly authorizes and proves need;
- SPFx packaging/deployment/app-catalog upload;
- secrets/app settings;
- broad format rewrites outside touched files.


## Validation

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
```

## Commit

Summary:

```text
feat(spfx-pcc): add lifecycle readiness client seam
```

Body:

```text
Adds Wave 9 Project Lifecycle Readiness Center fixture/default SPFx read-model client parity and routes the lifecycle readiness data seam to the Project Readiness surface. Keeps fixture mode as the default and preserves explicit opt-in backend behavior where applicable.

No live fetch default, Graph/PnP, SharePoint REST, Procore, Sage, Outlook, approval execution, notification, writeback, package, lockfile, manifest, workflow, deployment, tenant, or production changes are introduced.
```


## Required Closeout Response

Your final response must include:

- files changed;
- validation results;
- lockfile MD5 before/after;
- package/dependency/manifest status;
- explicit exclusions;
- remaining risks/operator-pending items;
- recommended next prompt.

If committing, use explicit path staging only. Do not use `git add .`.
