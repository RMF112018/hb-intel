# SF15-T09 — Testing and Deployment: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF15-T09 testing/deployment task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Finalize `@hbc/ai-assist` with SF11-grade documentation/deployment closure requirements (ADR template, adoption guide, API reference, README conformance, ADR index update, blueprint progress comment, and current-state-map updates) aligned to locked refined architecture.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## 3-Line Plan

1. Complete tests for extension-point registration, relevance/model-policy behavior, invoke/stream path, Smart Insert acceptance, trust tiers, governance portal, and notification routing.
2. Pass all mechanical enforcement gates with ≥95% coverage and directive/symbol presence checks.
3. Publish ADR-0104 and all required documentation/state-map/index updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification

- [ ] `@hbc/ai-assist` has zero direct model-service calls from client code
- [ ] AI invocation routes through backend proxy only
- [ ] extension-point registration APIs wired (`registerAiAction`, `registerAiActions`)
- [ ] `@hbc/ai-assist` has zero imports of `packages/features/*`
- [ ] app-shell-safe component usage validated for toolbar/overlay/governance portal
- [ ] boundary grep checks return zero prohibited matches

### Type Safety

- [ ] zero TypeScript errors: `pnpm --filter @hbc/ai-assist check-types`
- [ ] action prompt/response contracts enforced end-to-end
- [ ] `IAiActionResult.confidenceDetails` contract enforced across hooks/components/API
- [ ] `IAiAuditRecord` and `AiModelRegistry` contracts stable

### Build & Package

- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve in consuming modules (`AiActionDefinition`, register APIs, hooks, components)
- [ ] turbo build with integrating modules succeeds

### Tests

- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements ≥95)
- [ ] action contract tests complete for all 6 actions and registration flows
- [ ] hooks/API lifecycle tests complete (relevance/model/policy/stream/cancel)
- [ ] toolbar menu/Smart Insert/Trust Meter/loading/governance portal tests complete
- [ ] invoke→stream→accept→commit E2E scenario passing

### Storage/API (AI Proxy + Governance Controls)

- [ ] invoke endpoint contract validated (`modelKey`, `confidenceDetails`, SSE stream semantics)
- [ ] sensitive-field exclusion validated client and server
- [ ] per-role/site/action rate limit enforcement validated
- [ ] `IAiAuditRecord` emission and policy decision capture validated

### Integration

- [ ] project-canvas unified toolbar integration validated
- [ ] auth/model-registry tenant configuration integration validated
- [ ] versioned-record integration validated (`'ai-assisted'` tagging + usage-history scoring inputs)
- [ ] notification-intelligence routing validated for invoker/stakeholder/admin audiences

### Documentation

- [ ] `docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md` written and accepted
- [ ] `docs/how-to/developer/ai-assist-adoption-guide.md` written
- [ ] `docs/reference/ai-assist/api.md` written
- [ ] `packages/ai-assist/README.md` conformance + mandatory directive verified
- [ ] `docs/README.md` ADR index updated with ADR-0104 entry
- [ ] `current-state-map.md §2` updated with SF15 and ADR-0104 linkage

---

## ADR-0104: AI Assist Azure Foundry Integration Primitive

**File:** `docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md`

```markdown
# ADR-0104 — AI Assist Azure Foundry Integration Primitive

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Note:** Source spec PH7-SF-15 referenced ADR-0024. Canonical ADR number for SF15 is ADR-0104.

## Context

AI support in construction workflows is typically externalized, losing context and violating enterprise governance boundaries.

## Decisions

### D-01 — Named Action Model and Unified Canvas Entry
Use contextual named actions registered by extension-point APIs and surfaced through a single Project Canvas toolbar entry.

### D-02 — Tenant Boundary
Route model execution through Azure AI Foundry via backend proxy.

### D-03 — Smart Insert Acceptance Architecture
Use inline Smart Insert overlay for per-field/apply-all acceptance with live diff and versioned commit.

### D-04 — Trust Transparency Model
Require progressive Trust Meter disclosures from `confidenceDetails` by complexity tier.

### D-05 — Access, Policy, and Discovery Controls
Filter actions by role/tier, apply policy overrides, and rank with relevance signals.

### D-06 — Sensitive Field Exclusion
Exclude sensitive fields in both client and server paths.

### D-07 — Governance and Audit
Persist every invocation as `IAiAuditRecord` and provide admin-only AI Governance Portal for analytics/policy/transparency.

### D-08 — Streaming + Cancel
Support true inline stream-capable invocation with immediate cancel hard-stop.

### D-09 — Multi-Model Registry and Integrations
Resolve logical model keys via tenant-governed `AiModelRegistry`; integrate with project-canvas, auth, versioned-record, notifications, handoff, and annotations.

### D-10 — Built-In Action Delivery + Research Mandate
Ship six curated built-in actions on refined contracts and enforce mandatory Azure AI Foundry research before planning/implementation.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/ai-assist-adoption-guide.md`

Required sections:

1. when to use ai-assist actions
2. defining `AiActionDefinition` and registering actions (`registerAiAction`/`registerAiActions`)
3. prompt building and response parsing with `confidenceDetails`
4. enforcing role/complexity/policy/sensitive-field rules
5. integrating Smart Insert acceptance and `'ai-assisted'` version commits
6. model registry and governance portal integration patterns
7. using testing fixtures from `@hbc/ai-assist/testing`
8. exact mandatory pre-implementation research directive text

---

## API Reference

**File:** `docs/reference/ai-assist/api.md`

Must include export table entries for:

- `AiActionDefinition`
- `registerAiAction`
- `registerAiActions`
- `IAiAction`
- `IAiPromptPayload`
- `IAiActionResult`
- `IAiAuditRecord`
- `IAiModelRegistry`
- `IAiAssistConfig<T>`
- `AiAssistApi`
- `useAiAction`
- `useAiActions`
- `HbcAiActionMenu`
- `HbcAiResultPanel` (compat wrapper) / Smart Insert overlay behavior contract
- `HbcAiLoadingState`
- `HbcAiTrustMeter`
- `HbcAiGovernancePortal`
- testing exports (`createMockAiAction`, `createMockPromptPayload`, `createMockAiActionResult`, `createMockAiAuditRecord`, `createMockAiModelRegistration`, `mockAiActionStates`)

---

## Package README Conformance

**File:** `packages/ai-assist/README.md`

Verify README contains:

- purpose and named-action model overview
- quick-start setup
- tenant-boundary and proxy architecture summary
- unified toolbar entrypoint and relevance-ranked action discovery model
- Smart Insert/Trust Meter invoke-result review lifecycle summary
- governance portal and model registry summary
- exports table
- architecture boundary rules
- exact mandatory pre-implementation research directive text
- links to SF15 master plan, T09, ADR-0104, adoption guide, API reference

---

## ADR Index Update

**File:** `docs/README.md`

Append ADR row:

```markdown
| [ADR-0104](architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md) | AI Assist Azure Foundry Integration Primitive | Accepted | 2026-03-10 |
```

---

## current-state-map Update Requirement

**File:** `docs/architecture/blueprint/current-state-map.md`

At implementation closure, update §2 with:

- SF15 shared-feature plans row
- ADR-0104 row linkage
- optional doc rows if authored in same pass:
  - `docs/how-to/developer/ai-assist-adoption-guide.md`
  - `docs/reference/ai-assist/api.md`
- update next unreserved ADR number after ADR-0104 allocation

---

## Final Verification Commands

```bash
# Mechanical enforcement gates
pnpm turbo run build --filter @hbc/ai-assist...
pnpm turbo run lint --filter @hbc/ai-assist...
pnpm --filter @hbc/ai-assist check-types
pnpm --filter @hbc/ai-assist test --coverage

# Boundary checks
grep -r "from 'packages/features/" packages/ai-assist/src/
grep -r "https://" packages/ai-assist/src/ | grep -v "Azure Functions endpoint constants"

# Documentation checks
test -f docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md
test -f docs/how-to/developer/ai-assist-adoption-guide.md
test -f docs/reference/ai-assist/api.md
test -f packages/ai-assist/README.md
rg -n "Mandatory Pre-Implementation Research Directive" docs/architecture/plans/shared-features/SF15*.md
rg -n "registerAiActions|registerAiAction|AiActionDefinition|IAiAuditRecord|AiModelRegistry|confidenceDetails|relevanceTags|basePriorityScore|Smart Insert|Trust Meter" docs/architecture/plans/shared-features/SF15*.md
```

---

## Blueprint Progress Comment

Append to `SF15-AI-Assist.md` after all gates pass:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF15 completed: {DATE}
T01–T09 implemented.
All four mechanical enforcement gates passed.
ADR created: docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md
Documentation added:
  - docs/how-to/developer/ai-assist-adoption-guide.md
  - docs/reference/ai-assist/api.md
  - packages/ai-assist/README.md
docs/README.md ADR index updated: ADR-0104 row appended.
current-state-map.md §2 updated with SF15 and ADR-0104 rows.
Mandatory pre-implementation research directive completed and verified before implementation start.
-->
```
