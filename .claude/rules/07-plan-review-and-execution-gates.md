# 07 — Plan Review and Execution Gates

## Purpose

Protect HB Intel from uncontrolled execution, unrelated churn, sensitive operations, unnecessary plan-file noise, and unverified completion claims.

## Primary Rule

For prompt-package, phase/wave, risky, cross-cutting, architecture, SPFx, backend, provisioning, deployment, Graph/PnP, Procore, permission, CI/CD, package/version, or tenant-sensitive work:

1. produce a plan first;
2. wait for user approval before execution when execution is gated;
3. execute only approved scope;
4. validate changed scope;
5. report evidence and residual risk.

## Plan Output Discipline

When a plan gate is required, present the execution plan in chat / ExitPlanMode for approval.

Do **not** create a `.claude/plans/**` working-plan file unless one of the following is true:

- the user explicitly asks for a saved plan file;
- the execution is multi-stage and a durable scratch plan materially reduces risk;
- another agent/session must consume the plan later;
- the plan is a formal deliverable;
- the plan includes enough placement, validation, or sequencing decisions that preserving it avoids repeated repo reads.

If a scratch plan is necessary:

- keep it concise;
- place it under `.claude/plans/**`;
- do not duplicate long prompt text;
- do not omit useful canonical path references merely to satisfy hooks;
- delete or archive it when it is no longer active, if the workflow calls for cleanup.

Do **not** write canonical plan-library files under `docs/architecture/plans/**` unless the user explicitly requested a canonical docs-plan, phase/wave plan, prompt package, or architecture-plan update.

Required closeout documents named by the prompt are not scratch plans. Create them only at the required closeout stage and only in the path authorized by the prompt.

## Canonical Plan Library Guard

`docs/architecture/plans/**` is the canonical repository plan library.

Default rule:

- read-only inspection is allowed;
- accidental write/edit/mutation is blocked;
- canonical writes require explicit user authorization or the override environment variable used by the hook.

The active hook must distinguish actual tool target paths from file content. A scratch plan under `.claude/plans/**` may reference `docs/architecture/plans/**` in its content without being blocked.

## Default Flow

1. Identify the active scope and surface.
2. Inspect current repo truth using the smallest sufficient source set.
3. Produce the plan in chat / ExitPlanMode.
4. Wait for approval when the gate applies.
5. Execute only approved scope.
6. Modify only in-scope files.
7. Do not stage unrelated files.
8. Do not push unless explicitly instructed.
9. Run appropriate validation.
10. Report completion evidence.

## Gate Applies To

Use the plan gate when work touches:

- architecture;
- cross-package behavior;
- SPFx runtime parity;
- app shell behavior;
- backend routes/services;
- provisioning;
- SharePoint/Graph/PnP;
- Procore;
- Azure deployment;
- app catalog;
- package or manifest versions;
- CI/CD workflows;
- permissions;
- auth;
- secrets;
- tenant mutation;
- live endpoint probes;
- prompt packages;
- phase/wave execution;
- broad UI doctrine;
- broad documentation authority.

## Forbidden Unless Explicitly Authorized

Do not:

- mutate tenants;
- call live Graph/PnP;
- call Procore;
- add Procore secrets, mirrors, or write-back behavior;
- introduce direct SPFx-to-Procore calls;
- deploy to app catalog;
- generate or upload `.sppkg`;
- edit CI/CD workflows;
- change package or manifest versions;
- push commits;
- stage unrelated files;
- run destructive shell or git commands;
- run dependency install/update commands;
- call live backend/tenant endpoints with `curl`;
- broaden scope into adjacent cleanup.

Dependency commands requiring explicit authorization include:

- `npm install`;
- `pnpm install`;
- `pnpm add`;
- `npm update`;
- `pnpm update`;
- any dependency manager command whose main purpose changes `package.json` or lockfiles.

## Sensitive Operation Gate

Use the sensitive-operation gate and the relevant specialist agents when the task involves:

- tenant mutation;
- app catalog deployment;
- Azure deployment;
- CI/CD;
- Graph/PnP live calls;
- SharePoint provisioning;
- permission mutation;
- Procore;
- live backend probes;
- secrets;
- tokens;
- app settings;
- auth proof.

High-risk specialists:

- `hb-security-and-secrets-auditor`;
- `hb-tenant-deployment-gatekeeper`;
- `hb-spfx-runtime-parity-auditor`.

## Plan Review

Use plan review when:

- an agent presents a plan;
- the user asks whether the plan is acceptable;
- the work is gated;
- the plan includes broad refactors;
- validation is unclear;
- scope boundaries are ambiguous;
- sensitive operations are implied.

A plan review should answer:

- Is the plan aligned with repo truth?
- Does it inspect the right sources?
- Does it preserve guardrails?
- Does it overreach?
- Does it require explicit authorization?
- Is the validation adequate?
- What should be changed before execution?

## Post-Execution Review

Use post-execution review when:

- an agent claims completion;
- a commit has landed;
- the user pastes a closure summary;
- validation failed or is ambiguous;
- the user asks whether execution matched the plan.

Post-execution review should check:

- actual changed files;
- unrelated churn;
- package/manifest/lockfile drift;
- validation claims;
- guardrail preservation;
- docs updates;
- commit summary accuracy;
- residual risk.

## Completion Report

For execution work, report:

- files inspected;
- files changed;
- validation commands run;
- validation results;
- validation not run;
- guardrails preserved;
- known gaps or uncertainty;
- commit summary;
- commit description.

Do not claim completion without stating what was actually verified.

## Failed Validation

When validation fails, report:

- command run;
- failure summary;
- whether it appears new, pre-existing, flaky, environmental, or ambiguous;
- affected scope;
- recommended next step;
- whether execution should stop.

Do not hide failed validation behind a general success statement.

## Scope Discipline

If the user approved a narrow scope, do not expand into:

- adjacent cleanup;
- formatting unrelated files;
- broad docs rewrites;
- package refactors;
- dependency upgrades;
- workflow edits;
- tenant or deployment work.

If adjacent work is discovered, report it separately as a recommendation or follow-up.
