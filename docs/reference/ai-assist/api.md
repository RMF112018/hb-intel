# @hbc/ai-assist — API Reference

> **Doc Classification:** Living Reference (Diataxis) — Reference quadrant; developer audience; `@hbc/ai-assist` API reference.

Complete export reference for the `@hbc/ai-assist` package. All symbols are available from `'@hbc/ai-assist'` unless noted otherwise.

---

## Types

| Export | Kind | Description |
|--------|------|-------------|
| `AiActionDefinition` | Type alias | Alias for `IAiAction`; named action contract for `registerAiAction` |
| `IAiAction` | Interface | Named AI action definition with `actionKey`, `modelKey`, `buildPrompt`, `parseResponse` |
| `IAiPromptPayload` | Interface | Prompt payload sent to the backend proxy (`systemInstruction`, `userPrompt`, `contextData`, `modelKey`) |
| `IAiActionResult` | Interface | Invocation result with `outputType`, content fields, and mandatory `confidenceDetails` |
| `IAiConfidenceDetails` | Interface | Confidence/trust metadata: score, badge, rationale, cited sources, token usage |
| `IAiAuditRecord` | Interface | Audit trail record emitted for every invocation |
| `IAiModelRegistry` | Interface | Model registry contract (`registerModel`, `resolveModel`, `listModels`) |
| `IAiModelRegistration` | Interface | Model registry entry (`modelKey`, `deploymentName`, `deploymentVersion`) |
| `IAiAssistConfig<T>` | Interface | Per-record-type config with `actions` and `excludeFields` |
| `IRelevanceScore` | Interface | Scoring engine output (`actionId`, `score`, `factors`) |
| `IAiSmartInsertMapping` | Interface | Field-level mapping in Smart Insert result |
| `IAiSmartInsertResult` | Interface | Smart Insert result with `mappings`, `canApplyAll`, `supportsDragDrop` |
| `IAiAssistPolicy` | Interface | Policy controls: disabled actions, rate limits, approval requirements |
| `IAiActionInvokeContext` | Interface | Invocation context: user, role, record, complexity, site |
| `IAiActionRegistration` | Interface | Registration entry binding record type to actions |
| `AiTrustLevel` | Type | `'essential' \| 'standard' \| 'expert'` |
| `AiOutputType` | Type | `'text' \| 'bullet-list' \| 'structured-object'` |
| `ComplexityTier` | Type | Re-exported from `@hbc/complexity` |

## Constants

| Export | Description |
|--------|-------------|
| `AI_ASSIST_DEFAULTS` | Default configuration values |
| `AI_TRUST_LEVELS` | Trust level constants |
| `AI_ACTION_CATEGORIES` | Action category identifiers |
| `AI_OUTPUT_TYPES` | Output type constants |
| `AI_CONFIDENCE_BADGES` | Confidence badge values |
| `AI_POLICY_DECISIONS` | Policy decision constants |
| `AI_ACTION_OUTCOMES` | Action outcome constants |

## Registry

| Export | Kind | Description |
|--------|------|-------------|
| `registerAiAction` | Function | Register a single `IAiAction` for a record type |
| `registerAiActions` | Function | Register multiple actions for a record type |
| `AiActionRegistry` | Class | Action registry singleton — stores and retrieves registered actions |
| `AiModelRegistry` | Class | Model registry — resolves logical model keys to tenant deployments |
| `RelevanceScoringEngine` | Class | Dynamic action ranking using `relevanceTags`, `basePriorityScore`, context, role, complexity, and usage history |

## Governance

| Export | Kind | Description |
|--------|------|-------------|
| `AiGovernanceApi` | Class | Policy evaluation, rate-limit status, approval analytics endpoints |
| `AiAuditWriter` | Class | Writes `IAiAuditRecord` through the versioned-record path |
| `IPolicyEvaluation` | Type | Policy evaluation result |
| `IRateLimitStatus` | Type | Rate-limit status for a given role/action |
| `IAuditTrailFilters` | Type | Audit trail query filters |

## API

| Export | Kind | Description |
|--------|------|-------------|
| `AiAssistApi` | Class | Core invoke/stream/cancel API for AI action execution |
| `IAiAssistApi` | Type | API interface contract |
| `IAiActionExecutor` | Type | Executor interface for action invocation |

## Hooks

| Export | Kind | Description |
|--------|------|-------------|
| `useAiAction` | Hook | Single action invoke lifecycle: invoke, stream, cancel, result state |
| `useAiActions` | Hook | Action discovery: filtered, grouped, relevance-ranked actions for a record type |
| `UseAiActionResult` | Type | Return type for `useAiAction` |
| `UseAiActionsResult` | Type | Return type for `useAiActions` |
| `UseAiActionsParams` | Type | Parameters for `useAiActions` |

## Components

| Export | Kind | Description |
|--------|------|-------------|
| `HbcAiActionMenu` | Component | Toolbar action popover — merged, grouped, relevance-ranked action list |
| `HbcAiResultPanel` | Component | Compatibility wrapper — delegates to `HbcAiSmartInsertOverlay` for inline result acceptance |
| `HbcAiSmartInsertOverlay` | Component | Inline Smart Insert overlay with schema-driven mapping, per-field accept, Apply All, live diff |
| `HbcAiTrustMeter` | Component | Progressive confidence disclosure by complexity tier |
| `HbcAiGovernancePortal` | Component | Admin-only governance portal: audit trail, policy controls, analytics |
| `HbcAiLoadingState` | Component | Streaming-aware loading indicator with cancel support |
| `HbcAiSmartInsertOverlayProps` | Type | Props for `HbcAiSmartInsertOverlay` |
| `HbcAiTrustMeterProps` | Type | Props for `HbcAiTrustMeter` |
| `HbcAiGovernancePortalProps` | Type | Props for `HbcAiGovernancePortal` |
| `HbcAiActionMenuProps` | Type | Props for `HbcAiActionMenu` |
| `HbcAiLoadingStateProps` | Type | Props for `HbcAiLoadingState` |
| `HbcAiResultPanelProps` | Type | Props for `HbcAiResultPanel` |

## Reference Integrations

| Export | Kind | Description |
|--------|------|-------------|
| `REFERENCE_MODELS` | Constant | Reference model registry entries for the six built-in actions |
| `REFERENCE_ACTIONS` | Constant | Reference action definitions for the six curated built-in actions |
| `REFERENCE_ACTION_BINDINGS` | Constant | Record-type to action binding map |
| `REFERENCE_POLICY` | Constant | Reference governance policy configuration |
| `ReferenceExecutor` | Class | Reference executor implementation for testing/demo |
| `createReferenceExecutor` | Function | Factory for `ReferenceExecutor` |
| `seedReferenceIntegrations` | Function | Seeds registry with all reference models, actions, and bindings |

## Testing Exports (`@hbc/ai-assist/testing`)

| Export | Kind | Description |
|--------|------|-------------|
| `createMockAiAction` | Function | Creates a mock `IAiAction` with optional overrides |
| `createMockPromptPayload` | Function | Creates a mock `IAiPromptPayload` |
| `createMockAiActionResult` | Function | Creates a mock `IAiActionResult` with valid `confidenceDetails` |
| `createMockAiAuditRecord` | Function | Creates a mock `IAiAuditRecord` |
| `createMockAiModelRegistration` | Function | Creates a mock `IAiModelRegistration` |
| `createMockSmartInsertResult` | Function | Creates a mock `IAiSmartInsertResult` with field mappings |
| `mockAiActionStates` | Object | Predefined action states: `idle`, `loading`, `streaming`, `complete`, `error` |
