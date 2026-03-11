# AI Assist Adoption Guide

> **Doc Classification:** Living Reference (Diataxis) — How-to quadrant; developer audience; `@hbc/ai-assist` module adoption.

This guide covers integrating the `@hbc/ai-assist` contextual AI action layer into HB Intel feature packages.

---

## 1. When to Use AI Assist Actions

Use `@hbc/ai-assist` when a feature workflow benefits from contextual AI-generated suggestions that users review before committing. The package provides:

- Named actions tied to specific record types (scorecards, estimates, risk assessments, etc.)
- Structured outputs with confidence details and trust transparency
- Full audit trail and governance controls

**Do not use** for batch/background processing, unsupervised automation, or any scenario where AI output bypasses user review.

---

## 2. Defining `AiActionDefinition` and Registering Actions

Every AI action implements the `IAiAction` interface (aliased as `AiActionDefinition`):

```tsx
import { registerAiAction, type AiActionDefinition } from '@hbc/ai-assist';

const myAction: AiActionDefinition = {
  actionKey: 'summarize-scorecard',
  label: 'Summarize Scorecard',
  description: 'Generate an executive summary from scorecard metrics',
  modelKey: 'gpt-4o',
  relevanceTags: ['scorecard', 'summary'],
  basePriorityScore: 80,
  minComplexity: 'standard',
  allowedRoles: ['project-manager', 'executive'],
  buildPrompt: (record) => ({
    systemInstruction: 'You are a construction project analyst...',
    userPrompt: `Summarize the following scorecard: ${JSON.stringify(record)}`,
    modelKey: 'gpt-4o',
  }),
  parseResponse: (raw) => ({
    outputType: 'text',
    text: raw,
    confidenceDetails: {
      confidenceScore: 0.85,
      confidenceBadge: 'high',
      rationaleShort: 'Based on structured scorecard data',
      citedSources: [],
      modelDeploymentName: 'gpt-4o',
      modelDeploymentVersion: '2024-08-06',
    },
  }),
};

registerAiAction('scorecard', myAction);
```

For bulk registration:

```tsx
import { registerAiActions } from '@hbc/ai-assist';

registerAiActions('scorecard', [actionA, actionB, actionC]);
```

---

## 3. Prompt Building and Response Parsing with `confidenceDetails`

Every action must implement `buildPrompt` and `parseResponse`:

- **`buildPrompt(record)`** — Returns an `IAiPromptPayload` with `systemInstruction`, `userPrompt`, `contextData`, and `modelKey`. Exclude sensitive fields before including record data.
- **`parseResponse(rawResponse)`** — Returns an `IAiActionResult` with `outputType` (`'text'`, `'bullet-list'`, or `'structured-object'`) and a mandatory `confidenceDetails` object containing `confidenceScore`, `confidenceBadge`, cited sources, and model deployment info.

The `confidenceDetails` contract drives the Trust Meter display across all complexity tiers.

---

## 4. Enforcing Role, Complexity, Policy, and Sensitive-Field Rules

Actions are filtered and controlled at multiple levels:

- **Role filtering:** Set `allowedRoles` on the action definition. The `useAiActions` hook filters actions by the current user's role.
- **Complexity gating:** Set `minComplexity` to restrict actions to `'essential'`, `'standard'`, or `'expert'` tiers via the Complexity Dial.
- **Policy controls:** The `IAiAssistPolicy` interface supports `disableActions`, `rateLimitPerHourByRole`, `requireApprovalActions`, and `confidenceEscalationThreshold`. These are evaluated by `AiGovernanceApi`.
- **Sensitive field exclusion:** Use `IAiAssistConfig<T>.excludeFields` to declare fields that must never be sent to the AI model. Exclusion is enforced in both client prompt building and server-side proxy validation.

---

## 5. Integrating Smart Insert Acceptance and `'ai-assisted'` Version Commits

When an action completes, results appear in the `HbcAiSmartInsertOverlay`:

1. The overlay provides schema-driven auto-mapping of AI output fields to record fields.
2. Users can accept per-field, use Apply All, or drag-and-drop remap.
3. A live diff shows proposed changes before commitment.
4. Committing creates a versioned-record snapshot tagged with `'ai-assisted'` via `@hbc/versioned-record`.

The `HbcAiResultPanel` component wraps `HbcAiSmartInsertOverlay` for backward-compatible usage in contexts that expect a panel-style interface.

---

## 6. Model Registry and Governance Portal Integration Patterns

### Model Registry

The `AiModelRegistry` resolves logical model keys (e.g., `'gpt-4o'`) to tenant-specific Azure AI Foundry deployments:

```tsx
import { AiModelRegistry } from '@hbc/ai-assist';

const registry = new AiModelRegistry();
const resolved = registry.resolveModel('gpt-4o', invokeContext);
// resolved.deploymentName, resolved.deploymentVersion
```

Model/version/source lineage is injected into trust, audit, and reporting surfaces.

### Governance Portal

The `HbcAiGovernancePortal` is an admin-only extension-point component providing:

- Full audit trail with filtering via `IAuditTrailFilters`
- Policy control management (enable/disable actions, rate limits, approval requirements)
- Analytics dashboards and source transparency reports
- Rate-limit status and token budget monitoring

---

## 7. Using Testing Fixtures from `@hbc/ai-assist/testing`

The testing sub-path provides canonical fixtures for unit and integration tests:

```tsx
import {
  createMockAiAction,
  createMockPromptPayload,
  createMockAiActionResult,
  createMockAiAuditRecord,
  createMockAiModelRegistration,
  createMockSmartInsertResult,
  mockAiActionStates,
} from '@hbc/ai-assist/testing';

// Create a mock action with optional overrides
const action = createMockAiAction({ actionKey: 'test-action' });

// Create mock results with confidence details
const result = createMockAiActionResult({ outputType: 'text' });

// Access predefined state combinations for component testing
const { idle, loading, streaming, complete, error } = mockAiActionStates;
```

All fixtures produce valid contract-compliant objects suitable for snapshot testing and component rendering.

---

## 8. Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.
