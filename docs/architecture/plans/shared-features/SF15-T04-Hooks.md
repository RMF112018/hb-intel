# SF15-T04 — Hooks: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-01, D-02, D-03, D-04, D-06, D-08
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF15-T04 hooks task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Implement hooks for merged action discovery, relevance-ranked filtering, invoke lifecycle, inline streaming, Smart Insert readiness, and versioned commit/audit-aware completion flows.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## Hook Contracts

- `useAiActions(record, currentRole, complexityTier, policyContext)`
  - reads globally registered actions (`registerAiAction` / `registerAiActions`)
  - filters by record type, `allowedRoles`, complexity tier, and policy overrides
  - returns grouped actions in relevance order
  - relevance inputs include `relevanceTags`, `basePriorityScore`, context signals, and usage-history signals from `@hbc/versioned-record`
- `useAiAction()`
  - invoke with `modelKey`
  - inline loading/streaming state for Smart Insert overlay
  - cancel support with hard-stop semantics
  - parsed result + `confidenceDetails` + mapping payload for Smart Insert
  - commit helper that supports `'ai-assisted'` snapshot flow and completion/audit notifications

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test -- useAiActions useAiAction
pnpm --filter @hbc/ai-assist check-types
rg -n "useAiActions|useAiAction|relevance|confidenceDetails|ai-assisted|modelKey" packages/ai-assist/src/hooks
```
