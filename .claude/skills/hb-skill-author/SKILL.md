---
name: hb-skill-author
description: Create or revise HB Intel Claude Code Skills with focused names, clear descriptions, supported frontmatter, progressive disclosure, safety boundaries, and non-overlapping workflow ownership.
when_to_use: Use when the user asks to create a Skill, update Skills, convert a rule or prompt into a Skill, audit Skills, package Skills, or improve Claude Code workflow configuration.
argument-hint: "[skill objective or existing skill path]"
---

# HB Skill Author

Create or revise a Skill for:

```text
$ARGUMENTS
```

## Objective

Produce focused, maintainable Claude Code Skills that reduce repeated prompting without duplicating `CLAUDE.md`, `.claude/rules.md`, or specialist agents.

## Skill Design Rules

1. One Skill = one repeatable workflow.
2. Use lowercase hyphenated names.
3. Keep names short and specific.
4. Keep `description` clear enough for automatic invocation.
5. Use `when_to_use` for trigger phrases and edge cases.
6. Use `argument-hint` when the Skill is likely to be invoked manually.
7. Use `disable-model-invocation: true` for user-triggered or side-effect-prone workflows.
8. Use `context: fork` and `agent:` when the Skill should run in a focused subagent.
9. Use `allowed-tools` to restrict read-only or sensitive workflows.
10. Keep `SKILL.md` concise; move templates, examples, reference details, and scripts into supporting files.

## Required Structure

```text
.claude/skills/<skill-name>/
  SKILL.md
  templates/
  reference/
  examples/
  scripts/
```

Only include supporting directories that add value.

## Frontmatter Template

Use `templates/skill-template.md` as the starting point.

## Overlap Check

Before creating a new Skill, check whether the workflow belongs in:

- `CLAUDE.md` — standing high-level operating brief;
- `.claude/rules.md` — rule index and source routing;
- `.claude/rules/**` — durable guardrail;
- `.claude/agents/**` — specialist reviewer/investigator;
- `.claude/skills/**` — repeatable workflow or slash-command playbook;
- `.claude/hooks/**` — deterministic enforcement.

## Output Format

## Proposed Skill

- name:
- path:
- purpose:
- invocation model:
- supporting files:

## Files to Create / Modify

- <path>

## Skill Content

Provide complete file contents unless the user asked for a summary only.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

