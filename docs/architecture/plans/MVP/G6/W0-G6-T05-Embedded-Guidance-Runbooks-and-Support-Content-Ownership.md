# W0-G6-T05 — Embedded Guidance, Runbooks, and Support Content Ownership

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`
> **Related:** `docs/maintenance/provisioning-runbook.md`; `docs/maintenance/provisioning-observability-runbook.md`; `packages/ui-kit/` (HbcCoachingCallout)

**Status:** Complete
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-06, LD-07, LD-08, LD-09

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/ui-kit` | `packages/ui-kit/` | `HbcCoachingCallout` and other contextual guidance components | **Assess before implementation.** Verify that `HbcCoachingCallout` (or equivalent) is exported from `@hbc/ui-kit`. If not, T05 must either use an alternate guidance component from `@hbc/ui-kit` or request addition of a coaching callout component to the kit. Do not create a new reusable guidance component outside `@hbc/ui-kit` (LD-09). |

### Gate Outcome

**Before beginning T05 implementation:** inspect `packages/ui-kit/src/` to confirm whether `HbcCoachingCallout` or equivalent contextual guidance component is exported. Record the outcome in the Gate Check Record below.

If no suitable guidance component exists in `@hbc/ui-kit`, T05 is gated pending addition. Do not create a feature-local guidance component — that would violate LD-09.

---

## Objective

Embed operational guidance directly in the admin surface so admins can take the right action without leaving the interface. After this task:

1. Key admin action surfaces (failures inbox, alert dashboard, queue overview) have embedded contextual guidance (coaching callouts, inline runbook section links)
2. Operational runbooks in `docs/maintenance/` are linked from relevant UI surfaces
3. Support content ownership is explicitly documented: who updates what and where
4. Business-ops leads have access to simplified guidance appropriate to their scope (LD-08)

This task does not duplicate runbook content into the UI. It embeds links and brief contextual prompts that direct the admin to the right action.

---

## Scope

### Guidance Placements (minimum Wave 0)

| Surface | Guidance Content | Audience |
|---|---|---|
| Failures inbox (`/provisioning-failures`) — Failed requests | Coaching callout: "Provisioning failure detected. Review the error detail and check the [Provisioning Runbook](link) for retry and escalation steps." | Technical admins |
| Failures inbox — retry ceiling reached | Coaching callout: "Maximum retries reached. Escalation is required. See [escalation procedure](link) in the runbook." | Technical admins |
| Failures inbox — stuck request | Coaching callout: "This request appears stuck. Check Azure Function timer status in the [Observability Runbook](link)." | Technical admins |
| Queue overview — healthy state | Brief status message: "No active failures or stuck workflows." | Both audiences |
| Alert dashboard — empty state | Brief status message: "No active alerts. Probes run every 15 minutes." | Technical admins |
| Infrastructure truth dashboard | Coaching callout: "Run probes manually to check current infrastructure health. Results are cached for 30 minutes." | Technical admins |
| Business-ops summary view | Summary only: "All systems operating normally" or "N requests need attention." No runbook links. | Business-ops leads |

### Runbook Link Registry

The following runbook sections must be linked from the relevant admin surfaces. Links are relative paths from the admin app to the docs:

| Runbook Section | Admin Surface | Path |
|---|---|---|
| Manual retry procedure | Failures inbox — retry button tooltip | `docs/maintenance/provisioning-runbook.md#retry-procedure` |
| Escalation procedure | Failures inbox — escalate button tooltip / retry-ceiling callout | `docs/maintenance/provisioning-runbook.md#escalation-procedure` |
| Step 5 manual re-run | Failures inbox — stuck workflow | `docs/maintenance/provisioning-runbook.md#step-5-manual` |
| Alert thresholds | Alert dashboard | `docs/maintenance/provisioning-runbook.md#alert-thresholds` |
| KQL query templates | Infrastructure truth dashboard | `docs/maintenance/provisioning-observability-runbook.md#kql-queries` |
| Stuck provisioning alert rule | Queue overview — stuck indicator | `docs/maintenance/provisioning-observability-runbook.md#alert-rule-1` |

**Note:** Runbook links from the admin SPFx webpart may need to be absolute URLs or SharePoint page deep links depending on the deployment context. Confirm the link format with the deployment team and document the decision.

---

## Exclusions / Non-Goals

- Do not build a standalone help portal or documentation site in Wave 0 (LD-07).
- Do not duplicate runbook content into the UI. Links and brief prompts only.
- Do not implement contextual guidance for coordinator or requester surfaces. Those are G4/G5 scope.
- Do not create new reusable guidance components outside `@hbc/ui-kit` (LD-09).

---

## Governing Constraints

- Guidance components must come from `@hbc/ui-kit` (LD-09)
- Guidance model: contextual, embedded, linked — not a separate help section (LD-07)
- Business-ops leads must not see technical runbook links or infrastructure detail (LD-08)
- Runbook ownership: operational runbooks (`docs/maintenance/`) are admin/dev team owned; support guidance embedded in the surface is business-ops team owned (LD-06)

---

## Support Content Ownership

| Content | Owner | Location | Update Trigger |
|---|---|---|---|
| Provisioning failure runbook | Admin/dev team | `docs/maintenance/provisioning-runbook.md` | New failure modes, threshold changes, API changes |
| Observability runbook | Admin/dev team | `docs/maintenance/provisioning-observability-runbook.md` | KQL changes, new alert rules, probe changes |
| Coaching callout text in admin surface | Business-ops leads | `apps/admin/src/` (in component props) | Terminology changes, policy changes, audience feedback |
| Business-ops summary labels | Business-ops leads | `apps/admin/src/` | Policy changes |

**Documentation update rule (LD-06):** Changes to `docs/maintenance/` runbooks require review from the admin/dev team. Changes to callout text in the admin surface may be made by business-ops leads via a PR, no admin/dev review required unless the change touches behavior.

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/ui-kit` | Required | `HbcCoachingCallout` or equivalent guidance component |
| `apps/admin` | Target app | Guidance wiring in pages and components |
| `docs/maintenance/` | Referenced | Runbook links embedded in the surface |

---

## Acceptance Criteria

1. **Gate check complete:** This task file's Gate Check Record confirms which `@hbc/ui-kit` guidance component is used.

2. **Guidance placements implemented:** All placements in the table above have coaching callouts or inline guidance text.

3. **Runbook links wired:** All runbook links in the Runbook Link Registry are present and confirmed to resolve in the deployment context.

4. **Audience separation respected:** Business-ops leads do not see technical runbook links or infrastructure guidance.

5. **No new reusable components:** All guidance components come from `@hbc/ui-kit`. No feature-local guidance primitives in `apps/admin/` or `@hbc/features-admin/`.

6. **Content ownership documented:** This task file's Support Content Ownership table is confirmed with the relevant teams (or noted as unconfirmed pending team review).

---

## Validation / Readiness Criteria

Before T05 is ready for review:

- TypeScript compilation clean in `apps/admin/`
- All runbook links manually verified as resolving correctly in the deployment context
- Manual walkthrough: admin sees coaching callout on a `Failed` request with correct runbook link
- Manual walkthrough: business-ops lead does not see technical runbook links

---

## Known Risks / Pitfalls

**`HbcCoachingCallout` availability.** The component may not be exported from `@hbc/ui-kit` under that name. Inspect the kit before implementation. If absent, T05 is gated until the component is added.

**Runbook link format.** In an SPFx webpart context, links to `docs/maintenance/` markdown files cannot be deep-linked in the browser directly. The runbook links may need to be SharePoint page URLs or absolute links to a documentation site. Clarify the deployment target for runbook links before wiring them.

**Content ownership sign-off.** The Support Content Ownership table marks callout text as business-ops team owned. If the team has not confirmed this ownership, record it as "unconfirmed" and track.

---

## Gate Check Record

*(Record outcome of `@hbc/ui-kit` coaching callout inspection here before implementation begins.)*

**`HbcCoachingCallout`:** ✅ Confirmed exported from `@hbc/ui-kit` (line 284 of barrel). Props: `message: string`, `actionLabel?: string`, `onAction?: () => void`, extends `IComplexityAwareProps`. Visible to Essential+Standard tiers, hidden at Expert. Gated by `showCoaching` context flag.

---

## Progress Documentation Requirements

During active T05 work:

- ✅ **Coaching callout component:** `HbcCoachingCallout` from `@hbc/ui-kit`. Props: `message`, `actionLabel`, `onAction`. Complexity-gated (Essential+Standard only, hidden at Expert).
- ✅ **Runbook link format:** Relative doc paths stored as constants in `apps/admin/src/constants/runbookLinks.ts`. Wave 0 format is `docs/maintenance/*.md#anchor`. Production SPFx mapping to SharePoint doc library URLs is a deployment concern.
- ✅ **Callout text:** Reviewed and implemented. Content ownership documented in Support Content Ownership table — callout text is business-ops-owned, modifiable via PR without admin/dev review unless touching behavior.
- ✅ **Verified anchors:** All 6 runbook section anchors confirmed to exist in the markdown source files.

---

## Closure Documentation Requirements

Before T05 can be closed:

- Gate Check Record updated with confirmed coaching callout component
- Runbook link format confirmed and recorded
- All guidance placements implemented and verified
- Support Content Ownership table confirmed with teams (or noted as pending confirmation)
- All acceptance criteria verified and checked off
- TypeScript compilation clean
