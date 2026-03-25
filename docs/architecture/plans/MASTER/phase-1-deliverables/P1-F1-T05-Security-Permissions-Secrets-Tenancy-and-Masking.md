# P1-F1-T05: Security, Permissions, Secrets, Tenancy, and Masking

## 1. Security Posture

The native integration backbone must treat connector-runtime layers, publication layers, and downstream read layers as separate security surfaces.

## 2. Credential and Secret Boundaries

The following boundaries are locked:

- connector credentials and secrets belong to backend/platform custody, not client surfaces,
- downstream consumers must never handle connector secrets,
- secret rotation and replacement are operator concerns,
- later connector-family planning must not invent vendor-specific auth flows beyond official-source-supported capability statements.

## 3. Permission Propagation

Permission handling must distinguish:

- connector-runtime privileges,
- operator/admin privileges,
- publication privileges,
- downstream read privileges.

Downstream consumers inherit access only to published HB Intel views or governed repositories. They do not inherit connector-runtime scope automatically.

## 4. Tenancy

Connector and publication planning must account for:

- tenant-specific configuration,
- environment isolation,
- project/site or department scoping where applicable,
- separation between administrative operations and user-facing read-model surfaces.

## 5. Masking and Redaction

Raw and normalized layers may contain more sensitive detail than published read models. The planning rule is:

- broader sensitivity may exist in raw and normalized custody layers,
- published read models must expose only what downstream consumers need,
- masking and redaction must be available by data class and operator role.

## 6. Sensitivity Handling

The family explicitly anticipates higher-sensitivity handling for:

- employee and personnel data,
- financial data,
- internal operational details,
- audit and error payloads that may surface source-native fields.

## 7. Admin-Only Surfaces

The following concerns are operator or admin surfaces by default:

- replay,
- dead-letter inspection,
- connector run control,
- credential and configuration diagnostics,
- reconciliation override workflows,
- failure triage and recovery.
