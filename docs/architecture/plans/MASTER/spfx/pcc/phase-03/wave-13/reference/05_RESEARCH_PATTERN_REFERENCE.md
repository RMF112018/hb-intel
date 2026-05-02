# Research Pattern Reference

Use these sources as product-pattern inputs only. They do not override HB Intel / PCC repo architecture, source-of-record boundaries, or Wave 13 guardrails.

## Research Themes

1. Construction buyout is the post-award bridge between preconstruction and execution; it finalizes subcontractors, suppliers, purchase orders, subcontracts, scope clarity, cost exposure, and schedule readiness.
2. Bid leveling should inform package comparison, scope-gap detection, inclusions/exclusions, internal adjustments, and award posture without turning PCC into a bid marketplace.
3. Procore commitments, purchase orders, subcontracts, SOVs, commitment change orders, vendors/companies, and budget views should be modeled as read-only source-lineage inputs in Wave 13.
4. Sage/accounting systems should remain accounting truth for committed/actual cost and job-cost references; PCC should not post accounting entries.
5. Compliance posture should include insurance, SDI, bonds, lien-waiver references, prequalification posture, and explicit waiver/audit requirements.
6. Procurement-risk posture should surface submittal dependencies, lead times, required-order dates, required-on-job dates, and schedule exposure.
7. Comparable products show useful patterns: command centers, exception queues, cost/commitment matrices, reconciliation checklists, detail drawers, and audit trails.

## Public Sources

| Source | URL | Pattern Use |
| --- | --- | --- |
| Procore construction buyout | https://www.procore.com/library/construction-buyout | Buyout occurs after GC award and before construction, finalizing subcontractors, suppliers, POs, scope, cost, and schedule readiness. |
| BuildingConnected bid leveling overview | https://support.buildingconnected.com/hc/en-us/articles/47949854611219-Bid-Leveling-Overview | Bid leveling compares proposals, identifies discrepancies, applies adjustments/notes, and supports soft award decisions. |
| BuildingConnected bid leveling adjustments | https://support.buildingconnected.com/hc/en-us/articles/360026547553-How-to-make-adjustments-to-bids-in-Bid-Leveling | Leveling plugs/adjustments are team-visible internal adjustments used to compare bids consistently. |
| Procore Commitments | https://support.procore.com/products/online/user-guide/project-level/commitments | Commitments expose current status/value of contracts and purchase orders, invoices, and payments. |
| Procore CCO | https://support.procore.com/products/online/user-guide/project-level/commitments/tutorials/create-a-commitment-change-order-cco | Procore treats purchase orders and subcontracts as commitments; commitment change orders can include SOV line items. |
| Sage 300 PO + Job Costing | https://help.sage300.com/en-us/2023/classic/Content/Operations/Purchase_Orders/Transactions/AboutProjectAndJobCosting.htm | Job-related PO transactions affect committed and actual quantities/costs in Project and Job Costing. |
| Trimble committed costs | https://help.trimble.com/vista/vista/costs-and-contracts/job-cost/costs/types-of-cost-information/committed-costs | Committed cost tracks purchase orders/subcontracts/material orders and remaining commitment reduces as actual costs are posted. |
| Procore SDI | https://www.procore.com/library/subcontractor-default-insurance | SDI protects GCs from subcontractor default risk and depends on robust subcontractor vetting/prequalification. |
| Procore insurance statuses | https://support.procore.com/faq/what-are-the-default-statuses-for-insurance-in-procore | Insurance compliance statuses include compliant, partially compliant/in progress, non-compliant, expired, unknown, and unregistered. |
| Procore commitment insurance compliance | https://support.procore.com/products/online/procore-pay/tutorials/manage-insurance-documents-and-compliance-statuses-for-a-commitment | Commitment insurance compliance derives from Directory insurance entries and should be source-labeled. |
| Outbuild submittal/procurement log | https://www.outbuild.com/construction-submittal-software | Submittals tied to schedule activities expose at-risk/overdue procurement timing and required-on-site dates. |
| QuoteToMe procurement | https://quotetome.com/ | Comparable procurement workflow converts quotes/receipts to POs, tracks receiving, and surfaces invoice matching/discrepancies. |
| Oracle Unifier Cost Manager | https://docs.oracle.com/cd/F74686_01/help/uDesigner/en/77649.htm | Cost Manager tracks budgets, project cost sheets, cost business processes, SOV, and cash flows by CBS codes. |
| Kahua cost management | https://www.kahua.com/product/cost-management-for-owners/ | Comparable cost-control platform manages budgets, commitments, change orders, audit trail, and forecast impact. |

## Implementation Translation

Convert research into safe PCC patterns:

- exception-first dashboard;
- package table;
- budget-vs-commitment matrix;
- unbought scope queue;
- reconciliation center;
- compliance/SDI/bond panel;
- procurement timing panel;
- evidence/source-lineage panel;
- audit history;
- role-specific display cues.

Do not clone external products and do not add external-system mutation.
