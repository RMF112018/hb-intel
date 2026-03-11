# PH7-SF-23: Record Form — Shared Record Creation, Draft, Validation & Submission Runtime

**Priority Tier:** 2 — Application Layer (shared package; cross-module record lifecycle)
**Module:** Platform / Shared Infrastructure (cross-module)
**Interview Decision:** Addendum A — Recommended package candidate (not yet interview-locked)
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

---

## Mold Breaker Rationale

The Workflow Composer principle in the Mold Breaker work argues that repeated operational workflows should be assembled from shared primitives rather than re-authored from scratch in every module. The progressive disclosure requirement from the con-tech study also applies directly here: users should not be forced into overly technical form experiences when the platform can expose only the right fields, decisions, and warnings at the right moment.

`@hbc/record-form` is the package that operationalizes those principles for authoring workflows:

1. It allows a module to define a record form declaratively rather than re-implementing form orchestration.
2. It supports basic, essential, and expert form density through `@hbc/complexity`.
3. It makes draft recovery, autosave, and validation a platform behavior rather than a best-effort module detail.
4. It creates a clean persistence boundary between SharePoint-list writes in the MVP and Azure-backed persistence in future phases.

The package is not a “form builder for everything.” It is a controlled record-lifecycle runtime for HB Intel’s structured business objects.

---

## Record Form Lifecycle Model

Every consuming module should be able to opt into the same lifecycle:

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

---

## Record Form Structure

The package should support both single-surface and multi-step authoring:

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

Wizard mode should compose with `@hbc/step-wizard`, not replace it.

### Standard Building Blocks
- field groups / sections
- conditional reveal rules
- informational callouts
- required/optional field status
- inline validation
- summary sidebar / review panel
- submit bar with lifecycle feedback
- contextual metadata strip (project, record owner, due date, current step)

---

## Interface Contract

```typescript
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

export type FieldDisplayMode = 'hidden' | 'read-only' | 'editable';

export interface IRecordFormContext {
  moduleKey: string;
  recordType: string;
  projectId?: string;
  recordId?: string;
  templateId?: string;
  currentUserId: string;
  currentRoleKey: string;
  complexityLevel: 'basic' | 'essential' | 'expert';
}

export interface IRecordFieldConfig<TRecord> {
  key: keyof TRecord & string;
  label: string;
  fieldType:
    | 'text'
    | 'textarea'
    | 'number'
    | 'currency'
    | 'date'
    | 'datetime'
    | 'select'
    | 'multiselect'
    | 'toggle'
    | 'people-picker'
    | 'attachments'
    | 'custom';
  required?: boolean;
  helperText?: string;
  defaultValue?: unknown;
  displayMode?: (context: IRecordFormContext, draft: Partial<TRecord>) => FieldDisplayMode;
  validate?: (value: unknown, draft: Partial<TRecord>, context: IRecordFormContext) => string[];
}

export interface IRecordSectionConfig<TRecord> {
  key: string;
  title: string;
  description?: string;
  fields: IRecordFieldConfig<TRecord>[];
  isVisible?: (context: IRecordFormContext, draft: Partial<TRecord>) => boolean;
}

export interface IRecordValidationResult {
  blockingErrors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  canSubmit: boolean;
}

export interface IRecordSubmissionResult<TRecord> {
  success: boolean;
  recordId?: string;
  persistedRecord?: TRecord;
  message?: string;
  errorCode?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface IRecordPersistenceAdapter<TRecord> {
  loadInitialDraft(context: IRecordFormContext): Promise<Partial<TRecord> | null>;
  saveDraft(draft: Partial<TRecord>, context: IRecordFormContext): Promise<void>;
  submitRecord(draft: Partial<TRecord>, context: IRecordFormContext): Promise<IRecordSubmissionResult<TRecord>>;
}

export interface IRecordFormDefinition<TRecord> {
  recordType: string;
  title: string;
  mode: RecordFormMode;
  sections: IRecordSectionConfig<TRecord>[];
  getDefaults?: (context: IRecordFormContext) => Partial<TRecord>;
  validateRecord?: (draft: Partial<TRecord>, context: IRecordFormContext) => IRecordValidationResult;
  persistenceAdapter: IRecordPersistenceAdapter<TRecord>;
}
```

---

## Component Architecture

```
packages/record-form/src/
├── components/
│   ├── HbcRecordForm.tsx                # primary record form shell
│   ├── HbcRecordFormWizard.tsx          # wizard composition layer with @hbc/step-wizard
│   ├── HbcRecordFieldRenderer.tsx       # field factory / renderer
│   ├── HbcRecordSection.tsx             # section container
│   ├── HbcRecordReviewPanel.tsx         # pre-submit review summary
│   ├── HbcRecordSubmitBar.tsx           # save / submit / cancel command bar
│   └── HbcRecordRecoveryBanner.tsx      # restore draft / conflict / stale-draft messaging
├── hooks/
│   ├── useRecordForm.ts                 # core lifecycle state / validation / actions
│   ├── useRecordDraftPersistence.ts     # bridges to @hbc/session-state
│   └── useRecordSubmission.ts           # submit mutation orchestration
├── adapters/
│   ├── createSharePointRecordAdapter.ts # MVP persistence adapter
│   └── createAzureRecordAdapter.ts      # future persistence adapter
├── validators/
│   ├── required.ts
│   ├── numeric.ts
│   └── dateRules.ts
├── types.ts
└── index.ts
```

---

## Component Specifications

### `HbcRecordForm` — Shared Authoring Surface

```typescript
interface HbcRecordFormProps<TRecord> {
  definition: IRecordFormDefinition<TRecord>;
  context: IRecordFormContext;
}
```

**Visual behavior:**
- renders a standardized creation/edit shell with header, metadata strip, body, and submit bar
- uses `@hbc/complexity` to reduce or expand visible controls
- provides consistent dirty-state indicator and autosave feedback
- shows blocking validation inline and summarizes unresolved errors in the review panel
- shows normalized success / failure states after submit

### `HbcRecordFormWizard` — Multi-Step Composition Layer

```typescript
interface HbcRecordFormWizardProps<TRecord> extends HbcRecordFormProps<TRecord> {
  stepOrder: string[];
}
```

**Visual behavior:**
- wraps section groups in `@hbc/step-wizard`
- persists each step transition through `@hbc/session-state`
- supports “save and continue later”
- supports a final review step that aggregates warnings and unresolved optional data

### `HbcRecordFieldRenderer` — Controlled Field Factory

Receives field config and renders the right `@hbc/ui-kit` input. All field types should route through a single renderer so labels, required markers, helper text, and error placement remain consistent platform-wide.

### `HbcRecordReviewPanel` — Pre-Submit Summary

Shows:
- required fields complete / incomplete
- warning count
- key metadata that will be written on submit
- downstream actions that will occur after submission (notification, handoff, versioning, acknowledgment)

### `HbcRecordSubmitBar` — Lifecycle Command Surface

Shows:
- Save Draft
- Submit
- Cancel
- Discard Draft
- status pill (`Draft saved`, `Submitting`, `Submission failed`, etc.)

The user should not have to guess whether a record is locally saved, SharePoint-persisted, or fully submitted.

---

## Persistence Boundary

A core reason this package should exist is to isolate the persistence transition between phases:

### MVP
- writes structured records to SharePoint lists / document metadata
- supports lookup normalization and basic write receipts
- returns SharePoint-centric identifiers through a normalized contract

### Future Phase
- swaps module adapters to Azure-backed persistence
- preserves the same form orchestration contract
- minimizes rework at the UI / lifecycle layer

The package should make the persistence target an implementation detail behind `IRecordPersistenceAdapter<TRecord>` rather than something every module has to rewrite when the backend changes.

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/ui-kit` | field primitives, layout primitives, validation display surfaces |
| `@hbc/complexity` | adapts visible fields, helper text density, and advanced controls |
| `@hbc/step-wizard` | multi-step form orchestration for long authoring flows |
| `@hbc/session-state` | autosave, resume-later, stale draft recovery, offline-safe draft continuity |
| `@hbc/versioned-record` | optional snapshotting on submit or major edit checkpoints |
| `@hbc/acknowledgment` | optional pre-submit or post-submit review confirmations |
| `@hbc/workflow-handoff` | optional downstream handoff after successful submit |
| `@hbc/notification-intelligence` | send creation / assignment / escalation notifications after submit |
| `@hbc/data-access` | persistence adapter implementations for SharePoint and future Azure APIs |

---

## Expected Consumers

- Business Development: pursuit setup, scorecard authoring, strategic entries
- Estimating: intake forms, kickoff records, bid-support records
- Project Hub: meeting minutes, issue logs, plan records, safety workflows, turnover records
- Admin: controlled configuration entries, permission request forms, taxonomy maintenance
- Future modules: field capture, QC/Warranty overlays, staffing requests, scheduler generators

---

## Priority & ROI

**Priority:** P1 — shared package should be implemented before create/edit workflows proliferate across multiple modules  
**Estimated build effort:** 4–6 sprint-weeks (base shell, field renderer, validation framework, session-state integration, SharePoint adapter, wizard mode)  
**ROI:** Prevents repeated authoring-form drift, standardizes draft behavior, reduces module-by-module plumbing, and creates a durable system-of-record abstraction for the SharePoint-to-Azure transition

---

## Definition of Done

- [ ] `IRecordFormDefinition`, `IRecordPersistenceAdapter`, and validation contracts defined
- [ ] `HbcRecordForm` base shell implemented with normalized header/body/submit bar
- [ ] `HbcRecordFieldRenderer` supports the standard field catalog
- [ ] `HbcRecordFormWizard` composes with `@hbc/step-wizard`
- [ ] Draft save / restore implemented via `@hbc/session-state`
- [ ] Blocking vs warning validation states implemented
- [ ] MVP SharePoint persistence adapter implemented and tested
- [ ] normalized success / error submission receipt returned
- [ ] dirty-state / autosave / stale-draft messaging implemented
- [ ] complexity-aware field density supported
- [ ] version snapshot hook supported for records that require it
- [ ] unit tests on validation, draft persistence, adapter failure handling, and mode transitions
- [ ] E2E test: create record → save draft → reload → restore → submit successfully

---

## ADR Reference

Create `docs/architecture/adr/0032-record-form.md` documenting the shared record authoring boundary, the separation of schema from lifecycle runtime, the SharePoint-to-Azure persistence adapter strategy, and the reasons this capability belongs in a shared package instead of being rebuilt inside each domain module.
