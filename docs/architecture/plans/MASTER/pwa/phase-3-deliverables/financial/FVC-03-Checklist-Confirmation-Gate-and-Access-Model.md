# FVC-03 — Checklist, Confirmation Gate, and Access Model

| Property | Value |
|----------|-------|
| **Doc ID** | FVC-03 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Checklist, Confirmation Gate, and Access Model |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file defines the Forecast Checklist model, the confirmation gate, the current access matrix, and the runtime behaviors that should surround checklist completion and version confirmation.*

---

## 1. Why the Checklist Exists

The checklist exists to convert a loosely disciplined monthly forecast process into a governed readiness gate.

It should answer:

- has the PM completed the required preparation work
- is the Working version ready to become an immutable checkpoint
- are key supporting materials and review steps complete
- are there unresolved staleness conditions that should block confirmation

---

## 2. Checklist Structure

### 2.1 Canonical checklist groups

The current source constants lock four groups:

- `RequiredDocuments`
- `ProfitForecast`
- `Schedule`
- `Additional`

### 2.2 Template size

The current source constants define a 19-item canonical template.

### 2.3 Current required-vs-optional posture

The current source template includes both required and optional items. Optional items should remain visible, but should not independently block confirmation unless separately elevated by explicit rules.

---

## 3. Checklist Instance Model

### 3.1 Checklist is version-scoped

Every checklist instance belongs to one specific `forecastVersionId`.

### 3.2 Checklist item fields

A real checklist item should capture:

- checklist item identity
- version linkage
- stable item ID
- group
- label
- completed boolean
- completedBy
- completedAt
- notes
- required boolean

### 3.3 Why the instance model is correct

This model gives the system:

- per-version accountability
- stable template identity
- full completion history potential
- the ability to regenerate a fresh instance on derivation

---

## 4. Canonical Template Behavior

### 4.1 Required Documents

These items prove the supporting documentation posture is current.

### 4.2 Profit Forecast

These items prove the PM has actively reviewed the financial logic, not just copied numbers forward.

### 4.3 Schedule

These items force alignment between financial forecasting and current schedule reality.

### 4.4 Additional

These items capture supporting readiness areas such as contingency, GC estimate confirmation, aging review, and conditional buyout-savings disposition.

---

## 5. Confirmation Gate

### 5.1 Core gate conditions already implemented

The current source governance logic already checks:

- version must be `Working`
- all required checklist items must be complete
- `staleBudgetLineCount` must be `0`

### 5.2 Contract-level gate conditions from the governing plan

The governing T03 contract also expects:

- required checklist completion
- valid/populated financial summary fields
- no unresolved reconciliation/staleness conditions
- no extreme overrun conditions without PM notes in specific cases

### 5.3 Why the gate matters

Without the gate, confirmation becomes ceremonial instead of governed.

---

## 6. Access Model

### 6.1 Current role-state access posture

The current source governance logic establishes this access structure:

| Role | Working | ConfirmedInternal | PublishedMonthly | Superseded |
|------|---------|-------------------|------------------|------------|
| PM | read/write | read/derive/designate | read | read |
| PER | hidden | read/annotate | read/annotate | read |
| Leadership | read | read | read | read |

### 6.2 Why the PM rules are correct

PM should:

- fully edit Working
- derive from confirmed state
- designate the reporting candidate
- not edit immutable versions

### 6.3 Why the PER rules are correct

PER should:

- never see the PM Working draft
- annotate confirmed and published snapshots
- not derive or designate candidates

### 6.4 Why Leadership remains read-only

Leadership visibility is important, but version-state control should remain narrow.

---

## 7. Recommended Runtime Checklist Behaviors

### 7.1 Checklist generation

A new checklist instance should be generated every time a new Working version is created.

### 7.2 Checklist completion ledger

The runtime model should preserve event history for:

- item completed
- item unchecked
- notes changed
- conditional relevance changes

### 7.3 Checklist summary projection

The UI should show:

- total required items
- completed required items
- incomplete required items
- optional items complete/incomplete
- overall confirmation readiness

### 7.4 Checklist blockers panel

When confirmation fails, the UI should present blockers clearly rather than just reporting a generic failure.

---

## 8. Recommended Runtime Additions

### 8.1 `ChecklistCompletionLedger`

Captures per-item completion events over time.

### 8.2 `ChecklistReadinessProjection`

Provides a simple runtime read model for:

- can confirm / cannot confirm
- blocker count
- required remaining
- optional remaining

### 8.3 `ConfirmationAttemptRecord`

Captures when PM attempted confirmation, whether it passed, and what blockers were returned.

### 8.4 `VersionAccessAuditRecord`

Optional but useful for auditing sensitive access patterns, especially around PER visibility.

---

## 9. Recommended User-Facing Experience

A proper checklist/version UX should visibly support:

- the current Working version’s checklist
- the blocker list
- one-click view of incomplete required items
- candidate/publication context for confirmed versions
- clear indication that a newly derived Working version gets a fresh checklist

---

## 10. Bottom-Line Recommendation

The checklist should remain a true gate, not a passive worksheet.

The runtime shell should make three things obvious to the user:

1. what is still incomplete
2. why confirmation is blocked
3. what happens to the checklist when a new Working version is derived

---

*Navigation: [FVC-04 Repository, Provider, and Persistence Seams →](FVC-04-Repository-Provider-and-Persistence-Seams.md)*
