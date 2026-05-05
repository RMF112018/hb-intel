# 15 — Dependency Package Evaluation

## Prefer current repo-compatible stack
TypeScript, React, Vitest, Testing Library, Zod, `@hbc/models`, and `@hbc/ui-kit`.

## Potential future dependencies
- Zod: preferred if already present.
- Fluent UI React: only if consistent with UI-kit posture.
- TanStack Table: evaluate later for dense tables.
- XState: avoid unless state complexity justifies it.
- AJV: avoid unless JSON Schema validation is required outside Zod.

## Lockfile rule
Documentation package must not change package manifests, SPFx manifests, or `pnpm-lock.yaml`.
