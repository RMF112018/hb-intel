# 07 — Role / Action / Redaction Model

## Role action matrix
| Action | PM | PX | IT Admin | PCC Admin | Executive | Accountant | Viewer |
|---|---:|---:|---:|---:|---:|---:|---:|
| View non-sensitive | Y | Y | Y | Y | Y | Y | Y |
| View restricted | Limited | Y | Y | Y | Limited | Limited | N |
| View secret reference metadata | N | N | Y | Y | N | N | N |
| View raw secret | N | N | N | N | N | N | N |
| Draft business setting | Y | Y | Y | Y | N | Conditional | N |
| Submit business request | Y | Y | Y | Y | N | Conditional | N |
| Approve business setting | Conditional | Y | Y | Y | Conditional | N | N |
| Edit technical draft | N | N | Y | Y | N | N | N |
| Execute tenant/security mutation | N | N | Future-gated | Future-gated | N | N | N |

## Redaction
`public`, `internal`, `restricted`, `secret-reference`, `secret-never-display`.

## Standard disabled reasons
- Read-only because this value is owned by `{sourceOwner}`.
- Request a change because approval is required.
- IT/Admin controls this setting because it affects security, provisioning, or tenant configuration.
- This value is hidden because it references a secret.
- This setting is unavailable because the source system could not be reached.
