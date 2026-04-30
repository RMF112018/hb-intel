# HB Intel Claude Code Operating Brief

## Purpose

Work on HB Intel from current repo truth, with surface-aware routing, narrow validation, controlled execution, and strong guardrails for tenant, deployment, SPFx, backend, documentation, and package-boundary risk.

This file is the root brief only. Detailed routing lives under `.claude/`.

---

## Start Here

1. Identify the active scope and repo surface.
2. Read the smallest authoritative source set.
3. Use the relevant Skill for repeatable workflows.
4. Use a specialist agent only when risk or uncertainty justifies it.
5. Execute only the requested or approved scope.
6. Validate before claiming completion.

Do not read the whole repo first.

---

## Configuration Routing

Use:

- `.claude/README.md` for the configuration map.
- `.claude/rules.md` for rule routing.
- `.claude/skills/README.md` for workflow Skills.
- `.claude/agents/README.md` for specialist agents.
- `.claude/hooks/README.md` for deterministic enforcement.

When working in the repo, prefer:

- `pnpm-workspace.yaml`
- nearest `package.json`
- nearest app/package README
- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/developer/verification-commands.md`

The root `README.md` is not currently a useful implementation authority.

---

## Source of Truth

Current repo truth controls.

Default order:

1. live files, manifests, exports, tests, configs, and nearest README in the touched area;
2. workspace/package routing files;
3. canonical current-state documentation;
4. active phase/wave/package decision docs where applicable;
5. ADRs and reference docs;
6. historical plans only when the user explicitly asks for history or the active task requires them.

Do not rely on chat memory when current files are available.

---

## Surface-Aware Work

Before implementing, classify the scope as one or more of:

- app or SPFx surface;
- shared package;
- feature package;
- backend Functions;
- tools/scripts;
- documentation;
- Project Control Center;
- platform primitive adoption;
- sensitive tenant/deployment operation.

Use the matching Skill or agent from `.claude/skills/README.md` or `.claude/agents/README.md`.

---

## Guardrails

Do not perform these unless the user explicitly authorizes them and the governing prompt supports them:

- tenant mutation;
- live Graph/PnP/SharePoint/Procore calls;
- Azure deployment or app settings mutation;
- app catalog deployment;
- `.sppkg` generation or upload;
- CI/CD workflow changes or workflow dispatch;
- package/manifest version changes;
- dependency install/update commands;
- destructive shell or git commands;
- `git push`;
- live endpoint probes with `curl`;
- unrelated cleanup.

Use `hb-sensitive-operation-gate` before sensitive operations.

---

## Plan Gate

Produce a plan and wait for approval before execution when work is prompt-package-driven, phase/wave-driven, cross-cutting, architecture-affecting, SPFx/runtime-sensitive, backend/provisioning/deployment related, tenant/security/permission related, package/version affecting, broad UI doctrine work, or broad documentation authority work.

Execution must stay inside the approved scope.

---

## Validation

Use the smallest meaningful validation set.

Default route:

1. changed-file/local inspection;
2. package-local scripts from nearest `package.json`;
3. affected consumer checks when exports/contracts changed;
4. workspace checks only when justified;
5. browser/E2E only for runtime/UI behavior;
6. hosted/tenant checks only when explicitly authorized.

Use `docs/reference/developer/verification-commands.md` before inventing validation commands.

---

## Completion

Report evidence, not ceremony:

- files inspected;
- files changed;
- validation run and results;
- validation not run and why;
- guardrails preserved;
- residual risk;
- commit summary and description when relevant.

Do not present partial or failed validation as success.
