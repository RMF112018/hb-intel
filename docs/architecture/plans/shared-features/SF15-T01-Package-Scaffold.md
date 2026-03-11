# SF15-T01 — Package Scaffold: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-01, D-07, D-09, D-10
**Estimated Effort:** 0.35 sprint-weeks
**Depends On:** SF15 master plan

> **Doc Classification:** Canonical Normative Plan — SF15-T01 scaffold task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Create package skeleton for `@hbc/ai-assist` with dual exports, strict coverage thresholds, mandatory README scaffold, and explicit extension-point/registry/governance surfaces required by the locked architecture.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

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
├── src/registry/AiActionRegistry.ts
├── src/registry/AiModelRegistry.ts
├── src/registry/RelevanceScoringEngine.ts
├── src/governance/AiGovernanceApi.ts
├── src/governance/AiAuditWriter.ts
├── src/hooks/index.ts
├── src/components/index.ts
├── src/components/HbcAiSmartInsertOverlay.tsx
├── src/components/HbcAiTrustMeter.tsx
├── src/components/HbcAiGovernancePortal.tsx
├── testing/index.ts
└── src/__tests__/setup.ts
```

---

## Package Requirements

- Name: `@hbc/ai-assist`
- Exports: `"."`, `"./testing"`
- `sideEffects: false`
- Coverage thresholds all `95`
- Scaffold must include extension-point registration path (`registerAiAction`, `registerAiActions`) and model registry bootstrap surfaces.

---

## README Requirement (Mandatory in T01)

**File:** `packages/ai-assist/README.md`

Must include:

1. overview + named-action AI model
2. quick-start usage
3. Azure AI Foundry tenant-boundary architecture summary
4. unified Project Canvas toolbar entrypoint and action discovery model
5. Smart Insert + Trust Meter + `'ai-assisted'` commit flow summary
6. model registry and governance portal summary
7. exports table (`AiActionDefinition`, `registerAiAction`, `registerAiActions`, hooks/components/testing)
8. architecture boundary rules
9. links to SF15 master/T09 and ADR-0104 target path
10. the exact mandatory pre-implementation research directive text

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist check-types
pnpm --filter @hbc/ai-assist build
pnpm --filter @hbc/ai-assist test --coverage
test -f packages/ai-assist/README.md
rg -n "Mandatory Pre-Implementation Research Directive" packages/ai-assist/README.md
```
