HB Intel repository operating brief for Claude Code.

## Purpose
Build and evolve HB Intel with maintainable, production-grade code while preserving package boundaries, keeping context lean, and raising the quality ceiling of the shared UI system when UI work is involved.

## Primary objective
Optimize for:
- maintainable code
- clear package boundaries
- disciplined documentation
- targeted verification
- minimal prompt bloat
- premium, signature-quality shared UI when the task touches cross-surface UX or `@hbc/ui-kit`

## Start here
Use `docs/reference/developer/agent-authority-map.md` to decide what to read.
Use `docs/reference/developer/verification-commands.md` to choose the smallest meaningful validation set.
Use `docs/reference/developer/documentation-authoring-standard.md` when updating docs.
Use `.claude/agents/hb-repo-researcher.md` for unfamiliar areas, cross-package impact, doc routing, or plan-to-repo alignment.
Do not start by rereading the whole repo.
Read only the smallest authoritative set needed.
Do not reread files already in current context unless they changed, the context is stale, or scope expanded.
For UI-system work, do not assume existing `docs/reference/ui-kit/**` guidance is fully authoritative just because it exists.
Treat live repo truth, current exports, active consumers, and the active UI-system rebuild direction as the primary signals.
Read older UI doctrine selectively and verify it against the code before following it.

## Specialist routing
Use specialists when the task clearly fits:
- `hb-boundary-auditor` for package placement, dependency direction, and ownership questions
- `hb-verification-runner` for smallest-credible validation selection and failure interpretation
- `hb-docs-curator` for documentation impact, routing, and doc drift
- `hb-ui-ux-conformance-reviewer` for shared visual ownership, `@hbc/ui-kit` fit, token/primitive/surface-family placement, doctrine drift, cross-surface UX consistency, and premium experience alignment
- `hb-repo-researcher` for unfamiliar code, cross-package impact, authority routing, and plan alignment
Do not call specialists for trivial local tasks.
When a task spans concerns, prefer the smallest useful specialist first.

## Authority hierarchy
When documents and code disagree, use this order:
1. `docs/architecture/blueprint/current-state-map.md` and verified live repo truth
2. `docs/architecture/blueprint/package-relationship-map.md`
3. `docs/README.md`
4. target-state architecture docs
5. active scoped plans relevant to the task
6. local package/app guidance (`README.md`, local docs, local `CLAUDE.md`)
If legacy UI doctrine conflicts with live `@hbc/ui-kit` code, active migration work, or verified consumer reality, treat the verified repo state as authoritative and update or replace stale doctrine.

## Locked invariants
Protect these unless the user explicitly asks to revisit them or a new ADR supersedes them:
- HB Intel remains a multi-surface platform; PWA and SPFx constraints still matter.
- Package dependency direction must remain architecturally correct.
- Feature packages must not become a web of direct cross-feature dependencies.
- Durable reusable visual UI belongs in `@hbc/ui-kit` or an explicitly approved successor shared UI boundary during migration.
- Shared behavior spanning feature areas belongs in shared/platform packages, not copied across features.
- Shared UI should move toward token-first foundations, clear primitive families, and deliberate surface families.
- Preserve compatibility through adapters, wrappers, or export shims when evolving shared UI unless the task explicitly calls for a breaking rebuild.
- Durable architectural reversals require deliberate documentation, usually via ADR.

## Working rules
- Prefer the smallest correct change unless the task is explicitly a rebuild or structural correction.
- Keep code strongly typed, readable, and easy to test.
- Preserve or improve separation of concerns.
- Reuse healthy patterns; replace weak ones when they limit maintainability or product quality.
- Do not add packages or dependencies without checking the package relationship map first.
- Do not create new reusable visual primitives casually inside feature packages or apps.
- For UI-system work, do not preserve legacy wrapper patterns just because they compile.
- Do not infer architecture from old plans alone; inspect repo truth.
- Do not duplicate large policy text when a canonical source already exists.

## UI-system posture
When the task touches `@hbc/ui-kit`, shared tokens, shared primitives, or broad UI doctrine:
- Think in layers: foundations → primitives → surface families → consumers.
- Treat premium authored quality as a first-class requirement, not a homepage-only exception.
- Distinguish reusable primitives from feature-specific compositions.
- Distinguish shared cross-surface UI from route-specific or webpart-specific authored assemblies.
- Preserve compatibility through adapters or staged migration when needed.
- Flag stale or over-restrictive UI doctrine instead of silently working around it.
- Use `hb-ui-ux-conformance-reviewer` when ownership, reuse, premium direction, or doctrine drift is materially in play.

## Execution, verification, and docs
For implementation work: inspect the touched area, read only relevant authority docs, make the change, verify the changed scope, and update docs when behavior, exports, boundaries, workflows, or shared UI expectations change.
Use the smallest meaningful verification set first: 1) changed-file or package-local checks, 2) affected-package lint, typecheck, and tests, 3) broader workspace validation only when cross-cutting, release-critical, or requested.
For shared UI work, verify the changed layer: foundations/tokens, primitives, affected consumer surfaces, and adapters when present.
Do not claim completion without saying what was actually verified.
Follow `docs/README.md`, `current-state-map.md`, and `docs/reference/developer/documentation-authoring-standard.md`.
When UI doctrine is stale, contradictory, or structurally limiting, replace or consolidate it instead of layering more patch guidance on top.

## Response style
Be direct and efficient. Avoid ritualized preambles. Reference governing sources only when they materially affect the decision. Keep answers focused on the task.

## When unsure
Use `docs/reference/developer/agent-authority-map.md` first.
Use `.claude/agents/hb-repo-researcher.md` when uncertainty crosses code, ownership, architecture, or documentation boundaries.
Use `hb-ui-ux-conformance-reviewer` when the uncertainty is specifically about shared visual ownership, cross-surface consistency, premium experience direction, or whether legacy UI doctrine should still govern.
