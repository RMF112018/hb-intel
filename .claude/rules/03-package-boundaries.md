# 03 — Package Boundaries

## Primary Rule

Respect package ownership, public exports, and dependency direction. Do not deep-import through private source paths unless the package explicitly supports it.

## Required Checks

Before package work:

1. read nearest `package.json`;
2. inspect `exports`, `main`, `types`, scripts, dependencies, and peer dependencies;
3. inspect nearest README;
4. identify affected consumers;
5. validate package-local first.

## Shared Packages

Shared packages define reusable contracts. Preserve public exports unless a breaking change is explicitly authorized.

## Feature Packages

Feature packages belong under `packages/features/*`. Do not duplicate shared primitive concerns locally when a Tier-1 primitive applies.

## UI Kit

Use `@hbc/ui-kit` and doctrine docs for UI primitives, tokens, and premium surface rules. Do not create one-off UI systems when a governed primitive exists.

## Models

Treat `@hbc/models` as a contract source. Changes may affect many consumers and require cross-package validation.
