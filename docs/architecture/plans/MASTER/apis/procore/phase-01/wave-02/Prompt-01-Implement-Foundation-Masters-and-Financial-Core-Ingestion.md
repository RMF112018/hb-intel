# Prompt-01 — Implement Foundation Masters and Financial Core Ingestion

## Objective
Implement the first production Procore subject areas: foundation masters and financial core.

## Governing authorities
- Procore package files:
  - `04-Company-Level-Model.md`
  - `05-Portfolio-Level-Model.md`
  - `06-Project-Level-Model.md`
  - `07-Transactional-and-Event-Level-Model.md`
  - `09-Endpoint-to-Entity-Crosswalk.csv`
  - `extraction_priority_matrix.csv`
- Repo authorities:
  - the new Wave 01 connection/raw/canonical seams
  - `docs/how-to/developer/native-integration-backbone-implementation-guide.md`

## Repo seams to inspect
- new Procore connector services
- canonical relational schema/mappers
- publication services
- admin/run-control surfaces

## Current gap to close
The architecture may exist after Wave 01, but there is still no first-wave business data landing in canonical/publication form.

## Required implementation outcome
1. Ingest and map:
   - company
   - project
   - user
   - vendor
   - WBS / cost-code / sub-job foundations
2. Ingest and map financial core:
   - budget views/current state
   - budget snapshots where approved in the design
   - commitments and relevant line items
   - direct costs
   - prime-contract / owner-invoice / change subject areas selected for first wave
3. Publish project and portfolio cost/change summaries.

## Proof of closure
Return:
- exact subject areas implemented
- extraction cadence chosen per subject area
- canonical tables populated
- publication/read-model outputs added
- sync and failure behavior for these areas

## Guardrails
- Do not overreach into lower-priority long-tail subjects in this prompt.
- Do not expose raw canonical internals directly to consumers.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
