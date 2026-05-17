# Security and Validation Rules

## URL
- Accept absolute `https://` only.
- Reject all other schemes.
- Max length: 2048.
- Trim before persistence.

## Title
- Required.
- Trim.
- Collapse repeated whitespace.
- Max 80 characters.

## Entitlement
- Create requires actor entitlement to the project.
- Update/delete require creator ownership.

## Visibility
- `private`: creator only.
- `project`: all current My Projects viewers for that project.

## Persistence
- Soft delete only.
- Store creator UPN/OID server-side.
- Do not expose raw creator UPN/OID in the read model.

## Logging
Do not log:
- raw URL,
- title,
- UPN,
- bearer tokens.

Safe telemetry:
- command type,
- result status,
- visibility,
- whether Projects/Registry IDs were present.
