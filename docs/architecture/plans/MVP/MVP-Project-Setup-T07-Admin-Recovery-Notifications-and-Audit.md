# MVP-Project-Setup-T07 — Admin Recovery, Notifications, and Audit

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** D-08 through D-11, D-15 + R-03, R-05, R-08  
**Estimated Effort:** 0.9 sprint-weeks  
**Depends On:** T02, T03, T05, T06  
> **Doc Classification:** Canonical Normative Plan — admin-recovery/audit task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Turn the existing failed-runs surface into a governed admin recovery workspace with explicit takeover semantics, business-readable failure summaries, notification routing, and append-only event history.

---

## Required Paths

```text
apps/admin/src/pages/ProvisioningFailuresPage.tsx
backend/functions/src/functions/projectRequests/*
backend/functions/src/functions/provisioningSaga/*
packages/notification-intelligence/*
packages/provisioning/src/notification-templates.ts
packages/models/src/provisioning/*
```

---

## Admin Recovery Requirements

### Failure dashboard behavior

- show failed and escalated runs
- show whether business retry remains available
- show whether admin takeover is required
- show last successful step, failure step, and latest human-readable summary
- allow Admin retry from the last safe checkpoint
- allow mark-resolved only when status truth confirms success or explicit closure

### Takeover semantics

- second failed retry automatically moves ownership to Admin
- takeover event must record actor, timestamp, reason, and recovery notes
- requester and Controller must be able to see that Admin now owns the issue
- resolved admin changes must be summarized back to business users in plain English

---

## Notification Requirements

Use `@hbc/notification-intelligence` or aligned notification infrastructure for:

- request submitted -> Controller
- clarification requested -> requester
- ready to provision -> Controller
- provisioning started -> requester / business watchers
- first failure -> requester / Controller
- second failure escalated -> Admin + business stakeholders
- completion -> requester / business watchers
- recovery resolved -> requester / Controller

Notification content must remain business-readable, with direct deep links where possible.

---

## Audit / Event Timeline Requirements

Create one append-only event model for:

- state transitions
- clarification raised/resolved
- cancellation/reopen
- provisioning start / step progress / completion / failure
- retry invoked
- escalation invoked
- admin takeover / recovery notes
- site launch ready

The Admin page may show the most detail, but Estimating and Accounting must each receive a summarized timeline view.

---

## Verification Commands

```bash
pnpm --filter @hbc/spfx-admin check-types
pnpm --filter @hbc/spfx-admin test
pnpm --filter @hbc/functions test -- notifications
rg -n "escalat|takeover|recoverySummary|event history|timeline|notification" apps/admin backend/functions packages
```
