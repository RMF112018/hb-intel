# SF15-T03 — AiAssistApi and Action Registry: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-01, D-02, D-05, D-07, D-08, D-09, D-10
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF15-T03 API/registry task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Define backend proxy invoke contract, extension-point action/model registry behavior, relevance metadata ingestion, and governance enforcement path.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## API Contract

- Endpoint: `POST /api/ai-assist/invoke`
- Request body:
  - `actionKey`
  - `modelKey` (logical key; backend resolves deployment through `AiModelRegistry`)
  - prompt payload (`systemInstruction`, `userPrompt`, `contextData`, model controls)
  - metadata (`recordType`, `recordId`)
- Response:
  - SSE stream chunks for inline rendering
  - terminal completion payload with `confidenceDetails` and normalized output

Server-side requirements:

- auth validation + role/site policy enforcement
- rate limiting (configurable by role/site/action)
- approval-gated action enforcement where configured
- audit log emission (`IAiAuditRecord`) through `@hbc/versioned-record`
- sensitive-field filtering enforcement
- cancel hard-stop that immediately terminates Azure Functions stream

---

## Action Registration Model

- extension-point registration APIs: `registerAiAction` and `registerAiActions`
- action registry is global and consumed by Project Canvas unified toolbar popover
- action list grouped by record type and relevance-ranked
- action key uniqueness per record type
- relevance metadata (`relevanceTags`, `basePriorityScore`) required for ranking participation
- admin override policies can re-prioritize or disable actions without code redeploy
- model registry resolves logical `modelKey` to tenant-approved deployment details

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test -- AiAssistApi
pnpm --filter @hbc/ai-assist check-types
rg -n "registerAiAction|registerAiActions|AiModelRegistry|IAiAuditRecord|modelKey|confidenceDetails" packages/ai-assist/src
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF15-T03 completed: 2026-03-11

Implementations delivered:
- AiActionRegistry: composite-key registry (recordType::actionKey), validation, duplicate protection,
  getByRecordType/getForContext filtering (role/complexity/policy), wildcard recordType, deterministic sort,
  _clearForTests — pattern: RelationshipRegistry
- AiModelRegistry: IAiModelRegistry conformance, registerModel validation, resolveModel with role auth,
  listModels, _clearForTests
- RelevanceScoringEngine: weighted 4-factor scoring (basePriority 40%, tagMatch 30%, complexityAlignment 15%,
  roleMatch 15%), factors breakdown, sorted desc by composite score
- AiGovernanceApi: mutable policy, in-memory audit trail, evaluatePolicy (allowed/blocked/approval-required),
  checkRateLimit (hourly window), getAuditTrail with filters, recordAudit, getPolicyStatus, getRateLimitStatus
- AiAuditWriter: field validation, delegates to AiGovernanceApi.recordAudit, injectable onWrite callback
- AiAssistApi: injectable IAiActionExecutor pattern, full invoke orchestration (model resolution → policy check →
  buildPrompt → execute → parseResponse → audit), cancel via AbortController, default executor placeholder

Barrel exports created:
- src/registry/index.ts
- src/governance/index.ts (includes IPolicyEvaluation, IRateLimitStatus, IAuditTrailFilters type exports)
- src/index.ts updated with barrel paths + IAiActionExecutor type export

Tests: 6 test files, 69 tests passing
- src/registry/AiActionRegistry.test.ts (21 tests)
- src/registry/AiModelRegistry.test.ts (10 tests)
- src/registry/RelevanceScoringEngine.test.ts (9 tests)
- src/governance/AiGovernanceApi.test.ts (14 tests)
- src/governance/AiAuditWriter.test.ts (8 tests)
- src/api/AiAssistApi.test.ts (7 tests)

Verification: check-types ✅ | build ✅ | test ✅ (69/69)
Next: SF15-T04 (Hooks)
-->
