# Wave 13 System Of Record And Integration Model

Date: 2026-05-02
Wave: 13
Module: `Buyout Log` (`Buyout Control Center`)

## Purpose

Define Wave 13 system-of-record ownership and integration posture so Buyout Log preserves external-source authority boundaries while enabling PCC-native workflow governance.

## Field-Family Ownership

| Field Family                                           | Owner                                  |
| ------------------------------------------------------ | -------------------------------------- |
| PCC buyout status / BIC / exceptions                   | PCC                                    |
| Procore commitments / POs / subcontracts / SOVs / CCOs | Procore                                |
| Procore operational budget views                       | Procore operational context            |
| Sage committed / actual / accounting cost              | Sage                                   |
| Evidence document binaries                             | SharePoint / OneDrive or source system |
| Evidence-link records and source lineage               | PCC                                    |

## System-of-Record Summary

| Domain                                | Owner                                  | PCC Behavior                                 |
| ------------------------------------- | -------------------------------------- | -------------------------------------------- |
| Buyout workflow posture               | PCC                                    | Create, maintain, audit                      |
| Reconciliation notes/disposition      | PCC                                    | Create, maintain, audit                      |
| External-source reference mapping     | PCC                                    | Maintain source-lineage metadata             |
| Procore operational financial records | Procore                                | Read, summarize, deep-link/reference         |
| Sage accounting records               | Sage                                   | Read/reference and label as accounting truth |
| Evidence/document binaries            | SharePoint / OneDrive or source system | Deep-link/reference                          |

## Integration Posture

```text
SPFx Buyout Surface
  -> PCC read-model client
  -> PCC backend read-model endpoint
  -> integration-provider boundary
  -> source adapters (Procore / Sage / SharePoint) in read-only posture
```

## Source-Lineage Expectations

- Source-derived values include lineage metadata identifying source system and mapped field family.
- Procore- and Sage-sourced values remain visually/semantically distinguished from PCC-native workflow fields.
- Evidence references are stored as links/metadata in PCC; binary ownership remains with source storage systems.

## Prohibited Behavior

- Direct SPFx-to-Procore behavior.
- Procore secrets in frontend code.
- Procore write-back.
- Sage write-back or accounting postings.
- Full Procore mirror in PCC.
- External-system mutation/sync/writeback behavior.
- Automatic creation of commitments, POs, subcontracts, CCOs, invoices, or accounting entries.

## Guardrail Confirmation

This Wave 13 document defines architecture boundaries only and does not authorize runtime, backend, SPFx, package, dependency, lockfile, manifest, tenant, or production-mutation changes.
