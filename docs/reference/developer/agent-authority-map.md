# Agent Authority Map

Purpose: help agents and developers route quickly to the right authoritative source or specialist reviewer for a given HB Intel task without loading unnecessary doctrine into context.

## Fast path

1. Identify the touched package, app, backend area, or documentation area.
2. Read the nearest local code, `README.md`, package manifest, and tests first.
3. Use the source routing table to escalate only to the broader authoritative source needed for the decision.
4. Use the specialist routing map when a focused reviewer will reduce main-context noise or improve decision quality.
5. Use `current-state-map.md` plus verified live repo state when the question is about what exists now.
6. Keep Claude working plans under `.claude/plans/**` unless the user explicitly requests a canonical plan artifact in the docs library.

## Source routing table

| Question | Primary source | Read when | Notes |
|---|---|---|---|
| What exists in the repo right now? | `docs/architecture/blueprint/current-state-map.md` | Any task involving repo state, current maturity, current package status, or current governance state | Present-truth authority for current state |
| What package should own this concern? | `docs/architecture/blueprint/package-relationship-map.md` | Adding dependencies, moving code, creating packages, evaluating ownership or layering | Dependency and ownership authority |
| Where should this documentation live? | `docs/README.md` | Any docs creation or update task | Repository docs navigation and structure |
| How should documentation be written? | `docs/reference/developer/documentation-authoring-standard.md` | Creating or updating docs, README work, developer-facing reference docs | Documentation quality and placement standard |
| What verification should be run? | `docs/reference/developer/verification-commands.md` | Any task requiring tests, lint, typecheck, build, or validation decisions | Verification routing and reporting standard |
| Where should Claude working plans go? | `.claude/rules/06-planning-and-proposals.md` | Planning help, plan persistence, draft plan generation, proposal writeups | Default working-plan location is `.claude/plans/**`; canonical plan docs require explicit user intent |
| What is the intended target architecture? | `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` | Cross-cutting architecture work, structure changes, runtime model work | Target-state architecture |
| What is the broader product/program doctrine? | `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` | Product thesis, operating doctrine, long-range alignment, narrative context | Program narrative, not present-state authority |
| What is the active implementation scope? | The relevant phase, wave, feature, or task plan | Scoped implementation work | Use only the plans relevant to the current task; do not treat Claude working plans as canonical scope docs |
| Does this need an ADR? | Existing ADRs plus the relevant architecture docs | Durable architecture decisions, reversals, or repo-wide rules | Do not create ADRs for routine local implementation details |
| How does this package work locally? | The package or app `README.md`, `package.json`, tests, and nearby code | Local package or app implementation work | Prefer this before broad repo docs |
| Do I need focused repo research before coding? | `.claude/agents/hb-repo-researcher.md` | Unfamiliar code areas, cross-package impact analysis, architecture/doc routing questions, plan-to-repo alignment checks | Read-only investigation helper |

## Specialist routing map

Use the specialist agents automatically when the task clearly fits their scope. If the fit is weak or the task is simple, stay with the main agent.

| Specialist | Use for | Do not use for | Typical outcome |
|---|---|---|---|
| `hb-boundary-auditor` | Package ownership, dependency legality, export placement, cross-package coupling, deciding whether code belongs in a feature package, shared package, app, backend, or `@hbc/ui-kit` | Running tests, writing docs, generic repo exploration, broad product strategy questions | Boundary finding + recommended next move |
| `hb-verification-runner` | Choosing the right validation scope, running targeted checks, separating new failures from pre-existing failures, summarizing what was and was not verified | Package ownership decisions, documentation placement, UI/UX quality review | Verification result + recommended next move |
| `hb-docs-curator` | Whether docs need updates, where docs belong, doc conflicts with current-state truth, package README vs developer reference vs explanation vs plan placement | Code ownership questions, generic code review, test execution | Documentation impact + recommended next move |
| `hb-ui-ux-conformance-reviewer` | Reusable UI ownership, `@hbc/ui-kit` alignment, cross-surface UI consistency, mold-breaker UX fit, feature-level UI reuse decisions | Test execution, generic package-boundary review outside UI concerns, broad docs routing | UI/UX conformance finding + recommended next move |
| `hb-repo-researcher` | Read-only repo investigation, unfamiliar code areas, cross-package impact analysis, authority routing, plan-to-repo alignment, locating the smallest relevant source set | Routine local edits, final validation execution, formal docs curation when the docs impact is already obvious | Focused research summary + recommended next move |

## Conflict handling

If sources disagree, use this order:

1. verified live code and configuration,
2. `current-state-map.md`,
3. `package-relationship-map.md`,
4. `docs/README.md` for docs routing,
5. Blueprint V4,
6. Unified Blueprint,
7. scoped task plans.

Historical plans do not override present repo truth.
Narrative doctrine does not replace verified implementation state.
Claude working plans under `.claude/plans/**` do not override canonical repository docs.

## Recommended reading patterns

### Local package or app change
Read:
- local code,
- local tests,
- package or app `README.md`,
- package or app `package.json`.

Escalate only if the change affects ownership, boundaries, architecture, shared behavior, or documentation outside the local area.

### Cross-package or shared primitive change
Read:
- local code in all touched packages,
- `current-state-map.md`,
- `package-relationship-map.md`,
- the relevant active plan files.

Use `hb-boundary-auditor` when package ownership or dependency direction is unclear.
Use `hb-repo-researcher` first if the impacted surface is not already clear.

### Architecture or platform doctrine question
Read:
- `current-state-map.md`,
- Blueprint V4,
- Unified Blueprint,
- relevant ADRs,
- package relationship map when ownership or dependency direction matters.

Use `hb-repo-researcher` when the question spans multiple areas and the right source set is not obvious.

### Documentation update
Read:
- `docs/README.md`,
- `docs/reference/developer/documentation-authoring-standard.md`,
- the nearest canonical doc in the touched area,
- package README when the change is local,
- `current-state-map.md` when classification or document governance matters.

Use `hb-docs-curator` when placement, update scope, or doc conflict is unclear.

### Verification planning or execution
Read:
- `docs/reference/developer/verification-commands.md`,
- the root or affected package `package.json`,
- the nearest README if package-specific validation guidance exists.

Use `hb-verification-runner` when the right validation scope is non-obvious or when failures need triage.

### UI or UX review
Read:
- local component code,
- `@hbc/ui-kit` exports and nearby usage patterns,
- the package relationship map if reusable ownership is unclear,
- relevant design-decision docs when the change affects user experience direction.

Use `hb-ui-ux-conformance-reviewer` when reusable visual ownership, surface consistency, or UX-fit needs review.

### Working plan creation
Read:
- `.claude/rules/06-planning-and-proposals.md`,
- the relevant local code and scoped plan docs,
- `docs/README.md` only if the user explicitly wants the plan promoted into canonical docs.

Default persistence for working plans is `.claude/plans/**`.
Write into `docs/architecture/plans/**` only when the user explicitly requests a canonical plan artifact or update.

## Efficiency rules

- Do not start every session by reading all major architecture docs.
- Do not reread files already in current session context unless something changed or the task widened.
- Prefer the nearest authoritative source that answers the question.
- Escalate to broader doctrine only when the local sources are insufficient.
- Use the specialist agents when the task clearly fits and they can reduce main-context load.
- Keep Claude working plans in `.claude/plans/**` unless the user explicitly requests a canonical docs-library write.
