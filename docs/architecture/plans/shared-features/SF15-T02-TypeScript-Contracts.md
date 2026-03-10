# SF15-T02 — TypeScript Contracts: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-03, D-04, D-05, D-06
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF15-T02 contracts task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Define public contracts for AI actions, prompt payloads, parseable outputs, and record-specific AI config.

---

## Core Contracts

```typescript
export interface IAiAction {
  actionKey: string;
  label: string;
  description: string;
  icon?: string;
  minComplexity?: ComplexityTier;
  allowedRoles?: string[];
  buildPrompt: (record: unknown) => IAiPromptPayload;
  parseResponse: (rawResponse: string) => IAiActionResult;
}

export interface IAiPromptPayload {
  systemInstruction: string;
  userPrompt: string;
  contextData?: Record<string, unknown>;
  modelDeployment: string;
  maxTokens?: number;
  temperature?: number;
}

export interface IAiActionResult {
  outputType: 'text' | 'bullet-list' | 'structured-object';
  text?: string;
  items?: string[];
  data?: Record<string, unknown>;
  confidence?: 'high' | 'medium' | 'low';
  rationale?: string;
}

export interface IAiAssistConfig<T> {
  recordType: string;
  actions: IAiAction[];
  excludeFields?: Array<keyof T>;
}
```

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist check-types
pnpm --filter @hbc/ai-assist build
```
