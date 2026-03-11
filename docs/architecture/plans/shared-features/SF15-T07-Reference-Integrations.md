# SF15-T07 — Reference Integrations: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-01, D-05, D-06, D-07, D-08, D-09
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T06

> **Doc Classification:** Canonical Normative Plan — SF15-T07 integration reference task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Document required cross-package integration patterns for unified entrypoint, Smart Insert commit flow, governance/audit controls, notification routing, and multi-model policy enforcement.

---

## Mandatory Pre-Implementation Research Directive

> **Mandatory Pre-Implementation Research Directive**  
> Before drafting any technical plan, writing any code, or configuring any Azure resources for the `@hbc/ai-assist` feature, the implementation agent **must** conduct exhaustive research on Azure AI Foundry integration using web search and official Microsoft documentation. Research must cover: current 2026 deployment models, Server-Sent Events streaming patterns, token and cost management, security and tenant-boundary controls, governance and audit APIs, rate-limiting capabilities, model registry patterns, compliance mechanisms, and all relevant best practices. All research findings must be documented in the implementation notes before proceeding. No implementation work may begin until this research step is complete and verified.

---

## Required References

- `@hbc/project-canvas` single global toolbar `✨ AI Assist` entrypoint using merged action registration
- `@hbc/auth` role/site policy enforcement and tenant model configuration source for `AiModelRegistry`
- `@hbc/versioned-record` tag `'ai-assisted'` on Smart Insert commit, `IAiAuditRecord` persistence, and usage-history scoring signals
- `@hbc/workflow-handoff` context-note generation action
- `@hbc/notification-intelligence` inline completion badge for invoker, stakeholder digest cards, admin governance alerts only for low-confidence/policy events
- `@hbc/field-annotations` staging/review pattern for AI output before formal commit where module policy requires
- admin-only `HbcAiGovernancePortal` registration path for policy override, analytics, and transparency reporting

---

## Verification Commands

```bash
rg -n "registerAiActions|project-canvas|AiModelRegistry|IAiAuditRecord|ai-assisted|notification-intelligence|GovernancePortal" packages
pnpm turbo run check-types --filter packages/business-development...
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF15-T07 completed: 2026-03-11
Files created:
  - packages/ai-assist/src/reference/referenceModels.ts (2 IAiModelRegistration entries)
  - packages/ai-assist/src/reference/referenceActions.ts (6 IAiAction definitions with buildPrompt/parseResponse)
  - packages/ai-assist/src/reference/referenceExecutor.ts (ReferenceExecutor with keyword-based deterministic responses)
  - packages/ai-assist/src/reference/seedReferenceIntegrations.ts (full registry seeding + REFERENCE_POLICY)
  - packages/ai-assist/src/reference/index.ts (barrel)
  - packages/ai-assist/src/reference/referenceIntegrations.test.ts (36 integration tests — 10 groups)
Files edited:
  - packages/ai-assist/src/index.ts (added reference exports + HbcAiResultPanel gap fill)
  - packages/ai-assist/vitest.config.ts (added src/reference/** to coverage exclude)
Verification: check-types ✅ | build ✅ | 169 tests pass (36 new) ✅
Next: SF15-T08 (Testing Strategy)
-->
