# 01 — Authority and Reading Order

## Purpose

Define how Claude Code should choose sources of truth in the `hb-intel` repository without over-reading the repo or relying on stale summaries.

---

## Primary Rule

Use current repo truth first.

Historical plans, old blueprints, previous chat summaries, old implementation reports, and unverified claims are context only. They do not override live files, package manifests, exports, tests, current closeouts, active prompt packages, or current governing docs.

---

## Default Authority Hierarchy

Use the smallest authoritative source set that can answer the task.

Default order:

1. live files, package manifests, exports, tests, configs, and nearby README files in the touched area;
2. active prompt package README, decision register, validation matrix, scope lock, and closeout docs when phase/wave work is involved;
3. project-specific governing docs when the task names a product area;
4. `.claude/rules.md` and `.claude/rules/**`;
5. `.claude/agents/README.md` and `.claude/skills/README.md` for routing;
6. developer reference docs for source routing, verification, and documentation standards;
7. broad architecture docs only when local/project truth is insufficient.

---

## Start-Here Checklist

Before answering or editing:

1. Identify the task type:
   - code implementation;
   - repo-truth audit;
   - planning/prompt package;
   - phase/wave work;
   - UI/SPFx work;
   - backend/provisioning/deployment work;
   - docs-only work;
   - Claude configuration work.
2. Identify the touched package, app, doc area, or project.
3. Read the nearest authoritative files first.
4. Use broader docs only when ownership, boundary, architecture, runtime, deployment, or historical context is actually needed.
5. State uncertainty when evidence is incomplete.

---

## Repo-Truth Audit Standard

For an audit, verify current files and do not rely on memory.

A credible audit should identify:

- files inspected;
- source-of-truth hierarchy used;
- findings supported by current files;
- outdated, missing, contradictory, or stale references;
- implementation gaps;
- recommended remediation;
- validation or proof needed.

Use the `hb-repo-truth-audit` Skill for repeatable repo-truth audits.

Use `hb-repo-researcher` when the audit spans unfamiliar areas or cross-package ownership.

---

## Package or App Reading Order

If the user names a package or app, start with:

1. package/app directory;
2. package `package.json`;
3. README;
4. public exports;
5. tests and fixtures;
6. local docs and configs;
7. consumers only if exports, public contracts, shared behavior, or cross-package ownership are involved.

---

## Phase / Wave / Prompt Package Reading Order

If the user names a phase, wave, prompt package, or implementation step, start with:

1. active prompt package README;
2. validation matrix;
3. decision register;
4. scope lock;
5. closeout docs;
6. governing architecture docs named by the prompt package;
7. affected package/app files.

Do not read the full planning corpus unless the task is cross-cutting or the active prompt package has an unresolved authority gap.

---

## UI / SPFx Reading Order

For UI or SPFx work, read:

1. touched app/package files;
2. affected component and styling files;
3. `@hbc/ui-kit` exports and related primitives when shared UI is involved;
4. `docs/reference/ui-kit/doctrine/`;
5. `docs/reference/spfx-surfaces/`;
6. task-specific basis-of-design assets;
7. app-specific README or surface benchmark docs.

Use `hb-ui-doctrine-conformance` for repeatable UI doctrine review.

Use `hb-spfx-runtime-parity` for source/build/manifest/runtime/hosted parity.

---

## Backend / Provisioning / Deployment Reading Order

For backend, tenant, deployment, provisioning, Graph/PnP, Procore, CI/CD, app catalog, permissions, secrets, package/version, or hosted proof work:

1. read the touched package/app files;
2. read current closeout docs and runtime boundary docs;
3. read verification guidance;
4. read tenant/deployment guardrails;
5. produce a plan before execution;
6. wait for explicit approval before mutation or live calls.

Use `hb-sensitive-operation-gate` before proceeding.

---

## Claude Configuration Reading Order

For `.claude`, `CLAUDE.md`, Skills, agents, hooks, settings, or Codex/Claude configuration work:

1. `CLAUDE.md`;
2. `.claude/rules.md`;
3. `.claude/rules/README.md`;
4. affected detailed rule files;
5. `.claude/agents/README.md`;
6. affected agent files;
7. `.claude/skills/README.md`;
8. affected Skill files;
9. `.claude/settings*.json`;
10. hooks and supporting scripts.

Use `hb-claude-config-curator` for specialist review.

Use `hb-skill-author` when creating or revising Skills.

---

## Conflict Resolution

When sources disagree:

1. verified current file state controls implementation status;
2. package manifests, exports, tests, and configs control package behavior;
3. current closeouts control completion evidence;
4. active prompt packages control approved execution scope;
5. governing architecture docs control target state;
6. `.claude` rules control agent behavior;
7. historical plans and summaries provide context only.

If a conflict affects architecture, package ownership, runtime behavior, deployment posture, security, permissions, tenant state, or user-approved scope, stop and surface the conflict before implementing.

---

## Evidence Discipline

Do not make completion claims without evidence.

Use precise language:

- “Verified by reading...”
- “Not verified...”
- “Assumption...”
- “Current repo evidence indicates...”
- “This appears stale because...”

Avoid:

- “should be fine”;
- “probably” without stating uncertainty;
- “complete” without validation;
- citing old plans as present truth.
