# HB Intel Claude Code Skills

## Purpose

This directory contains project Skills for the `hb-intel` repository.

Use Skills for repeatable workflows that should not permanently bloat `CLAUDE.md`, `.claude/rules.md`, or specialist-agent bodies.

## Operating Model

- **Rules** define standing doctrine, guardrails, and source-of-truth routing.
- **Agents** perform specialist review, investigation, or focused validation.
- **Skills** package repeatable workflows and slash-command playbooks.
- **Hooks** enforce deterministic behavior outside model judgment.
- **Settings** control permissions, command posture, and safety boundaries.

## Included Skills

| Skill | Purpose | Primary Use |
| --- | --- | --- |
| `hb-repo-truth-audit` | Repo-truth audit playbook | Exhaustive audits, source-of-truth review, plan-to-repo alignment |
| `hb-prompt-package-builder` | Prompt package generation | Fresh-session prompts, agent prompts, phase/wave prompt packages |
| `hb-plan-gate-review` | Pre-execution plan review | Review agent plans before approval |
| `hb-post-execution-closeout` | Completion/commit audit | Review closure summaries, diffs, validation claims |
| `hb-verification-router` | Validation selection | Pick smallest credible check set |
| `hb-sensitive-operation-gate` | Sensitive operation gate | Tenant, Azure, Graph/PnP, Procore, app catalog, CI/CD, live endpoint work |
| `hb-spfx-runtime-parity` | SPFx parity review | Source/build/manifest/runtime/hosted parity |
| `hb-ui-doctrine-conformance` | UI doctrine review | `@hbc/ui-kit`, SPFx/PWA UI quality, accessibility, basis-of-design fit |
| `hb-doc-authority-cleanup` | Documentation authority cleanup | README, doctrine, roadmap, closeout, prompt-package documentation |
| `hb-pcc-phase-router` | PCC work routing | Project Control Center phase/wave guardrails and source routing |
| `hb-brand-asset-governance` | Brand asset governance | Logo, font, curated web-ready asset placement and usage |
| `hb-skill-author` | Skill authoring | Create or revise additional Skills |