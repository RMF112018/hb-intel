# PH7-SF-25: Publish Workflow — Shared Issue, Distribution, Approval & Publication Governance

**Priority Tier:** 2 — Application Layer (shared package; cross-module publication governance)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (not yet interview-locked)
**Mold Breaker Source:** UX-MB §4 (Responsibility Attribution); con-tech §8 (Accountability)

---

## Problem Solved

HB Intel will frequently generate information that is not merely “exported” but formally **issued**. A draft report becomes the official report of record. A meeting package is published to the project team. A review summary is distributed to named stakeholders. A finalized output may require acknowledgment, version stamping, supersession, or revocation.

That is not just an artifact-generation problem. It is a workflow-governance problem.

Without a shared publication layer, each module will handle publication differently:

- one module will upload files to SharePoint with no formal state
- another will download PDFs locally and rely on email
- another will notify users without preserving what was published, by whom, or under what version
- approval, acknowledgment, supersession, and distribution logic will drift by module
- users will not have a reliable concept of “current published issue” versus “working draft”

The **Publish Workflow** package is the platform service that formalizes what it means to issue something in HB Intel. It governs state transitions, targets, approvals, acknowledgments, and publish receipts while remaining independent of the content itself.

---

## Mold Breaker Rationale

Responsibility Attribution and Accountability are central to operational trust. A platform that generates high-value outputs but cannot clearly show who published them, when they became active, what they superseded, and who received them is not a trustworthy system of record.

`@hbc/publish-workflow` creates that trust by standardizing publication governance:

1. A published artifact has a known state and issue trail.
2. Users can see whether a record is still draft, ready for issue, published, superseded, or revoked.
3. Publication targets are explicit rather than ad hoc.
4. Approval and acknowledgment hooks can be consistently inserted into the publish lifecycle.
5. Downstream consumers know which artifact is authoritative.

This package is not a renderer. It sits above the export layer and manages the controlled release of artifacts and record states.

---

## Publish Workflow Model

The package should support formal lifecycle states and explicit target definitions.

### Standard Publish States
- `draft`
- `ready-for-review`
- `approved-for-publish`
- `publishing`
- `published`
- `superseded`
- `revoked`
- `failed`

### Common Publish Events
- Request publish
- Approve publish
- Reject publish
- Publish now
- Supersede prior issue
- Revoke issue
- Reissue corrected version
- Confirm acknowledgment received

### Publish Targets
- SharePoint document library / folder
- in-app published record surface
- stakeholder distribution list
- future Teams / email delivery adapters
- future transmittal or formal issue package targets

---

## Publish Structure

The package should organize publication into four shared steps:

### Step 1 — Readiness Check
- required artifact exists
- required metadata present
- version / issue number resolvable
- approval gates satisfied
- target definitions complete

### Step 2 — Approval & Confirmation
- optional reviewer / approver path
- optional acknowledgment prompt before issue
- optional supersession warning if current published issue exists

### Step 3 — Publish Execution
- stamp issue metadata
- create publish receipt
- deliver artifact and/or state change to target(s)
- trigger notifications

### Step 4 — Post-Publish Governance
- show published state in source module
- retain superseded link chain
- emit activity events
- support revoke / reissue where configuration permits

---

## Interface Contract

```typescript
export type PublishState =
  | 'draft'
  | 'ready-for-review'
  | 'approved-for-publish'
  | 'publishing'
  | 'published'
  | 'superseded'
  | 'revoked'
  | 'failed';

export type PublishTargetType =
  | 'sharepoint-library'
  | 'in-app-record'
  | 'distribution-list'
  | 'teams'
  | 'email';

export interface IPublishTarget {
  key: string;
  type: PublishTargetType;
  displayName: string;
  targetRef: string;
  isRequired?: boolean;
}

export interface IPublishApprovalRule {
  key: string;
  label: string;
  requiredRoleKeys?: string[];
  requiresAcknowledgment?: boolean;
}

export interface IPublishRequest {
  sourceModuleKey: string;
  sourceRecordId: string;
  sourceVersionId?: string;
  artifactId?: string;
  title: string;
  issueLabel?: string;
  requestedByUserId: string;
  targets: IPublishTarget[];
  approvalRules?: IPublishApprovalRule[];
}

export interface IPublishReceipt {
  publishId: string;
  sourceRecordId: string;
  publishedAtIso: string;
  publishedByUserId: string;
  state: PublishState;
  issueLabel?: string;
  supersedesPublishId?: string;
  targetReceipts: {
    targetKey: string;
    success: boolean;
    externalRef?: string;
  }[];
}

export interface IPublishResult {
  success: boolean;
  receipt?: IPublishReceipt;
  message?: string;
  errorCode?: string;
}

export interface IPublishWorkflowAdapter {
  validateReadiness(request: IPublishRequest): Promise<string[]>;
  executePublish(request: IPublishRequest): Promise<IPublishResult>;
  revokePublish(publishId: string, reason: string): Promise<IPublishResult>;
}
```

---

## Component Architecture

```
packages/publish-workflow/src/
├── components/
│   ├── HbcPublishPanel.tsx             # main publish surface / side panel
│   ├── PublishTargetSelector.tsx       # choose / confirm publish destinations
│   ├── PublishApprovalChecklist.tsx    # readiness and approval requirements
│   ├── PublishConfirmDialog.tsx        # final confirmation + supersession warning
│   ├── PublishReceiptCard.tsx          # visible publish result / issue trail
│   └── PublishedStateBadge.tsx         # draft / published / superseded status pill
├── hooks/
│   ├── usePublishWorkflow.ts           # readiness, execution, revoke/reissue actions
│   └── usePublishReadiness.ts
├── adapters/
│   ├── sharePointPublishAdapter.ts
│   ├── inAppPublishAdapter.ts
│   └── distributionAdapter.ts
├── rules/
│   ├── readinessRules.ts
│   └── approvalRules.ts
├── types.ts
└── index.ts
```

---

## Component Specifications

### `HbcPublishPanel` — Shared Publication Surface

```typescript
interface HbcPublishPanelProps {
  request: IPublishRequest;
  onPublished?: (receipt: IPublishReceipt) => void;
}
```

**Visual behavior:**
- opens as a controlled side panel or modal from any publishing-capable module
- shows source title, record/version, issue label, and intended targets
- surfaces all readiness errors before the user can publish
- supports optional review checklist and acknowledgment actions
- clearly states whether the action is a first issue, a reissue, or a superseding issue

### `PublishApprovalChecklist` — Readiness Truth Surface

Shows:
- required artifact present
- required metadata present
- approver assigned / completed
- acknowledgment prerequisites
- supersession impact if an active issue already exists

The platform should make publication blockers visible and deterministic.

### `PublishReceiptCard` — Formal Issue Receipt

After publish, the user should see:
- publish ID / issue label
- timestamp
- publishing user
- targets reached
- superseded link if applicable
- revoke / reissue options if the configuration allows

This makes publish outcomes auditable and easy to reference later.

### `PublishedStateBadge` — Shared State Indicator

Used throughout consuming modules to show whether the current artifact or record is:
- draft
- ready for review
- published
- superseded
- revoked

A shared badge pattern helps users learn publication semantics across the platform.

---

## Separation from Export Runtime

`@hbc/publish-workflow` should never absorb low-level rendering responsibilities. The boundary should stay clean:

- `@hbc/export-runtime` generates artifacts
- `@hbc/publish-workflow` governs issue state, distribution, approvals, acknowledgments, and target delivery

This separation matters because some things may be published without a newly rendered artifact, while some exports are purely ad hoc and should never be treated as formally issued records.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/export-runtime` | optional artifact generation before publish |
| `@hbc/sharepoint-docs` | publish-to-library delivery target and metadata handling |
| `@hbc/versioned-record` | source version and supersession chain support |
| `@hbc/acknowledgment` | pre- or post-publish acknowledgment requirements |
| `@hbc/notification-intelligence` | issue notifications, escalations, supersession notices |
| `@hbc/workflow-handoff` | optional assignment transfer after issue |
| `@hbc/activity-timeline` | emit publish / revoke / reissue / supersede events |
| `@hbc/auth` | permission gating on who can publish, approve, or revoke |

---

## Expected Consumers

- Business Development: scorecards, pursuit summaries, intelligence packets
- Project Hub: meeting minutes, plans, turnover outputs, project reports
- Estimating: review packets, bid summaries, formal estimate issue outputs
- Executive reporting: approved KPI or financial packets
- Future compliance / transmittal-style workflows

---

## Priority & ROI

**Priority:** P1 — implement after export-runtime and version discipline are stable  
**Estimated build effort:** 4–5 sprint-weeks (publish state model, readiness engine, SharePoint/in-app targets, approval checklist, receipt model, revoke/reissue handling)  
**ROI:** converts ad hoc distribution into controlled publication, improves accountability, reduces per-module governance duplication, and creates a trustworthy concept of “current published issue” across the platform

---

## Definition of Done

- [ ] `PublishState`, target, approval, and receipt contracts defined
- [ ] `HbcPublishPanel` implemented with readiness validation
- [ ] publish readiness checks implemented and surfaced clearly
- [ ] SharePoint publish target adapter implemented
- [ ] in-app publish target adapter implemented
- [ ] supersession chain support implemented
- [ ] revoke and reissue flows supported where allowed
- [ ] approval / acknowledgment hooks integrated
- [ ] publish receipt visible and queryable by consuming modules
- [ ] notification emission on publish / supersede / revoke supported
- [ ] activity timeline event emission hook supported
- [ ] unit tests on readiness validation, target delivery, supersession, and revoke paths
- [ ] E2E test: generate artifact → publish to SharePoint + in-app state → supersede with new issue

---

## ADR Reference

Create `docs/architecture/adr/0034-publish-workflow.md` documenting the boundary between export and publish, the controlled publication state model, the supersession/revocation strategy, and the decision to treat formal issue management as shared platform infrastructure instead of a per-module convenience feature.
