# SF15-T08 — Testing Strategy: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-10
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF15-T08 testing strategy task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Define fixtures and tests for action contracts, relevance-ranked discovery, invoke/stream lifecycle, Smart Insert acceptance, trust disclosure tiers, model/policy governance, and notification routing.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## Testing Sub-Path

- `createMockAiAction`
- `createMockPromptPayload`
- `createMockAiActionResult`
- `createMockAiAuditRecord`
- `createMockAiModelRegistration`
- `mockAiActionStates`

---

## Required Coverage

- action `buildPrompt` and `parseResponse` tests for all 6 confirmed actions
- registration tests for `registerAiAction` and `registerAiActions`
- relevance scoring tests (`relevanceTags`, `basePriorityScore`, context/role/complexity/usage-history inputs)
- model registry resolution and policy-gated action availability tests
- hook tests for grouped/ranked discovery and invoke lifecycle
- streaming tests for inline SSE updates and cancel hard-stop behavior
- Smart Insert tests for auto-mapping, drag/drop remap, per-field accept, Apply All, live diff, and commit-to-`'ai-assisted'`
- Trust Meter tier tests for Essential/Standard/Expert disclosure and `confidenceDetails` rendering
- governance portal authorization and audit analytics path tests
- notification routing tests for invoker/stakeholder/admin audiences
- storybook states for toolbar menu, Smart Insert variants, trust meter tiers, and governance views
- Playwright scenario: summarize-scorecard invoke -> inline stream -> Smart Insert accept/commit -> snapshot + audit + notification outcomes

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test --coverage
pnpm --filter @hbc/ai-assist storybook
pnpm exec playwright test --grep "ai-assist"
rg -n "Mandatory Pre-Implementation Research Directive" docs/architecture/plans/shared-features/SF15*.md
```
