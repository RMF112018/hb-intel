# MVP-Project-Setup-T08 — Completion and Getting-Started Experience

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** D-06, D-10, D-12, D-14, D-15 + R-01, R-08
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T04, T05, T06, T07
> **Doc Classification:** Canonical Normative Plan — completion/launch task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Make a successful provisioning run feel complete and operationally real by delivering a launch-ready site link, created-site summary, and useful getting-started landing content.

---

## Required Paths

```text
apps/estimating/src/pages/RequestDetailPage.tsx       ← completion UX for requester
apps/accounting/src/pages/ControllerReviewPage.tsx    ← completion visibility for Controller
backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts  ← getting-started page provisioning
packages/ui-kit/*                                     ← any reusable completion components
```

> **Note on content files:** SharePoint template content for the getting-started page is a deployment artifact, not a source file. Reference the provisioning step that writes the page content — document its path in `backend/functions/README.md`.

---

## Getting-Started Page URL Convention

`IProjectSetupRequest.siteLaunch.gettingStartedPageUrl` must follow this pattern:

```
{siteUrl}/SitePages/Getting-Started.aspx
```

This URL is generated during the step responsible for content provisioning (**step 3** — `step3-template-files.ts`) when the getting-started page is created or confirmed. It must be stored in `IProvisioningStatus.siteUrl`-adjacent fields and surfaced on the request's `siteLaunch` object.

---

## `BaseComplete` vs `Completed` Distinction

When `overallStatus === 'WebPartsPending'` (step 5 deferred to overnight timer), the frontend must clearly distinguish "site is usable now" from "fully decorated later":

- show the direct site link immediately when `overallStatus === 'WebPartsPending'` or `'Completed'`
- show `"Site is ready — full workspace setup completing overnight"` when `WebPartsPending`
- show `"Your project site is ready to use"` when `Completed`
- do not block the requester from accessing the site while deferred work is pending

---

## Completion Requirements

### Request-side completion (Estimating `RequestDetailPage`)

When a request reaches `Completed` state and `siteLaunch` is populated, surface:

- direct site link (`siteLaunch.siteUrl`) — prominent, clearly labeled
- project number
- project name
- department
- created timestamp (`siteLaunch.launchReadyAtIso`)
- whether full-spec completion is still pending (`overallStatus === 'WebPartsPending'`) or fully done
- getting-started page link (`siteLaunch.gettingStartedPageUrl`) when available
- any known follow-up tasks (access requests, project plan setup, etc.)

### Completion visibility (Accounting `ControllerReviewPage`)

When a request reaches `Completed` state, the Controller review page must:

- show the request as read-only completed history
- show the direct site link
- show the completion timestamp
- not allow any further state actions

### Getting-started landing experience (provisioned in step 3)

The created site must include a practical launch page at `SitePages/Getting-Started.aspx` with at least:

- primary document library link
- site overview / quick links
- who to contact for access issues
- how to report a provisioning/setup issue
- department-specific first-use guidance (minimal; one department-specific sentence or link is sufficient for MVP)

---

## Template / Content Rules

- keep landing content standardized and lightweight
- use template-driven page/content where feasible (R-01)
- if content is injected post-create (step 3), the write must be idempotent — if the getting-started page already exists, do not overwrite it
- avoid role-specific page explosion in MVP

---

## Verification Commands

```bash
pnpm --filter @hbc/spfx-estimating test -- completion
pnpm --filter @hbc/functions test -- completion

# Confirm getting-started page URL convention
rg -n "Getting-Started\|gettingStartedPageUrl\|SitePages" backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts

# Confirm siteLaunch field is populated on completion
rg -n "siteLaunch\|launchReadyAtIso\|gettingStartedPageUrl" backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts

# Confirm BaseComplete/WebPartsPending distinction in UI
rg -n "WebPartsPending\|BaseComplete\|usable now\|overnight" apps/estimating/src/pages/RequestDetailPage.tsx

# Confirm site link is exposed in completion state
rg -n "siteUrl\|siteLaunch\|Completed\|getting.started" apps/estimating/src/pages/RequestDetailPage.tsx apps/accounting/src/pages/ControllerReviewPage.tsx
