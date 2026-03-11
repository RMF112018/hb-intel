# PH7-SF-15: `@hbc/ai-assist` — Contextual AI Action Layer (Azure AI Foundry)
 
**Priority Tier:** 3 — Intelligence Layer (enhances modules; not a blocker for core workflows)
**Package:** `packages/ai-assist/`
**Interview Decision:** Q19 — Option B confirmed; Azure AI Foundry (or equivalent Microsoft AI embed service) required for model integration to keep data within Microsoft tenant boundary
**Mold Breaker Source:** UX-MB §12 (AI Action Layer); ux-mold-breaker.md Signature Solution #12; con-tech-ux-study §12 (AI assistance gap)
 
---
 
## Problem Solved
 
Construction management requires frequent synthesis of complex information: summarizing a 60-criteria Go/No-Go Scorecard into an executive briefing, generating a pre-bid risk assessment from project details, drafting a Post-Bid Learning autopsy from win/loss data, or surfacing the key constraints that drove a project overrun.
 
Current construction platforms offer no AI assistance for these tasks — users copy data from the platform into ChatGPT or Copilot, losing context, risking data privacy, and severing the AI output from the platform workflow. The output is a document in someone's Downloads folder, not a structured contribution to the project record.
 
`@hbc/ai-assist` provides **in-context AI actions** directly within the platform:
- AI actions are triggered from the single global `✨ AI Assist` entrypoint in Project Canvas and are merged from registered modules — no copy-paste required
- AI uses the full record context (not just what the user chooses to paste)
- AI output streams directly into an inline Smart Insert overlay anchored to the source card, with drag/drop or schema-driven mapping before acceptance
- AI output can be accepted per-field or with one-click “Apply All,” with live diff highlighting and automatic `'ai-assisted'` version snapshots on commit
- All data stays within the Microsoft tenant boundary (Azure AI Foundry)
- AI actions are role-appropriate and complexity-appropriate, relevance-ranked by context, and governed through auditable policies
 
**Mandatory research requirement (non-negotiable):** Before drafting technical plans or implementation for this package, teams and agents must complete exhaustive Azure AI Foundry research covering deployment models, Server-Sent Events streaming patterns, token/cost management, security and tenant-boundary controls, governance and audit APIs, rate limiting, model registry patterns, compliance mechanisms, and current 2026 best practices.
 
---
 
## Mold Breaker Rationale
 
The ux-mold-breaker.md Signature Solution #12 (AI Action Layer) specifies: "AI actions are contextual, not conversational. The user does not chat with the AI — they invoke specific, named actions appropriate to their current context, and the AI uses the full record as its context." Operating Principle §7.7 (AI-augmented, not AI-replaced) requires that AI actions surface suggestions for human review, not take autonomous action.
 
The con-tech UX study §12 identifies AI assistance as the largest capability gap across all seven evaluated platforms — none integrate AI meaningfully into workflow. HB Intel's `@hbc/ai-assist` takes a different approach from general AI chat: **named, purposeful actions tied to specific records**, not a general-purpose chatbot. The refined architecture extends this model with unified canvas action discovery, Smart Insert acceptance, progressive trust transparency, complete governance/audit controls, multi-model tenant registry support, and relevance-ranked action delivery.
 
---
 
## Microsoft Tenant Boundary Requirement
 
All AI model integration must use Azure AI Foundry (or an equivalent Microsoft AI embed service) to ensure:
- Project data never leaves the Microsoft tenant boundary
- All AI processing is subject to the organization's Microsoft data governance policies
- No data is used to train external models
- Compliance with construction industry data sensitivity requirements
 
**Architecture:** HB Intel record data → Azure Functions → Azure AI Foundry (GPT-4o or equivalent) → streamed structured response → Smart Insert overlay in HB Intel UI
 
**Research gate (required):** Package README, ADR, and implementation plans must explicitly document completed Azure AI Foundry research findings prior to any build start.
 
---
 
## Confirmed Phase 7 AI Actions
 
| Action Key | Triggered From | Input Context | Output |
|---|---|---|---|
| `summarize-scorecard` | BD Go/No-Go Scorecard | All scorecard fields + scoring | Executive summary paragraph |
| `risk-assessment` | BD Scorecard / Estimating Pursuit | Project details + historical data | Structured risk items with severity |
| `draft-learning-loop` | Post-Bid Learning Loop | Win/loss data + project details | Structured autopsy draft |
| `constraint-analysis` | Project Hub constraints | Constraint list + schedule | Critical path analysis summary |
| `generate-context-notes` | `@hbc/workflow-handoff` | Source record snapshot | Suggested handoff context notes |
| `intelligence-contribution` | Living Strategic Intelligence | Project + market data | Drafted intelligence contribution |
 
All six actions ship as curated built-in defaults inside `@hbc/ai-assist`, fully migrated to: unified toolbar discovery (`registerAiActions`), relevance-ranked ordering, model-key resolution through `AiModelRegistry`, Smart Insert acceptance, Trust Meter confidence details, and complete audit/governance instrumentation.
 
---
 
## Interface Contract
 
```typescript
// packages/ai-assist/src/types/IAiAssist.ts
 
export type AiOutputType = 'text' | 'bullet-list' | 'structured-object';

export interface IAiAction {
  /** Unique action identifier */
  actionKey: string;
  /** Display label for the UI */
  label: string;
  /** Description shown in the action menu */
  description: string;
  /** Icon key from @hbc/ui-kit icons */
  icon?: string;
  /** Context tags used by relevance engine */
  relevanceTags?: string[];
  /** Optional static bias for sort ranking */
  basePriorityScore?: number;
  /** Logical model key resolved by AiModelRegistry */
  modelKey: string;
  /** Minimum complexity tier to expose this action */
  minComplexity?: ComplexityTier;
  /** Roles that can invoke this action */
  allowedRoles?: string[];
  /** Build the prompt from the record context */
  buildPrompt: (record: unknown) => IAiPromptPayload;
  /** Parse the AI response into structured output */
  parseResponse: (rawResponse: string) => IAiActionResult;
}

export type AiActionDefinition = IAiAction;

export interface IAiPromptPayload {
  systemInstruction: string;
  userPrompt: string;
  /** Optional structured context included as JSON in the prompt */
  contextData?: Record<string, unknown>;
  /** Logical model key; deployment resolved server-side */
  modelKey: string;
  /** Max tokens for response */
  maxTokens?: number;
  temperature?: number;
}

export interface IAiConfidenceDetails {
  /** Numeric confidence score in 0..1 range */
  confidenceScore: number;
  /** Human-readable confidence badge value */
  confidenceBadge: 'high' | 'medium' | 'low';
  /** Short rationale for Standard users */
  rationaleShort?: string;
  /** Full rationale for Expert users */
  rationaleLong?: string;
  /** Source lineage used to produce output */
  citedSources: Array<{ key: string; label: string; uri?: string }>;
  /** Resolved model deployment metadata */
  modelDeploymentName: string;
  modelDeploymentVersion: string;
  /** Token and cost telemetry */
  tokenUsage?: { prompt: number; completion: number; total: number; estimatedCostUsd?: number };
}

export interface IAiActionResult {
  /** Structured output type */
  outputType: AiOutputType;
  /** For 'text' output */
  text?: string;
  /** For 'bullet-list' output */
  items?: string[];
  /** For 'structured-object' output */
  data?: Record<string, unknown>;
  /** Progressive trust model payload */
  confidenceDetails: IAiConfidenceDetails;
}

export interface IAiActionInvokeContext {
  userId: string;
  role: string;
  recordType: string;
  recordId: string;
  complexity: ComplexityTier;
  siteId?: string;
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

export interface IAiAssistPolicy {
  disableActions?: string[];
  rateLimitPerHourByRole?: Record<string, number>;
  requireApprovalActions?: string[];
  confidenceEscalationThreshold?: number;
}

export interface IAiAssistConfig<T> {
  /** Record type this config applies to */
  recordType: string;
  /** Available AI actions for this record type */
  actions: IAiAction[];
  /** Fields to exclude from AI context (sensitive data) */
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
 
## Package Architecture
 
```
packages/ai-assist/
├── package.json
├── tsconfig.json
├── README.md                               # includes mandatory Azure AI Foundry research gate before planning/implementation
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IAiAssist.ts
│   │   └── index.ts
│   ├── registry/
│   │   ├── AiActionRegistry.ts             # registerAiAction/registerAiActions extension-point API
│   │   ├── AiModelRegistry.ts              # logical model-key resolution from tenant config
│   │   └── RelevanceScoringEngine.ts       # dynamic action ranking by context/role/complexity/usage history
│   ├── api/
│   │   └── AiAssistApi.ts                  # Azure Functions AI proxy endpoint + SSE stream controls
│   ├── hooks/
│   │   ├── useAiAction.ts                  # invoke action, track loading/streaming/result state, cancel support
│   │   └── useAiActions.ts                 # merged global actions, filtered/ranked for current record + role
│   ├── governance/
│   │   ├── AiGovernanceApi.ts              # policy and analytics queries
│   │   └── AiAuditWriter.ts                # emits IAiAuditRecord to @hbc/versioned-record
│   └── components/
│       ├── HbcAiActionMenu.tsx             # global toolbar popover menu (merged/grouped actions)
│       ├── HbcAiSmartInsertOverlay.tsx     # inline acceptance overlay replacing legacy result panel
│       ├── HbcAiTrustMeter.tsx             # Essential/Standard/Expert trust disclosure
│       ├── HbcAiLoadingState.tsx           # inline streaming progress + cancel
│       ├── HbcAiGovernancePortal.tsx       # admin-only governance and audit analytics surface
│       └── index.ts
```
 
---
 
## Component Specifications
 
### `HbcAiActionMenu` — AI Action Trigger
 
```typescript
interface HbcAiActionMenuProps<T> {
  record: T;
  config: IAiAssistConfig<T>;
  /** Global toolbar host context (Project Canvas) */
  host: 'project-canvas-toolbar';
}
```
 
**Visual behavior:**
- A single global "✨ AI Assist" button is rendered by `@hbc/project-canvas` toolbar (no local button proliferation)
- Clicking opens one merged popover of all registered actions grouped by record-type context
- Actions are filtered by record type, `@hbc/auth` role policy, and `@hbc/complexity` tier
- Actions are relevance-ranked by context, role, tier, and usage history, with admin override support
- Selecting an action invokes `useAiAction` and opens the Smart Insert overlay with inline streaming
 
### `HbcAiResultPanel` — AI Output Display
 
```typescript
interface HbcAiResultPanelProps {
  result: IAiActionResult;
  actionLabel: string;
  /** Smart Insert acceptance callback */
  onAcceptMapping?: (mapping: IAiSmartInsertMapping) => void;
  /** Apply all accepted mappings */
  onApplyAll?: () => void;
  /** Commit accepted mappings and create ai-assisted snapshot */
  onCommit: () => void;
  onDismiss: () => void;
}
```
 
**Visual behavior:**
- Implemented as an intelligent inline Smart Insert overlay anchored directly to the triggering Canvas card
- Streaming output appears in place (character-by-character or line-by-line) for text, bullets, or structured field suggestions
- Schema-aware auto-mapping uses `@hbc/versioned-record` introspection; drag/drop remapping is available for manual alignment
- Live diff highlighting shows proposed vs current field values
- CTAs: per-field accept, "Apply All," "Commit to record," and "Dismiss"
- Commit triggers automatic version snapshot tagged `'ai-assisted'`
- Trust Meter appears in overlay header area with progressive disclosure:
  - Essential: confidence badge + disclaimer only
  - Standard: confidence badge + short rationale
  - Expert: full trust details (numeric score, cited sources, model deployment/version, expandable rationale, token usage)
 
### `HbcAiLoadingState` — Streaming Indicator
 
- True inline streaming renderer in Smart Insert overlay (no detached loading panel)
- Subtle progress indicator in the Trust Meter area
- Essential users see clean growing content only; Expert users additionally see live token usage
- Cancel button immediately terminates Azure Functions SSE stream
 
---
 
## AI Action Example — Scorecard Executive Summary
 
```typescript
// In BD module ai-assist config
import { IAiAssistConfig, registerAiActions } from '@hbc/ai-assist';
import { IGoNoGoScorecard } from '../types';
 
export const scorecardAiConfig: IAiAssistConfig<IGoNoGoScorecard> = {
  recordType: 'bd-scorecard',
  excludeFields: ['internalNotes', 'competitorIntelligence'],
  actions: [
    {
      actionKey: 'summarize-scorecard',
      label: 'Generate Executive Summary',
      description: 'Summarize this scorecard into a concise executive briefing for leadership.',
      minComplexity: 'standard',
      allowedRoles: ['BD Manager', 'Director of Preconstruction', 'VP of Operations'],
      relevanceTags: ['executive-summary', 'go-no-go', 'leadership-brief'],
      basePriorityScore: 85,
      modelKey: 'summary-default',
      buildPrompt: (scorecard) => ({
        systemInstruction: `You are an assistant for a general contractor's business development team.
          You help summarize Go/No-Go scorecards into concise executive briefings.
          Be factual, highlight key risk factors, and recommend a decision if the data supports one.
          Do not invent data not present in the scorecard.`,
        userPrompt: `Summarize this Go/No-Go Scorecard for the project "${scorecard.projectName}"
          owned by ${scorecard.ownerName}. The scorecard scored ${scorecard.totalScore}/100.
          Here is the full scoring detail:`,
        contextData: {
          projectName: scorecard.projectName,
          ownerName: scorecard.ownerName,
          totalScore: scorecard.totalScore,
          scoringBreakdown: scorecard.scoringBreakdown,
          keyRisks: scorecard.keyRisks,
          workflowStage: scorecard.workflowStage,
        },
        modelKey: 'summary-default',
        maxTokens: 500,
        temperature: 0.3,
      }),
      parseResponse: (raw) => ({
        outputType: 'structured-object',
        data: {
          executiveSummary: raw.trim(),
          suggestedMappings: [
            { fieldKey: 'executiveSummary', suggestedValue: raw.trim(), sourcePath: 'response.summary' },
          ],
        },
        confidenceDetails: {
          confidenceScore: 0.86,
          confidenceBadge: 'high',
          rationaleShort: 'High alignment with scorecard risk and scoring inputs.',
          rationaleLong: 'Summary was generated from weighted score bands, key risks, and workflow stage metadata.',
          citedSources: [
            { key: 'scorecard.scoringBreakdown', label: 'Scoring Breakdown' },
            { key: 'scorecard.keyRisks', label: 'Key Risks' },
          ],
          modelDeploymentName: 'resolved-server-side',
          modelDeploymentVersion: 'resolved-server-side',
        },
      }),
    },
  ],
};

registerAiActions({ recordType: 'bd-scorecard', actions: scorecardAiConfig.actions });
```
 
---
 
## Azure Functions Backend
 
All AI actions route through an Azure Functions endpoint to prevent direct model API key exposure in the client:
 
```
POST /api/ai-assist/invoke
Body: {
  actionKey: string,
  modelKey: string,
  systemInstruction: string,
  userPrompt: string,
  contextData: Record<string, unknown>,
  maxTokens: number,
  temperature: number,
  recordType: string,
  recordId: string
}
→ resolve modelKey via AiModelRegistry + tenant config
→ enforce auth/policy/rate-limit/approval rules
→ Azure AI Foundry / OpenAI Service (within tenant)
→ SSE stream chunks + completion payload with confidenceDetails
→ emit IAiAuditRecord to @hbc/versioned-record
```
 
The Azure Functions endpoint enforces:
- User authentication (valid HB Intel session)
- Rate limiting (per user, per role, per site, per action policy)
- Policy enforcement (disabled actions, approval-required actions, threshold checks)
- Audit logging (complete `IAiAuditRecord` with model resolution and context lineage)
- Sensitive field filtering (double-checks `excludeFields` server-side)
- Immediate stream termination on cancel requests
 
---
 
## Integration Points
 
| Package | Integration |
|---|---|
| `@hbc/project-canvas` | Renders the single global `✨ AI Assist` toolbar button and merged/grouped action popover via `registerAiActions` |
| `@hbc/complexity` | Action filtering and Trust Meter progressive disclosure (Essential badge-only, Standard short rationale, Expert full diagnostics/token telemetry) |
| `@hbc/versioned-record` | Smart Insert commits create snapshot tagged `'ai-assisted'`; all invocations emit versioned `IAiAuditRecord`; usage history contributes to relevance scoring |
| `@hbc/workflow-handoff` | `generate-context-notes` AI action auto-populates handoff context notes |
| `@hbc/notification-intelligence` | Invoker gets inline completion badge; stakeholders get context-sensitive digest cards; admins get governance alerts only for policy violations/low-confidence events |
| `@hbc/auth` | Tenant policy enforcement for role/site limits, action availability, approval gating, and model registry configuration |
| `@hbc/field-annotations` | AI results can be staged as annotations prior to final Smart Insert commit when review workflow is required |
 
---
 
## SPFx Constraints
 
- The single AI entrypoint is hosted in Project Canvas global toolbar and is supported in SPFx webpart contexts
- Smart Insert overlay renders inline against Canvas cards using SPFx-safe app-shell primitives
- All AI API calls route through Azure Functions — no direct Azure AI Foundry calls from client
- Streaming responses use Server-Sent Events (SSE) from Azure Functions; cancel must terminate stream immediately in SPFx modern browser contexts
- Governance Portal is admin-only and must honor SPFx-safe routing/shell constraints
 
---
 
## Priority & ROI
 
**Priority:** P2 — High-value differentiator but not a blocker for core workflow completion; ship after core modules are stable
**Estimated build effort:** 4–5 sprint-weeks (Azure Functions proxy, Smart Insert + Trust Meter surfaces, 6 migrated actions, streaming/governance/model-registry integration)
**ROI:** Eliminates the "copy to ChatGPT" data risk; keeps AI output inside the platform workflow; adds governed trust transparency, auditability, and tenant-safe multi-model control while preserving human review and acceptance
 
---
 
## Definition of Done
 
- [ ] `IAiAssistConfig<T>`, `AiActionDefinition`, and registration APIs (`registerAiAction`, `registerAiActions`) defined and exported
- [ ] `AiModelRegistry` implemented with tenant-configured logical model keys and role/site enforcement
- [ ] Azure Functions `POST /api/ai-assist/invoke` endpoint with auth, policy checks, rate limiting, audit logging, SSE streaming, and cancel hard-stop
- [ ] Azure AI Foundry deployment configured within tenant boundary and resolved only via model-key registry
- [ ] `useAiAction` invokes action, manages loading/inline-streaming/result/cancel state
- [ ] `useAiActions` returns merged, filtered, grouped, and relevance-ranked action list for current context
- [ ] Single global Project Canvas toolbar `HbcAiActionMenu` renders merged action popover
- [ ] Smart Insert overlay (replacing legacy standalone result panel) supports drag/drop and schema-driven auto-mapping with live diffs
- [ ] Per-field acceptance, Apply All, and Commit flows implemented; commit creates version snapshot tagged `'ai-assisted'`
- [ ] Trust Meter progressive disclosure implemented from `confidenceDetails` by complexity tier
- [ ] `IAiAuditRecord` emitted for every invocation and queryable in admin governance analytics
- [ ] Admin-only AI Governance Portal implemented (action disable, rate limits, approval policy, transparency reports, admin overrides)
- [ ] All 6 Phase 7 AI actions migrated to new contracts and shipped as curated defaults
- [ ] Sensitive field exclusion enforced both client-side and server-side
- [ ] Notification integration implemented for invoker inline completion, stakeholder digest cards, and governance-only admin alerts
- [ ] Relevance scoring uses context + role + complexity + usage history with admin override path
- [ ] Unit tests on `buildPrompt` and `parseResponse` for all 6 actions plus confidenceDetails/model-key contracts
- [ ] E2E test: invoke summarize-scorecard → stream to Smart Insert → apply mapping → commit → `'ai-assisted'` snapshot + audit record created
- [ ] Mandatory pre-implementation Azure AI Foundry research completed and documented in package README, ADR, and implementation plan artifacts
 
---
 
## ADR Reference
 
Create `docs/architecture/adr/0024-ai-assist-azure-foundry-integration.md` documenting the decision to use Azure AI Foundry for tenant-boundary compliance, the named-action model vs. chatbot model rationale, extension-point action registration (`registerAiAction`/`registerAiActions`), Smart Insert inline acceptance architecture, Trust Meter confidence transparency (`confidenceDetails`), SSE streaming and cancel control, full `IAiAuditRecord` governance trail and admin portal policy enforcement, multi-model logical `AiModelRegistry` with tenant configuration, relevance-ranked action discovery with overrides, and the mandatory pre-implementation Azure AI Foundry research requirement.
