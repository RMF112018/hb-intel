# Prompt 04 — Complete Deprecated Alias Retirement Plan and Consumer Impact Map

You are working in the live HB Intel repository.

## Objective

Close the audit report’s deprecated-alias planning gap by producing a formal retirement plan for the known deprecated typography and elevation aliases, including exact consumer impact, migration sequencing, and removal gates.

This is primarily a planning and documentation task. Make only minimal code changes if they materially improve traceability or safe deprecation annotations.

Do not reread files that are already in your active context unless needed.

---

## Governing files

Read and follow:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
- `packages/ui-kit/src/theme/typography.ts`
- `packages/ui-kit/src/theme/elevation.ts`
- `packages/ui-kit/src/index.ts`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`

---

## Deprecated aliases to plan

Typography aliases:
- `displayHero`
- `displayLarge`
- `displayMedium`
- `titleLarge`
- `titleMedium`
- `bodyLarge`
- `bodyMedium`
- `caption`
- `monospace` if treated as deprecated alias in current repo truth

Elevation aliases:
- `elevationRest`
- `elevationHover`
- `elevationRaised`
- `elevationOverlay`
- `elevationDialog`

Use live repo truth to confirm the final exact list before writing the plan.

---

## Required work

### 1. Confirm the exact alias inventory
Produce the exact final list of deprecated aliases still public in the repo.

### 2. Map all live consumers
Find every current consumer of each alias.

Group them by:
- package / app,
- productive vs presentation lane,
- direct import path,
- and migration complexity.

### 3. Define removal readiness tiers
For each alias, define:
- zero-risk / no-consumer,
- low-risk / shallow migration,
- medium-risk / multi-consumer,
- high-risk / broad or fragile.

### 4. Produce a wave-02 retirement plan
Create a formal plan with:
- migration order,
- gating requirements,
- required validation,
- rollback considerations,
- and explicit removal criteria.

### 5. Write the closure artifact
Create:

`docs/architecture/reviews/UI-System-Deprecated-Alias-Retirement-Plan.md`

This file must include:
- exact alias inventory,
- consumer map,
- risk tiering,
- suggested execution order,
- removal gates,
- and open blockers.

### 6. Tighten inline annotations if warranted
If current deprecation comments are vague or inconsistent, tighten them narrowly.

Do not perform broad implementation migration in this prompt unless a zero-risk cleanup is obvious and safe.

---

## Validation requirements

Report exactly:
- final alias count,
- affected consumers,
- aliases with zero live consumers,
- aliases that are still heavily used,
- and whether the planning gap is now fully closed.

---

## Guardrails

- Do not turn this into a repo-wide removal campaign.
- Do not remove aliases broadly in this prompt unless clearly zero-risk.
- Do not estimate consumer impact without scanning the repo.
- Keep the output actionable and decision-grade.

---

## Completion requirement

When finished:
1. create `docs/architecture/reviews/UI-System-Deprecated-Alias-Retirement-Plan.md`
2. tighten any necessary deprecation annotations only if justified
3. provide a short completion note stating:
   - exact alias inventory,
   - most affected consumers,
   - whether the alias-retirement planning gap is now closed.
