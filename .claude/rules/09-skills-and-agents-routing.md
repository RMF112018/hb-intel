# 09 — Skills and Agents Routing

## Purpose

Define when Claude Code should use a Skill, a specialist agent, a detailed rule file, or direct work.

---

## Primary Rule

Use the smallest effective routing layer.

- Rules define standing doctrine and guardrails.
- Skills define repeatable workflows.
- Agents provide specialist review or investigation.
- Direct work is acceptable for simple, local, low-risk tasks.

---

## Routing Model

| Need | Use |
|---|---|
| Standing policy or source-of-truth hierarchy | `.claude/rules.md` and `.claude/rules/**` |
| Repeatable workflow or playbook | `.claude/skills/<skill>/SKILL.md` |
| Specialist reviewer/investigator | `.claude/agents/*.md` |
| Simple local answer/edit | Direct work using current context |
| Deterministic enforcement | `.claude/hooks/**` |
| Tool permissions | `.claude/settings*.json` |

---

## Skill Routing

Use Skills for recurring workflows such as:

- `hb-repo-truth-audit` — live/current repo-truth audits.
- `hb-prompt-package-builder` — prompt package generation.
- `hb-plan-gate-review` — pre-execution plan review.
- `hb-post-execution-closeout` — post-execution/commit/report audit.
- `hb-verification-router` — validation command selection and reporting standard.
- `hb-sensitive-operation-gate` — sensitive tenant/deployment/security operation review.
- `hb-spfx-runtime-parity` — SPFx source/build/manifest/runtime/hosted parity workflow.
- `hb-ui-doctrine-conformance` — UI doctrine, basis-of-design, `@hbc/ui-kit`, SPFx/PWA conformance.
- `hb-doc-authority-cleanup` — documentation routing, drift, and source-of-truth cleanup.
- `hb-pcc-phase-router` — Project Control Center phase/wave/source routing.
- `hb-brand-asset-governance` — brand package, logos, fonts, curated assets.
- `hb-skill-author` — create or update Skills.
- `hb-claude-config-curator` agent — specialist review for Claude config consistency.

Skills should not duplicate all rule text. They should point to the governing rules and perform the repeatable procedure.

---

## Agent Routing

Use agents when a specialist perspective reduces risk.

Use:

- `hb-security-and-secrets-auditor` for secrets, tokens, auth proof, app settings, redaction, sensitive artifacts.
- `hb-tenant-deployment-gatekeeper` for tenant mutation, Azure, app catalog, Graph/PnP, CI/CD, permissions, rollout.
- `hb-spfx-runtime-parity-auditor` for SPFx source/build/manifest/runtime/hosted parity.
- `hb-boundary-auditor` for package ownership, dependency direction, exports, shared placement.
- `hb-implementation-plan-reviewer` for plan or execution report review.
- `hb-verification-runner` for validation scope and command choice.
- `hb-docs-curator` for documentation authority and placement.
- `hb-ui-ux-conformance-reviewer` for UI doctrine and product quality.
- `hb-commit-diff-auditor` for post-execution diff and commit accuracy.
- `hb-repo-researcher` for unfamiliar repo areas and broad current-state research.
- `hb-claude-config-curator` for Claude Code configuration alignment.

---

## Escalation Priority

When multiple agents apply, use the highest-risk relevant agent first:

1. `hb-security-and-secrets-auditor`
2. `hb-tenant-deployment-gatekeeper`
3. `hb-spfx-runtime-parity-auditor`
4. `hb-boundary-auditor`
5. `hb-implementation-plan-reviewer`
6. `hb-verification-runner`
7. `hb-docs-curator`
8. `hb-ui-ux-conformance-reviewer`
9. `hb-commit-diff-auditor`
10. `hb-claude-config-curator`
11. `hb-repo-researcher`

If the area is unfamiliar, `hb-repo-researcher` may be used first to establish repo truth before escalating.

---

## When Direct Work Is Enough

Do direct work without invoking Skills or agents when:

- the task is simple;
- the touched area is local and obvious;
- no sensitive operations are involved;
- no package/architecture boundary is affected;
- no reusable workflow is needed;
- no specialist review would add value.

Examples:

- correcting a typo in a known doc;
- answering a question from a file already in active context;
- making a narrow local code fix with clear tests;
- summarizing a provided file.

---

## When Not to Use Skills

Do not use a Skill as ceremony.

Do not use Skills to bypass:

- user approval;
- plan gates;
- permission prompts;
- security/tenant restrictions;
- repo-truth verification;
- current file evidence.

Do not convert every rule or agent into a Skill. Skills should remain workflow-oriented.

---

## When Not to Use Agents

Do not use agents:

- for trivial local edits;
- to avoid reading a directly relevant file;
- as a substitute for user approval;
- as a substitute for validation;
- when the answer is already clear from current repo truth.

---

## Skill and Agent Interaction

A Skill may route to an agent when the workflow requires specialist judgment.

Examples:

- `hb-plan-gate-review` may route to `hb-implementation-plan-reviewer`.
- `hb-sensitive-operation-gate` may route to `hb-security-and-secrets-auditor` or `hb-tenant-deployment-gatekeeper`.
- `hb-spfx-runtime-parity` may route to `hb-spfx-runtime-parity-auditor`.
- `hb-doc-authority-cleanup` may route to `hb-docs-curator`.
- `hb-ui-doctrine-conformance` may route to `hb-ui-ux-conformance-reviewer`.

The root agent remains responsible for final synthesis, user-facing recommendations, and honoring user instructions.

---

## Claude Configuration Changes

When changing `.claude` files or `CLAUDE.md`:

1. inspect current `CLAUDE.md`;
2. inspect `.claude/rules.md`;
3. inspect affected rule/agent/Skill files;
4. avoid duplication across layers;
5. preserve current repo-truth routing;
6. keep high-risk operations gated;
7. update README/index files;
8. report exactly what changed.

Use `hb-claude-config-curator` for specialist review.
