# PH7-SF-17: Admin Intelligence Layer — Proactive Alerts, Implementation Truth, & Approval Role Config

**Priority Tier:** 1 — Foundation (Admin module core; must exist before platform goes live)
**Module:** Admin
**Interview Decision:** Q1 (Option B — proactive alert badges) + Q22 (Option B — Implementation Truth Layer) + Q12 (Admin-configurable approval roles)
**Mold Breaker Source:** UX-MB §11 (Implementation Truth Layer); ux-mold-breaker.md Signature Solution #11; con-tech-ux-study §6 (Admin experience gaps)

---

## Problem Solved

The HB Intel Admin module faces three distinct problems that, together, define whether the platform is trustworthy at the organizational level:

**Problem 1 — Reactive Admin:** Current construction platforms surface provisioning problems only when a user encounters a failure and files a ticket. By then, the PM has been waiting for access, the project launch is delayed, and confidence in the platform is damaged. Admins need to see emerging problems before users do.

**Problem 2 — Implementation Opacity:** IT administrators cannot tell whether SharePoint provisioning completed successfully, whether all required site columns were created, whether permissions are correctly applied, or whether a workflow configuration is valid — without manually checking each component. The "Implementation Truth Layer" is the Admin module's honest view of platform health.

**Problem 3 — Hardcoded Approval Authority:** Approval roles (who can approve a Living Strategic Intelligence contribution, who can approve a Go/No-Go Scorecard) are currently conceived as hardcoded business logic. As HB Intel's organizational structure evolves — new directors, restructured departments, contract approvers — hardcoded roles create change-management risk. Approval authority must be Admin-configurable without code deployments.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #11 (Implementation Truth Layer) specifies: "The Admin view shows the true implementation state of the platform — not what should be true, but what is actually true." Operating Principle §7.6 (Transparency) requires that the platform never pretend everything is fine when something is wrong.

Q1's proactive alert badge approach (Option B) directly applies this principle at the Admin navigation level: badge counts surface emerging problems before they become user-facing failures.

Q12's admin-configurable approval authority extends organizational transparency to governance: who can approve what is a visible, editable policy — not an invisible code constant.

---

## Feature 1: Proactive Alert Badge System

### Monitored Conditions

| Alert Category | Trigger | Severity |
|---|---|---|
| Provisioning Failures | SharePoint site creation failed or incomplete | Critical |
| Permission Anomalies | A user has access they shouldn't (or lacks access they should have) | High |
| Stuck Workflows | A handoff or approval has been pending >SLA threshold | High |
| Overdue Provisioning Tasks | Provisioning tasks past due date | Medium |
| Upcoming Expirations | Guest access, license assignments expiring within 30 days | Low |
| Stale Records | Records in draft state past their expected completion date | Low |

### Admin Navigation Badge

```typescript
// Rendered in the Admin module navigation
interface IAdminAlertBadge {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  totalCount: number;
}
```

**Visual behavior:**
- Admin nav item shows a badge: red for critical/high, amber for medium/low
- Badge count = total unacknowledged alerts
- Clicking opens the Admin Intelligence Dashboard

### Admin Intelligence Dashboard — Alert List

- Filterable list of active alerts grouped by severity
- Each alert: severity badge, category icon, description, affected record/user, timestamp, CTA ("View Provisioning Task", "Fix Permission", "Send Reminder")
- Acknowledge: marks alert as seen (does not resolve it — the underlying condition must be fixed)
- Auto-resolves when the underlying condition clears
- Export to CSV for IT audit reporting

---

## Feature 2: Implementation Truth Layer

### What It Shows

The Implementation Truth Layer is a dedicated Admin view that shows the **actual state** of HB Intel's SharePoint infrastructure — not the intended state, but what is verifiably true right now.

```
Implementation Truth Dashboard
├── SharePoint Infrastructure
│   ├── Site Collections: [N] provisioned, [N] healthy, [N] anomalies
│   ├── Site Columns: [N] created, [N] missing, [N] misconfigured
│   ├── Content Types: [N] deployed, [N] failures
│   └── Permission Groups: [N] groups, [N] membership anomalies
├── Azure Functions Backend
│   ├── Function Apps: [N] healthy, [N] degraded
│   ├── Queue Depth: [N] items pending
│   └── Error Rate: [N]% (last 24h)
├── Azure Cognitive Search
│   ├── Index Health: Healthy / Degraded / Error
│   ├── Last Index Run: [timestamp]
│   └── Unindexed Records: [N]
├── Notification System
│   ├── Pending Push Deliveries: [N]
│   ├── Email Bounce Rate: [N]%
│   └── Failed Digest Jobs: [N]
└── Module Record Health
    ├── BD Scorecards: [N] in valid state, [N] anomalies
    ├── Estimating Pursuits: [N] in valid state, [N] anomalies
    └── Project Hub: [N] in valid state, [N] anomalies
```

### Verification Probes

Each Infrastructure item is backed by a live probe:
- SharePoint: `GET /sites/hb-intel/_api/web/lists` → verify all required lists exist
- Azure Functions: health endpoint probe
- Azure Cognitive Search: index stats API
- Module records: count records in unexpected states (e.g., `workflowStage = 'approved'` but no `approvedAt` timestamp)

Probes run on a configurable schedule (default: every 15 minutes) via Azure Timer Functions.

---

## Feature 3: Admin-Configurable Approval Role Table

### Approval Authority Records

The Admin module maintains a configurable approval authority table that all packages consult when resolving approval eligibility:

```typescript
// packages/admin/src/types/IApprovalAuthority.ts

export interface IApprovalAuthorityRule {
  ruleId: string;
  /** What is being approved */
  approvalContext: ApprovalContext;
  /** AAD Object IDs or UPNs of users authorized to approve */
  approverUserIds: string[];
  /** AAD Group IDs authorized to approve (all members can approve) */
  approverGroupIds: string[];
  /** Whether any single approver is sufficient (OR) vs. all must approve (AND) */
  approvalMode: 'any' | 'all';
  /** Created/modified by */
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export type ApprovalContext =
  | 'bd-scorecard-director-review'
  | 'living-strategic-intelligence-contribution'
  | 'provisioning-task-completion'
  | 'handoff-package-acknowledgment';
```

**Phase 7 Default Approval Authority Rules:**

| Approval Context | Default Approvers | Mode |
|---|---|---|
| `bd-scorecard-director-review` | Director of Preconstruction OR Chief Estimator | any |
| `living-strategic-intelligence-contribution` | Director of Preconstruction OR Chief Estimator | any |
| `provisioning-task-completion` | Admin users | any |

### Admin UI for Approval Authority

- List of all approval contexts with current approver list
- Each rule: edit approvers (people picker, AAD group picker), change mode (any/all), save
- History: who changed what and when (audit trail)
- "Test" button: simulate whether a specific user would be eligible to approve this context

### Package Integration

Every package that involves approval consults the `ApprovalAuthorityApi`:

```typescript
// In @hbc/acknowledgment, when resolving eligible approvers
import { ApprovalAuthorityApi } from '@hbc/admin';

const eligibleApprovers = await ApprovalAuthorityApi.getApprovers('bd-scorecard-director-review');
// Returns IApprovalAuthorityRule → resolveParties uses this to populate the acknowledgment config
```

---

## Package Architecture (Admin Module)

```
apps/admin/ (or packages/admin/)
├── src/
│   ├── features/
│   │   ├── alerts/
│   │   │   ├── AdminAlertDashboard.tsx
│   │   │   ├── useAdminAlerts.ts
│   │   │   └── alertMonitors/           # one file per monitored condition
│   │   ├── truth-layer/
│   │   │   ├── ImplementationTruthDashboard.tsx
│   │   │   ├── InfrastructureProbeCard.tsx
│   │   │   └── useInfrastructureProbes.ts
│   │   └── approval-authority/
│   │       ├── ApprovalAuthorityTable.tsx
│   │       ├── ApprovalRuleEditor.tsx
│   │       └── ApprovalAuthorityApi.ts
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Stuck workflow alerts include BIC state of the stuck item |
| `@hbc/notification-intelligence` | Critical alerts → Immediate notification to Admin users; Medium/Low → Digest |
| `@hbc/acknowledgment` | `resolveParties` consults `ApprovalAuthorityApi` for all approval contexts |
| `@hbc/complexity` | Essential: alert badge only; Standard: alert dashboard; Expert: full Implementation Truth Layer |
| `@hbc/versioned-record` | Approval authority changes create version snapshots (governance audit trail) |

---

## Priority & ROI

**Priority:** P0 (Alert Badges + Approval Authority) / P1 (Implementation Truth Layer)
- Alert badges and configurable approval authority must exist before any approval workflow goes live
- Implementation Truth Layer must exist before production deployment

**Estimated build effort:** 5–6 sprint-weeks (alert monitors, probe engine, truth dashboard, approval authority UI + API)
**ROI:** Eliminates reactive IT support cycles; creates honest platform health visibility; allows organizational governance changes without code deployments

---

## Definition of Done

**Alert System:**
- [ ] 6 monitored conditions implemented with configurable SLA thresholds
- [ ] `AdminAlertDashboard` renders alert list with severity grouping and CTA links
- [ ] Alert badge in Admin navigation shows unacknowledged count
- [ ] Auto-resolve when underlying condition clears
- [ ] `@hbc/notification-intelligence`: Critical → Immediate; Medium/Low → Digest

**Implementation Truth Layer:**
- [ ] Infrastructure probes for: SharePoint lists, Azure Functions, Azure Cognitive Search, notification system
- [ ] Probe scheduler: Azure Timer Function, configurable interval (default 15 min)
- [ ] `ImplementationTruthDashboard` renders all probe categories with health indicators
- [ ] Module record health counts implemented for BD, Estimating, Project Hub

**Approval Authority:**
- [ ] `IApprovalAuthorityRule` schema defined and SharePoint list deployed
- [ ] `ApprovalAuthorityApi.getApprovers()` available to all packages
- [ ] `ApprovalAuthorityTable` lists all contexts with current rules
- [ ] `ApprovalRuleEditor` allows adding/removing approvers (people picker + AAD group picker)
- [ ] Change history with timestamp and modified-by tracking
- [ ] `@hbc/acknowledgment` integrated: `resolveParties` uses `ApprovalAuthorityApi`
- [ ] Unit tests on approval eligibility resolution
- [ ] E2E test: change approval authority in Admin → create scorecard → verify new approver is eligible

---

## ADR Reference

Create `docs/architecture/adr/0026-admin-intelligence-layer.md` documenting the proactive alert monitoring model, the Implementation Truth Layer probe architecture, the Admin-configurable approval authority design, and the rationale for keeping approval authority in a SharePoint list rather than application configuration files.
