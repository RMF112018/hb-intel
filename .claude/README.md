# HB Claude Configuration Index

## Purpose

This directory contains the project-level Claude Code operating configuration for the `hb-intel` repository.

Use this index to decide whether a task should route through rules, Skills, agents, hooks, settings, or working plans.

---

## Configuration Map

| Package | Path | Primary Purpose | Use When |
| --- | --- | --- | --- |
| Rules router | `.claude/rules.md` | Top-level rule index and source-of-truth routing. | A task needs repo operating policy, source routing, scope guardrails, validation rules, or project-specific rules. |
| Detailed rules | `.claude/rules/` | Modular durable rules. | A task needs detailed guidance on authority, architecture, package boundaries, docs, implementation quality, planning, execution gates, context efficiency, or Skills/agents routing. |
| Agents | `.claude/agents/` | Specialist reviewer/investigator subagents. | A task needs focused review for security, tenant/deployment, SPFx parity, package boundaries, docs, UI/UX, verification, repo research, commit diff, or Claude config. |
| Skills | `.claude/skills/` | Reusable workflow playbooks. | A task repeats a known workflow such as repo-truth audit, prompt package generation, plan review, post-execution closeout, verification routing, sensitive-operation gating, SPFx parity, UI doctrine review, PCC routing, brand governance, or Skill authoring. |
| Hooks | `.claude/hooks/` | Deterministic local enforcement scripts. | A constraint should be enforced outside model judgment, especially preventing accidental writes to protected paths. |
| Working plans | `.claude/plans/` | Claude-generated draft/temporary planning artifacts. | A plan is useful but not ready to promote into canonical `docs/**` or `docs/architecture/plans/**`. |
| Settings | `.claude/settings*.json` | Local/project tool permission and hook configuration. | Tool allow/ask/deny posture, hook registration, and local Claude Code behavior need control. |

---

## Routing Decision Matrix

| User Request / Situation | Start With | Then Use |
| --- | --- | --- |
| "Audit the live repo" / "repo-truth audit" | `.claude/skills/hb-repo-truth-audit/SKILL.md` | `hb-repo-researcher`; `.claude/rules/01-authority-and-reading-order.md` |
| "Generate a prompt package" | `.claude/skills/hb-prompt-package-builder/SKILL.md` | `.claude/rules/06-planning-and-proposals.md`; `.claude/rules/07-plan-review-and-execution-gates.md` |
| "Agent's plan" / "Does this plan align?" | `.claude/skills/hb-plan-gate-review/SKILL.md` | `hb-implementation-plan-reviewer` |
| "Following execution" / "Commit landed" / "Closure summary" | `.claude/skills/hb-post-execution-closeout/SKILL.md` | `hb-commit-diff-auditor` |
| "What validation should run?" | `.claude/skills/hb-verification-router/SKILL.md` | `hb-verification-runner`; `docs/reference/developer/verification-commands.md` |
| Tenant, Azure, Graph/PnP, Procore, CI/CD, app catalog, `.sppkg`, live `curl` | `.claude/skills/hb-sensitive-operation-gate/SKILL.md` | `hb-security-and-secrets-auditor`; `hb-tenant-deployment-gatekeeper` |
| SPFx source/build/manifest/runtime/hosted proof | `.claude/skills/hb-spfx-runtime-parity/SKILL.md` | `hb-spfx-runtime-parity-auditor` |
| UI doctrine, `@hbc/ui-kit`, SPFx/PWA UI quality | `.claude/skills/hb-ui-doctrine-conformance/SKILL.md` | `hb-ui-ux-conformance-reviewer` |
| Documentation authority, README, roadmap, closeout, stale links | `.claude/skills/hb-doc-authority-cleanup/SKILL.md` | `hb-docs-curator`; `.claude/rules/04-documentation-standards.md` |
| Project Control Center / PCC | `.claude/skills/hb-pcc-phase-router/SKILL.md` | `.claude/rules/projects/pcc-phase-3.md` |
| Brand files, fonts, logos, curated web assets | `.claude/skills/hb-brand-asset-governance/SKILL.md` | UI doctrine and brand docs under `docs/reference/brand/` |
| Create/update Claude Code Skills | `.claude/skills/hb-skill-author/SKILL.md` | `hb-claude-config-curator` |
| Update `.claude` config itself | `hb-claude-config-curator` | `.claude/rules/09-skills-and-agents-routing.md` |

---

## Package Indexes

Use the package-specific indexes for detailed routing:

- `.claude/agents/README.md`
- `.claude/hooks/README.md`
- `.claude/skills/README.md`
- `.claude/rules/README.md`

---

## Operating Split

| Layer | Owns | Does Not Own |
| --- | --- | --- |
| `CLAUDE.md` | Root operating brief and high-level posture. | Detailed process bodies or package-specific routing tables. |
| `.claude/rules.md` | Concise rule router and top-level guardrails. | Long reusable workflow instructions. |
| `.claude/rules/**` | Durable doctrine and guardrails. | Specialist persona behavior or repeatable workflow templates. |
| `.claude/skills/**` | Reusable workflows and playbooks. | Standing policy or broad repo doctrine. |
| `.claude/agents/**` | Focused specialist review/investigation. | General workflow orchestration or user-facing final synthesis. |
| `.claude/hooks/**` | Deterministic enforcement. | Model judgment, repo research, or contextual reasoning. |
| `.claude/plans/**` | Working/draft planning artifacts. | Canonical architecture docs unless explicitly promoted. |

---

## High-Risk Routing

Use the highest-risk applicable route first:

1. Security/secrets/token/app-setting risk → `hb-security-and-secrets-auditor`
2. Tenant/deployment/permission/CI/CD risk → `hb-tenant-deployment-gatekeeper`
3. SPFx source/build/manifest/runtime risk → `hb-spfx-runtime-parity-auditor`
4. Package ownership/dependency risk → `hb-boundary-auditor`
5. Plan approval or execution scope risk → `hb-implementation-plan-reviewer`
6. Validation uncertainty → `hb-verification-runner`
7. Documentation authority risk → `hb-docs-curator`
8. UI doctrine/product-quality risk → `hb-ui-ux-conformance-reviewer`
9. Claude config consistency → `hb-claude-config-curator`
10. Unknown repo area → `hb-repo-researcher`

---

## Maintenance Rules

- Keep each package indexed.
- Keep package indexes routing-focused.
- Do not duplicate long instructions across rules, Skills, and agents.
- If a Skill routes to an agent, keep the Skill as the workflow owner and the agent as the specialist reviewer.
- If a rule path changes, update `.claude/rules.md`, `.claude/rules/README.md`, and any affected Skill/agent references.
- If a hook is added, document its event, matcher, purpose, command, and override path in `.claude/hooks/README.md`.
- If a sensitive command is allowed locally, verify `.claude/rules/07-plan-review-and-execution-gates.md` still gates actual execution.
