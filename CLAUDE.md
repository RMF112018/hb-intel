# HB Intel Claude Code Operating Brief

## Purpose

Build HB Intel with current repo truth, clean package boundaries, targeted verification, controlled execution, and premium UI quality where UI work is involved.

This file is the root brief only. Do not duplicate detailed indexes, rule bodies, Skill instructions, or agent routing here.

---

## Start Here

1. Identify the active scope.
2. Read the smallest authoritative source set.
3. Use a Skill for repeatable workflows.
4. Use a specialist agent only when risk or uncertainty justifies it.
5. Execute only the requested or approved scope.
6. Verify before claiming completion.

Do not read the whole repo first. Do not search archives, logs, generated outputs, dependency folders, build folders, or old `.claude/plans` material during normal work.

---

## Routing Sources

Use the indexes and routers instead of expanding this file:

| Need | Source |
| --- | --- |
| Claude configuration map | `.claude/README.md` |
| Rule routing | `.claude/rules.md` |
| Detailed rule index | `.claude/rules/README.md` |
| Skill routing | `.claude/skills/README.md` |
| Agent routing | `.claude/agents/README.md` |
| Hook routing | `.claude/hooks/README.md` |
| Validation commands | `docs/reference/developer/verification-commands.md` |
| Documentation standards | `docs/reference/developer/documentation-authoring-standard.md` |

---

## Source of Truth

Current repo truth controls.

Default order:

1. live files, manifests, exports, tests, configs, and nearby README files in the touched area;
2. active prompt package README, decision register, validation matrix, scope lock, and closeout docs for phase/wave work;
3. project-specific governing docs;
4. `.claude/rules.md` and `.claude/rules/**`;
5. `.claude/skills/README.md`, `.claude/agents/README.md`, and `.claude/hooks/README.md`;
6. developer reference docs;
7. broad architecture docs only when local/project truth is insufficient.

Historical plans and old summaries are context only. Old `.claude/plans` material now belongs under `.archive/claude-plans/` and is not normal context.

---

## Mandatory Skill Triggers

Use the relevant Skill when the request matches a known workflow:

| Request | Skill |
| --- | --- |
| repo-truth audit / exhaustive live repo review | `hb-repo-truth-audit` |
| fresh-session prompt / prompt package | `hb-prompt-package-builder` |
| agent plan review / approval check | `hb-plan-gate-review` |
| post-execution report / commit landed / closure summary | `hb-post-execution-closeout` |
| validation selection / test adequacy | `hb-verification-router` |
| tenant, Azure, Graph/PnP, Procore, CI/CD, app catalog, `.sppkg`, live endpoint | `hb-sensitive-operation-gate` |
| SPFx source/build/manifest/runtime/hosted parity | `hb-spfx-runtime-parity` |
| UI doctrine / `@hbc/ui-kit` / basis-of-design / premium UI | `hb-ui-doctrine-conformance` |
| documentation authority / stale docs / source-of-truth cleanup | `hb-doc-authority-cleanup` |
| Project Control Center / PCC | `hb-pcc-phase-router` |
| brand assets / logos / fonts / curated web-ready assets | `hb-brand-asset-governance` |
| create/update Skills | `hb-skill-author` |

If a Skill is unavailable, use the matching rules and agents manually.

---

## Non-Negotiable Guardrails

Do not do any of the following unless the user explicitly authorizes it and the governing prompt supports it:

- mutate SharePoint or any tenant resource;
- call live Graph/PnP;
- call Procore;
- add Procore secrets, mirrors, or write-back behavior;
- introduce direct SPFx-to-Procore calls;
- deploy to app catalog;
- generate or upload `.sppkg` packages;
- edit CI/CD workflows;
- change package versions or SPFx manifests;
- run dependency install/update commands;
- push commits;
- stage unrelated files;
- run destructive git or shell commands;
- run live endpoint probes with `curl`;
- broaden scope into adjacent cleanup.

Use `hb-sensitive-operation-gate` before sensitive operations.

---

## Plan Gate

Produce a plan and wait for approval before execution when work is:

- prompt-package-driven;
- phase/wave-driven;
- cross-cutting;
- architecture-affecting;
- SPFx runtime-sensitive;
- backend/provisioning/deployment related;
- tenant, permission, security, or CI/CD related;
- package/version affecting;
- broad UI doctrine work;
- broad documentation authority work.

Execution must stay inside the approved scope.

---

## Implementation Standard

For implementation work:

1. inspect the touched area;
2. read only relevant authority docs;
3. make the smallest correct change;
4. preserve public contracts unless breakage is explicitly authorized;
5. preserve package and runtime boundaries;
6. preserve error, empty, fallback, and preview states where applicable;
7. update docs only when behavior, exports, boundaries, workflows, or public expectations change;
8. validate the changed scope;
9. report exactly what was verified.

Do not claim completion without proof.

---

## Verification Standard

Use the smallest meaningful validation set:

1. changed-file or local checks;
2. affected package lint/typecheck/tests;
3. affected consumer checks when exports/contracts changed;
4. workspace checks only when cross-cutting, release-critical, or requested;
5. Playwright/end-to-end only when runtime/UI behavior requires it;
6. hosted/tenant validation only when explicitly authorized.

For docs-only work, default validation is:

- `git diff -- <changed docs>`;
- `git status --short`;
- `pnpm format:check` only if expected by repo convention or requested.

Always report verified checks, checks not run, why the set was appropriate, and residual risk.

---

## Completion Reporting

For execution work, report:

- files inspected;
- files modified;
- implementation summary;
- validation commands run;
- validation results;
- validation not run;
- guardrails preserved;
- known gaps or uncertainty;
- commit summary;
- commit description.

Do not present failed or partial validation as success.

---

## Archive and Context Discipline

`.archive/claude-plans/**` is historical material. Do not inspect it during normal work.

Only read archived Claude plans when the user explicitly asks for historical reconstruction, legacy comparison, or archive recovery.

Do not search or read:

- `.archive/claude-plans/**`;
- `.claude/plans/logs/**`;
- logs;
- generated artifacts;
- dependency folders;
- build folders;
- coverage folders;
- old working plans.

---

## Response Standard

Be direct.

- Lead with the answer or decision.
- Separate evidence from recommendation.
- State assumptions and uncertainty.
- Avoid ritualized preambles.
- Avoid repeating indexes.
- Provide copy-ready prompts or instructions when corrective action is needed.

If unsure, check `.claude/README.md`, then `.claude/rules.md`, then the relevant Skill or specialist agent.
