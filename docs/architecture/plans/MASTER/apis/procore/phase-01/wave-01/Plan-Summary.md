# Plan Summary — Wave 01

## Objective
Turn the existing repo into a safe, durable host for Procore.

## Governing call
- Keep `backend/functions/` as the primary integration host.
- Keep the existing Azure app registration as the protected-API / Entra trust seam.
- Use a Procore DMSA-backed client-credentials posture for the first enterprise sync wave.
- Use Key Vault for secrets, Blob for raw landing, Azure SQL for canonical storage, and SharePoint only for curated materializations.

## Success standard
Wave 01 is done only when:
- a Procore connection can be created, stored, tested, and governed
- raw payloads and checkpoints are durable and replayable
- canonical relational storage exists for first-wave subject areas
- project crosswalk/registry is durable
- publication contracts exist
- operator-facing sync diagnostics are real

## Instruction to the code agent
Do not re-read files already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
