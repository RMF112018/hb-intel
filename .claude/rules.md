# Claude Code Context Rules – HB Intel

## Purpose

This file is the top-level rule index for Claude Code work in the `hb-intel` repository. It should stay concise and route Claude to the correct detailed rule file, specialist agent, or Skill instead of duplicating every policy here.

Use current repo truth first. Historical plans, older blueprints, prior summaries, and old implementation notes guide context only; they do not override live code, package manifests, exports, tests, closeouts, active prompt packages, and current governing docs.

---

## Relationship to `CLAUDE.md`

`CLAUDE.md` is the root operating brief.

This file is the detailed rule index and routing layer.

When `CLAUDE.md` and this file differ, follow the more specific current rule in this file unless the user explicitly provides a newer task-specific instruction.

Use:

- `.claude/agents/README.md` for specialist-agent routing.
- `.claude/skills/README.md` for reusable workflow routing.
- `.claude/rules/README.md` for this rule file set index.

---

## Rule Index

| Rule | File | Use When |
|---|---|---|
| 01 — Authority and Reading Order | `.claude/rules/01-authority-and-reading-order.md` | Choosing source of truth, reading order, repo-truth evidence, specialist agent, Skill, or verification source. |
| 02 — Architecture Invariants | `.claude/rules/02-architecture-invariants.md` | Protecting package direction, shared primitives, architecture guardrails, app shell behavior, auth, provisioning, routing, or runtime doctrine. |
| 03 — Package Boundaries | `.claude/rules/03-package-boundaries.md` | Adding/moving code across packages, changing exports, adding dependencies, or deciding ownership. |
| 04 — Documentation Standards | `.claude/rules/04-documentation-standards.md` | Creating/updating docs, deciding doc placement, preserving canonical docs, avoiding scratch-plan pollution, or resolving documentation authority overlap. |
| 05 — Implementation Quality | `.claude/rules/05-implementation-quality.md` | Writing or reviewing code for correctness, maintainability, testability, typing, and minimal scope. |
| 06 — Planning and Proposals | `.claude/rules/06-planning-and-proposals.md` | Preparing plans, proposals, prompt packages, better-path recommendations, saved planning artifacts, or canonical plan updates. |
| 07 — Plan Review and Execution Gates | `.claude/rules/07-plan-review-and-execution-gates.md` | Prompt-package, phase/wave, risky, cross-cutting, architecture, SPFx, backend, provisioning, deployment, Graph/PnP, Procore, permissions, or CI/CD work. |
| 08 — Active Context Efficiency | `.claude/rules/08-active-context-efficiency.md` | Avoiding unnecessary repeated reads while preserving repo-truth verification. |
| 09 — Skills and Agents Routing | `.claude/rules/09-skills-and-agents-routing.md` | Deciding whether to use a Skill, specialist agent, rule file, or direct work path. |
| PCC Phase 3 Active Rules | `.claude/rules/projects/pcc-phase-3.md` | Any task touching the Project Control Center, especially Phase 3 shell-frame, UI/UX, module, planning, roadmap, or provisioning-boundary work. |

---

## Operating Defaults

### 1. Start With Current Scope

For every task, identify the active scope first:

- package or app;
- phase, wave, or prompt package;
- docs-only update;
- UI/SPFx work;
- backend/provisioning/deployment work;
- project-specific work such as PCC;
- Claude configuration work involving agents, Skills, hooks, settings, or rules.

Then use the smallest rule/source set that can answer the question accurately.

### 2. Repo Truth Is Authoritative

Use current repo truth before historical summaries:

- live files in the touched area;
- package `package.json`, exports, README, tests, and configs;
- current closeouts;
- current prompt package README / decision registers / validation matrices;
- current governing architecture docs;
- current validation command output.

Historical plans guide prior intent. They do not override current repo truth.

### 3. Skills Are Workflow Playbooks

Use `.claude/skills/README.md` for reusable workflows such as:

- repo-truth audits;
- prompt package generation;
- plan-gate reviews;
- post-execution closeout reviews;
- verification routing;
- sensitive-operation gates;
- SPFx runtime parity reviews;
- UI doctrine conformance;
- documentation authority cleanup;
- PCC phase routing;
- brand asset governance;
- Claude configuration maintenance.

Skills should orchestrate repeatable process. They should not replace repo truth, specialist agents, or explicit user approval.

### 4. Specialist Agents Reduce Risk

Use `.claude/agents/README.md` for specialist reviewer/investigator routing.

Use the smallest specialist that clearly fits:

- `.claude/agents/hb-repo-researcher.md` — unfamiliar areas, cross-package investigation, repo-truth mapping.
- `.claude/agents/hb-boundary-auditor.md` — package placement, dependency legality, export ownership, shared-primitive placement, cross-package coupling.
- `.claude/agents/hb-verification-runner.md` — validation scope, command choice, separating new failures from pre-existing failures.
- `.claude/agents/hb-docs-curator.md` — documentation impact, placement, conflicts, and canonical doc quality.
- `.claude/agents/hb-ui-ux-conformance-reviewer.md` — reusable UI ownership, `@hbc/ui-kit` alignment, SPFx surface quality, UX consistency, and basis-of-design review.
- `.claude/agents/hb-implementation-plan-reviewer.md` — pre-execution plan review and post-execution validation.
- `.claude/agents/hb-security-and-secrets-auditor.md` — secrets, tokens, app settings, auth proofs, redaction posture, and sensitive artifact risk.
- `.claude/agents/hb-tenant-deployment-gatekeeper.md` — tenant mutation, app catalog, Azure deployment, CI/CD, Graph/PnP, rollout, and permission-change gates.
- `.claude/agents/hb-spfx-runtime-parity-auditor.md` — SPFx source/build/manifest/runtime/hosted parity and SharePoint host constraints.
- `.claude/agents/hb-commit-diff-auditor.md` — post-execution diff scope, unrelated churn, package/manifest/lockfile drift, and commit-summary accuracy.
- `.claude/agents/hb-claude-config-curator.md` — Claude Code configuration consistency across rules, agents, Skills, hooks, settings, and root operating guidance.

Do not invoke specialists when the answer is obvious from the current file or current package context.

### 5. Specialist Escalation Priority

When multiple specialists may apply, start with the highest-risk relevant specialist:

1. `hb-security-and-secrets-auditor`
2. `hb-tenant-deployment-gatekeeper`
3. `hb-spfx-runtime-parity-auditor`
4. `hb-boundary-auditor`
5. `hb-implementation-plan-reviewer`
6. `hb-verification-runner`
7. `hb-docs-curator`
8. `hb-ui-ux-conformance-reviewer`
9. `hb-claude-config-curator`
10. `hb-repo-researcher`

This is not a rigid call order. If the area is unfamiliar, use `hb-repo-researcher` first to establish repo truth.

---

## Source-of-Truth Routing

### Package or App Work

If the task names a package/app, start with:

1. the package/app directory;
2. its `package.json`;
3. its README;
4. public exports;
5. tests;
6. nearby docs and configs.

Then escalate to broader architecture docs only if ownership, dependencies, runtime behavior, public API, app shell behavior, auth, provisioning, deployment, or cross-package scope is involved.

### Phase / Wave / Prompt Package Work

If the task names a phase, wave, or prompt package, start with:

1. that prompt package README;
2. validation matrix;
3. decision register;
4. scope lock;
5. closeout docs;
6. the governing architecture docs named by the prompt package.

Do not read the entire planning corpus unless the task is cross-cutting.

Use the `hb-prompt-package-builder`, `hb-plan-gate-review`, or `hb-post-execution-closeout` Skill when the user requests that specific workflow.

### PCC Work

If the task touches the Project Control Center, follow `.claude/rules/projects/pcc-phase-3.md` and read current PCC repo truth from:

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/`

For PCC Phase 3 Wave 2 specifically:

- target shell app: `apps/project-control-center/`;
- shared vocabulary and fixtures: `@hbc/models/pcc`;
- UI basis of design: `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`;
- `apps/project-sites/` is a reference pattern only, not the PCC target.

Use `hb-pcc-phase-router` for repeatable PCC routing.

### UI / SPFx Work

If the task is UI/SPFx-related, read:

- touched app/package files;
- `docs/reference/ui-kit/doctrine/`;
- `docs/reference/spfx-surfaces/`;
- relevant app/package implementation patterns;
- any task-specific basis-of-design asset.

Use `.claude/agents/hb-ui-ux-conformance-reviewer.md` or the `hb-ui-doctrine-conformance` Skill when ownership, consistency, accessibility, responsive behavior, SPFx fit, or visual direction is material.

For SPFx source/build/manifest/runtime/hosted parity questions, use:

- `.claude/agents/hb-spfx-runtime-parity-auditor.md`
- `hb-spfx-runtime-parity`

### Backend / Provisioning / Deployment Work

If the task touches backend, provisioning, tenant mutation, Graph/PnP, Procore, deployment, CI/CD, package versions, SPFx manifests, or app catalog behavior:

1. verify the current closeout docs and package/runtime boundaries;
2. produce a plan first;
3. do not execute until the user approves;
4. preserve no-mutation/no-secrets/no-deployment guardrails unless explicitly authorized.

For secrets, auth-proof, token, app-setting, or sensitive artifact risk, use:

- `.claude/agents/hb-security-and-secrets-auditor.md`

For tenant mutation, deployment, app catalog, Azure, CI/CD, Graph/PnP, SharePoint provisioning, permission mutation, or rollout risk, use:

- `.claude/agents/hb-tenant-deployment-gatekeeper.md`
- `hb-sensitive-operation-gate`

---

## Plan and Execution Gate

For prompt-package-driven, phase/wave-driven, risky, cross-cutting, or sensitive work, follow `.claude/rules/07-plan-review-and-execution-gates.md`.

Default flow:

1. Produce an implementation plan first.
2. Wait for user approval before execution.
3. Execute only the approved scope.
4. Do not stage unrelated files.
5. Do not push unless explicitly instructed.
6. Report files inspected, files modified, validation commands, validation results, guardrails preserved, known gaps, commit summary, and commit description.

Claims are not proof. Verify current files and command results before claiming completion.

Use `.claude/agents/hb-implementation-plan-reviewer.md` or `hb-plan-gate-review` for pre-execution plan review or post-execution validation when the work is prompt-package-driven, phase/wave-driven, risky, cross-cutting, or sensitive.

Use `.claude/agents/hb-commit-diff-auditor.md` or `hb-post-execution-closeout` after execution when the key question is whether the actual diff matches the approved scope and whether the commit summary accurately describes the work.

---

## Documentation and Planning Artifact Defaults

Follow `.claude/rules/04-documentation-standards.md` and `.claude/rules/06-planning-and-proposals.md`.

Default distinction:

- `docs/**` contains repository documentation and approved canonical artifacts.
- `docs/architecture/plans/**` is the canonical development plan library.
- `.claude/plans/**` is the default location for Claude-generated working plans, draft plans, exploratory outlines, and temporary planning artifacts when a file is useful.
- Inline chat output remains the default for most planning unless persistence adds real value.

Do not write exploratory or working plans into `docs/architecture/plans/**` unless the user explicitly asks to create, revise, or promote a canonical plan document there.

For documentation authority cleanup, prevent source-of-truth overlap:

- blueprint = architecture doctrine and product boundaries;
- roadmap = sequencing, phase/wave status, execution plan, and acceptance criteria;
- README = navigation, source-of-truth hierarchy, and orientation;
- contract = implementable structure, permissions, settings, validation, and MVP boundaries when named as the implementation source of truth;
- prompt package README = scoped execution guidance only;
- closeouts = historical proof and completion evidence.

Use `.claude/agents/hb-docs-curator.md` or `hb-doc-authority-cleanup` when documentation placement, drift, redundancy, or authority overlap is material.

---

## Active Context Efficiency

Follow `.claude/rules/08-active-context-efficiency.md`.

Do not re-read files that are still within active context or memory unless:

- the file may have changed;
- line-level verification is needed;
- final validation or closeout reporting requires proof;
- the scope expanded;
- the user asks for a repo-truth audit;
- the task involves post-execution validation;
- the file is a governing source of truth for the current task.

When in doubt, verify the current file rather than relying on stale memory. Efficiency must not override repo-truth validation.

---

## Non-Negotiable Safety and Scope Guardrails

Unless explicitly authorized by the user and supported by governing docs, do not:

- mutate tenants;
- call live Graph/PnP;
- call Procore;
- add Procore secrets, mirrors, or write-back behavior;
- introduce direct SPFx-to-Procore calls;
- deploy to app catalog;
- generate `.sppkg` artifacts;
- edit CI/CD workflows;
- change package or manifest versions;
- push commits;
- stage unrelated files;
- run destructive shell commands;
- broaden scope into adjacent cleanup.

Do not run dependency install or upgrade commands unless explicitly authorized, including:

- `npm install`
- `pnpm install`
- `pnpm add`
- `npm update`
- `pnpm update`
- dependency manager commands whose main purpose is changing `package.json` or lockfiles.

For sensitive tasks, use the plan gate first.

For secrets, auth-proof, token, app-setting, or sensitive artifact risk, use:

- `.claude/agents/hb-security-and-secrets-auditor.md`

For tenant mutation, deployment, app catalog, Azure, CI/CD, Graph/PnP, SharePoint provisioning, permission mutation, or rollout risk, use:

- `.claude/agents/hb-tenant-deployment-gatekeeper.md`
- `hb-sensitive-operation-gate`

---

## Validation Defaults

Use the smallest meaningful validation set first:

1. changed-file or package-local checks;
2. affected-package lint, typecheck, and tests;
3. broader workspace validation only when cross-cutting, release-critical, or requested.

For docs-only work, default validation is:

- `git diff -- <changed docs>`;
- `git status --short`;
- `pnpm format:check` only if expected by repo convention or requested.

Do not run broad builds or tests for docs-only work unless the docs change affects generated docs, command references, package behavior, or repo tooling.

For validation uncertainty, use:

- `.claude/agents/hb-verification-runner.md`
- `hb-verification-router`

---

## Conflict Resolution

When sources disagree:

1. verified live repo state and current files are present-truth authority;
2. current package manifests, exports, tests, and closeouts govern implementation status;
3. package relationship maps and local package docs govern ownership and dependency direction;
4. current governing architecture docs govern target state;
5. active prompt packages govern the current execution scope;
6. historical plans and old summaries are context only.

If a conflict would change architecture, package ownership, runtime boundaries, deployment posture, or security posture, stop and surface the conflict before implementing.

---

## Output Discipline

- Be concise and decision-useful.
- Prefer bullets and clear sections.
- State assumptions and uncertainty explicitly.
- Separate evidence from recommendation.
- Reference canonical sources instead of duplicating long prose.
- Validate the changed scope before claiming completion.
- When corrective action is needed, provide a copy-ready prompt or instruction for the next agent step.
