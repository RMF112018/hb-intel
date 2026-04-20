# P1-F6-T09: Sage Intacct Implementation, Acceptance, Gates, and Known Unresolveds

## Acceptance Gates

- The connector remains read-only and ingest-first.
- Azure raw custody, normalized source-aligned records, thin canonical core mapping, and published finance read models are explicitly staged.
- Published consumer surfaces remain behind governed repositories.

## Known Unresolveds

- Exact route and object inventory must still be captured from the official Intacct OpenAPI and object indexes.
- Direct authoring-time access to the official contract URL was blocked by Cloudflare on 2026-03-25.
- Runtime implementation must not infer endpoint or schema structure beyond the verified official contract source.
