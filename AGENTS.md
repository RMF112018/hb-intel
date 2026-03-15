HB Intel repository operating brief for Claude Code.

## Purpose

Build and evolve HB Intel with maintainable, production-grade code while preserving the repository's architectural invariants and keeping agent context usage lean.

## Primary objective

Optimize for:
- maintainable code,
- clear package boundaries,
- disciplined documentation,
- targeted verification,
- minimal prompt bloat.

## Start here

Use `docs/reference/developer/agent-authority-map.md` to decide which repository documents to read for the task at hand.
Use `docs/reference/developer/verification-commands.md` to choose the smallest meaningful validation set.
Use `docs/reference/developer/documentation-authoring-standard.md` when creating or updating documentation.
Use `.claude/agents/hb-repo-researcher.md` for unfamiliar areas, cross-package impact analysis, architecture/doc routing questions, or plan-to-repo alignment checks before implementation.

Do not start every task by rereading the entire documentation set.
Read only the smallest authoritative set needed for the change.
Do not reread files that are already in current session context unless the file changed, the context is stale, or the task scope expanded.

## Specialist routing

Use specialist agents automatically when the task clearly fits their scope:

- `hb-boundary-auditor` for package placement, dependency direction, ownership, layer fit, shared-vs-local placement, and architecture guardrail questions.
- `hb-verification-runner` for choosing or running the smallest credible validation set, interpreting failures, and separating likely regressions from pre-existing issues.
- `hb-docs-curator` for documentation impact, documentation routing, doc drift, and deciding whether a change warrants local README, developer reference, explanation, or architecture doc updates.
- `hb-ui-ux-conformance-reviewer` for reusable UI ownership, `@hbc/ui-kit` fit, cross-surface UX consistency, and mold-breaker experience alignment.
- `hb-repo-researcher` for unfamiliar code areas, cross-package impact analysis, authority/doc routing, and plan-to-repo alignment before implementation.

Do not call a specialist when the task is trivial and local enough for the root agent to handle directly.
When a task spans multiple concerns, prefer the smallest useful specialist first instead of calling several by default.

## Authority hierarchy

When documents or code signals disagree, use this order:

1. **Current repository truth**
   - `docs/architecture/blueprint/current-state-map.md`
   - live code, package manifests, exports, tests, and configs
2. **Package and dependency authority**
   - `docs/architecture/blueprint/package-relationship-map.md`
3. **Repository documentation navigation**
   - `docs/README.md`
4. **Target-state architecture**
   - `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`
5. **Program narrative and operating doctrine**
   - `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md`
6. **Active scoped plans**
   - the specific phase, wave, feature, or task plan relevant to the work
7. **Local package and app guidance**
   - package `README.md`, local docs, and local `CLAUDE.md` files when present

If a historical plan conflicts with current-state truth or live code, treat `current-state-map.md` and the verified repo state as authoritative for what exists now.

## Locked invariants

Protect these unless the user explicitly asks to revisit them or a new ADR intentionally supersedes them:

- HB Intel is a multi-surface platform with PWA and SPFx doctrine still relevant to planning and implementation.
- Package dependency direction must remain architecturally correct.
- Feature packages must not become a web of direct cross-feature dependencies.
- Reusable visual UI belongs in `@hbc/ui-kit`.
- Shared behavior that spans feature areas belongs in the appropriate shared or platform package, not by copying logic across features.
- Durable architectural reversals require deliberate documentation, usually via ADR.

These invariants are guardrails, not a ban on proposing better implementation approaches.
When a better path exists that does not violate the guardrails, prefer the better path and explain why.

## Working rules

- Prefer the smallest correct change over broad speculative refactors.
- Keep code strongly typed, readable, and easy to test.
- Preserve or improve separation of concerns.
- Reuse existing patterns when they are healthy; improve them when they are clearly limiting maintainability.
- Do not introduce new packages or dependencies without checking the package relationship map first.
- Do not create reusable visual components outside `@hbc/ui-kit`.
- Do not infer architecture from old plans alone; inspect the repo state.
- Do not duplicate large policy text into new files when a canonical source already exists.

## Execution expectations

For implementation work:
- inspect the touched area first,
- read only the relevant authority docs,
- make the change,
- verify the changed scope using `docs/reference/developer/verification-commands.md`,
- update documentation when the change affects public behavior, architecture, workflows, exports, or developer expectations.

For multi-step or cross-cutting work:
- provide a concise plan,
- state material assumptions,
- call out risks or boundary concerns,
- propose a better path when one is warranted.

Exploratory and working plans belong inline in chat by default.
When a plan file is useful but not intended as canonical repository documentation, keep it under `.claude/plans/`.
Do not write exploratory, draft, or working plans into `docs/architecture/plans/**` unless the user explicitly requests creation or update of a canonical plan document there.

## Verification expectations

Use the smallest meaningful verification set first.
Follow `docs/reference/developer/verification-commands.md` for command selection and reporting.
Typical order:
1. changed-file or package-local checks,
2. affected-package lint, typecheck, and tests,
3. broader workspace validation only when the change is cross-cutting, release-critical, or requested.

Do not claim completion without reporting what was actually verified.

## Documentation expectations

Follow `docs/README.md`, the document classification guidance in `current-state-map.md`, and `docs/reference/developer/documentation-authoring-standard.md`.

Update documentation when work changes:
- public APIs or exports,
- package responsibilities or boundaries,
- developer workflow,
- architecture or governance,
- user-visible behavior that existing docs describe.

Default documentation targets:
- package or app `README.md` for local implementation guidance,
- `docs/how-to/developer/` for procedural guidance,
- `docs/reference/` for factual reference material,
- `docs/explanation/` for rationale and conceptual material,
- ADRs only for durable architectural decisions or reversals.

`docs/architecture/plans/**` is the canonical development plan library.
Agent working artifacts under `.claude/plans/` are not canonical documentation unless the user explicitly promotes them into the docs library.

Documentation should be concise, accurate, and maintained near the code or canonical doc location it describes.

## Response style

Be direct and efficient.
Do not front-load large quotations or long ritualized preambles.
Reference the governing source when it materially affects the decision.
Keep answers focused on the current task.

## When unsure

Use `docs/reference/developer/agent-authority-map.md` to route to the right source.
Use `.claude/agents/hb-repo-researcher.md` when the task crosses unfamiliar code, ownership, architecture, or documentation boundaries.
If the answer is still unclear, inspect the affected code and the nearest package documentation before escalating to broader architecture docs.
