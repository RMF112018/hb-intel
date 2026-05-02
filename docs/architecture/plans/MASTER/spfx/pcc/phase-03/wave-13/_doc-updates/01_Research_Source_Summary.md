# 01 — Research Source Summary

## Research Direction

The target architecture is informed by current construction buyout, procurement, commitment, cost-management, compliance, and bid-leveling platform patterns.

## Key Findings

### Procore commitments

Procore's Commitments tool tracks project-level financial commitments such as contracts, purchase orders, status, current value, invoices/payments, SOV lines, purchase orders, subcontracts, and commitment change orders.

Architecture impact:

- PCC must not recreate Procore Commitments.
- PCC should read, summarize, deep-link, and reconcile Procore commitments/SOVs.
- Procore-derived values must remain read-only and source-labeled.

### Procore commitment change orders

Procore commitment change order workflows include SOV line items, budget codes, cost amounts, and ERP/accounting acceptance paths in some configurations.

Architecture impact:

- Commitment change orders may affect current commitment amount and buyout variance.
- PCC must show CCO impact as operational context only.
- ERP/accounting acceptance reinforces Sage/accounting truth boundaries.

### BuildingConnected bid leveling

BuildingConnected bid leveling organizes and compares submitted proposals, estimated cost, bid forms, line items, alternates, inclusions, notes, adjustments, apparent low, and soft award workflows.

Architecture impact:

- PCC Wave 13 will not implement bid management.
- PCC will retain bid-leveling context fields: leveled amount, inclusions/exclusions, alternates, adjustments, award rationale, and proposal evidence links.

### Procurement logs

A strong construction procurement log tracks component description, required-on-site date, lead time, required order date, actual order date, PO number, expected/actual delivery, receiving party, supplier contact, approvals, and notes. Procurement often depends on submittal approval.

Architecture impact:

- Buyout completion must account for long-lead and submittal risk.
- Detail drawer needs procurement/submittal milestones.
- Scheduler/Look Ahead linkage should be a future seam, not a Wave 13 scheduling engine.

### CMiC subcontract / compliance patterns

CMiC subcontract management includes subcontract details, SOVs, cost-code/category associations, bonding, insurance, lien waivers, and date-sensitive compliance requirements.

Architecture impact:

- SDI, bond, insurance, lien waiver, prequalification, and similar controls should be normalized into `ComplianceRequirement` child records.
- Compliance waivers require reason, approver, timestamp, and evidence.

### Sage / accounting pattern

Sage remains accounting truth for job-cost and accounting values. Procore operational financial values must not be treated as official accounting truth where Sage owns the record.

Architecture impact:

- All Sage values must be read-only and labeled as accounting-reference/accounting-truth values.
- PCC must not post accounting entries or infer official accounting position from Procore alone.

## Source URLs

See `reference/source_research_urls.json`.
