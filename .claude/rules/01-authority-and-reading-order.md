# 01-authority-and-reading-order

## Intent

Help the agent find the right authoritative source quickly without rereading the entire repository doctrine for every task.

## First routing tools

Start with:
- `docs/reference/developer/agent-authority-map.md` for source routing,
- `docs/reference/developer/verification-commands.md` for validation routing,
- `docs/reference/developer/documentation-authoring-standard.md` for documentation quality and placement,
- `.claude/agents/hb-repo-researcher.md` when the area is unfamiliar or the work is cross-package.

## Specialist routing map

Use the smallest specialist that clearly fits the task:
- `.claude/agents/hb-boundary-auditor.md` for package placement, dependency legality, export ownership, shared-primitive placement, and cross-package coupling questions.
- `.claude/agents/hb-verification-runner.md` for choosing the right validation scope, running targeted checks, and separating new failures from likely pre-existing failures.
- `.claude/agents/hb-docs-curator.md` for documentation impact, doc placement, documentation conflicts, and deciding whether a change needs updates to package README, developer reference, explanation, or architecture docs.
- `.claude/agents/hb-ui-ux-conformance-reviewer.md` for reusable UI ownership, `@hbc/ui-kit` alignment, cross-surface consistency, and fit with HB Intel UX direction.
- `.claude/agents/hb-repo-researcher.md` for unfamiliar areas, cross-package investigation, or when the right source set is not yet clear.

Do not invoke a specialist when the answer is obvious from the current file or current local package context.
Use specialists automatically when the task clearly fits one of the roles above.
When multiple specialists could apply, prefer the most specific one first.

## Reading order by question

### 1. What exists in the repo right now?
Read:
- `docs/architecture/blueprint/current-state-map.md`
- live code in the touched area
- package manifests, exports, tests, and configs

### 2. Which package should own this change?
Read:
- `docs/architecture/blueprint/package-relationship-map.md`
- the touched package `README.md`
- the touched package `package.json`
- use `.claude/agents/hb-boundary-auditor.md` if ownership is not obvious

### 3. What is the intended target architecture?
Read:
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`

### 4. What is the broader product or program doctrine?
Read:
- `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md`

### 5. Where should documentation go and how should it be written?
Read:
- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/developer/documentation-authoring-standard.md`
- `.claude/rules/04-documentation-standards.md`
- use `.claude/agents/hb-docs-curator.md` if documentation scope or placement is unclear

### 6. What verification should I run?
Read:
- `docs/reference/developer/verification-commands.md`
- the touched package `README.md`
- the root or package `package.json` scripts that apply to the change
- use `.claude/agents/hb-verification-runner.md` if validation scope or result interpretation is unclear

### 7. What should I do for a specific phase, wave, or feature task?
Read:
- only the active scoped plan files relevant to the task
- not the full planning corpus unless the task is cross-cutting

### 8. Is this a UI ownership or UX consistency question?
Read:
- the touched app or package files
- `docs/architecture/blueprint/package-relationship-map.md`
- relevant `docs/explanation/design-decisions/*` materials when the question is about interaction quality, UX direction, or mold-breaker intent
- use `.claude/agents/hb-ui-ux-conformance-reviewer.md` if ownership or consistency is unclear

## Conflict resolution

When sources disagree:
- treat verified live repo state and `current-state-map.md` as present-truth authority,
- treat `package-relationship-map.md` as dependency and ownership authority,
- treat Blueprint V4 as target-state architecture,
- treat the Unified Blueprint as narrative and doctrine,
- treat historical task plans as scoped execution guidance rather than absolute truth about current state.

## Efficiency rules

- Do not start by reading every authoritative document.
- Do not reread files already in current session context unless the file changed, the context is stale, or the task widened.
- Read the nearest local package or app docs before escalating to broader repo doctrine when the work is local.
- Prefer the smallest source set that can answer the question accurately.
- Use the repo-researcher subagent when targeted investigation will reduce main-context noise.
- Use specialist agents to reduce main-context load, not to add extra ceremony.

## Escalate when

Escalate from local docs to broader architecture docs when the work:
- changes package boundaries,
- adds a new dependency,
- changes shared primitives,
- affects multiple apps or features,
- changes auth, provisioning, runtime model, or deployment doctrine,
- appears to conflict with an ADR or architecture plan.
