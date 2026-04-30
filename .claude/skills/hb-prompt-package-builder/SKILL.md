---
name: hb-prompt-package-builder
description: Build HB Intel prompt packages and fresh-session prompts with repo-truth requirements, file targets, guardrails, validation gates, and closeout requirements.
when_to_use: Use for fresh ChatGPT session prompts, Claude Code prompts, Cursor prompts, remediation packages, downloadable markdown prompt files, or phase/wave prompt packages.
argument-hint: "[objective or package name]"
---

# HB Prompt Package Builder

Build a prompt package for:

```text
$ARGUMENTS
```

## Requirements

Each prompt must include:

1. Objective.
2. Repo-truth requirement.
3. Required files / starting sources.
4. Direction not to re-read files still in active context unless changed, line-level proof is needed, or scope expanded.
5. Allowed scope.
6. Forbidden scope.
7. Implementation instructions.
8. Validation requirements.
9. Closeout requirements.

## Repo-Specific Additions

When applicable, include:

- workspace surface routing;
- documentation classification;
- platform primitive assessment;
- SPFx runtime/manifest posture;
- backend artifact gate;
- PCC wave/source routing.

## Output Style

Direct, forceful, scoped, copy-ready, and non-deferable.
