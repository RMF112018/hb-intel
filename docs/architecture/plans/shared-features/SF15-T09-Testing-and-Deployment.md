# SF15-T09 — Testing and Deployment: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** All D-01 through D-10
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01–T08

> **Doc Classification:** Canonical Normative Plan — SF15-T09 testing/deployment task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Finalize `@hbc/ai-assist` with SF11-grade documentation/deployment closure requirements (ADR template, adoption guide, API reference, README conformance, ADR index update, blueprint progress comment, and current-state-map updates).

---

## 3-Line Plan

1. Complete tests for action contracts, hooks, API invoke path, and UI interaction flows.
2. Pass all mechanical enforcement gates with ≥95% coverage.
3. Publish ADR-0104 and all required documentation/state-map/index updates.

---

## Pre-Deployment Checklist (30 items)

### Architecture & Boundary Verification

- [ ] `@hbc/ai-assist` has zero direct model-service calls from client code
- [ ] AI invocation routes through backend proxy only
- [ ] `@hbc/ai-assist` has zero imports of `packages/features/*`
- [ ] `@hbc/ai-assist` has zero imports of `@hbc/session-state` unless superseding plan adds dependency
- [ ] app-shell-safe component usage validated
- [ ] boundary grep checks return zero prohibited matches

### Type Safety

- [ ] zero TypeScript errors: `pnpm --filter @hbc/ai-assist check-types`
- [ ] action prompt/response contracts enforced end-to-end
- [ ] role/complexity filters typed and validated
- [ ] structured output parsing contracts stable

### Build & Package

- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle
- [ ] exports resolve in consuming modules
- [ ] turbo build with integrating modules succeeds

### Tests

- [ ] all tests pass
- [ ] coverage thresholds met (lines/branches/functions/statements ≥95)
- [ ] action contract tests complete for all 6 actions
- [ ] hooks/API lifecycle tests complete
- [ ] action menu/result panel/loading state tests complete
- [ ] invoke→accept E2E scenario passing

### Storage/API (AI Proxy + Governance Controls)

- [ ] invoke endpoint contract validated
- [ ] sensitive-field exclusion validated client and server
- [ ] per-user rate limit enforcement validated
- [ ] audit log emission validated for action invocation

### Integration

- [ ] complexity integration validated (Standard+/Expert behavior)
- [ ] versioned-record integration validated (`ai-assisted` tagging)
- [ ] workflow-handoff context-note generation integration validated
- [ ] notification-intelligence digest integration validated

### Documentation

- [ ] `docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md` written and accepted
- [ ] `docs/how-to/developer/ai-assist-adoption-guide.md` written
- [ ] `docs/reference/ai-assist/api.md` written
- [ ] `packages/ai-assist/README.md` conformance verified
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

### D-01 — Named Action Model
Use contextual named actions, not generic chatbot interactions.

### D-02 — Tenant Boundary
Route model execution through Azure AI Foundry via backend proxy.

### D-03 — Prompt/Parse Contract
Each action defines prompt construction and response parsing.

### D-04 — Human Review
AI outputs are suggestion-only pending user accept/edit.

### D-05 — Role/Complexity Gating
Filter actions by role and complexity tier.

### D-06 — Sensitive Field Exclusion
Exclude sensitive fields in both client and server paths.

### D-07 — Governance Controls
Require audit logging and rate limiting.

### D-08 — Streaming + Cancel
Support stream-capable invocation with cancel control.

### D-09 — Integration Baseline
Integrate with complexity, versioned-record, handoff, notifications, annotations.

### D-10 — Testing Sub-Path
Expose canonical fixture exports from `@hbc/ai-assist/testing`.

## Compliance

This ADR is locked and can only be superseded by explicit follow-up ADR.
```

---

## Developer Adoption Guide

**File:** `docs/how-to/developer/ai-assist-adoption-guide.md`

Required sections:

1. when to use ai-assist actions
2. defining `IAiAssistConfig<T>` and action sets
3. prompt building and response parsing guidance
4. enforcing role/complexity/sensitive-field rules
5. integrating result acceptance into record update flows
6. using testing fixtures from `@hbc/ai-assist/testing`

---

## API Reference

**File:** `docs/reference/ai-assist/api.md`

Must include export table entries for:

- `IAiAction`
- `IAiPromptPayload`
- `IAiActionResult`
- `IAiAssistConfig<T>`
- `AiAssistApi`
- `useAiAction`
- `useAiActions`
- `HbcAiActionMenu`
- `HbcAiResultPanel`
- `HbcAiLoadingState`
- testing exports (`createMockAiAction`, `createMockPromptPayload`, `createMockAiActionResult`, `mockAiActionStates`)

---

## Package README Conformance

**File:** `packages/ai-assist/README.md`

Verify README contains:

- purpose and named-action model overview
- quick-start setup
- tenant-boundary and proxy architecture summary
- invoke/result review lifecycle summary
- exports table
- architecture boundary rules
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
-->
```
