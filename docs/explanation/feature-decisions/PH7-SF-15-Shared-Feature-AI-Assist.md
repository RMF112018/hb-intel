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
- AI actions are triggered from within record detail pages — no copy-paste required
- AI uses the full record context (not just what the user chooses to paste)
- AI output can be inserted directly into record fields or saved as structured contributions
- All data stays within the Microsoft tenant boundary (Azure AI Foundry)
- AI actions are role-appropriate (different actions available to different roles)

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #12 (AI Action Layer) specifies: "AI actions are contextual, not conversational. The user does not chat with the AI — they invoke specific, named actions appropriate to their current context, and the AI uses the full record as its context." Operating Principle §7.7 (AI-augmented, not AI-replaced) requires that AI actions surface suggestions for human review, not take autonomous action.

The con-tech UX study §12 identifies AI assistance as the largest capability gap across all seven evaluated platforms — none integrate AI meaningfully into workflow. HB Intel's `@hbc/ai-assist` takes a different approach from general AI chat: **named, purposeful actions tied to specific records**, not a general-purpose chatbot.

---

## Microsoft Tenant Boundary Requirement

All AI model integration must use Azure AI Foundry (or an equivalent Microsoft AI embed service) to ensure:
- Project data never leaves the Microsoft tenant boundary
- All AI processing is subject to the organization's Microsoft data governance policies
- No data is used to train external models
- Compliance with construction industry data sensitivity requirements

**Architecture:** HB Intel record data → Azure Functions → Azure AI Foundry (GPT-4o or equivalent) → structured response → HB Intel UI

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

---

## Interface Contract

```typescript
// packages/ai-assist/src/types/IAiAssist.ts

export interface IAiAction {
  /** Unique action identifier */
  actionKey: string;
  /** Display label for the UI */
  label: string;
  /** Description shown in the action menu */
  description: string;
  /** Icon key from @hbc/ui-kit icons */
  icon?: string;
  /** Minimum complexity tier to expose this action */
  minComplexity?: ComplexityTier;
  /** Roles that can invoke this action */
  allowedRoles?: string[];
  /** Build the prompt from the record context */
  buildPrompt: (record: unknown) => IAiPromptPayload;
  /** Parse the AI response into a structured output */
  parseResponse: (rawResponse: string) => IAiActionResult;
}

export interface IAiPromptPayload {
  systemInstruction: string;
  userPrompt: string;
  /** Optional structured context included as JSON in the prompt */
  contextData?: Record<string, unknown>;
  /** Azure AI Foundry model deployment name */
  modelDeployment: string;
  /** Max tokens for response */
  maxTokens?: number;
  temperature?: number;
}

export interface IAiActionResult {
  /** Structured output type: 'text' | 'bullet-list' | 'structured-object' */
  outputType: 'text' | 'bullet-list' | 'structured-object';
  /** For 'text' output */
  text?: string;
  /** For 'bullet-list' output */
  items?: string[];
  /** For 'structured-object' output */
  data?: Record<string, unknown>;
  /** Confidence level (if computable from model response) */
  confidence?: 'high' | 'medium' | 'low';
  /** Human-readable rationale for Expert-mode transparency */
  rationale?: string;
}

export interface IAiAssistConfig<T> {
  /** Record type this config applies to */
  recordType: string;
  /** Available AI actions for this record type */
  actions: IAiAction[];
  /** Fields to exclude from AI context (sensitive data) */
  excludeFields?: Array<keyof T>;
}
```

---

## Package Architecture

```
packages/ai-assist/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IAiAssist.ts
│   │   └── index.ts
│   ├── api/
│   │   └── AiAssistApi.ts                # Azure Functions AI proxy endpoint
│   ├── hooks/
│   │   ├── useAiAction.ts                # invoke action, track loading/result state
│   │   └── useAiActions.ts               # returns filtered action list for current record + role
│   └── components/
│       ├── HbcAiActionMenu.tsx           # trigger button + action selection popover
│       ├── HbcAiResultPanel.tsx          # displays AI result with accept/edit/dismiss controls
│       ├── HbcAiLoadingState.tsx         # streaming loading indicator
│       └── index.ts
```

---

## Component Specifications

### `HbcAiActionMenu` — AI Action Trigger

```typescript
interface HbcAiActionMenuProps<T> {
  record: T;
  config: IAiAssistConfig<T>;
  /** Where to position the result panel after invocation */
  resultPlacement?: 'sidebar' | 'modal' | 'inline';
}
```

**Visual behavior:**
- Compact "✨ AI Assist" button with sparkle icon
- Clicking opens a popover listing available actions for this record type + user role
- Each action shows: label + description + estimated tokens (Expert mode only)
- Selecting an action invokes `useAiAction` and shows `HbcAiLoadingState`

### `HbcAiResultPanel` — AI Output Display

```typescript
interface HbcAiResultPanelProps {
  result: IAiActionResult;
  actionLabel: string;
  /** Called when user accepts the result (e.g., inserts into field) */
  onAccept?: (result: IAiActionResult) => void;
  /** Called when user wants to edit the result before accepting */
  onEdit?: (result: IAiActionResult) => void;
  onDismiss: () => void;
  /** Whether to show model rationale (Expert mode) */
  showRationale?: boolean;
}
```

**Visual behavior:**
- Panel header: action label + confidence badge (Expert mode)
- Body: rendered output (text / bullet list / structured form)
- Rationale (Expert mode): collapsible "Why did the AI suggest this?" section
- CTAs: "Insert into record" / "Edit before inserting" / "Dismiss"
- Disclaimer: "AI-generated content. Review before saving."

### `HbcAiLoadingState` — Streaming Indicator

- Animated shimmer placeholder matching the output type shape
- Progress message: "Analyzing [record type]..." → "Generating [action label]..."
- Cancel button (stops the Azure Functions stream)

---

## AI Action Example — Scorecard Executive Summary

```typescript
// In BD module ai-assist config
import { IAiAssistConfig } from '@hbc/ai-assist';
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
        modelDeployment: 'gpt-4o',
        maxTokens: 500,
        temperature: 0.3,
      }),
      parseResponse: (raw) => ({
        outputType: 'text',
        text: raw.trim(),
        confidence: 'high',
        rationale: 'Based on scoring criteria weighted by historical win/loss correlation.',
      }),
    },
  ],
};
```

---

## Azure Functions Backend

All AI actions route through an Azure Functions endpoint to prevent direct model API key exposure in the client:

```
POST /api/ai-assist/invoke
Body: {
  actionKey: string,
  modelDeployment: string,
  systemInstruction: string,
  userPrompt: string,
  contextData: Record<string, unknown>,
  maxTokens: number,
  temperature: number
}
→ Azure AI Foundry / OpenAI Service (within tenant)
→ Streamed response or JSON response
```

The Azure Functions endpoint enforces:
- User authentication (valid HB Intel session)
- Rate limiting (per user, per record type)
- Audit logging (which user invoked which action on which record)
- Sensitive field filtering (double-checks `excludeFields` server-side)

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/complexity` | AI action menu hidden in Essential; available in Standard+; rationale and confidence visible in Expert |
| `@hbc/versioned-record` | AI-generated content inserted into record fields triggers a version snapshot tagged `'ai-assisted'` |
| `@hbc/workflow-handoff` | `generate-context-notes` AI action auto-populates handoff context notes |
| `@hbc/notification-intelligence` | AI action completion → Digest notification (no intrusive alert) |
| `@hbc/field-annotations` | AI result can be saved as a field annotation for review before formal insertion |

---

## SPFx Constraints

- `HbcAiActionMenu` available in SPFx webpart contexts (button + popover)
- `HbcAiResultPanel` available as modal in SPFx contexts
- All AI API calls route through Azure Functions — no direct Azure AI Foundry calls from client
- Streaming responses use Server-Sent Events (SSE) from Azure Functions; SSE available in SPFx modern browser contexts

---

## Priority & ROI

**Priority:** P2 — High-value differentiator but not a blocker for core workflow completion; ship after core modules are stable
**Estimated build effort:** 4–5 sprint-weeks (Azure Functions proxy, three components, 6 initial action implementations, streaming integration)
**ROI:** Eliminates the "copy to ChatGPT" data risk; keeps AI output inside the platform workflow; creates a competitive advantage no current construction platform offers

---

## Definition of Done

- [ ] `IAiAssistConfig<T>` contract defined and exported
- [ ] Azure Functions `POST /api/ai-assist/invoke` endpoint with auth, rate limiting, audit logging
- [ ] Azure AI Foundry deployment configured (gpt-4o or equivalent within tenant)
- [ ] `useAiAction` invokes action, manages loading/streaming/result state
- [ ] `useAiActions` returns filtered action list for current user role and complexity tier
- [ ] `HbcAiActionMenu` renders action list popover
- [ ] `HbcAiResultPanel` renders text/list/structured output with accept/edit/dismiss controls
- [ ] `HbcAiLoadingState` renders streaming shimmer with cancel support
- [ ] All 6 Phase 7 AI actions implemented (see action table above)
- [ ] `@hbc/complexity` integration: action menu in Standard+; rationale in Expert
- [ ] `@hbc/versioned-record` integration: AI-assisted inserts tagged `'ai-assisted'`
- [ ] Sensitive field exclusion enforced both client-side and server-side
- [ ] Rate limiting: max 10 AI actions per user per hour (configurable)
- [ ] Unit tests on `buildPrompt` and `parseResponse` for all 6 actions
- [ ] E2E test: invoke summarize-scorecard → result displays → user accepts → field updated

---

## ADR Reference

Create `docs/architecture/adr/0024-ai-assist-azure-foundry-integration.md` documenting the decision to use Azure AI Foundry for tenant-boundary compliance, the named-action model vs. chatbot model rationale, the Azure Functions proxy architecture, and the rate limiting strategy.
