# SF15-T03 — AiAssistApi and Action Registry: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-01, D-02, D-07, D-08
**Estimated Effort:** 0.6 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF15-T03 API/registry task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Define the backend proxy invoke contract and local action registration model.

---

## API Contract

- Endpoint: `POST /api/ai-assist/invoke`
- Request body:
  - `actionKey`
  - prompt payload (`systemInstruction`, `userPrompt`, `contextData`, model controls)
  - metadata (`recordType`, `recordId`)
- Response:
  - stream (SSE/chunked) or final payload

Server-side requirements:

- auth validation
- rate limiting (configurable; default 10/hour/user)
- audit log emission
- sensitive-field filtering enforcement

---

## Action Registration Model

- local action set per `IAiAssistConfig<T>`
- no global chatbot action list
- action key uniqueness per record type

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test -- AiAssistApi
pnpm --filter @hbc/ai-assist check-types
```
