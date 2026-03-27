# Period History / Versions — UI Specification

## 1. Screen Identity

- **Screen name:** Period History / Versions
- **Module:** Project Hub / Financial
- **Primary route:** `/project-hub/$projectId/financial/forecast/history`
- **Screen type:** Immutable record and comparison workspace
- **Primary intent:** Let users inspect version lineage, compare periods or versions, understand stale / superseded transitions, and preserve confidence in the historical record.

## 2. Why This Page Exists

This page replaces the ad hoc historical trail currently spread across saved files, exported PDFs, email attachments, and memory.

It should be the permanent memory surface for the Financial module:
- what version existed,
- when it changed,
- who changed custody,
- what became stale,
- what was approved,
- and what was published or archived.

## 3. Primary Users

- Project Manager
- Project Executive
- Leadership
- MOE / governance roles
- Finance as readers

## 4. Recommended Layout Model

- **`WorkspacePageShell` layout:** `list`
- **Primary wireframe influence:** Concept 4 — trend / intervention posture
- **Secondary influence:** Concept 2 for command-oriented navigation

## 5. Region Map

1. `R1` — History Header / Filters
2. `R2` — Version Ledger
3. `R3` — Compare Workspace
4. `R4` — Activity / Audit Timeline
5. `R5` — Reopen / Governance Context Panel

## 6. Text Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ R1: History Header                                                          │
│ Project | Filters | Compare Selectors | Commands                            │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ R2: Version Ledger                   │ R3: Compare Workspace                │
│ period / version list                │ summary of changes                   │
│ state markers                        │ field / metric deltas                │
│ stale / superseded badges            │ notes / interpretation               │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ R4: Activity / Audit Timeline                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ R5: Reopen / Governance Context                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. Major Regions

### R1 — History Header / Filters
Must support:
- period filter,
- state filter,
- compare selectors,
- and commands like Open Version, Compare, Export, Request Reopen.

### R2 — Version Ledger
The ledger should list:
- period,
- version label,
- workflow state,
- stale / superseded markers,
- confirmed / published state,
- created and approved timestamps,
- and major notes.

This ledger is the primary browsing tool.

### R3 — Compare Workspace
Should support:
- selected version vs selected version,
- selected period vs prior period,
- summary-level delta explanation,
- and direct jumps to the affected working surfaces.

### R4 — Activity / Audit Timeline
Must include:
- state transitions,
- approvals,
- returns,
- stale events,
- refresh events,
- override actions,
- reopen events,
- and publication events.

### R5 — Reopen / Governance Context
Should surface:
- whether a closed period can be reopened,
- who may authorize it,
- what reason has been captured,
- and what happened historically on prior reopen events.

## 8. Component Inventory

### Governed `@hbc/ui-kit` primitives
- `WorkspacePageShell`
- `HbcCommandBar`
- `HbcDataTable` or history list
- panels / drawers
- timeline / status components

### Financial-specific composites
- `FinancialHistoryHeader`
- `FinancialVersionLedger`
- `FinancialCompareWorkspace`
- `FinancialAuditTimeline`
- `FinancialGovernancePanel`

## 9. Data Dependencies

- forecast version records,
- workflow states,
- approval records,
- stale / superseded transitions,
- compare snapshots,
- audit events,
- reopen records,
- publication state.

## 10. Interaction Model

### Browsing flow
- select period or version,
- inspect status and timestamps,
- open the version or compare it.

### Compare flow
- choose baseline and target,
- review deltas,
- jump to source surfaces if more detail is needed.

### Governance flow
- inspect reopen eligibility or history,
- request or review governed action.

## 11. State Model Behavior

This page must faithfully represent:
- Working
- Ready for Review
- In Review
- Returned for Revision
- Approved / Confirmed
- Stale
- Superseded
- Closed / Archived

All markers must be explicit and legible.

## 12. Responsive Behavior

### Desktop
- ledger + compare workspace together.

### Tablet
- compare workspace on second pane / tab.

### Mobile
- ledger first; compare opens separate full-screen view.

## 13. Complexity / Progressive Disclosure

### Essential
- simple version list and top-level status.

### Standard
- compare and activity timeline.

### Expert
- full audit payload, reopen nuance, and deep historical comparison.

## 14. Accessibility Requirements

- timeline items clearly labeled,
- compare outputs textual as well as visual,
- ledger status accessible beyond color badges,
- command flow keyboard friendly.

## 15. Key Acceptance Criteria

- A user can trust the module as the historical system of record for periodized forecast versions.
- A reviewer can compare versions without exporting data.
- Stale / superseded / reopened history is explicit and auditable.
- The page strengthens trust in the module’s governance model.
