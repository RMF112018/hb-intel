# SF15-T07 — Reference Integrations: `@hbc/ai-assist`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-15-Shared-Feature-AI-Assist.md`
**Decisions Applied:** D-06, D-09
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T06

> **Doc Classification:** Canonical Normative Plan — SF15-T07 integration reference task; sub-plan of `SF15-AI-Assist.md`.

---

## Objective

Document required cross-package integration patterns.

---

## Required References

- complexity gating (Standard+ actions, Expert rationale)
- versioned-record tag `'ai-assisted'` on accepted inserts
- workflow-handoff context-note generation action
- notification-intelligence digest completion notification
- field-annotations staging/review pattern for AI output

---

## Verification Commands

```bash
rg -n "ai-assisted|useAiAction|IAiAssistConfig" packages
pnpm turbo run check-types --filter packages/business-development...
```
