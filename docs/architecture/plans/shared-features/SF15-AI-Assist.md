# SF15 — `@hbc/ai-assist`: Contextual AI Action Layer (Azure AI Foundry)

**Plan Version:** 1.1
**Date:** 2026-03-11
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Priority Tier:** 3 — Intelligence Layer (workflow enhancement, non-blocking core primitive)
**Estimated Effort:** 4–5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md`

> **Doc Classification:** Canonical Normative Plan — SF15 implementation master plan for `@hbc/ai-assist`; governs SF15-T01 through SF15-T09.

---

## Purpose

`@hbc/ai-assist` provides named, contextual AI actions directly in record workflows, keeping data within the Microsoft tenant boundary and returning structured outputs that users review before committing. Phase-locked architecture centers on a single Project Canvas toolbar entrypoint, Smart Insert inline acceptance, progressive trust disclosure, policy-governed multi-model invocation, and full auditability.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Canvas integration | `registerAiActions` extension point; `@hbc/project-canvas` renders single global `✨ AI Assist` toolbar button with merged/grouped actions filtered by record type, auth role, and complexity tier |
| D-02 | Result acceptance | Inline Smart Insert overlay anchored to triggering Canvas card with schema-driven auto-mapping and drag/drop remap; per-field accept + Apply All + live diff; commit creates `'ai-assisted'` snapshot |
| D-03 | Confidence transparency | Progressive Trust Meter in Smart Insert: Essential badge+disclaimer; Standard badge+short rationale; Expert full confidence details |
| D-04 | Streaming model | True inline streaming in Smart Insert with subtle Trust Meter progress; Essential sees clean growing content; Expert sees token usage; cancel terminates Azure Functions stream |
| D-05 | Governance and audit | Every invocation emits versioned `IAiAuditRecord`; admin-only AI Governance Portal provides trail, analytics, policy controls, and source transparency reports |
| D-06 | Notification routing | `@hbc/notification-intelligence` sends inline completion badge to invoker, targeted digest cards to stakeholders, and governance alerts to admins for low-confidence/policy events |
| D-07 | Multi-model support | `AiModelRegistry` resolves logical model keys from tenant configuration via `@hbc/auth`; resolved model/version/source lineage injected into trust, audit, and reporting |
| D-08 | Action discovery | Relevance scoring via `relevanceTags` + `basePriorityScore` + context/role/complexity/usage history; popover sorted/grouped with admin overrides |
| D-09 | Action delivery | Six Phase 7 actions ship as curated built-in defaults migrated to extension-point, Smart Insert, trust, governance, model-registry, and relevance patterns |
| D-10 | Research gate + testing sub-path | Research directive is mandatory precondition; `@hbc/ai-assist/testing` exports canonical fixtures for actions/results/audit/model/relevance states |

---

## Package Directory Structure

```text
packages/ai-assist/
├── package.json
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IAiAssist.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── aiAssistDefaults.ts
│   │   └── index.ts
│   ├── registry/
│   │   ├── AiActionRegistry.ts            # registerAiAction/registerAiActions extension points
│   │   ├── AiModelRegistry.ts             # logical model key resolution and tenant model map
│   │   └── RelevanceScoringEngine.ts      # dynamic ranking with admin override support
│   ├── governance/
│   │   ├── AiGovernanceApi.ts             # policy/rate-limit/approval analytics endpoints
│   │   └── AiAuditWriter.ts               # writes IAiAuditRecord through versioned-record path
│   ├── api/
│   │   ├── AiAssistApi.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAiAction.ts
│   │   ├── useAiActions.ts
│   │   └── index.ts
│   └── components/
│       ├── HbcAiActionMenu.tsx
│       ├── HbcAiSmartInsertOverlay.tsx    # inline acceptance overlay replacing standalone panel behavior
│       ├── HbcAiTrustMeter.tsx            # progressive confidence/rationale disclosure
│       ├── HbcAiLoadingState.tsx
│       ├── HbcAiGovernancePortal.tsx      # admin-only extension-point component
│       └── index.ts
├── testing/
│   ├── index.ts
│   ├── createMockAiAction.ts
│   ├── createMockPromptPayload.ts
│   ├── createMockAiActionResult.ts
│   ├── createMockAiAuditRecord.ts
│   ├── createMockAiModelRegistration.ts
│   └── mockAiActionStates.ts
└── src/__tests__/
    ├── setup.ts
    ├── AiAssistApi.test.ts
    ├── useAiAction.test.ts
    ├── useAiActions.test.ts
    ├── HbcAiActionMenu.test.tsx
    ├── HbcAiSmartInsertOverlay.test.tsx
    ├── HbcAiTrustMeter.test.tsx
    └── HbcAiLoadingState.test.tsx
```

---

## Confirmed Phase 7 Actions

- `summarize-scorecard`
- `risk-assessment`
- `draft-learning-loop`
- `constraint-analysis`
- `generate-context-notes`
- `intelligence-contribution`

All six actions are curated built-in defaults in `@hbc/ai-assist` and must be fully migrated to the refined architecture (extension-point registration, Smart Insert acceptance, Trust Meter, audit/governance controls, model-key resolution, and relevance scoring).

---

## Definition of Done

- [ ] `registerAiAction`, `registerAiActions`, and `AiActionDefinition` contracts exported and stable
- [ ] global Project Canvas toolbar AI entrypoint behavior documented and integration-locked
- [ ] backend proxy invoke contract documented with model-key resolution, governance controls, and hard-stop cancel
- [ ] `IAiAuditRecord` and `AiModelRegistry` contracts documented and cross-referenced in T02/T03/T09
- [ ] hooks provide filtered/grouped/relevance-ranked action list + invoke lifecycle + Smart Insert-ready result state
- [ ] action menu/Smart Insert/Trust Meter/loading behavior documented for Essential/Standard/Expert tiers
- [ ] sensitive-field exclusion, approval controls, and rate-limiting requirements documented
- [ ] admin-only AI Governance Portal responsibilities documented
- [ ] notification routing requirements documented for invoker/stakeholder/admin audiences
- [ ] all 6 Phase 7 actions documented with prompt/parse/testing migration requirements
- [ ] testing sub-path fixtures exported, including audit/model/relevance fixtures
- [ ] mandatory research directive included and enforced in every SF15 task plan and T09 documentation checks
- [ ] T09 includes SF11-grade documentation/deployment requirements and expanded ADR-0104 decisions
- [ ] `current-state-map.md` updated with SF15 + ADR-0104 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF15-T01-Package-Scaffold.md` | package scaffold + README requirement ✅ completed 2026-03-11 |
| `SF15-T02-TypeScript-Contracts.md` | AI contracts + constants ✅ completed 2026-03-11 |
| `SF15-T03-AiAssistApi-and-Action-Registry.md` | API invoke contract + action/model registry ✅ completed 2026-03-11 |
| `SF15-T04-Hooks.md` | `useAiAction` + `useAiActions` behavior ✅ completed 2026-03-11 |
| `SF15-T05-HbcAiActionMenu.md` | global toolbar action trigger/popover behavior ✅ completed 2026-03-11 |
| `SF15-T06-HbcAiResultPanel-and-LoadingState.md` | Smart Insert overlay + Trust Meter + loading/cancel behavior ✅ completed 2026-03-11 |
| `SF15-T07-Reference-Integrations.md` | canvas/auth/versioning/notifications/handoff/annotations/governance references ✅ completed 2026-03-11 |
| `SF15-T08-Testing-Strategy.md` | testing fixtures + test matrix ✅ completed 2026-03-11 |
| `SF15-T09-Testing-and-Deployment.md` | checklist, ADR/docs/index/state-map updates ✅ completed 2026-03-11 |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF15 completed: 2026-03-11
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md
Documentation added:
  - docs/how-to/developer/ai-assist-adoption-guide.md
  - docs/reference/ai-assist/api.md
  - packages/ai-assist/README.md
docs/README.md ADR index updated: ADR-0104 row appended.
current-state-map.md §2 updated with SF15 and ADR-0104 rows.
Mandatory pre-implementation research directive completed and verified before implementation start.
-->
