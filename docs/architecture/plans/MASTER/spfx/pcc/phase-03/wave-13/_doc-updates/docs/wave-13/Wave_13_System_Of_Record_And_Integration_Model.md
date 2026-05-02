# Wave 13 — System of Record and Integration Model

## System of Record Summary

| Domain | Owner | PCC Behavior |
|---|---|---|
| Buyout workflow status | PCC | Create, maintain, audit |
| Ball in Court | PCC | Create, maintain, audit |
| Internal notes / reconciliation disposition | PCC | Create, maintain, audit |
| Procore commitments / POs / subcontracts | Procore | Read, summarize, deep-link |
| Procore commitment SOV | Procore | Read, summarize, map |
| Procore commitment change orders | Procore | Read and summarize exposure |
| Procore operational budget views | Procore | Read and label as operational context |
| Sage committed/actual/accounting costs | Sage | Read/reference and label as accounting truth |
| SharePoint / OneDrive evidence files | SharePoint / OneDrive | Deep-link/reference |
| Evidence link records | PCC | Store link, classification, lineage |

## Integration Posture

```text
SPFx Buyout UI
  → PCC API client
  → PCC backend read-model endpoint
  → integration provider boundary
  → Procore / Sage / SharePoint read-only source adapters
```

## Prohibited Behavior

- Direct SPFx-to-Procore.
- Procore secrets in frontend.
- Procore write-back.
- Sage write-back.
- Full Procore mirror.
- Accounting postings.
- Automatic commitments, POs, subcontracts, SOVs, CCOs, invoices.
- External-system mutation.
