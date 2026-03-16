# @hbc/ai-assist

> **Phase 1 Scope:** `@hbc/ai-assist` is deferred from Phase 1 scope per P0-A2 D-010 resolution (2026-03-16). A Mandatory Pre-Implementation Research Directive applies. Core dependency `@hbc/strategic-intelligence` is scaffold-only. Phase N assignment TBD via OD-013 in P0-E2 Open Decisions Register.

Contextual AI action layer for HB Intel — Azure AI Foundry integration.

## 1. Overview — Named-Action AI Model

`@hbc/ai-assist` provides named, contextual AI actions directly in record workflows. Each action is a registered `IAiActionDefinition` with explicit record-type targeting, model-key resolution, trust-level classification, and relevance scoring. Data stays within the Microsoft tenant boundary; structured outputs are reviewed by users before committing.

## 2. Quick Start

```tsx
import { useAiActions, HbcAiActionMenu } from '@hbc/ai-assist';

function MyToolbar() {
  const { actions } = useAiActions('scorecard');
  return <HbcAiActionMenu recordType="scorecard" />;
}
```

```tsx
// Testing utilities
import { createMockAiAction, mockAiActionStates } from '@hbc/ai-assist/testing';
```

## 3. Azure AI Foundry Tenant-Boundary Architecture

All AI invocations route through an Azure Functions proxy within the organization's Microsoft tenant. The `AiModelRegistry` resolves logical model keys to tenant-specific Azure AI Foundry deployments. No data leaves the tenant boundary. Rate limiting, token budgets, and policy controls are enforced at the proxy layer.

## 4. Unified Project Canvas Toolbar Entrypoint

A single global `✨ AI Assist` toolbar button in `@hbc/project-canvas` renders a merged, grouped action popover. Actions are filtered by record type, auth role, and complexity tier, then ranked by the `RelevanceScoringEngine` using `relevanceTags`, `basePriorityScore`, context signals, role, complexity, and usage history.

## 5. Smart Insert + Trust Meter + `'ai-assisted'` Commit Flow

AI results appear in an inline **Smart Insert** overlay anchored to the triggering Canvas card. The overlay provides schema-driven auto-mapping, per-field accept, Apply All, and live diff. Committing creates an `'ai-assisted'` versioned-record snapshot.

The **Trust Meter** provides progressive confidence disclosure:
- **Essential:** Badge + disclaimer
- **Standard:** Badge + short rationale
- **Expert:** Full confidence details + token usage

## 6. Model Registry and Governance Portal

The `AiModelRegistry` maps logical model keys to Azure AI Foundry deployment configurations, injecting resolved model/version/source lineage into trust, audit, and reporting surfaces.

The admin-only **AI Governance Portal** (`HbcAiGovernancePortal`) provides:
- Full audit trail of all AI invocations
- Policy controls and approval workflows
- Analytics and source transparency reports
- Rate-limit status and token budget monitoring

## 7. Exports

| Export | Description |
|--------|-------------|
| `IAiActionDefinition` | Named AI action contract |
| `IAiActionResult` | Invocation result shape |
| `IAiAuditRecord` | Audit trail record |
| `IAiModelRegistration` | Model registry entry |
| `IRelevanceScore` | Scoring engine output |
| `AiTrustLevel` | `'essential' \| 'standard' \| 'expert'` |
| `registerAiAction` | Register a single AI action |
| `registerAiActions` | Register multiple AI actions |
| `AiActionRegistry` | Action registry singleton |
| `AiModelRegistry` | Model resolution registry |
| `RelevanceScoringEngine` | Dynamic action ranking |
| `AiGovernanceApi` | Governance/analytics endpoints |
| `AiAuditWriter` | Audit record persistence |
| `AiAssistApi` | Core invoke/cancel API |
| `useAiAction` | Single action invoke hook |
| `useAiActions` | Action discovery hook |
| `HbcAiActionMenu` | Toolbar action popover |
| `HbcAiSmartInsertOverlay` | Inline result acceptance |
| `HbcAiTrustMeter` | Confidence disclosure |
| `HbcAiGovernancePortal` | Admin governance portal |
| `HbcAiLoadingState` | Streaming-aware loading |
| `HbcAiResultPanel` | Compatibility wrapper for Smart Insert |

**Testing sub-path** (`@hbc/ai-assist/testing`):
`createMockAiAction`, `createMockPromptPayload`, `createMockAiActionResult`, `createMockAiAuditRecord`, `createMockAiModelRegistration`, `createMockSmartInsertResult`, `mockAiActionStates`

## 8. Architecture Boundary Rules

- `@hbc/ai-assist` depends on `@hbc/auth` (tenant context, role resolution) and `@hbc/versioned-record` (audit trail persistence).
- Feature packages consume `@hbc/ai-assist` — never the reverse.
- No direct Azure SDK imports in this package; all cloud calls route through the backend proxy contract.
- The package does not import `@hbc/project-canvas`; canvas integration is via the extension-point `registerAiActions` contract.

## 9. Related Documentation

- **SF15 Master Plan:** `docs/architecture/plans/shared-features/SF15-AI-Assist.md`
- **SF15-T09 Testing & Deployment:** `docs/architecture/plans/shared-features/SF15-T09-Testing-and-Deployment.md`
- **ADR-0104:** `docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md`
- **Adoption Guide:** `docs/how-to/developer/ai-assist-adoption-guide.md`
- **API Reference:** `docs/reference/ai-assist/api.md`

## 10. Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.
