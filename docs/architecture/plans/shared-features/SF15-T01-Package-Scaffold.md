# SF15-T01 — Package Scaffold: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-02, D-08, D-10
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** SF15 master plan

> **Doc Classification:** Canonical Normative Plan — SF15-T01 scaffold task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Create package skeleton for `@hbc/ai-assist` with dual exports, strict coverage thresholds, and mandatory README scaffold.

---

## Required Files

```text
packages/ai-assist/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/index.ts
├── src/types/index.ts
├── src/constants/index.ts
├── src/api/index.ts
├── src/hooks/index.ts
├── src/components/index.ts
├── testing/index.ts
└── src/__tests__/setup.ts
```

---

## Package Requirements

- Name: `@hbc/ai-assist`
- Exports: `"."`, `"./testing"`
- `sideEffects: false`
- Coverage thresholds all `95`

---

## README Requirement (Mandatory in T01)

**File:** `packages/ai-assist/README.md`

Must include:

1. overview + named-action AI model
2. quick-start usage
3. Azure AI Foundry tenant-boundary architecture summary
4. action invocation and result-review flow summary
5. exports table
6. architecture boundary rules
7. links to SF15 master/T09 and ADR-0104 target path

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist check-types
pnpm --filter @hbc/ai-assist build
pnpm --filter @hbc/ai-assist test --coverage
test -f packages/ai-assist/README.md
```
