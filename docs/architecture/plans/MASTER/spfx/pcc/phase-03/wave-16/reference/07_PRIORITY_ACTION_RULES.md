# 07 — Priority Actions Rules

## Objective

Define settings-related Priority Action candidates without giving Wave 16 ownership of Priority Actions lifecycle commands.

## Candidate Types

| Candidate Type | Trigger | Severity | Default Owner |
| --- | --- | --- | --- |
| `settings-missing-required` | Required setting has no effective value | High | PCC Admin / IT |
| `settings-validation-blocked` | Latest validation status is `Blocked` | High | Setting owner |
| `settings-validation-warning` | Latest validation status is `Warning` | Medium | Setting owner |
| `settings-stale-override` | Override expired or nearing expiration | Medium | PM/PX + PCC Admin |
| `settings-pending-approval` | Change request pending beyond SLA | Medium | Approval route owner |
| `settings-admin-verification-required` | Approval effective but admin verification pending | High | IT/PCC Admin |
| `settings-secret-reference-missing` | Secret-reference setting lacks valid reference | High | IT |
| `settings-source-drift` | Source-derived setting conflicts with policy snapshot | Medium/High | Source owner |
| `settings-backend-unavailable` | Settings read model degraded | Medium | IT |
| `settings-duplicate-request` | Duplicate change request candidate detected | Low | PCC Admin |

## Severity Mapping

| Condition | Severity |
| --- | --- |
| Security, secret, permission, or validation blocked | High |
| Missing required operational/integration setting | High |
| Stale override, source drift, pending approval past SLA | Medium |
| Informational warning or pending future-dated override | Low/Medium |
| Backend unavailable in fixture/test mode | Medium unless repeated/production |

## Dedupe Key Format

```text
priority::settings::{projectId}::{candidateType}::{settingKey}::{sourceRefId || "none"}
```

## Suppression Rules

- Suppression must be explicit and auditable.
- Suppression cannot hide security/secret blocked conditions from authorized admins.
- Suppression cannot resolve the underlying setting validation state.
- Suppressed items still appear in audit/history where authorized.

## Resolve Rules

A candidate resolves only when the underlying source condition changes:

- missing required setting receives valid effective value;
- validation blocked/warning returns to valid;
- expired override is renewed, removed, or superseded;
- pending approval closes;
- admin verification completes;
- secret reference is restored;
- backend/source recovers;
- duplicate request is cancelled/merged.

## Project Home Summary Rules

Project Home may display:

- count of blocked settings;
- count of missing required settings;
- count of pending approval/admin verification items;
- top one to three settings risks.

Project Home must not:

- expose raw secret values;
- enable setting mutation;
- execute approvals;
- create external-system actions.
