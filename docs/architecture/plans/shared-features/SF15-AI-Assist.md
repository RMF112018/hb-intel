# SF15 — `@hbc/ai-assist`: Contextual AI Action Layer (Azure AI Foundry)

**Plan Version:** 1.0
**Date:** 2026-03-10
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Priority Tier:** 3 — Intelligence Layer (workflow enhancement, non-blocking core primitive)
**Estimated Effort:** 4–5 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md`

> **Doc Classification:** Canonical Normative Plan — SF15 implementation master plan for `@hbc/ai-assist`; governs SF15-T01 through SF15-T09.

---

## Purpose

`@hbc/ai-assist` provides named, contextual AI actions directly in record workflows, keeping data within the Microsoft tenant boundary and returning structured outputs that users review before committing.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Interaction model | Named contextual actions only; no free-form chatbot UX in Phase 7 |
| D-02 | Model boundary | Azure AI Foundry via backend proxy only; no direct client model access |
| D-03 | Action contract | `buildPrompt(record)` + `parseResponse(raw)` per action |
| D-04 | Result policy | AI output is suggestion-only; user accept/edit/dismiss required |
| D-05 | Access control | Actions filtered by role and complexity tier |
| D-06 | Data safety | Sensitive field exclusion enforced both client-side and server-side |
| D-07 | Governance controls | Audit logging + rate limiting mandatory in invoke path |
| D-08 | Streaming model | SSE/stream-capable loading with cancel support |
| D-09 | Integration baseline | complexity, versioned-record, handoff, notification-intelligence, field-annotations integrations |
| D-10 | Testing sub-path | `@hbc/ai-assist/testing` exports canonical AI action fixtures |

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
│   ├── api/
│   │   ├── AiAssistApi.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAiAction.ts
│   │   ├── useAiActions.ts
│   │   └── index.ts
│   └── components/
│       ├── HbcAiActionMenu.tsx
│       ├── HbcAiResultPanel.tsx
│       ├── HbcAiLoadingState.tsx
│       └── index.ts
├── testing/
│   ├── index.ts
│   ├── createMockAiAction.ts
│   ├── createMockPromptPayload.ts
│   ├── createMockAiActionResult.ts
│   └── mockAiActionStates.ts
└── src/__tests__/
    ├── setup.ts
    ├── AiAssistApi.test.ts
    ├── useAiAction.test.ts
    ├── useAiActions.test.ts
    ├── HbcAiActionMenu.test.tsx
    ├── HbcAiResultPanel.test.tsx
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

---

## Definition of Done

- [ ] `IAiAssistConfig<T>` contracts exported and stable
- [ ] backend proxy invoke contract documented with governance controls
- [ ] hooks provide filtered action list + invoke lifecycle
- [ ] action menu/result panel/loading state behavior documented
- [ ] sensitive-field exclusion and rate-limiting requirements documented
- [ ] all 6 Phase 7 actions documented with prompt/parse testing requirements
- [ ] testing sub-path fixtures exported
- [ ] T09 includes SF11-grade documentation/deployment requirements
- [ ] `current-state-map.md` updated with SF15 + ADR-0104 linkage

---

## Task File Index

| File | Contents |
|---|---|
| `SF15-T01-Package-Scaffold.md` | package scaffold + README requirement |
| `SF15-T02-TypeScript-Contracts.md` | AI contracts + constants |
| `SF15-T03-AiAssistApi-and-Action-Registry.md` | API invoke contract + action registration |
| `SF15-T04-Hooks.md` | useAiAction + useAiActions behavior |
| `SF15-T05-HbcAiActionMenu.md` | action trigger/menu behavior |
| `SF15-T06-HbcAiResultPanel-and-LoadingState.md` | output rendering + loading/cancel behavior |
| `SF15-T07-Reference-Integrations.md` | complexity/versioning/handoff/notifications/annotations references |
| `SF15-T08-Testing-Strategy.md` | testing fixtures + test matrix |
| `SF15-T09-Testing-and-Deployment.md` | checklist, ADR/docs/index/state-map updates |
