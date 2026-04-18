# Legacy Fallback Contracts (Prompt 01)

This module locks Prompt 01 contracts for the Legacy Project Fallback Bridge.

## Scope

- Typed annual source configuration for 2019-2026 legacy project sites
- Typed list-descriptor contracts for HBCentral bridge lists
- Typed parser and matching assumptions
- Locked implementation placement constants

## Auth posture

- Service posture is app-only backend execution.
- Interim pilot identity is **HB SharePoint Creator** (`08c399eb-a394-4087-b859-659d493f8dc7`).
- This pilot identity is not the final production-rightsized identity.

## Secrets posture

- No secrets are stored in source control.
- Environment and Key Vault handling remains the source of truth for credentials and sensitive config.

## Locked locations

- Discovery service ownership: `backend/functions/src/services/legacy-fallback/*`
- List provisioning execution path (Prompt 02): `scripts/provision-legacy-fallback-lists.ts`

## Override/review list decision

- Separate override/review list is **not required** in Prompt 01.
- Review/override state remains on the registry record shape unless Prompt 06 proves a durable separation need.
