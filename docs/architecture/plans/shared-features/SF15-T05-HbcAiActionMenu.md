# SF15-T05 — `HbcAiActionMenu`: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-01, D-05, D-08
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF15-T05 action menu task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Implement single global toolbar AI trigger and contextual action selection popover for Project Canvas.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## Contract

```typescript
interface HbcAiActionMenuProps<T> {
  record: T;
  host: 'project-canvas-toolbar';
  recordType: string;
  currentRole: string;
  complexityTier: ComplexityTier;
}
```

Behavior:

- rendered once in `@hbc/project-canvas` as global `✨ AI Assist` toolbar button
- popover merges all registered actions and groups by record-type context
- action list filtered by record type, auth role policy, and complexity tier
- list sorted by dynamic relevance score with admin override support
- selecting action invokes `useAiAction` and opens Smart Insert overlay stream

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test -- HbcAiActionMenu
pnpm --filter @hbc/ai-assist build
rg -n "project-canvas-toolbar|registerAiActions|relevance" packages/ai-assist/src/components/HbcAiActionMenu.tsx
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF15-T05 completed: 2026-03-11
- Rewrote HbcAiActionMenu.tsx from scaffold to full implementation
- Props: record, host, recordType, recordId, userId, currentRole, complexityTier, policyContext, contextTags, onActionSelect
- State machine: empty/ready/open via useMemo; no loading state (synchronous discovery)
- Governance-aware: per-action AiGovernanceApi.evaluatePolicy for allowed/blocked/approval-required
- 13 tests in HbcAiActionMenu.test.tsx (all passing)
- Barrel exports unchanged (already in place from T01 scaffold)
- Build: zero errors; Type-check: zero errors; Tests: 97 passing across 9 files
Next: SF15-T06 (Smart Insert Overlay + Trust Meter + Loading State)
-->
