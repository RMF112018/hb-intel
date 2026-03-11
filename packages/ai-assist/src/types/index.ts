/**
 * @hbc/ai-assist — Type contracts (SF15-T02)
 *
 * Authoritative contract layer for the AI action system.
 * Decisions applied: D-02 (Smart Insert), D-03 (Trust Meter),
 * D-05 (Governance), D-07 (Multi-model), D-08 (Action discovery), D-10 (Testing).
 */

import type { ComplexityTier } from '@hbc/complexity';

export type { ComplexityTier } from '@hbc/complexity';

// ---------------------------------------------------------------------------
// Trust level (retained from T01)
// ---------------------------------------------------------------------------

/** Trust level applied to AI-generated results for progressive disclosure. */
export type AiTrustLevel = 'essential' | 'standard' | 'expert';

// ---------------------------------------------------------------------------
// Relevance score (retained from T01)
// ---------------------------------------------------------------------------

/** Relevance score computed by the RelevanceScoringEngine for action ranking. */
export interface IRelevanceScore {
  readonly actionId: string;
  readonly score: number;
  readonly factors: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Output type
// ---------------------------------------------------------------------------

export type AiOutputType = 'text' | 'bullet-list' | 'structured-object';

// ---------------------------------------------------------------------------
// Action definition (replaces IAiActionDefinition)
// ---------------------------------------------------------------------------

/** Definition of a named AI action registered via registerAiAction. */
export interface IAiAction {
  readonly actionKey: string;
  readonly label: string;
  readonly description: string;
  readonly icon?: string;
  readonly modelKey: string;
  readonly relevanceTags?: readonly string[];
  readonly basePriorityScore?: number;
  readonly minComplexity?: ComplexityTier;
  readonly allowedRoles?: readonly string[];
  readonly buildPrompt: (record: unknown) => IAiPromptPayload;
  readonly parseResponse: (rawResponse: string) => IAiActionResult;
}

/** Alias retained for backward compatibility with registerAiAction signatures. */
export type AiActionDefinition = IAiAction;

// ---------------------------------------------------------------------------
// Prompt payload
// ---------------------------------------------------------------------------

export interface IAiPromptPayload {
  readonly systemInstruction: string;
  readonly userPrompt: string;
  readonly contextData?: Record<string, unknown>;
  readonly modelKey: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
}

// ---------------------------------------------------------------------------
// Confidence details (D-03 Trust Meter)
// ---------------------------------------------------------------------------

export interface IAiConfidenceDetails {
  readonly confidenceScore: number;
  readonly confidenceBadge: 'high' | 'medium' | 'low';
  readonly rationaleShort?: string;
  readonly rationaleLong?: string;
  readonly citedSources: ReadonlyArray<{ key: string; label: string; uri?: string }>;
  readonly modelDeploymentName: string;
  readonly modelDeploymentVersion: string;
  readonly tokenUsage?: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
    readonly estimatedCostUsd?: number;
  };
}

// ---------------------------------------------------------------------------
// Action result
// ---------------------------------------------------------------------------

/** Result returned from an AI action invocation. */
export interface IAiActionResult {
  readonly outputType: AiOutputType;
  readonly text?: string;
  readonly items?: readonly string[];
  readonly data?: Record<string, unknown>;
  readonly confidenceDetails: IAiConfidenceDetails;
}

// ---------------------------------------------------------------------------
// Smart Insert (D-02)
// ---------------------------------------------------------------------------

export interface IAiSmartInsertMapping {
  readonly fieldKey: string;
  readonly suggestedValue: unknown;
  readonly sourcePath?: string;
  readonly confidence?: number;
}

export interface IAiSmartInsertResult {
  readonly mappings: readonly IAiSmartInsertMapping[];
  readonly canApplyAll: boolean;
  readonly supportsDragDrop: boolean;
}

// ---------------------------------------------------------------------------
// Audit record (D-05 Governance)
// ---------------------------------------------------------------------------

/** Audit record emitted for every AI action invocation. */
export interface IAiAuditRecord {
  readonly auditId: string;
  readonly actionKey: string;
  readonly recordType: string;
  readonly recordId: string;
  readonly invokedByUserId: string;
  readonly invokedAtUtc: string;
  readonly modelKey: string;
  readonly resolvedModelName: string;
  readonly resolvedModelVersion: string;
  readonly contextSourceKeys: readonly string[];
  readonly policyDecision: 'allowed' | 'blocked' | 'approval-required';
  readonly policyNotes?: readonly string[];
  readonly rateLimitBucket: string;
  readonly outcome: 'success' | 'cancelled' | 'failed';
  readonly tokenUsage?: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
  readonly confidenceScore?: number;
  readonly snapshotTag?: 'ai-assisted';
}

// ---------------------------------------------------------------------------
// Model registry (D-07 Multi-model)
// ---------------------------------------------------------------------------

/** Registration entry for a model in the AiModelRegistry. */
export interface IAiModelRegistration {
  readonly modelKey: string;
  readonly displayName: string;
  readonly deploymentName: string;
  readonly deploymentVersion: string;
  readonly allowedRoles?: readonly string[];
  readonly maxTokensDefault?: number;
}

export interface IAiModelRegistry {
  registerModel: (model: IAiModelRegistration) => void;
  resolveModel: (modelKey: string, context: IAiActionInvokeContext) => IAiModelRegistration;
  listModels: () => readonly IAiModelRegistration[];
}

// ---------------------------------------------------------------------------
// Invoke context
// ---------------------------------------------------------------------------

export interface IAiActionInvokeContext {
  readonly userId: string;
  readonly role: string;
  readonly recordType: string;
  readonly recordId: string;
  readonly complexity: ComplexityTier;
  readonly siteId?: string;
}

// ---------------------------------------------------------------------------
// Policy controls (D-05)
// ---------------------------------------------------------------------------

export interface IAiAssistPolicy {
  readonly disableActions?: readonly string[];
  readonly rateLimitPerHourByRole?: Record<string, number>;
  readonly requireApprovalActions?: readonly string[];
  readonly confidenceEscalationThreshold?: number;
}

// ---------------------------------------------------------------------------
// Config and registration
// ---------------------------------------------------------------------------

export interface IAiAssistConfig<T> {
  readonly recordType: string;
  readonly actions: readonly IAiAction[];
  readonly excludeFields?: ReadonlyArray<keyof T>;
}

export interface IAiActionRegistration {
  readonly recordType: string;
  readonly actions: readonly IAiAction[];
}
