---
name: hb-skill-author
description: Create or update HB Intel Claude Skills using concise workflow-focused SKILL.md files and supporting templates only when needed.
when_to_use: Use when creating, revising, consolidating, or auditing Skills.
argument-hint: "[skill objective]"
---

# HB Skill Author

Create or update a Skill for:

```text
$ARGUMENTS
```

## Standards

- Put each Skill at `.claude/skills/<skill-name>/SKILL.md`.
- Keep the Skill workflow-focused.
- Do not duplicate rule bodies.
- Use supporting templates only when the prompt body would become too long.
- Do not use Skills to bypass permissions, approval, or repo-truth verification.

## Output

- Skill name
- Trigger description
- Workflow
- Supporting files, if any
- Index updates
