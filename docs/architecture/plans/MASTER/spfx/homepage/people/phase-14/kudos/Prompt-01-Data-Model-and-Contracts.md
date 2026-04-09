# Prompt 01 — Data Model and Contracts

Use the v3 package, the live repo, and the Prompt 00 authority lock to normalize the HB Kudos data model and implementation contracts against the final SharePoint list posture.

## Objective

Define and/or refactor the typed contracts so the repo uses a clean, explicit, final-state operating model for:

- workflow/status
- recipients
- visibility
- scheduling
- prominence
- claim/assignment
- audit events
- employee-facing recognition view models
- governance workspace view models

The goal is to eliminate schema drift, loose strings, and placeholder contracts.

## Governing Inputs

Use at minimum:
- current code contracts/hooks/helpers in the HB Kudos / People & Culture seams
- `People Culture Kudos` list schema
- `Kudos Audit Events` list schema
- Prompt 00 output
- current `packages/ui-kit/src/homepage.ts` exports to understand current shared component prop shapes

## Required Contract Outcomes

### 1. Typed recipient contracts
Replace any final-state contract that treats recipients as a single string.

Define a typed recipient model that cleanly represents:
- individual recipients
- team recipients
- department recipients
- project-group recipients
- mixed-recipient submissions

The result should support:
- SharePoint write payloads
- read normalization
- employee-facing summary rendering
- detail-panel rendering
- governance filtering/search

### 2. Workflow/status contracts
Normalize the live workflow model into explicit internal types and mapping helpers for:
- pending
- revisionRequested
- approved
- approvedScheduled
- rejected
- withdrawn
- removedUnpublished
- flaggedForAdminReview as a distinct governance flag/overlay where appropriate

### 3. Visibility contracts
Normalize:
- public visibility
- associated-only visibility
- internal-only visibility

Be explicit about:
- current public visibility
- associated visibility
- archive eligibility
- recipient visibility before/after publish

### 4. Scheduling/prominence contracts
Define clean contracts for:
- scheduled publish metadata
- pinned state/order
- featured state/expiration
- prominence failures
- admin-review flagging for missed prominence outcomes

### 5. Work-management contracts
Define clean contracts for:
- claim owner
- assigned owner
- reassignment
- reviewed by / reviewed at
- queue ownership views
- overdue metadata and reminder targeting

### 6. Audit-event contracts
Define typed event contracts aligned to the audit list:
- event type
- actor
- event time
- public note
- internal note
- old/new value payload shape
- reducer/replay friendliness

## Required Shared View-Model Outcomes

Create or normalize shared view-model contracts for:

### Employee-facing recognition
- spotlight item
- feed/rail/archive item
- recipient summary model
- detail-panel recognition sections

### Governance workspace
- queue row
- toolbar/filter state
- governance detail sections
- state/aging/ownership chips
- audit timeline entries

Where these models expose repeated visual patterns, shape them so they can feed shared homepage-safe primitives rather than local one-off markup.

## Tasks

1. Audit current contracts/types/hooks/helpers.
2. Identify schema drift, placeholder strings, and missing enums.
3. Define or refactor typed recipient contracts.
4. Define or refactor workflow/visibility/scheduling/prominence contracts.
5. Define or refactor audit-event contracts.
6. Define or refactor shared employee/governance view models.
7. Update affected helpers/adapters as needed so later UI prompts are building on final-state contracts.

## Deliverables

Return:

1. changed-file summary
2. contract map
3. recipient-model summary
4. workflow/status map
5. event-type map
6. known schema/code mismatches resolved
7. remaining blockers, if any

## Important Rules

- Do not preserve stringly-typed recipient or workflow contracts merely for backward convenience.
- Prefer explicit mapping helpers over loose string comparisons scattered across files.
- Keep local business/data logic local, but shape the contracts so the later shared-primitive work can stay disciplined.
- Do not re-read files that are still within your active context window or memory unless a detail is genuinely uncertain.
