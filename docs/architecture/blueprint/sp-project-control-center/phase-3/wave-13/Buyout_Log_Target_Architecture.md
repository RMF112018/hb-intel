# Wave 13 Buyout Log Target Architecture

Date: 2026-05-02
Wave: 13
Official module name: `Buyout Log`
User-facing subtitle: `Buyout Control Center`

## Objective

Define the Wave 13 Project Readiness architecture for a PCC-native, exception-first buyout module that governs package-level buyout posture, reconciliation, source lineage, and actionability without external-system mutation.

Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.

## Product Definition

The Buyout Control Center replaces siloed Excel / Procore / Sage / SharePoint tracking with a source-aware control surface that helps teams answer:

- what scope is unbought;
- what has been awarded but not committed;
- what is over/under budget;
- what is missing LOI, subcontract/PO, compliance, or procurement readiness details;
- what requires role-specific follow-up.

## Developer Decision Summary

| Decision Area              | Closed Architecture Posture                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| Primary record             | `BuyoutPackage`                                                                             |
| Workbook role              | Source field inventory and seed taxonomy, not UX contract                                   |
| Procore role               | Read-only operational financial source                                                      |
| Sage role                  | Read-only accounting truth                                                                  |
| SharePoint / OneDrive role | Evidence/document storage                                                                   |
| PCC role                   | Workflow state, BIC, exceptions, reconciliation, source lineage, Priority Action candidates |

## Exception-First UX Model

1. Buyout command center for exception triage.
2. Buyout package table with package-level ownership and status.
3. Budget vs commitment posture view.
4. Unbought scope queue.
5. Reconciliation view for source-linked discrepancies.
6. Detail drawer for package-level decisions, notes, and lineage.

## Workbook-Source Truth Context (Prompt 01)

Source workbook:

- path: `docs/reference/example/financial/Buyout Log_Template 2025.xlsx`
- sheet: `Sheet1`
- used range: `A1:N88`
- header row: `6`
- candidate buyout rows: `8–85`
- summary rows: `86–88`
- hidden rows/columns: none
- data validations: none
- conditional formatting: none
- defined names: none

Workbook-derived structure is reference input for taxonomy and field lineage only. It does not define the runtime UX contract.

## Core Boundaries

- PCC owns buyout workflow state, BIC, exceptions, reconciliation posture, lineage metadata, and action candidates.
- Procore owns Procore-native commitments, POs, subcontracts, SOVs, commitment change orders, vendors/companies, and operational budget context.
- Sage owns accounting truth.
- SharePoint / OneDrive (or source systems where appropriate) own document binaries.
- PCC stores evidence-link and lineage records, not binary payload copies by default.

## Integration and Guardrails

- Read-only external source posture for Procore/Sage/SharePoint references.
- No direct SPFx-to-Procore behavior.
- No Procore write-back.
- No Sage write-back or accounting postings.
- No external-system mutation/sync/mirror behavior.
- No automatic creation of commitments, POs, subcontracts, CCOs, invoices, or accounting entries.
- No legal/claim/entitlement/compensability/delay-damages determination engine.

## Definition of Done

1. Wave 13 architecture is defined as Buyout Log with Buyout Control Center subtitle.
2. Exception-first model, ownership boundaries, and decision posture are explicit.
3. Workbook-source truth context is captured as reference-only architecture input.
4. Guardrails and no-mutation boundaries are explicit and consistent.
