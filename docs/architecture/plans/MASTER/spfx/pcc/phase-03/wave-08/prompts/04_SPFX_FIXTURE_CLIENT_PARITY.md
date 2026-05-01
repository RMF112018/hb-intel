<!--
PCC Phase 3 Wave 8 Prompt Bundle
Use this file as a standalone prompt for the local code agent.
Do not combine with later prompts until this prompt has been completed, validated, committed, and closed out.
-->

## Package-Level Operating Rules

- Work in `/Users/bobbyfetting/hb-intel`.
- Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
- Protect unrelated working-tree changes. Record them, do not overwrite them, and do not stage them.
- Do not use `git add .` or broad staging.
- Use explicit path staging only.
- Run `git diff --check` before commit.
- Record `md5 pnpm-lock.yaml` before and after.
- Do not run `pnpm install`, `pnpm add`, or `pnpm update` unless explicitly authorized.
- Do not edit `docs/architecture/plans/**` unless this prompt explicitly authorizes it. Prefer current-state documentation under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/`.
- Preserve Wave 8 as the Project Readiness Module Framework; do not implement Wave 9 checklist content, Wave 10 Permit Log, Wave 11 RACI, Wave 12 Constraints Log, Wave 13 Buyout Log, or Wave 14 Approvals runtime.
- Preserve no-mutation posture: no live Graph file operations, SharePoint list mutations, tenant mutations, permission mutations, Procore runtime/writeback, external-system writeback, approval/workflow execution, secrets/app settings, SPFx package/deployment, or production rollout.

---

# Prompt 04 — SPFx Fixture/Client Parity and API Guardrails

## Role

You are an SPFx TypeScript client-boundary implementer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Add Project Readiness Framework read-model parity to the SPFx PCC app client boundary and fixture client while preserving fixture-first default behavior.

Do not replace the Project Readiness UI in this prompt; this prompt is client/fixture parity only.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Required preconditions

Verify Prompts 02–03 landed if this prompt is using backend route parity. If Prompt 03 has not landed, implement fixture client parity only and document backend route parity as pending.

## Files to inspect

```text
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/package.json
packages/models/src/pcc/PccReadModels.ts
```

## Files you may modify

Expected:

```text
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Only modify router if required to thread a narrow readiness client type later. Do not implement the UI surface here.

Do not modify:

```text
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required implementation

Add `project-readiness` route/client parity:

```text
pcc/projects/{projectId}/project-readiness
```

Add client method:

```ts
getProjectReadiness(...)
```

Ensure:

- fixture client returns deterministic model fixture envelope;
- backend client path remains explicit opt-in only;
- route path constants are inert strings where applicable;
- no new fetch callsites outside existing backend client implementation pattern;
- no default backend cutover;
- no direct Graph/PnP/SharePoint REST calls;
- no external runtime.

## Required tests

Prove:

- route path exists in route constants;
- fixture client returns `readOnly: true` readiness envelope;
- backend client constructs expected `project-readiness` path if backend client exists;
- opt-in tests still prove backend mode is not default;
- no broad additional fetch callsites are introduced;
- no prohibited runtime imports are introduced.

## Validation commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

Run models check if type exports needed adjustment:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
feat(spfx-pcc): add project readiness read-model client parity
```

## Commit body

```text
Adds SPFx PCC fixture/client parity for the Phase 3 Wave 8 Project Readiness Module Framework read model.

Extends route/client typing and deterministic fixture client behavior for the project-readiness envelope while preserving fixture-first default behavior and explicit backend opt-in posture.

No Project Readiness UI replacement, backend default cutover, direct Graph/PnP/SharePoint REST runtime, Procore runtime, external-system runtime, workflow execution, write behavior, package/dependency change, lockfile change, SPFx packaging, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- client methods/route constants added;
- explicit exclusions;
- remaining risks;
- recommended next prompt: Prompt 05.

---
