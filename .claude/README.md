# HB Claude Configuration Index

## Purpose

Active Claude Code configuration for `hb-intel`.

Keep this directory lean. Historical plans, logs, run outputs, generated artifacts, deployment evidence, and archives do not belong in active Claude context.

---

## Active Configuration

| Area | Path | Role |
| --- | --- | --- |
| Root operating brief | `../CLAUDE.md` | Minimal startup guidance. |
| Rule router | `.claude/rules.md` | Top-level rule selection. |
| Detailed rules | `.claude/rules/` | Durable repo rules and surface routers. |
| Skills | `.claude/skills/` | Repeatable workflows. |
| Agents | `.claude/agents/` | Specialist reviewers/investigators. |
| Hooks | `.claude/hooks/` | Deterministic local enforcement. |
| Active plans only | `.claude/plans/` | Short-lived working plans only. |
| Project settings | `.claude/settings.json` | Shared permissions, denies, hooks. |
| Local settings example | `.claude/settings.local.example.json` | Template only. Do not commit `.claude/settings.local.json`. |

---

## Primary Routing

| Work Type | Start With |
| --- | --- |
| Unknown repo area | `hb-workspace-surface-router` |
| Repo-truth audit | `hb-repo-truth-audit` |
| Prompt package | `hb-prompt-package-builder` |
| Agent plan review | `hb-plan-gate-review` |
| Post-execution / commit review | `hb-post-execution-closeout` |
| Validation selection | `hb-verification-router` |
| Tenant / Azure / Graph / PnP / Procore / app catalog / live endpoint | `hb-sensitive-operation-gate` |
| SPFx runtime / manifest / packaging | `hb-spfx-runtime-parity` |
| UI doctrine / `@hbc/ui-kit` / premium surface | `hb-ui-doctrine-conformance` |
| Documentation authority or placement | `hb-doc-classification-gate` then `hb-doc-authority-cleanup` |
| Platform primitive concern | `hb-platform-primitive-adoption-gate` |
| Backend Functions route / health / artifact | `hb-backend-functions-artifact-gate` |
| Project Control Center | `hb-pcc-phase-router` |
| Brand assets / logos / fonts | `hb-brand-asset-governance` |
| Create or update Skills | `hb-skill-author` |

---

## Repo Truth Starting Points

Use these before broad repo search:

```text
pnpm-workspace.yaml
package.json
turbo.json
vitest.workspace.ts
docs/README.md
docs/architecture/blueprint/current-state-map.md
docs/reference/developer/verification-commands.md
docs/reference/developer/documentation-authoring-standard.md
docs/reference/platform-primitives.md
```

SPFx work also routes through:

```text
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
tools/validate-manifests.ts
```

Backend Functions artifact work also routes through:

```text
backend/functions/package.json
scripts/package-functions-artifact.ts
```

PCC work also routes through:

```text
apps/project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/
docs/architecture/plans/MASTER/spfx/pcc/
```

---

## Not Active Context

Do not read during normal work:

```text
.archive/**
.claude/plans/logs/**
node_modules/**
dist/**
build/**
coverage/**
.turbo/**
.vite/**
playwright-report/**
test-results/**
*.log
```

Only inspect archived material when the user explicitly asks for historical reconstruction, legacy comparison, or archive recovery.

---

## Local Settings

`.claude/settings.local.json` is local-only and must remain untracked. Use `.claude/settings.local.example.json` as a template if needed.
