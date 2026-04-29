---
name: hb-doc-authority-cleanup
description: Review and clean up HB Intel documentation authority, routing, drift, redundancy, stale guidance, README structure, governance maps, prompt packages, closeouts, and source-of-truth hierarchy.
when_to_use: Use for README updates, doctrine indexes, governance maps, architecture docs, roadmaps, closeouts, prompt-package docs, source-of-truth cleanup, stale references, or documentation authority conflicts.
argument-hint: "[doc area, path, or authority issue]"
context: fork
agent: hb-docs-curator
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*)
---

# HB Documentation Authority Cleanup

Review documentation authority for:

```text
$ARGUMENTS
```

## Objective

Ensure documentation is useful, current, non-duplicative, and properly routed through the correct source-of-truth hierarchy.

## Authority Rules

Preserve these distinctions:

- **Blueprint** = architecture doctrine and product boundaries.
- **Roadmap** = sequencing, phase/wave status, execution plan, and acceptance criteria.
- **README** = navigation, source-of-truth hierarchy, and orientation.
- **Contract** = implementable structure, permissions, settings, validation, and MVP boundaries when named as the implementation source of truth.
- **Prompt package README** = scoped execution guidance only.
- **Closeout** = historical proof and completion evidence.

## Required Checks

1. Identify the current authority chain.
2. Detect stale path references.
3. Detect duplicate or conflicting instructions.
4. Preserve historical closeouts as historical evidence, not current doctrine.
5. Avoid moving scratch plans into canonical docs unless explicitly promoted.
6. Update navigation docs if files are moved or superseded.
7. Keep canonical docs concise and route to detailed supporting docs.

## Output Format

## Documentation Verdict

Use one:

- **Clean**
- **Needs Minor Cleanup**
- **Authority Drift**
- **Broken Source Routing**

## Findings

- <path, issue, recommended correction>

## Recommended File Changes

- <file> — <change>

## Copy-Ready Patch Prompt

Provide a follow-up prompt if implementation is needed.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

