# 12 — Security, Governance, and Permissions

## Role Separation

### Marketing Users

Can:
- create/edit content records;
- validate content;
- stage homepage placement;
- publish if granted publisher role;
- archive content.

Cannot:
- edit backend URL;
- edit API resource;
- edit list GUIDs;
- edit accepted origins;
- edit package/manifest governance;
- see secrets or secret references beyond safe labels.

### Admin Users

Can:
- manage Config tab;
- validate list/API/token readiness;
- provision or validate SharePoint artifacts;
- manage registry entries;
- inspect admin diagnostics;
- approve production policy.

## Recommended Entra Groups

- `HB Foleon Marketing Editors`
- `HB Foleon Publishers`
- `HB Foleon Admins`
- `HB Platform Config Admins`
- `HB Platform Config Readers`

## Backend Authorization

Maintain route-level authorization:

- `view`
- `edit`
- `publish`
- `place`
- `sync`
- `admin`

Map role claims or group claims consistently. Do not rely on property-pane flags for permission authority.

## Secrets

Never store these in SharePoint list fields:

- Foleon client secret.
- Graph app client secret.
- Function host keys.
- Bearer tokens.
- App-only Graph tokens.

Store only:

- Key Vault secret name/reference;
- App Configuration reference key;
- safe presence/status booleans;
- redacted fingerprints.

## URL and Origin Governance

Hard rules:

- Production mode accepts only production viewer URLs.
- Preview URLs require explicit admin-review mode.
- Accepted origins are exact-origin matches; no wildcards.
- Block unknown origins.
- Do not promote preview URLs to production content.

## Audit Logging

Log:

- content create/update/publish/archive;
- placement create/update/deactivate;
- config changes;
- validation runs;
- sync runs;
- blocked publish attempts;
- auth denials.

For logs, include:

- correlation ID;
- user UPN or stable ID;
- role family;
- action;
- target record ID;
- result;
- request ID.

Do not log secrets or tokens.

## Rollback

Rollback paths:

1. Use registry effective dates to revert to prior active values.
2. Use page-property override for emergency break-glass.
3. Revert package to last known good `.sppkg`.
4. Disable Foleon homepage lanes via registry flag.
5. Fall back to clearly labeled preview/sample state if live content is unavailable.

## Required Proof

- Non-admin user cannot open Config edit controls.
- Marketing editor cannot change API base URL.
- Publisher can publish only when validation passes.
- Admin can validate config without seeing secrets.
- Backend rejects unauthorized mutation even if frontend is bypassed.
