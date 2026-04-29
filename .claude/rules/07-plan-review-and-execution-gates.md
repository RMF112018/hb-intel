# 07 — Plan Review and Execution Gates

## Purpose

Protect HB Intel from uncontrolled execution, unrelated churn, sensitive operations, and unverified completion claims.

---

## Primary Rule

For prompt-package, phase/wave, risky, cross-cutting, architecture, SPFx, backend, provisioning, deployment, Graph/PnP, Procore, permission, CI/CD, package/version, or tenant-sensitive work:

1. produce a plan first;
2. wait for user approval before execution;
3. execute only the approved scope;
4. validate the changed scope;
5. report evidence and residual risk.

---

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

---

## Default Flow

1. Inspect current repo truth.
2. Produce a plan.
3. Ask for approval when execution is gated.
4. Execute only after approval.
5. Modify only in-scope files.
6. Do not stage unrelated files.
7. Do not push unless explicitly instructed.
8. Run appropriate validation.
9. Report completion evidence.

---

## Forbidden Unless Explicitly Authorized

Do not:

- mutate tenants;
- call live Graph/PnP;
- call Procore;
- add Procore secrets, mirrors, or write-back behavior;
- introduce direct SPFx-to-Procore calls;
- deploy to app catalog;
- generate or upload `.sppkg` artifacts;
- edit CI/CD workflows;
- change package or manifest versions;
- push commits;
- stage unrelated files;
- run destructive shell commands;
- broaden scope into adjacent cleanup;
- run dependency install/update commands;
- call live backend/tenant endpoints with `curl`.

Dependency commands requiring explicit authorization include:

- `npm install`;
- `pnpm install`;
- `pnpm add`;
- `npm update`;
- `pnpm update`;
- any dependency manager command whose main purpose changes `package.json` or lockfiles.

---

## Sensitive Operation Gate

Use `hb-sensitive-operation-gate` and the relevant specialist agents when the task involves:

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

---

## Plan Review

Use `hb-plan-gate-review` or `hb-implementation-plan-reviewer` when:

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

---

## Post-Execution Review

Use `hb-post-execution-closeout` or `hb-commit-diff-auditor` when:

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

---

## Completion Report Standard

For execution work, report:

- files inspected;
- files modified;
- validation commands run;
- validation results;
- validation not run;
- guardrails preserved;
- known gaps or uncertainty;
- commit summary;
- commit description.

Do not claim completion without stating what was actually verified.

---

## Failed Validation

When validation fails, report:

- command run;
- failure summary;
- whether it appears new, pre-existing, flaky, environmental, or ambiguous;
- affected scope;
- recommended next step;
- whether execution should stop.

Do not hide failed validation behind a general success statement.

---

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
