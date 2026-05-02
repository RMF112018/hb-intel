# Controlling Objective

## Module Identity

- Official module name: `Buyout Log`
- User-facing subtitle: `Buyout Control Center`
- Phase/Wave: `PCC Phase 3 / Wave 13`
- Primary record: `BuyoutPackage`

## Required Governance Sentence

```text
Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.
```

## Product Intent

Build a flagship PCC Project Readiness / project-controls control center that governs buyout workflow across workbook seed taxonomy, Procore read-only operational financial context, Sage accounting truth, SharePoint/OneDrive evidence links, PCC-native workflow state, reconciliation notes, BIC, exceptions, source lineage, and Priority Action candidates.

## Non-Goals

The module is not:

- a spreadsheet launcher;
- a Procore clone;
- a Sage clone;
- a generic procurement grid;
- a bid invitation marketplace;
- a material logistics platform;
- a legal/claims tool;
- an accounting posting tool;
- a production integration rollout.

## Required Initial Runtime Posture

- Read-only external source posture.
- GET-only backend read model.
- Fixture-first SPFx.
- Source-lineage display for source-derived values.
- Safe local workflow state only where explicitly model-owned by PCC.
- Candidate-only Priority Action posture.
