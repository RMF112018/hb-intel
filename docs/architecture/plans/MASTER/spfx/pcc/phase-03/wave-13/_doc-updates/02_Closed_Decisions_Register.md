# 02 — Closed Decisions Register

## Core Product Decisions

| Decision Area | Closed Decision |
|---|---|
| Official module name | Buyout Log |
| User-facing subtitle | Buyout Control Center |
| MVP host | Project Readiness framework |
| Functional classification | Procurement / Project Controls |
| Future affinity work center | Procurement & Buyout Center |
| Primary record | `BuyoutPackage` |
| Workbook role | Source field inventory, seed taxonomy, import/mapping reference |
| Procore role | Read-only operational financial source |
| Sage role | Read-only accounting truth source |
| SharePoint role | Evidence/document storage and source-link target |
| PCC role | Workflow record, status, BIC, exceptions, reconciliation, source lineage, dashboard signals |
| Primary UX posture | Exception-first command center, not spreadsheet clone |
| Completion rule | Gate-based completion only |
| External system writes | Prohibited in MVP |

## Data Decisions

- BuyoutPackage is the canonical PCC record.
- Workbook rows are not active records until activated.
- Every workbook column survives as a traceable field.
- Many-to-many mappings are required:
  - one BuyoutPackage to many Procore budget lines;
  - one BuyoutPackage to many Procore SOV lines;
  - one Procore commitment to many BuyoutPackages;
  - one Sage cost code to many BuyoutPackages.
- Source lineage is required for every external/source-derived value.

## Workflow Decisions

- Use the closed state machine in `reference/buyout_state_machine.json`.
- Completion is blocked by unresolved vendor, amount, budget-code, compliance, procurement, and source-lineage defects.
- Waivers require reason, approver, timestamp, and evidence.
- Priority Actions are generated as candidates only; they do not execute external changes.

## Integration Decisions

- No direct SPFx-to-Procore.
- No Procore write-back.
- No Sage write-back.
- No automatic subcontract/PO/commitment/CCO/invoice/accounting entry creation.
- Backend-mediated read-only integration posture only.
- Procore operational financial values and Sage accounting values must be visually and semantically distinct.
