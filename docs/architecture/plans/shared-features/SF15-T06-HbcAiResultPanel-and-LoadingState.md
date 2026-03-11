# SF15-T06 — `HbcAiResultPanel` and `HbcAiLoadingState`: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-02, D-03, D-04
**Estimated Effort:** 0.55 sprint-weeks
**Depends On:** T05

> **Doc Classification:** Canonical Normative Plan — SF15-T06 result/loading UI task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Implement Smart Insert overlay behavior and loading/streaming states with explicit user review controls, progressive trust disclosure, and commit-to-versioned-record acceptance paths.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## Components

- `HbcAiResultPanel`
  - maintained as compatibility wrapper that renders inline Smart Insert overlay behavior
  - anchored to triggering Canvas card
  - renders `text`, `bullet-list`, `structured-object` as editable Smart Insert suggestions
  - schema-driven auto-mapping using `@hbc/versioned-record` introspection plus drag/drop remap
  - per-field accept, Apply All, live diff highlighting, dismiss, and commit controls
  - commit creates `'ai-assisted'` snapshot tag
  - embeds Trust Meter powered by `confidenceDetails`:
    - Essential: badge + disclaimer
    - Standard: badge + short rationale
    - Expert: full score, sources, model details, expandable rationale, token telemetry
- `HbcAiLoadingState`
  - true inline streaming state inside Smart Insert overlay
  - subtle Trust Meter progress indicator
  - Essential shows clean growing content
  - Expert includes live token usage telemetry
  - cancel action immediately terminates Azure Functions stream

---

## Verification Commands

```bash
pnpm --filter @hbc/ai-assist test -- HbcAiResultPanel HbcAiLoadingState
pnpm --filter @hbc/ai-assist build
rg -n "Smart Insert|confidenceDetails|Trust Meter|ai-assisted|cancel" packages/ai-assist/src/components
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF15-T06 completed: 2026-03-11
Components implemented:
  - HbcAiTrustMeter.tsx — rewritten from scaffold; progressive disclosure (Essential/Standard/Expert), badge color derivation, expandable rationale, cited sources, token usage
  - HbcAiLoadingState.tsx — rewritten from scaffold; streaming indicator, streamed content preview, expert token telemetry, cancel affordance
  - HbcAiSmartInsertOverlay.tsx — rewritten from scaffold; conditional cascade (loading→null→text→bullet-list→structured-object→fallback), per-field accept with state tracking, Apply All, Commit, Dismiss, drag handle, TrustMeter integration
  - HbcAiResultPanel.tsx — new thin wrapper with className passthrough
Barrel updated: src/components/index.ts (added HbcAiResultPanel export)
Testing factory added: testing/createMockSmartInsertResult.ts
Tests added: 36 new tests (10+8+14+4) across 4 test files — all passing
Total package tests: 133 passing (13 files)
Verification: check-types ✅ | build ✅ | test ✅
Next: SF15-T07
-->
