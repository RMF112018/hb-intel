# PCC Phase 3 Wave 15A / Wave B — Shell, Host Fit, and Navigation Remediation

## Objective

Remediate the Project Control Center shared product frame so later Wave 15A surface remediation can build on a credible, host-safe, doctrine-aligned shell. This package covers shell structure, SharePoint host fit, navigation grouping, active/focus states, project context, diagnostics placement, command/search scope, scroll ownership, and baseline validation across all current PCC surfaces.

## Current Repo-Truth Summary

- `apps/project-control-center/README.md` describes the PCC app as a Wave 2-origin preview frame with `PccShell`, `PccNavigationRail`, `PccProjectIntelligenceHeader`, `PccCommandSearch`, `PccSurfaceRouter`, bento layout primitives, preview states, and eight MVP surfaces.
- Current `PccShell` still stamps `data-pcc-shell="wave-2"`, composes rail + header + canvas, and wraps all surface output in `PccBentoGrid`.
- Current navigation is a flat list of `PCC_MVP_SURFACE_IDS`, with per-surface workflow text but no operational group headers.
- Current project identity is a local placeholder (`Project Control Center`, `Project overview`, `Last 12 Months`, `Reference`, `PCC`), not a persistent project context band.
- Current command search is display-only/read-only and prominent in desktop header modes.
- Current shell uses `min-height: 100vh`; hosted SharePoint published/edit-mode viewport behavior remains unproven by this audit.
- Current doctrine requires evidence-backed scoring, hosted/runtime proof where host behavior is material, and no hard-stop failures.

## How to Use This Package

1. Copy this package to:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-B-shell-host-navigation-remediation/
```

2. Execute:

```text
prompts/Prompt_01_Shell_Host_Nav_Scope_Lock_And_File_Map.md
```

3. Do not execute Prompt 02 until Prompt 01 has produced the exact local file map, screenshot plan, command baseline, and stop-condition report.

## Required Local Checks

At minimum, the local agent should run or document why it cannot run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-B-shell-host-navigation-remediation/**/*.md
```

If Markdown globbing fails in the shell, the agent must use a repo-appropriate equivalent and document the exact command.

## First Prompt to Execute

```text
prompts/Prompt_01_Shell_Host_Nav_Scope_Lock_And_File_Map.md
```

Prompt 01 must not make runtime UI changes. It must validate scope, source ownership, exact files to change, existing tests, screenshot requirements, and stop conditions.
