# 03 — Enhanced Target Architecture

## Architecture Statement

Wave 13 defines the **Buyout Log** as a PCC-native **Buyout Control Center** that governs project buyout scope from budgeted trade package through award, LOI, subcontract/PO, Procore commitment, compliance, procurement readiness, and reconciliation.

The module replaces the current siloed Excel / Procore / Sage / SharePoint workflow with a source-aware control surface. The existing Buyout Log workbook is preserved as the source field inventory and seed taxonomy, but the target UX is not a spreadsheet clone.

Procore remains the source of truth for Procore-native commitments, purchase orders, subcontracts, commitment SOVs, commitment change orders, companies/vendors, and operational budget views. Sage remains the accounting book of record. SharePoint / OneDrive remain evidence and document-storage systems. PCC owns the buyout workflow record, internal status, ball-in-court, exception classification, reconciliation notes, source lineage, evidence-link records, dashboard signals, and Priority Action candidates.

## MVP Screens

1. Buyout Command Center
2. Buyout Package Table
3. Budget vs Commitment Matrix
4. Unbought Scope Queue
5. Procore Reconciliation View
6. Buyout Package Detail Drawer

## Command Center Cards

- Buyout Completion
- Budget Exposure
- Reconciliation Health
- Compliance Exposure
- Procurement Exposure
- Priority Actions

## Detail Drawer Panels

1. Summary
2. Scope / Budget
3. Award / Bid-Leveling Context
4. Procore Commitment / SOV
5. Sage Accounting Reference
6. LOI / Subcontract / PO
7. Compliance / SDI / Bond
8. Procurement / Submittal / Lead-Time
9. Evidence
10. Reconciliation
11. Audit History

## Deferred Capabilities

- full bid invitation workflow;
- full bid-leveling marketplace;
- automatic subcontract / PO generation;
- Procore write-back;
- Sage write-back;
- procurement logistics platform;
- material receiving workflow;
- vendor prequalification engine;
- formal accounting reports;
- portfolio-level analytics;
- production integrations.

## Success Criteria

A project user should be able to determine:

- what scope is unbought;
- what is bought but not committed in Procore;
- where buyout is over/under budget;
- which packages have missing LOI, subcontract, SDI, bond, insurance, or evidence;
- which procurement items create lead-time or submittal exposure;
- which Procore or Sage values conflict with PCC workflow state;
- who owns the next action.
