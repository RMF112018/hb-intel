# Prompt 02 — Wave 9 Shared Lifecycle Readiness Models and Fixtures

## Role

You are a local code agent working in `/Users/bobbyfetting/hb-intel`.

## Objective

Add shared TypeScript model contracts and deterministic fixture data for the Project Lifecycle Readiness Center, consuming Wave 8 readiness framework contracts where they exist.


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

- Prompt 01 must be approved.
- Wave 8 framework contracts must exist, or Prompt 01 must explicitly authorize the minimal shared-model additions required for Wave 9 without duplicating Wave 8.

## Allowed Files

Prefer additive files under:

```text
packages/models/src/pcc/
packages/models/src/pcc/fixtures/
packages/models/src/pcc/__tests__/
packages/models/src/pcc/index.ts
```

Potential new files, adjust to repo truth:

```text
packages/models/src/pcc/LifecycleReadiness.ts
packages/models/src/pcc/fixtures/lifecycleReadiness.ts
packages/models/src/pcc/LifecycleReadiness.test.ts
packages/models/src/pcc/fixtures/lifecycleReadiness.test.ts
```

Do not edit `docs/architecture/plans/**`.

## Implementation Requirements

Add type-only contracts for:

- lifecycle readiness family: startup, safety, closeout;
- lifecycle phases;
- readiness domains;
- item types;
- criticality/risk tags;
- status;
- evidence requirement policy;
- evidence link/reference;
- exception code;
- ownership classification: owned, linked, external-reference, deferred;
- template item;
- project item instance;
- gate summary;
- domain summary;
- source library metadata;
- read-model payload shape for Wave 9.

Fixtures must:

- preserve canonical count metadata: 157 total, 55 startup, 32 safety, 70 closeout;
- include representative sample items for startup, safety, and closeout;
- preserve source-document, section, item-number, exact source text, normalized title, domain, phase, type, criticality, evidence policy, owner/reviewer, triggers, and external reference posture;
- not attempt runtime PDF parsing;
- not require new dependencies.

Tests must verify:

- family/count metadata;
- source traceability fields are populated for sampled items;
- source text is preserved separately from normalized title;
- template items and project instances are distinct;
- safety sample supports recurring/failed/evidence posture;
- closeout sample supports future-closeout exposure;
- no forbidden runtime imports or URLs/secrets are introduced.


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
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
git diff --check
md5 pnpm-lock.yaml
```

## Commit

Summary:

```text
feat(models-pcc): add lifecycle readiness contracts
```

Body:

```text
Adds Wave 9 Project Lifecycle Readiness Center shared model contracts and deterministic fixtures for startup, safety, and closeout readiness. Preserves canonical source-library count metadata, exact source traceability fields, template-versus-project-instance separation, evidence/reference posture, and no-runtime/no-mutation boundaries.

No backend route, SPFx runtime, persistence, Graph/PnP, SharePoint REST, Procore, Sage, Outlook, approval execution, notification, package, lockfile, manifest, workflow, deployment, tenant, or production changes are introduced.
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
