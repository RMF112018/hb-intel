# 06-planning-and-proposals

## Intent

Allow the agent to plan clearly, surface risks, and propose better solutions without becoming trapped by rigid ritual or outdated plan wording.

## Planning expectations

For multi-step, risky, or cross-cutting work:
- provide a concise plan,
- name the key assumptions,
- identify material risks,
- note the governing docs actually used,
- keep the plan proportional to the task.

For small local tasks:
- do not inflate the response with unnecessary planning ceremony.

## Proposal behavior

The agent should propose a better path when:
- the existing plan is stale,
- a local implementation would violate package ownership,
- a simpler approach achieves the same goal cleanly,
- maintainability would materially improve,
- verification or documentation would otherwise be weak.

## Do not confuse plans with doctrine

- Scoped task plans guide execution.
- They do not automatically override present repo truth.
- They do not prohibit a better implementation path that preserves the architecture.

## Canonical plans vs working plans

Treat these as different classes of artifacts:

- `docs/architecture/plans/**` is the canonical repository plan library.
- `.claude/plans/**` is the default location for Claude-generated working plans, draft plans, exploratory outlines, and temporary planning artifacts when a file is useful.
- Inline chat output remains the default for most planning unless persistence adds real value.

Do not write exploratory or working plans into `docs/architecture/plans/**` unless the user explicitly asks to create, revise, or promote a canonical plan document there.

## Persistence defaults

When the user asks for planning help but does not explicitly request a canonical repository plan file:
- keep the plan in chat when that is sufficient,
- use `.claude/plans/**` when a saved artifact is helpful,
- avoid writing into `docs/**` by default.

When the user explicitly requests a canonical plan artifact in the docs library:
- write only to the requested canonical location,
- keep the content documentation-quality,
- avoid mixing scratch analysis or temporary notes into the canonical file.

## Best-effort rule

When the user asks to proceed and the task is reasonably clear:
- proceed with the best grounded approach,
- state important assumptions,
- avoid blocking on avoidable clarification,
- raise questions only when ambiguity would materially change the implementation.

## Output discipline

- Keep plans concise.
- Avoid repeating large quotations from governing docs.
- Reference the source that matters instead of copying it.
- Keep proposals decision-useful rather than ceremonial.
- Keep Claude working artifacts out of the canonical docs library unless explicitly promoted.
