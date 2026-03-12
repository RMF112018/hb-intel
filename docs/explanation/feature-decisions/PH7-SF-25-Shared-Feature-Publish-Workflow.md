# PH7-SF-25: Publish Workflow — Shared Issue, Distribution, Approval & Publication Governance
**Priority Tier:** 2 — Application Layer (shared package; cross-module publication governance)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (now fully interview-locked)
**Mold Breaker Source:** UX-MB §4 (Responsibility Attribution); con-tech §8 (Accountability)
---
## Problem Solved
HB Intel will frequently generate information that is not merely "exported" but formally **issued**. A draft report becomes the official report of record. A meeting package is published to the project team. A review summary is distributed to named stakeholders. A finalized output may require acknowledgment, version stamping, supersession, or revocation.
That is not just an artifact-generation problem. It is a workflow-governance problem.
Without a shared publication layer, each module will handle publication differently:
- one module will upload files to SharePoint with no formal state
- another will download PDFs locally and rely on email
- another will notify users without preserving what was published, by whom, or under what version
- approval, acknowledgment, supersession, and distribution logic will drift by module
- users will not have a reliable concept of "current published issue" versus "working draft"
The **Publish Workflow** package is the platform service that formalizes what it means to issue something in HB Intel. It governs state transitions, targets, approvals, acknowledgments, and publish receipts while remaining independent of the content itself.
Every publish request, readiness gap, approval step, supersession, revocation, and post-publish acknowledgment can automatically create a granular BIC record in `@hbc/bic-next-move`, with ownership avatars surfaced in `HbcPublishPanel` and in the `@hbc/project-canvas` "My Work" lane.
---
## Mold Breaker Rationale
Responsibility Attribution and Accountability are central to operational trust. A platform that generates high-value outputs but cannot clearly show who published them, when they became active, what they superseded, and who received them is not a trustworthy system of record.
`@hbc/publish-workflow` creates that trust by standardizing publication governance and serving as a reusable Tier-1 primitive.

1. A published artifact has a known state and issue trail.
2. Users can see whether a record is draft, ready for issue, published, superseded, or revoked.
3. Publication targets are explicit rather than ad hoc.
4. Approval and acknowledgment controls are inserted into one deterministic lifecycle.
5. Downstream consumers can identify the authoritative issue and the supersession chain.

This package is not a renderer. It sits above export-generation and manages controlled release, governance, and operational accountability.

---

## Publish Workflow Model

The package supports formal lifecycle states and explicit target definitions, with immutable provenance and telemetry emitted from primitive-owned runtime boundaries.

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

### Governance and Ownership Guarantees
- readiness checks, approvals, supersession, revocation, and acknowledgments are first-class workflow steps
- per-step ownership can project to BIC and role-aware My Work lanes
- every issue event is traceable to record version and actor metadata
- snapshot freeze metadata is preserved at publish and supersession boundaries

---

## AI Action Layer Integration

AI suggestions ("Generate readiness summary", "Suggest approval rule from project context", "Draft revocation reason", "Flag supersession risk") appear as contextual inline buttons and smart placeholders in `HbcPublishPanel`, `PublishApprovalChecklist`, and `PublishReceiptCard`.

AI guardrails are mandatory:
- inline only (no chat sidecar)
- source citation required for each recommendation
- explicit user approval required before state transition or persisted mutation
- approved AI actions can auto-create linked BIC records for publish-step ownership where configured

This keeps AI assist contextual, auditable, and compatible with immutable publication provenance.

---

## Interface Contract

```typescript
// In @hbc/publish-workflow primitive (new Tier-1 package)

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

export interface IPublishTelemetryState {
  publishCompletionLatency: number | null;
  approvalCycleTimeReduction: number | null;
  supersessionTraceabilityScore: number | null;
  publishGovernanceCes: number | null;
  formalIssueAdoptionRate: number | null;
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
  bicSteps?: IPublishBicStepConfig[]; // granular readiness/approval/supersession steps
  version: VersionedRecord; // from @hbc/versioned-record
  telemetry: IPublishTelemetryState;
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

(The entire model, offline logic, AI actions, BIC steps, receipt metadata, and telemetry are now provided by the new `@hbc/publish-workflow` primitive.)

---

## Component Architecture

```
packages/publish-workflow/src/
├── components/
│   ├── HbcPublishPanel.tsx
│   ├── PublishTargetSelector.tsx
│   ├── PublishApprovalChecklist.tsx
│   ├── PublishConfirmDialog.tsx
│   ├── PublishReceiptCard.tsx
│   └── PublishedStateBadge.tsx
├── hooks/
│   ├── usePublishWorkflow.ts     # delegates to @hbc/publish-workflow
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

**Visual behavior (locked Decision 2):**
- full panel visibility across all modes
- always shows readiness check, approval checklist, supersession warnings, and receipt metadata
- inline AI actions in panel/checklist/receipt, with approval gate and source citation
- BIC owner avatars projected for active workflow steps and mirrored to My Work

### `PublishApprovalChecklist` — Readiness Truth Surface

Shows:
- required artifact present
- required metadata present
- approver assigned / completed
- acknowledgment prerequisites
- supersession impact if an active issue already exists

This keeps publication blockers visible, deterministic, and ownership-scoped.

### `PublishReceiptCard` — Formal Issue Receipt

After publish, the user should see:
- publish ID / issue label
- timestamp
- publishing user
- targets reached
- superseded link if applicable
- revoke / reissue options if configuration allows
- optimistic sync indicators (`Saved locally`, `Queued to sync`) when offline queueing is active

This makes publish outcomes auditable and easy to reference later.

### `PublishedStateBadge` — Shared State Indicator

Used throughout consuming modules to show whether the current artifact or record is:
- draft
- ready for review
- published
- superseded
- revoked

A shared badge pattern keeps publication semantics consistent across the platform.

---

## Offline / PWA Resilience

Full tablet-native behavior: service worker caches `HbcPublishPanel`, `PublishApprovalChecklist`, and `PublishReceiptCard`; IndexedDB + `@hbc/versioned-record` persists publish requests and state; Background Sync queues publish executions with optimistic UI and `Saved locally / Queued to sync` indicators on the receipt card.

Operational guarantees:
- queued publish operations replay in deterministic order with immutable version snapshots
- readiness and approval context survives offline/online transitions without drift
- supersession/revocation actions remain traceable after reconnect
- failed replays remain queued for retry with user-visible diagnostics

Boundary discipline:
- export generation remains in `@hbc/export-runtime`
- publication governance remains in `@hbc/publish-workflow`
- publication can occur with or without new artifact generation, based on workflow context

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/publish-workflow` | New Tier-1 primitive providing the entire model |
| `@hbc/bic-next-move` | Granular BIC for readiness/approval/supersession/revocation/post-publish steps |
| `@hbc/complexity` | Full panel visibility across all modes (locked Decision 2) |
| `@hbc/versioned-record` | Immutable provenance, audit trail, snapshot freezing |
| `@hbc/related-items` | Direct deep-links from every publish receipt/supersession |
| `@hbc/project-canvas` | Automatic placement in role-aware My Work lane |
| `@hbc/export-runtime` | Optional artifact generation before publish |
| `@hbc/acknowledgment` | Pre- or post-publish acknowledgments |
| `@hbc/notification-intelligence` | Issue notifications and escalations |
| `@hbc/publish-workflow` telemetry | Five KPIs (publish-completion latency, approval-cycle time reduction, supersession traceability score, publish-governance CES, formal-issue adoption rate) surfaced in canvas and admin dashboard |

---

## Expected Consumers

- Business Development: scorecards, pursuit summaries, intelligence packets
- Project Hub: meeting minutes, plans, turnover outputs, project reports
- Estimating: review packets, bid summaries, formal estimate issue outputs
- Executive reporting: approved KPI or financial packets
- Future compliance / transmittal-style workflows
- Any module requiring governed publication with supersession/revocation controls

---

## Priority & ROI

**Priority:** P1 — implement after export-runtime and version discipline are stable; seed for the platform-wide `@hbc/publish-workflow` primitive.
**Estimated build effort:** 4–5 sprint-weeks (now accelerated by reusing existing primitives).
**ROI:** Converts ad hoc distribution into controlled publication; improves accountability; reduces per-module governance duplication; measurable impact via UX telemetry.

---

## Definition of Done

- [ ] New `@hbc/publish-workflow` Tier-1 primitive created and published
- [ ] All six locked integration patterns implemented and tested
- [ ] Offline/PWA resilience verified on tablet
- [ ] Embedded AI actions with provenance and approval guardrails
- [ ] Full panel visibility across modes (locked Decision 2)
- [ ] Deep-links and canvas integration via `@hbc/related-items` and `@hbc/project-canvas`
- [ ] Versioned audit trail and admin governance via `@hbc/versioned-record`
- [ ] Five UX telemetry KPIs wired and surfaced
- [ ] Unit tests, Storybook stories for all modes and offline states
- [ ] ADR-0109-publish-workflow-primitive created

---

## ADR Reference

Create `docs/architecture/adr/0109-publish-workflow.md` (and companion ADR for the new `@hbc/publish-workflow` primitive) documenting the boundary between export and publish, the controlled publication state model, the supersession/revocation strategy, granular BIC integration, offline strategy, AI Action Layer embedding, cross-module deep-linking, versioning/governance, and telemetry KPIs.
