# SF15-T08 — Testing Strategy: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-05, D-06, D-08, D-10
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF15-T08 testing strategy task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Define fixtures and tests for action contracts, invoke lifecycle, and output rendering.

---

## Testing Sub-Path

- `createMockAiAction`
- `createMockPromptPayload`
- `createMockAiActionResult`
- `mockAiActionStates`

---

## Required Coverage

- action `buildPrompt` and `parseResponse` tests for all 6 confirmed actions
- hook tests for filtered list and invoke lifecycle
- API tests for payload/response/cancel/error handling
- component tests for action menu and result panel modes
- storybook states for action list and result variants
- Playwright scenario: summarize-scorecard invoke and accept insertion

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test --coverage
pnpm --filter @hbc/ai-assist storybook
pnpm exec playwright test --grep "ai-assist"
```
