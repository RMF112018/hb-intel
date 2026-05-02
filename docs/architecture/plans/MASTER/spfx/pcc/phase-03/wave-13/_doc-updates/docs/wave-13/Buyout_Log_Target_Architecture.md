# Wave 13 — Buyout Log Target Architecture

## Official Name

**Buyout Log**

## Subtitle

**Buyout Control Center**

## Objective

Define a PCC-native project-control module that governs buyout package status, budget-to-commitment visibility, Procore reconciliation, compliance readiness, procurement exposure, source lineage, and Priority Action candidates.

## Product Definition

The Buyout Control Center replaces siloed Excel / Procore / Sage / SharePoint workflows with a source-aware control surface. It helps project teams answer:

- What scope is unbought?
- What has been awarded but not committed in Procore?
- What is over/under budget?
- What is missing LOI, subcontract, PO, SDI, bond, insurance, submittal, or lead-time confirmation?
- What requires PM, PX, Project Accountant, Superintendent, Preconstruction, Executive, or Admin attention?

## MVP Host

Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.

## Primary UX

The target UX is exception-first:

1. Buyout Command Center
2. Buyout Package Table
3. Budget vs Commitment Matrix
4. Unbought Scope Queue
5. Procore Reconciliation View
6. Detail Drawer

## System Boundary

- PCC owns the buyout workflow record.
- Procore owns Procore-native commitments, POs, subcontracts, SOVs, commitment change orders, vendors/companies, and operational budget views.
- Sage owns accounting truth.
- SharePoint / OneDrive own evidence and document storage.
- PCC stores evidence-link records and source lineage, not source-system binaries by default.

## Guardrails

No Procore write-back, no Sage write-back, no external mutation, no automatic contracts/POs/commitments/CCOs/accounting entries, no production rollout, and no legal/accounting determination engine.
