# Prompt 06 — Begin Main Barrel Reduction for @hbc/ui-kit

You are working in the live HB Intel repository.

## Objective

Start the first safe reduction wave for the oversized `packages/ui-kit/src/index.ts` main barrel by migrating named consumers to subpath imports where safe and reducing transitional export pressure without causing a destructive rewrite.

This is a real implementation wave, but it must remain disciplined and incremental.

Do not reread files that are already in your active context unless needed.

---

## Governing files

Read and follow:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
- `packages/ui-kit/src/index.ts`
- `packages/ui-kit/package.json`
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/primitives.ts`
- `packages/ui-kit/src/fluent.ts`
- `packages/ui-kit/src/app-shell.ts`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`

---

## Required work

### 1. Identify safe first-wave consumer migrations
Find named consumers currently importing from the main barrel that can safely move to:
- `@hbc/ui-kit/homepage`
- `@hbc/ui-kit/primitives`
- `@hbc/ui-kit/fluent`
- `@hbc/ui-kit/app-shell`
- or other existing subpath entry points

Prioritize:
- low-risk migrations,
- clearly aligned consumers,
- and consumers that reduce ambiguity around layer/lane ownership.

### 2. Execute the safe migrations
Update those consumers to the correct subpath imports.

### 3. Reduce main-barrel transitional pressure
Where safe, remove or mark transitional exports more explicitly.

Do not break wide legacy areas just to shrink the barrel numerically.

### 4. Preserve compatibility where needed
If an export must remain for compatibility, leave it in place with clear intent.

### 5. Write reduction-wave note
Create:

`docs/architecture/reviews/UI-System-Main-Barrel-Reduction-Wave-01.md`

This note must include:
- starting state,
- safe migrations executed,
- named consumers migrated,
- exports reduced or clarified,
- exports intentionally retained,
- and next-wave targets.

---

## Validation requirements

Report exactly:
- which consumers moved off the main barrel,
- which subpath entry points gained real usage,
- whether any exports were removed,
- and how much ambiguity was reduced.

If useful, quantify before/after counts for the main barrel, but do not fake precision if automated counting is not reliable.

---

## Guardrails

- Do not attempt a flag-day barrel purge.
- Do not break compatibility broadly.
- Do not move consumers to incorrect subpaths just to reduce counts.
- Keep migrations named, scoped, and reviewable.

---

## Completion requirement

When finished:
1. execute the safe first-wave migrations
2. create `docs/architecture/reviews/UI-System-Main-Barrel-Reduction-Wave-01.md`
3. provide a short completion note stating:
   - which named consumers moved,
   - what changed in the main barrel,
   - whether the oversized-barrel gap is fully closed or only reduced.
