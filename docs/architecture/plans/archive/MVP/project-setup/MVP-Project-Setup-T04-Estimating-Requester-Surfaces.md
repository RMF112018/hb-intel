# MVP-Project-Setup-T04 — Estimating Requester Surfaces

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** D-01, D-03, D-07 through D-09, D-12, D-14, D-15 + R-03, R-08
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02, T03
> **Doc Classification:** Canonical Normative Plan — requester-surface task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Upgrade Estimating from a basic request form into a complete requester-side workflow surface that supports intake, clarification, cancel/reopen, progress visibility, and one allowed retry.

---

## Required Paths

```text
apps/estimating/src/pages/NewRequestPage.tsx
apps/estimating/src/pages/ProjectSetupPage.tsx
apps/estimating/src/pages/RequestDetailPage.tsx
apps/estimating/src/components/ProvisioningChecklist.tsx   ← disposition decision required (see T01)
packages/provisioning/src/hooks/*
packages/step-wizard/*
packages/bic-next-move/*
packages/field-annotations/*
packages/ui-kit/*
```

---

## ProvisioningChecklist Disposition (Prerequisite)

Before writing any T04 code, apply the disposition decision recorded in T01:

- **Option A (preferred):** Remove `apps/estimating/src/components/ProvisioningChecklist.tsx` entirely. Replace with `@hbc/step-wizard` composition in `RequestDetailPage`. Steps are rendered via `@hbc/step-wizard`'s step model — do not re-invent the checklist pattern.
- **Option B:** If `ProvisioningChecklist` was promoted to `@hbc/ui-kit` in T01, import and use `@hbc/ui-kit`'s exported component.

Do not create a new app-local step-rendering component. `@hbc/step-wizard` is a Tier-1 Platform Primitive (ADR-0093) and is mandatory for multi-step guided workflow rendering.

---

## `NewRequestPage` Requirements

Must capture:

- project name
- project location
- **department** (required field; drives provisioning/access rules per D-03)
- project type
- project stage
- group members

Form rules:

- keep the form lean and nontechnical
- department is required; do not allow submission without it
- OpEx inclusion logic must not hide or overwrite explicit group-member choices
- validation messages must be business-readable
- submission returns a durable request reference immediately
- on success, navigate to `RequestDetailPage` for the new request

---

## `ProjectSetupPage` / `RequestDetailPage` Requirements

### Lifecycle visibility

- show current request state in plain English (not raw enum value)
- show current owner / next move using `@hbc/bic-next-move` — derived from `deriveCurrentOwner()` (T02)
- show project-number status once assigned
- show clarification tasks distinctly from general comments using `@hbc/field-annotations`
- show retry eligibility and escalation state clearly

### Actions (add to `RequestDetailPage`)

- cancel in any pre-`Provisioning` state with required reason (calls cancel endpoint → `Canceled` state)
- reopen / continue when the request is restored after cancellation (calls reopen endpoint → `Draft` or last pre-cancel state)
- resolve clarification items and resubmit (uses `@hbc/field-annotations` thread resolution)
- invoke one self-service retry after first failure (disabled when `retryPolicy.requesterRetryUsed === true`)
- submit a failure report / extra context before retry if desired

### Progress UX (using `@hbc/step-wizard`)

`@hbc/step-wizard` must be used for provisioning progress rendering. This is mandatory, not optional (Tier-1 Platform Primitive per ADR-0093).

- map `ISagaStepResult[]` from `IProvisioningStatus.steps` to `@hbc/step-wizard` step definitions
- render SignalR updates live when connected
- fall back to polling `getProvisioningStatus()` when SignalR is unavailable
- never rely on SignalR as the sole truth source (R-03)
- when `overallStatus === 'WebPartsPending'`, show "site is usable now — full setup completing overnight" messaging

### Completion UX handoff

- when request state is `Completed` and `siteLaunch` is populated:
  - expose direct site link (`siteLaunch.siteUrl`)
  - show created-site summary (project number, project name, department, created timestamp)
  - expose getting-started route if `siteLaunch.gettingStartedPageUrl` is present
  - preserve the request record as read-only history after completion

---

## Complexity / UI Rules

- reusable progress, alert, summary, and drawer components belong in `@hbc/ui-kit`; add them there if they don't exist before using app-local alternatives
- Estimating pages may compose role-specific shells only — no new standalone visual primitives in app code
- wording must remain plain English; do not expose raw step IDs, enum values, or internal state names as primary messaging
- `@hbc/step-wizard` step labels should map internal step names to business-friendly equivalents (e.g., "Install Web Parts" → "Preparing your site workspace")

---

## Verification Commands

```bash
pnpm --filter @hbc/spfx-estimating check-types
pnpm --filter @hbc/spfx-estimating test

# Confirm step-wizard is used (not app-local checklist)
grep -n "step-wizard\|StepWizard\|useStepWizard" apps/estimating/src/pages/RequestDetailPage.tsx
# Confirm ProvisioningChecklist.tsx is gone (Option A) or imported from ui-kit (Option B)
test -f apps/estimating/src/components/ProvisioningChecklist.tsx && echo "REVIEW: ProvisioningChecklist still exists — confirm this is intentional" || echo "OK: ProvisioningChecklist removed"

# Confirm department field
rg -n "department" apps/estimating/src/pages/NewRequestPage.tsx

# Confirm required actions present
rg -n "cancel|reopen|retry|clarification|resolv" apps/estimating/src/pages/RequestDetailPage.tsx

# Confirm deriveCurrentOwner / bic-next-move usage
rg -n "deriveCurrentOwner\|bic-next-move\|BicNextMove\|currentOwner" apps/estimating/src/

# Confirm completion UX
rg -n "siteLaunch\|siteUrl\|getting.started\|Completed" apps/estimating/src/pages/RequestDetailPage.tsx

# Confirm SignalR + polling fallback
rg -n "SignalR\|poll\|getProvisioningStatus\|WebPartsPending" apps/estimating/src/
