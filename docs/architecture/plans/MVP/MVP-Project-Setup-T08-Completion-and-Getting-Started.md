# MVP-Project-Setup-T08 — Completion and Getting-Started Experience

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** D-06, D-10, D-12, D-14, D-15 + R-01, R-08  
**Estimated Effort:** 0.7 sprint-weeks  
**Depends On:** T05, T06, T07  
> **Doc Classification:** Canonical Normative Plan — completion/launch task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Make a successful provisioning run feel complete and operationally real by delivering a launch-ready site link, created-site summary, and useful getting-started landing content.

---

## Required Paths

```text
apps/estimating/src/pages/*
apps/accounting/src/pages/*
backend/functions/src/functions/provisioningSaga/steps/*
packages/ui-kit/*
SharePoint template assets / provisioning content definitions
```

---

## Completion Requirements

### Request-side completion

When a request completes successfully, surface:

- direct site link
- project number
- project name
- department
- created timestamp
- whether full-spec completion is still pending or fully done
- any known follow-up tasks

### Getting-started landing experience

The created site must include a practical launch surface with at least:

- primary document library link
- site overview / quick links
- who to contact for access issues
- how to report a provisioning/setup issue
- any department-specific first-use guidance approved for MVP

### UX requirements

- completion should not feel like a raw backend state change
- users should not need to guess which site is theirs
- if a base site is ready while deferred work remains, messaging must distinguish “usable now” from “fully decorated later”

---

## Template / Content Rules

- keep landing content standardized and lightweight
- use template-driven page/content where feasible
- if content is injected post-create, the step must remain idempotent
- avoid role-specific page explosion in MVP

---

## Verification Commands

```bash
pnpm --filter @hbc/spfx-estimating test -- completion
pnpm --filter @hbc/functions test -- completion
rg -n "getting started|siteUrl|launchReadyAtIso|full-spec|BaseComplete|Completed" apps backend/functions packages
```
