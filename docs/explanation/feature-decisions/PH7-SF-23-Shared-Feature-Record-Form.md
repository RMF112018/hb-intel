# PH7-SF-23: Record Form — Shared Record Creation, Draft, Validation & Submission Runtime

**Priority Tier:** 2 — Application Layer (shared package; cross-module record lifecycle)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (now fully interview-locked)
**Mold Breaker Source:** UX-MB §10 (Workflow Composer); con-tech §5 (Progressive Disclosure)

---

## Problem Solved

HB Intel will create new records across many feature packages: pursuits, scorecards, meeting records, safety forms, action logs, reviews, issue records, configuration entries, and future field-capture workflows. The data models differ by module, but the structural workflow is the same:

- present a context-aware creation surface
- inject defaults and routing metadata
- support draft saving and recovery
- validate inputs and gating conditions
- persist to the active system of record
- hand off to downstream acknowledgments, notifications, and workflow steps

Without a shared package, each module will build its own create/edit form stack. The result is predictable:

- duplicated field-rendering logic and validation plumbing
- inconsistent draft-save behavior and recovery
- inconsistent create / edit / duplicate / template-from-existing behaviors
- repeated SharePoint list write logic in the MVP that becomes hard to swap when Azure becomes the system of record later
- inconsistent review-state, confirmation, and error handling across modules
- unnecessary UX drift between modules performing structurally identical work

The **Record Form** package is the shared runtime that standardizes record authoring while allowing each module to keep ownership of its schema, domain rules, and post-submit automations. It gives every module the same disciplined creation workflow without forcing those modules into a generic lowest-common-denominator form builder.

Every required review step or downstream action automatically becomes a granular BIC record in `@hbc/bic-next-move` with ownership avatars surfaced in the submit bar and in the `@hbc/project-canvas` “My Work” lane.

---

## Mold Breaker Rationale

The Workflow Composer principle in the Mold Breaker work argues that repeated operational workflows should be assembled from shared primitives rather than re-authored from scratch in every module. The progressive disclosure requirement from the con-tech study also applies directly here: users should not be forced into overly technical form experiences when the platform can expose only the right fields, decisions, and warnings at the right moment.

`@hbc/record-form` is the package that operationalizes those principles for authoring workflows and the foundation of the new reusable Tier-1 primitive.

It provides:
1. a declarative authoring runtime that prevents repeated orchestration logic across modules
2. complexity-aware disclosure with consistent Essential/Standard/Expert behavior
3. platform-owned draft/recovery/submission lifecycle guarantees
4. a persistence boundary that cleanly swaps SharePoint MVP writes for Azure-backed writes later

---

## Record Form Lifecycle Model

Every consuming module opts into the same lifecycle runtime while retaining schema control.

### Supported Modes
- `create` — author a brand-new record
- `edit` — modify an existing draft or editable record
- `duplicate` — create a new record from a prior one
- `template` — create from a predefined template/configuration
- `review` — read-only or partially locked mode before submission / publish

### Standard Lifecycle States
1. **Not started** — configuration loaded, no user edits yet
2. **Draft** — locally or remotely persisted draft exists
3. **Dirty** — changes made since last save
4. **Valid with warnings** — submittable with non-blocking warnings
5. **Blocked** — missing required data or failing hard validation
6. **Submitting** — persistence adapter in-flight
7. **Submitted** — normalized success response returned
8. **Failed** — normalized error payload available for retry / recovery

### Standard Actions
- Save draft
- Save & continue
- Submit
- Cancel
- Discard draft
- Duplicate from existing
- Restore last draft
- Open review summary

### Ownership and Handoff Integration
- each review/approval/handoff step can emit BIC ownership records
- BIC ownership appears inline in submit/review surfaces
- downstream assignment automatically propagates to My Work lane

### Lifecycle Safeguards and Gating
The runtime enforces standardized gating before persistence and handoff:

- required-field completeness checks at section and form level
- blocking vs warning validation split with explicit can-submit logic
- submit-bar state lock when blocking errors are unresolved
- deterministic transition rules for `draft -> dirty -> submitting -> submitted/failed`

### Review and Approval Step Semantics
For records that require downstream review, the runtime supports configurable step semantics:

- pre-submit review checkpoints (author-side confirmation)
- post-submit review checkpoints (assignee-side confirmation)
- blocking and non-blocking review steps
- owner-avatar projection for each active step
- traceable step completion and reassignment history

### Draft Recovery Behavior
Recovery behavior is standardized across modules:

- latest local draft is recoverable by context key
- stale draft warnings include timestamp and source
- user can restore, discard, or compare current vs saved draft
- restored drafts preserve validation metadata and warnings

### Submission Safety

Submission safety rules reduce accidental data loss and inconsistent writes:

- submit requires explicit intent from command surface
- duplicate-submit attempts are guarded while request is in-flight
- failure responses normalize field and form-level errors
- retry paths preserve both draft and prior error context

### Telemetry Emission Points

The lifecycle emits telemetry at key checkpoints:

- first-edit timestamp and completion timestamp
- save-draft and draft-recovery events
- submit-attempt, submit-success, submit-failure events
- review/handoff completion latency markers

---

## Record Form Structure

The package supports both single-surface and multi-step authoring patterns.

### Pattern A — Single-Surface Record Form
Best for short records such as:
- log entries
- configuration items
- small admin records
- simple requests

### Pattern B — Wizard-Based Record Form
Best for:
- multi-section forms
- forms with dependency-driven reveal logic
- handoff-driven records
- records requiring review before submit

Wizard mode composes with `@hbc/step-wizard` and preserves a uniform submit/review contract.

### Standard Building Blocks
- field groups / sections
- conditional reveal rules
- informational callouts
- required/optional field status
- inline validation
- summary sidebar / review panel
- submit bar with lifecycle feedback
- contextual metadata strip (project, owner, due date, step)
- inline AI actions and source-linked suggestions in approved surfaces

---

## Interface Contract

```typescript
// In @hbc/record-form primitive (new Tier-1 package)

export type RecordFormMode = 'create' | 'edit' | 'duplicate' | 'template' | 'review';
export type RecordFormStatus =
  | 'not-started'
  | 'draft'
  | 'dirty'
  | 'valid-with-warnings'
  | 'blocked'
  | 'submitting'
  | 'submitted'
  | 'failed';

export interface IRecordBicStepConfig {
  stepKey: string;
  stepLabel: string;
  ownerRoleKey: string;
  isBlocking: boolean;
}

export interface IRecordFormTelemetryState {
  formCompletionTime: number | null;
  submissionSuccessRate: number | null;
  draftRecoveryRate: number | null;
  handoffLatency: number | null;
  recordFormCes: number | null;
}

export interface IRecordFormDefinition<TRecord> {
  recordType: string;
  title: string;
  mode: RecordFormMode;
  sections: IRecordSectionConfig<TRecord>[];
  getDefaults?: (context: IRecordFormContext) => Partial<TRecord>;
  validateRecord?: (draft: Partial<TRecord>, context: IRecordFormContext) => IRecordValidationResult;
  persistenceAdapter: IRecordPersistenceAdapter<TRecord>;
  bicSteps?: IRecordBicStepConfig[]; // granular review/approval/handoff steps
  version: VersionedRecord; // from @hbc/versioned-record
  telemetry: IRecordFormTelemetryState;
}
```

(The entire model, offline logic, AI actions, BIC steps, review panel, and telemetry are now provided by the new `@hbc/record-form` primitive.)

---

## Component Architecture

```
packages/record-form/src/
├── components/
│   ├── HbcRecordForm.tsx
│   ├── HbcRecordFormWizard.tsx
│   ├── HbcRecordFieldRenderer.tsx
│   ├── HbcRecordReviewPanel.tsx
│   ├── HbcRecordSubmitBar.tsx
│   └── HbcRecordRecoveryBanner.tsx
├── hooks/
│   ├── useRecordForm.ts     # delegates to @hbc/record-form
│   ├── useRecordDraftPersistence.ts
│   └── useRecordSubmission.ts
├── adapters/
│   ├── createSharePointRecordAdapter.ts
│   └── createAzureRecordAdapter.ts
├── types.ts
└── index.ts
```

---

## Component Specifications

### `HbcRecordForm` — Shared Authoring Surface

**Visual behavior (Complexity-aware):**
- Essential: minimal required fields + simple submit bar
- Standard: full field renderer with inline validation and read-only review panel
- Expert: retrospective adjustments + full preview panel + configure link

### `HbcRecordFormWizard` — Multi-Step Composition Layer

**Visual behavior:**
- wraps section groups with `@hbc/step-wizard`
- persists each step transition through draft persistence runtime
- supports `save and continue later` and final review aggregation
- surfaces BIC owner avatars for blocking review/handoff steps

### `HbcRecordFieldRenderer` — Controlled Field Factory

- central renderer for `@hbc/ui-kit` field primitives
- consistent labels, helper text, required markers, and error placement
- inline AI actions/placeholders only in Standard/Expert modes

### `HbcRecordReviewPanel` — Pre-Submit Summary

Shows:
- required fields complete/incomplete
- warning count and unresolved blocks
- write metadata and downstream action preview
- deep-links to related items and pending BIC-owned actions

### `HbcRecordSubmitBar` — Lifecycle Command Surface

Shows:
- Save Draft
- Submit
- Cancel
- Discard Draft
- lifecycle status pills and ownership avatars
- optimistic status indicators: `Saved locally` / `Queued to sync`

---

## AI Action Layer Integration

AI suggestions (`Draft from daily logs`, `Suggest default from project context`, `Explain this warning`, `Recommend retrospective adjustment`) appear as contextual inline buttons and smart placeholders in field renderer, review panel, and submit bar surfaces.

AI constraints:
- no chat sidecar interface
- citation metadata is required
- explicit user approval is required before field mutation
- approved suggestions are persisted with provenance links and optional BIC step updates

---

## Persistence Boundary

A core reason this package exists is to isolate persistence transitions without rewriting authoring runtime behavior.

### MVP
- writes structured records to SharePoint list/document metadata targets
- normalizes lookup values and write receipts
- returns normalized record identifiers

### Future Phase
- swaps adapters to Azure-backed persistence
- preserves same lifecycle and submission contracts
- avoids module-by-module UI and workflow rework

All persistence writes carry immutable version/provenance metadata via `@hbc/versioned-record`.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/record-form` | New Tier-1 primitive providing the entire model |
| `@hbc/bic-next-move` | Granular BIC ownership for review/approval/handoff steps |
| `@hbc/complexity` | Essential/Standard/Expert progressive disclosure |
| `@hbc/versioned-record` | Immutable provenance, audit trail, snapshot freezing |
| `@hbc/related-items` | Direct deep-links from records and validation gaps |
| `@hbc/project-canvas` | Automatic placement in role-aware My Work lane |
| `@hbc/ui-kit` | Field primitives and layout |
| `@hbc/step-wizard` | Multi-step orchestration |
| `@hbc/session-state` | Draft persistence and recovery |
| `@hbc/record-form` telemetry | Five KPIs (form-completion time, submission success rate, draft recovery rate, handoff latency, record-form CES) surfaced in canvas and admin dashboard |

---

## Offline / PWA Resilience

Full tablet-native behavior: service worker caches the Record Form shell, field renderer, review panel, and submit bar; IndexedDB + `@hbc/versioned-record` persists drafts and state; Background Sync replays changes with optimistic UI and `Saved locally / Queued to sync` indicators.

Offline guarantees:
- local draft/save actions never block authoring progression
- queued submissions replay in deterministic order
- conflicts resolve via version append rather than overwrite
- audit trail captures local-save and sync-commit timestamps

---

## Priority & ROI

**Priority:** P1 — shared package should be implemented before create/edit workflows proliferate across modules; seed for the platform-wide `@hbc/record-form` primitive.
**Estimated build effort:** 4–6 sprint-weeks (now accelerated by reusing existing primitives).
**ROI:** Prevents repeated authoring-form drift, standardizes draft behavior, reduces module-by-module plumbing, and creates a durable system-of-record abstraction; measurable impact via UX telemetry.

---

## Definition of Done

- [ ] New `@hbc/record-form` Tier-1 primitive created and published
- [ ] All six locked integration patterns implemented and tested
- [ ] Offline/PWA resilience verified on tablet
- [ ] Embedded AI actions with provenance and approval guardrails
- [ ] Progressive disclosure via `@hbc/complexity` across all three modes
- [ ] Deep-links and canvas integration via `@hbc/related-items` and `@hbc/project-canvas`
- [ ] Versioned audit trail and admin governance via `@hbc/versioned-record`
- [ ] Five UX telemetry KPIs wired and surfaced
- [ ] Unit tests, Storybook stories for all modes and offline states
- [ ] ADR-0111-record-form-primitive created

---

## ADR Reference

Create `docs/architecture/adr/ADR-0111-record-form.md` (and companion ADR for the new `@hbc/record-form` primitive) documenting the shared record authoring boundary, separation of schema from lifecycle runtime, SharePoint-to-Azure persistence adapter strategy, granular BIC integration, complexity-adaptive disclosure, offline strategy, AI Action Layer embedding, cross-module deep-linking, versioning/governance, and telemetry KPIs.
