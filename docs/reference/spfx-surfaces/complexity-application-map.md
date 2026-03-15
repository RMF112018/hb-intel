# Complexity Application Map — G4 SPFx Surfaces

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; SPFx surface audience

**Version:** 1.0
**Date:** 2026-03-15
**Produced by:** W0-G4-T06
**Governed by:** CLAUDE.md v1.6, G3-T06 complexity gate spec table, W0-G4-T06 spec

---

## 1. Three-Tier Model Summary

All G4 surfaces use `@hbc/complexity`'s three-tier progressive disclosure model. Tier is determined solely by `useComplexity()` from `@hbc/complexity` — no app-level role branching.

| Tier | Label | Typical Role Context | Content Type |
|------|-------|---------------------|--------------|
| `essential` | Essential | Requester, general project group member | Universal core summary |
| `standard` | Standard | Estimating Coordinator, Controller | Operational detail, step status, BIC detail |
| `expert` | Expert | Admin, HBIntelAdmin | Diagnostic output, raw errors, saga internals |

---

## 2. Field-to-Tier Mapping Across G4 Surfaces

### 2.1 Essential Tier — Ungated (All Users)

| Field | Source | Estimating | Accounting | Admin |
|-------|--------|-----------|------------|-------|
| Project name | `request.projectName` | Yes | Yes | Yes |
| Current lifecycle state (badge) | `request.state` | Yes | Yes | Yes |
| BIC badge (compact) | `IBicNextMoveState` | Yes | Yes | — |
| Submitted by | `request.submittedBy` | Yes | Yes | — |
| Submitted at | `request.submittedAt` | Yes | Yes | — |
| State context description | Derived from state | Yes | Yes | — |
| Project type | `request.projectType` | — | Yes | — |
| Stage | `request.projectStage` | — | Yes | — |
| Department | `request.department` | — | Yes | — |
| Completed at | `request.completedAt` | Yes | — | — |

### 2.2 Standard Tier — `<HbcComplexityGate minTier="standard">`

| Field | Source | Estimating | Accounting | Admin |
|-------|--------|-----------|------------|-------|
| BIC detail chain | `HbcBicDetail` | — | Yes | — |
| Team members | `request.groupMembers` | Yes | Yes | — |
| Group leaders | `request.groupLeaders` | — | Yes | — |
| Project lead | `request.projectLeadId` | — | Yes | — |
| Contract type | `request.contractType` | — | Yes | — |
| Estimated value | `request.estimatedValue` | Yes | Yes | — |
| Client name | `request.clientName` | — | Yes | — |
| Start date | `request.startDate` | — | Yes | — |
| Add-ons | `request.addOns` | Yes | Yes | — |
| Clarification items | `request.clarificationItems` | — | Yes | — |
| Provisioning checklist (detailed) | `IProvisioningStatus` | Yes | — | — |
| Operational detail (request ID, timestamps) | Various | — | Yes | — |
| Status timeline | `HbcStatusTimeline` | — | Yes | — |
| Provisioning steps table | `IProvisioningStatus.steps` | — | — | Yes |

### 2.3 Expert Tier — `<HbcComplexityGate minTier="expert">`

| Field | Source | Estimating | Accounting | Admin |
|-------|--------|-----------|------------|-------|
| Audit trail panel | `HbcAuditTrailPanel` | — | Yes | — |
| Raw error stack / error message | `IProvisioningStatus.errorDetails` | — | — | Yes |
| Step metadata | `ISagaStepResult.metadata` | — | — | Yes |
| Entra ID group IDs | `IProvisioningStatus.entraGroups` | — | — | Yes |
| Internal identifiers (project ID, correlation ID) | Various | — | — | Yes |
| Manual state override controls | Admin UI | — | — | Yes |

---

## 3. `STATE_BADGE_VARIANTS` — Canonical Source

**Location:** `packages/provisioning/src/summary-field-registry.ts`

**Export:** `STATE_BADGE_VARIANTS` and `getStateBadgeVariant()` from `@hbc/provisioning`

```typescript
export const STATE_BADGE_VARIANTS: Readonly<Record<ProjectSetupRequestState, string>> = {
  Submitted: 'pending',
  UnderReview: 'inProgress',
  NeedsClarification: 'warning',
  AwaitingExternalSetup: 'pending',
  ReadyToProvision: 'pending',
  Provisioning: 'inProgress',
  Completed: 'completed',
  Failed: 'error',
};
```

**Deviation note:** The spec (W0-G4-T06 §10 Rule 1) suggested `info`/`success`/`warning` variant names. The codebase uses `pending`/`inProgress`/`completed` which are the actual `StatusVariant` values defined in `@hbc/ui-kit`. The codebase values are correct and have been preserved.

**Typing note:** `STATE_BADGE_VARIANTS` is typed as `Record<ProjectSetupRequestState, string>` (not `StatusVariant`) because `@hbc/provisioning` is a headless package per Rule R6 in `package-relationship-map.md` and must not import `@hbc/ui-kit`. Consumers narrow the type at the call site.

**Consumers:** Estimating and Accounting `stateDisplayHelpers.ts` re-export from `@hbc/provisioning` as `STATE_BADGE_MAP` for backwards compatibility.

---

## 4. `roleComplexityMap.ts` Validation

**Location:** `packages/complexity/src/config/roleComplexityMap.ts`

All G4-required roles are present and correctly mapped:

| AD Group | Tier | G4 Role Context | Status |
|----------|------|-----------------|--------|
| `HBC-NewHire` | `essential` | Requester (new hire) | Present |
| `HBC-FieldStaff` | `essential` | Requester (field staff) | Present |
| `HBC-Reviewer` | `essential` | External reviewer | Present |
| `HBC-ProjectCoordinator` | `standard` | Estimating coordinator | Present |
| `HBC-ProjectManager` | `standard` | Project manager | Present |
| `HBC-Estimator` | `standard` | Estimating team | Present |
| `HBC-BusinessDevelopment` | `standard` | Business development | Present |
| `HBC-Admin` | `expert` | Admin | Present |
| `HBIntelAdmin` | `expert` | HB Intel admin | Present |
| `HBC-Director` | `expert` | Director | Present |
| `HBC-VP` | `expert` | VP | Present |
| `HBC-Executive` | `expert` | Executive | Present |

**Fallback tier:** `standard` (applied when no AD group matches)

**Evaluation order:** First match wins. Essential-tier groups are listed first, then standard, then expert.

---

## 5. `HbcComplexityDial` Placement

| Surface | Page Component | Placement | Variant |
|---------|---------------|-----------|---------|
| Estimating | `RequestDetailPage.tsx` | First child inside `WorkspacePageShell`, before `RequestCoreSummary` | `header` |
| Accounting | `ProjectReviewDetailPage.tsx` | First child inside `WorkspacePageShell`, before back link | `header` |
| Admin | `ProvisioningOversightPage.tsx` | First child inside `WorkspacePageShell`, before error banner | `header` |

**Not placed in:** `NewRequestPage`, `ProjectSetupPage` (queue list), `DashboardPage` (Project Hub)

---

## 6. Cross-Surface Consistency Rules

1. **Same state, same badge variant.** All surfaces use `getStateBadgeVariant()` from `@hbc/provisioning`. No surface may define its own state-to-variant mapping.

2. **Same core summary fields across apps.** Every app showing a project setup request must display all essential-tier fields (§2.1). Omission is only permitted when the field is unavailable in the data source.

3. **No cross-surface tier inconsistency.** A field at standard tier in one surface must be standard tier in all surfaces where it appears.

4. **No action affordances hidden by complexity gate.** Primary action buttons (Approve, Request Clarification, Place on Hold, Retry, Return to Setup Form) must never be inside a complexity gate. Exception: manual state override (expert-tier admin tool, not primary workflow action).

---

## 7. ClarificationBanner — Ungated Rationale

`ClarificationBanner` in Estimating `RequestDetailPage` is NOT wrapped in a complexity gate despite clarification note content being spec'd as standard-tier (§6.3). Rationale: the banner contains the primary action "Return to Setup Form" which must never be gated (Rule 4 above, spec §9.2/§10 Rule 4). The banner remains ungated as a whole. If detailed clarification metadata is added in the future, individual metadata fields within the banner may be gated independently.

---

## 8. Boundaries

| Boundary | Scope |
|----------|-------|
| T07 | Responsive/failure modes for complexity dial placement |
| T08 | Automated testing for complexity gate assignments |
| G5 | PWA equivalent complexity surfaces |
| Wave 1 | Interactive handoff complexity gating |

---

*End of complexity-application-map.md v1.0*
