# Prompt 05 — Wave 9 Project Lifecycle Readiness Center Command Surface

## Objective

Implement the flagship Project Lifecycle Readiness Center command surface under the existing Project Readiness surface, using lifecycle-readiness read-model/fixture data.


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


## Allowed Files

```text
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/tests/
apps/project-control-center/README.md
```

## UI Requirements

Do not build one giant checklist table. Do not build only three static tabs. Build a command-center shell with progressive disclosure.

Required regions:

1. Readiness Hero — overall posture, active gate, major blockers, source health.
2. Lifecycle Map — startup/mobilization/safety/active controls/pre-CO/turnover/closeout/warranty.
3. Family/Domain Cards — startup, safety, closeout, evidence, future closeout exposure.
4. My Readiness Actions — fixture/read-model assigned items only; inert controls.
5. Blockers & Exceptions — blocked, overdue, missing evidence, failed safety, external dependency.
6. Evidence Readiness — document/reference posture, linking conceptually to Document Control.
7. Future Closeout Exposure — early closeout risks during active construction.
8. Source Traceability panel — source document/family/section/item count summary.

## Behavior Requirements

- Use existing bento/card/layout patterns.
- Keep controls inert/disabled.
- Show source-health and degraded states.
- Support empty/loading/error/unavailable-fixture/missing-config states if existing state components support them.
- Preserve responsive behavior and accessible labels.
- Do not add dependencies or charts unless already available and justified by repo truth.


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
pnpm --filter @hbc/spfx-project-control-center lint
git diff --check
md5 pnpm-lock.yaml
```

## Commit

Summary:

```text
feat(spfx-pcc): build lifecycle readiness center surface
```

Body:

```text
Builds the Wave 9 Project Lifecycle Readiness Center command surface in the PCC Project Readiness area. Adds fixture/read-model-driven readiness hero, lifecycle map, family/domain cards, readiness actions, blockers/exceptions, evidence posture, future closeout exposure, and source traceability UI while preserving inert controls and fixture-default behavior.

No checklist-table regression, runtime workflow execution, live Graph/PnP, SharePoint REST, Procore, Sage, Outlook, approval execution, notification, writeback, package, lockfile, manifest, workflow, deployment, tenant, or production changes are introduced.
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
