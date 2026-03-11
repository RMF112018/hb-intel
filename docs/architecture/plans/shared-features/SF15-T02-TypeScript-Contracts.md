# SF15-T02 — TypeScript Contracts: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-02, D-03, D-05, D-07, D-08, D-10
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF15-T02 contracts task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Define public contracts for action registration/discovery, prompt payloads, trust metadata, audit/governance records, Smart Insert acceptance, model registry resolution, and policy controls.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## Core Contracts

```typescript
export type AiOutputType = 'text' | 'bullet-list' | 'structured-object';

export interface IAiAction {
  actionKey: string;
  label: string;
  description: string;
  icon?: string;
  modelKey: string;
  relevanceTags?: string[];
  basePriorityScore?: number;
  minComplexity?: ComplexityTier;
  allowedRoles?: string[];
  buildPrompt: (record: unknown) => IAiPromptPayload;
  parseResponse: (rawResponse: string) => IAiActionResult;
}

export type AiActionDefinition = IAiAction;

export interface IAiPromptPayload {
  systemInstruction: string;
  userPrompt: string;
  contextData?: Record<string, unknown>;
  modelKey: string;
  maxTokens?: number;
  temperature?: number;
}

export interface IAiConfidenceDetails {
  confidenceScore: number;
  confidenceBadge: 'high' | 'medium' | 'low';
  rationaleShort?: string;
  rationaleLong?: string;
  citedSources: Array<{ key: string; label: string; uri?: string }>;
  modelDeploymentName: string;
  modelDeploymentVersion: string;
  tokenUsage?: { prompt: number; completion: number; total: number; estimatedCostUsd?: number };
}

export interface IAiActionResult {
  outputType: AiOutputType;
  text?: string;
  items?: string[];
  data?: Record<string, unknown>;
  confidenceDetails: IAiConfidenceDetails;
}

export interface IAiSmartInsertMapping {
  fieldKey: string;
  suggestedValue: unknown;
  sourcePath?: string;
  confidence?: number;
}

export interface IAiSmartInsertResult {
  mappings: IAiSmartInsertMapping[];
  canApplyAll: boolean;
  supportsDragDrop: boolean;
}

export interface IAiAuditRecord {
  auditId: string;
  actionKey: string;
  recordType: string;
  recordId: string;
  invokedByUserId: string;
  invokedAtUtc: string;
  modelKey: string;
  resolvedModelName: string;
  resolvedModelVersion: string;
  contextSourceKeys: string[];
  policyDecision: 'allowed' | 'blocked' | 'approval-required';
  policyNotes?: string[];
  rateLimitBucket: string;
  outcome: 'success' | 'cancelled' | 'failed';
  tokenUsage?: { prompt: number; completion: number; total: number };
  confidenceScore?: number;
  snapshotTag?: 'ai-assisted';
}

export interface IAiModelRegistration {
  modelKey: string;
  displayName: string;
  deploymentName: string;
  deploymentVersion: string;
  allowedRoles?: string[];
  maxTokensDefault?: number;
}

export interface IAiModelRegistry {
  registerModel: (model: IAiModelRegistration) => void;
  resolveModel: (modelKey: string, context: IAiActionInvokeContext) => IAiModelRegistration;
  listModels: () => IAiModelRegistration[];
}

export interface IAiActionInvokeContext {
  userId: string;
  role: string;
  recordType: string;
  recordId: string;
  complexity: ComplexityTier;
  siteId?: string;
}

export interface IAiAssistPolicy {
  disableActions?: string[];
  rateLimitPerHourByRole?: Record<string, number>;
  requireApprovalActions?: string[];
  confidenceEscalationThreshold?: number;
}

export interface IAiAssistConfig<T> {
  recordType: string;
  actions: IAiAction[];
  excludeFields?: Array<keyof T>;
}

export interface IAiActionRegistration {
  recordType: string;
  actions: IAiAction[];
}

export function registerAiAction(action: AiActionDefinition): void;
export function registerAiActions(registration: IAiActionRegistration): void;
```

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist check-types
pnpm --filter @hbc/ai-assist build
rg -n "registerAiAction|registerAiActions|AiActionDefinition|IAiAuditRecord|AiModelRegistry|confidenceDetails" packages/ai-assist/src
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF15-T02 completed: 2026-03-11
- Replaced placeholder types with 17 authoritative contracts per §Core Contracts
- Added @hbc/complexity dependency for ComplexityTier in IAiAction.minComplexity and IAiActionInvokeContext.complexity
- Added 4 constant groups: AI_OUTPUT_TYPES, AI_CONFIDENCE_BADGES, AI_POLICY_DECISIONS, AI_ACTION_OUTCOMES
- Updated barrel exports (removed IAiActionDefinition, added all new types + constants + ComplexityTier re-export)
- Updated downstream stubs: AiActionRegistry, RelevanceScoringEngine, AiAssistApi, hooks (IAiActionDefinition → IAiAction, actionId → actionKey)
- Rewrote all 6 testing mock factories to match new type shapes
- Removed IMockPromptPayload local type in favor of IAiPromptPayload from src/types
- Verification: check-types ✅ | build ✅ | test ✅ (passWithNoTests)
Next: SF15-T03 (AiAssistApi and Action Registry implementation)
-->
