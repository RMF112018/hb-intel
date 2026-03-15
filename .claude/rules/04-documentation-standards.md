# 04-documentation-standards

## Intent

Restore and preserve high-quality documentation without forcing the root `CLAUDE.md` to carry the full docs policy.

## Core standard

Documentation is part of the deliverable when the work changes behavior, architecture, public exports, workflows, or expectations for future developers.
Use `docs/reference/developer/documentation-authoring-standard.md` as the detailed writing and placement standard.

## Use the right document type

Use `docs/README.md` and the classification guidance in `current-state-map.md` to place docs correctly.

Default targets:
- package or app `README.md` for local ownership, public exports, commands, and implementation notes,
- `docs/how-to/` for procedural guidance,
- `docs/reference/` for factual or command reference,
- `docs/explanation/` for rationale or conceptual material,
- ADRs for durable architecture decisions.

## Canonical docs vs agent artifacts

Treat these as different classes of content:
- `docs/**` contains repository documentation and approved canonical artifacts,
- `docs/architecture/plans/**` is the canonical development plan library,
- `.claude/plans/**` contains Claude-generated working plans and temporary planning artifacts by default.

Agent artifacts are not repository documentation unless the user explicitly asks to promote or rewrite them into a canonical docs location.

## Quality bar

Documentation should be:
- accurate,
- current,
- concise,
- specific to the changed scope,
- written for the intended audience,
- linked to canonical sources instead of duplicating them.

## Package README minimums

When a mature package changes materially, keep its `README.md` current with:
- purpose,
- public exports,
- dependencies,
- consumers when relevant,
- key commands,
- local implementation notes,
- related docs or ADRs when useful.

## When docs updates are required

Update docs when work changes:
- public APIs or exports,
- package responsibility,
- dependency or ownership boundaries,
- developer workflow,
- architecture decisions,
- user-visible behavior already described in docs,
- required verification steps or command routing.

## When docs updates are not required

A docs update is usually not required for:
- purely internal refactors with no behavior or workflow impact,
- trivial rename-only changes already covered by existing docs,
- local implementation detail that stays fully obvious from code and tests,
- creation or revision of Claude working plans under `.claude/plans/**` unless the user wants them promoted into canonical docs.

## Writing guidance

- Prefer crisp, plain language.
- Avoid repeating large blocks of architecture prose from other canonical docs.
- Link or reference the canonical doc instead.
- Keep examples runnable and commands accurate.
- Update the nearest canonical doc rather than scattering the same guidance across multiple files.
- When verification guidance changes, update `docs/reference/developer/verification-commands.md` if the change affects general developer workflow.
