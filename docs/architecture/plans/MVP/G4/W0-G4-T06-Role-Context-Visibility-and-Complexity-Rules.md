# W0-G4-T06 — Role/Context Visibility and Complexity Rules

> **Doc Classification:** Canonical Normative Plan — implementation-governing task plan for Wave 0 Group 4, Task 06. Specifies how `@hbc/complexity`-governed progressive disclosure is applied consistently across all Group 4 SPFx surfaces, defines the universal core summary, maps every field to its tier, and establishes cross-surface consistency rules.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — implementation validates T01–T05 surface specifications; requires G3-T06 complexity gate spec table to be locked
**Parent Plan:** `W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
**Governed by:** CLAUDE.md v1.6 → `current-state-map.md` → G3-T06 → G4 master plan → this document
**Depends on:** G3-T06 (complexity gate spec table), T01–T05 (surfaces to validate)
**Unlocks:** T07 (complexity integration rules), T08 (visibility tests)
**Phase 7 gate:** ADR-0091 must exist on disk before implementation begins

---

## 1. Objective

Define and enforce the cross-surface complexity and role-context visibility rules for all Group 4 SPFx surfaces. This task:

- Defines what constitutes the universal core summary (visible to all roles without any gate)
- Defines what counts as standard-tier operational detail (coordinators and controllers)
- Defines what counts as expert-tier diagnostic detail (admins)
- Specifies how `@hbc/complexity` is applied across all four app surfaces
- Identifies where `HbcComplexityGate` must be placed for each field category in each surface
- Prevents inconsistency: the same field must not be shown ungated in one surface and gated in another
- Specifies where `@hbc/complexity`'s role-to-tier mapping must be validated against the current `roleComplexityMap.ts`

---

## 2. Why This Task Exists

T01–T05 each specify `HbcComplexityGate` usage for their respective surfaces. Without a cross-surface audit task, the following problems arise:

1. A field that is "always visible" in Estimating might be gated at standard in Accounting — creating inconsistency in what the same user sees across apps
2. A field defined as standard-tier in G3-T06's complexity gate spec table might be implemented as ungated in a G4 surface — defeating the progressive disclosure intent
3. The role-to-tier mapping in `packages/complexity/src/config/roleComplexityMap.ts` might be missing entries for roles used in G4 surfaces, causing all users to default to the same tier

T06 is the cross-surface consistency audit and specification task. It does not introduce new surface content — it governs how the content defined in T01–T05 is consistently gated across all G4 surfaces.

---

## 3. Governing Contract: G3-T06 Complexity Gate Spec Table

T06 applies the complexity gate spec table produced by G3-T06 (`docs/reference/workflow-experience/complexity-gate-spec.md`). That table is the field-by-field, tier-by-tier authority for what is gated where.

If G3-T06's table and T06's cross-surface application map disagree, G3-T06 governs. T06 must not silently override G3-T06's tier assignments — any disagreement must be raised as a G3 amendment before T06 proceeds.

T06 produces a cross-surface application map (`docs/reference/spfx-surfaces/complexity-application-map.md`) that translates G3-T06's field-level spec into app-level `HbcComplexityGate` placement guidance.

---

## 4. Three-Tier Model Applied to G4

All G4 surfaces use `@hbc/complexity`'s three-tier model:

| Tier | Label | Typical Role Context | Content Type |
|------|-------|---------------------|--------------|
| `essential` | Essential | Requester, general project group member | Universal core summary |
| `standard` | Standard | Estimating Coordinator, Controller | Operational detail, step status, BIC detail |
| `expert` | Expert | Admin, HBIntelAdmin | Diagnostic output, raw errors, saga internals |

**Critical rule:** Tier is determined by `@hbc/complexity`'s `roleComplexityMap` — not by app-level role checks. The G4 surfaces must not compute tier from `session.resolvedRoles` directly. They must call `useComplexity()` from `@hbc/complexity` and use the resolved `tier` value.

---

## 5. Universal Core Summary (Essential Tier — No Gate)

The following fields are universally visible across all G4 surfaces to any user who has access to a project setup request. These fields must never be wrapped in `HbcComplexityGate`. They must not be hidden or collapsed by default.

| Field | Source | App Surfaces Where Visible |
|-------|--------|---------------------------|
| Project name | `request.projectName` | Estimating, Accounting, Admin |
| Current lifecycle state | `request.state` | Estimating, Accounting, Admin |
| Current owner / expected action | `IBicNextMoveState` via BIC config | Estimating (HbcBicBadge), Accounting (HbcBicDetail), Admin |
| Submitted by (display) | `request.submittedBy` | Estimating, Accounting |
| Submitted at timestamp | `request.submittedAt` | All surfaces |
| Last-updated timestamp | `request.updatedAt` or store refresh time | All surfaces |
| State context description (plain language) | Derived from state value | Estimating (requester context) |

**Cross-surface consistency rule:** The state value displayed via `HbcStatusBadge` must use the same badge variant for the same state across all apps. Do not use `HbcStatusBadge variant="success"` for `Completed` in Estimating and `variant="info"` for `Completed` in Accounting. The variant-to-state mapping must be defined once (in a shared constant or in `@hbc/provisioning`) and consumed by all surfaces.

---

## 6. Standard Tier Content (Coordinators and Controllers)

The following fields are gated at `standard` tier minimum. Any surface displaying these fields must wrap them in `<HbcComplexityGate minTier="standard">`.

### 6.1 Operational State and Step Detail

| Field | Source | Gate Spec | App Surfaces |
|-------|--------|-----------|-------------|
| Step-level provisioning results | `IProvisioningStatus` | `minTier="standard"` | Estimating (T02), Admin (T04) |
| Per-step duration | `IProvisioningStatus` | `minTier="standard"` | Estimating (T02), Admin (T04) |
| Per-step timestamps | `IProvisioningStatus` | `minTier="standard"` | Estimating (T02), Admin (T04) |
| Failure class | `IProvisioningStatus.failureClass` | `minTier="standard"` | Estimating (T02) |
| Retry count | `IProvisioningStatus.retryCount` | `minTier="standard"` | Estimating (T02) |
| Escalated-at timestamp | `IProvisioningStatus.escalatedAt` | `minTier="standard"` | Admin (T04) |

### 6.2 BIC and Ownership Detail

| Field | Source | Gate Spec | App Surfaces |
|-------|--------|-----------|-------------|
| Full BIC ownership detail | `HbcBicDetail` | `minTier="standard"` | Estimating (T02), Accounting (T03) |
| Handoff history summary | `IBicNextMoveState.handoffHistory` | `minTier="standard"` | Estimating (T02), Accounting (T03) |
| BIC blocked state | `IBicNextMoveState.isBlocked` | `minTier="standard"` | All surfaces |

### 6.3 Request History and Audit

| Field | Source | Gate Spec | App Surfaces |
|-------|--------|-----------|-------------|
| Full lifecycle event log | `HbcAuditTrailPanel` data | `minTier="standard"` | Accounting (T03) |
| Clarification note content | `request.clarificationNote` | `minTier="standard"` | Estimating (T01/T02), Accounting (T03) |
| Clarification-flagged step list | `request.flaggedSteps` | `minTier="standard"` | Estimating (T01/T02) |

### 6.4 Internal Identifiers

| Field | Source | Gate Spec | App Surfaces |
|-------|--------|-----------|-------------|
| Internal request ID | `request.requestId` | `minTier="standard"` | All surfaces (displayed in detail views) |
| Project ID | `request.projectId` | `minTier="standard"` | All surfaces (displayed in detail views) |

---

## 7. Expert Tier Content (Admins Only)

The following fields are gated at `expert` tier minimum. They must be wrapped in `<HbcComplexityGate minTier="expert">` in all surfaces.

| Field | Source | Gate Spec | App Surfaces |
|-------|--------|-----------|-------------|
| Raw error stack / error message | `IProvisioningStatus.errorDetails` | `minTier="expert"` | Admin (T04) |
| Step input/output context | `IProvisioningStatus.stepContext` | `minTier="expert"` | Admin (T04) |
| Entra ID group IDs created | Provisioning step output | `minTier="expert"` | Admin (T04) |
| SharePoint internal site ID | Provisioning output | `minTier="expert"` | Admin (T04) |
| Graph API call references | Diagnostic output | `minTier="expert"` | Admin (T04) |
| Manual state override controls | `HbcForm` select | `minTier="expert"` | Admin (T04) |
| Tenant configuration context | Environment-derived | `minTier="expert"` | Admin (T04) |

**Expert-tier content must never appear in Estimating or Accounting surfaces.** If it does appear (e.g., because an implementer added a raw error field to `RequestDetailPage`), that is a violation of this spec and must be corrected before T06 acceptance criteria are satisfied.

---

## 8. Role-to-Tier Mapping Requirements

The `roleComplexityMap.ts` in `packages/complexity/src/config/` must contain the following mappings for G4 surfaces to function correctly:

| Role / Context | Required Tier | Notes |
|----------------|--------------|-------|
| Requester (submitter, project group member) | `essential` | Default for non-admin, non-coordinator contexts |
| `Estimating` or `EstimatingCoordinator` | `standard` | Must be confirmed as a role value in `@hbc/auth` |
| `Controller` or `Accounting` | `standard` | Must be confirmed as a role value in `@hbc/auth` |
| `Admin` | `expert` | Confirmed as `'Admin'` in `FULL_CHECKLIST_ROLES` in `getProvisioningVisibility()` |
| `HBIntelAdmin` | `expert` | Confirmed as `'HBIntelAdmin'` in `FULL_CHECKLIST_ROLES` |

**Required action before T06 implementation:** Inspect `packages/complexity/src/config/roleComplexityMap.ts` and confirm all entries above are present. For any missing entry, open an issue or ADR proposal for `@hbc/complexity` to add the mapping. Do not add local fallback tier computation in the G4 app code.

---

## 9. HbcComplexityGate Application Patterns

### 9.1 Standard Wrapping Pattern

```tsx
// Standard tier — coordinator and above
<HbcComplexityGate minTier="standard">
  <ProvisioningStepDetail steps={provisioningStatus?.steps} />
</HbcComplexityGate>

// Expert tier — admin only
<HbcComplexityGate minTier="expert">
  <HbcCard>
    <HbcTypography variant="caption">Raw Error</HbcTypography>
    <HbcTypography variant="mono">{provisioningStatus?.errorDetails}</HbcTypography>
  </HbcCard>
</HbcComplexityGate>
```

### 9.2 What Must Not Be Inside a Gate

The following must never be wrapped in `HbcComplexityGate` (they are essential-tier):
- The `HbcBicBadge` compact ownership display
- The `HbcStatusBadge` for current state
- The project name heading
- The state context paragraph (plain-language description for requester)
- Action buttons that are the user's primary next step (e.g., "Return to Setup Form" in clarification state)

Wrapping primary action buttons in a complexity gate would prevent some users from taking required actions. This is a critical error that must be caught in code review.

### 9.3 Layered Gating

When expert-tier content is nested inside a standard-tier section:

```tsx
<HbcComplexityGate minTier="standard">
  {/* Standard-tier section */}
  <FailureDetailCard failureClass={status.failureClass} retryCount={status.retryCount} />

  {/* Expert-tier content inside standard section */}
  <HbcComplexityGate minTier="expert">
    <RawErrorCard errorDetails={status.errorDetails} />
  </HbcComplexityGate>
</HbcComplexityGate>
```

This layered pattern is correct — the outer gate prevents standard content from being visible to essential-tier users; the inner gate prevents expert content from being visible to standard-tier users.

---

## 10. Cross-Surface Consistency Rules

These rules must be validated across all G4 surfaces during T06 implementation:

**Rule 1 — Same state, same badge variant.** `HbcStatusBadge` variant assignments for each `ProjectSetupRequestState` value must be identical in Estimating, Accounting, Admin, and Project Hub. Define a shared constant:

```typescript
// In a shared location — either @hbc/provisioning or a G4 shared file
export const STATE_BADGE_VARIANTS: Record<ProjectSetupRequestState, BadgeVariant> = {
  Submitted: 'info',
  UnderReview: 'warning',
  NeedsClarification: 'warning',
  AwaitingExternalSetup: 'warning',
  ReadyToProvision: 'success',
  Provisioning: 'info',
  Completed: 'success',
  Failed: 'error',
};
```

If this constant is placed in `@hbc/provisioning`, it is available to all apps. If placed in a G4 shared file (e.g., `apps/shared/` — check if this exists in the repo), it must be imported consistently.

**Rule 2 — Same core summary fields across apps.** Every app that shows a project setup request must show all essential-tier fields (§5). No app may omit a core summary field for any reason other than the field being unavailable in the data source.

**Rule 3 — No cross-surface tier inconsistency.** A field that is standard-tier in Estimating must be standard-tier in Accounting and Admin (not ungated in one and gated in others).

**Rule 4 — No action affordances hidden by complexity gate.** Primary action buttons (Approve, Return for Clarification, Retry) must never be inside a complexity gate. Complexity gates govern informational content — not action affordances. Exception: the manual state override action (§ expert-tier in T04) is behind an expert-tier gate because it is an advanced tool, not a primary workflow action.

---

## 11. `HbcComplexityDial` Placement

`HbcComplexityDial` from `@hbc/complexity` allows users to manually adjust their complexity tier within the bounds configured for their role. T06 specifies where this control is placed in G4 surfaces:

- **Estimating `RequestDetailPage`:** Render `HbcComplexityDial` in the page header area (using `WorkspacePageShell`'s header slot or an adjacent position). This allows coordinators to toggle between standard and essential view.
- **Accounting `ProjectReviewDetailPage`:** Same placement as above — the controller may want to reduce detail density.
- **Admin `ProvisioningFailuresPage`:** Render `HbcComplexityDial` accessible from the page header. Admins default to expert but may reduce detail for a cleaner overview.

`HbcComplexityDial` must not be rendered in:
- `NewRequestPage` (the setup wizard — complexity tier is irrelevant for form entry)
- `ProjectSetupPage` (coordinator queue list — the dial would be distracting in list context)
- Project Hub `DashboardPage` (completion welcome card context does not require tier control)

---

## 12. Reference Document Output

T06 produces `docs/reference/spfx-surfaces/complexity-application-map.md`. This document must contain:

1. A table mapping every field shown in any G4 surface to its tier, gate spec, and the surface(s) where it appears
2. The `STATE_BADGE_VARIANTS` constant definition with source location
3. A list of `roleComplexityMap.ts` entries required for G4 and their validation status
4. The `HbcComplexityDial` placement table
5. Cross-surface consistency rules (same as §10 in this plan, formalized as a reference checklist)

---

## 13. Acceptance Criteria

T06 is complete when all of the following are true:

- [ ] G3-T06 complexity gate spec table has been reviewed and applied across T01–T05 surfaces
- [ ] No `if (role === 'X')` role-branch rendering logic exists in any G4 surface component
- [ ] `STATE_BADGE_VARIANTS` constant is defined in a shared location and used consistently across all G4 apps
- [ ] All essential-tier fields appear ungated in all G4 surfaces
- [ ] All standard-tier fields are wrapped in `<HbcComplexityGate minTier="standard">` in all G4 surfaces
- [ ] All expert-tier fields are wrapped in `<HbcComplexityGate minTier="expert">` and do not appear in Estimating or Accounting surfaces
- [ ] `roleComplexityMap.ts` has been validated for all roles used in G4; any gaps have been raised as package-level issues
- [ ] `HbcComplexityDial` is placed correctly in the three surfaces specified in §11
- [ ] No primary action buttons are inside a complexity gate
- [ ] Reference document exists at `docs/reference/spfx-surfaces/complexity-application-map.md`

---

*End of W0-G4-T06 — Role/Context Visibility and Complexity Rules v1.0*
