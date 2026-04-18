# Prompt 03 — Refresh Docs and Capture Evidence

**Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty or verify drift.**

## Current issue
Once the curated seed path exists and has been validated, the repo documentation must reflect the new operating reality. Right now the documented provenance centers on:
- list schema
- homepage Quick Links extraction
- and the original command-band provisioning/seed actions

That is incomplete if a second, curated research-backed seed path now exists.

## Why this matters
Future maintainers need to understand the difference between:
1. extraction/parity seeding from homepage Quick Links, and
2. curated research-backed base catalog seeding.

If that distinction is not documented, future reruns may use the wrong action and unintentionally overwrite intent.

## Intended future state
The repo clearly documents:
- both seed models,
- which action key to run for each,
- how identity/upsert works,
- and where the curated seed payload lives.

## Repo/file scope
Refresh all materially affected docs, including where relevant:
- `docs/reference/sharepoint/list-schemas/hbcentral/README.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- any runner how-to doc that explains command-band provisioning/seeding
- any action catalog/operator doc that now needs the curated action documented

## Documentation expectations
### 1. Update schema docs to distinguish seed paths
Document that there are now two distinct seed intents:
- homepage Quick Links extraction/parity seed
- curated research-backed base-catalog seed

### 2. Document curated identity rules
Explicitly document:
- config profile reconciliation by `BandKey + Title`
- curated item reconciliation by `BandKey + ActionKey`
- explicit managed key set for the curated catalog
- non-destructive archive posture for unknown/manual rows

### 3. Document operator guidance
Add or update operator-facing guidance for:
- when to run the extraction/parity seed
- when to run the curated base-catalog seed
- why they are not interchangeable
- device-login usage
- artifact locations and what to inspect after a run

### 4. Capture evidence
Add or update durable evidence notes summarizing:
- the curated seed action key
- the validated run id
- what rows were written
- and whether any conflicts were encountered

## Acceptance criteria
- Docs are synchronized with the implemented curated seed path.
- A future maintainer can tell which seed action to use without ambiguity.
- The documentation no longer implies that homepage Quick Links extraction is the only seed provenance model.

## Done means
The implementation, the live-tenant validation, and the documentation now tell the same story.
