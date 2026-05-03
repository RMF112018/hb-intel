# PCC Source-System Integration Contracts

## Purpose

Define integration posture for Microsoft Graph / SharePoint, Procore, Sage, Autodesk, Document Crunch, Adobe Sign, DocuSign, Compass / CRM, and future systems.

## Universal Rules

- All live integrations are future-gated.
- Backend-mediated read-only posture is required by default.
- Direct SPFx-to-source-system runtime calls are prohibited unless a future approved gate explicitly permits a safe exception.
- Source systems retain source-owned records.
- PCC stores reference, lineage, evidence-link, and derived summary metadata.
- All live reads require permission, audit, caching, throttling, and stale-state rules.

## Microsoft Graph / SharePoint

- Use delegated access where user-context is required.
- Use app-only only where explicitly approved.
- Prefer delta query and change notifications where supported.
- Honor throttling and `Retry-After`.
- Do not over-poll.

## Procore / Sage / Autodesk / Other Systems

- Use backend-only integration adapters.
- No source-system writeback in MVP.
- No source-owned field overwrite.
- No automatic legal/accounting/warranty determinations.

## Reference JSON

Use `reference/source_system_integration_contracts.json` as machine-readable source.
