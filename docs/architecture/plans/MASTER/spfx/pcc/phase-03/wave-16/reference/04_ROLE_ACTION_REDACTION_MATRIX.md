# 04 — Role / Action / Redaction Matrix

## Personas

Use current repo-truth persona names if they differ, but the matrix must cover at least:

- `pcc-admin`
- `it-admin`
- `estimating-coordinator`
- `lead-estimator`
- `project-executive`
- `project-manager`
- `manager-of-operational-excellence`
- `executive-oversight`
- `read-only-viewer`

## Actions

| Action | Meaning |
| --- | --- |
| `view-summary` | View category/card-level status. |
| `view-effective-value` | View redacted effective value. |
| `view-secret-reference-metadata` | View non-secret secret-reference metadata. |
| `request-change` | Open local/future-gated change request UX. |
| `edit-direct` | Direct edit; must remain disabled unless future command gate authorizes backend command. |
| `request-recheck` | Request validation recheck; future command-gated. |
| `view-audit-history` | View business audit rows. |
| `view-approval-handoff` | View linked Wave 14 approval/checkpoint status. |
| `admin-verify` | Admin verification action; future command-gated. |
| `hbi-explain` | Ask HBI to explain/cite posture. |
| `hbi-mutate` | Always refused. |

## Redaction Classes

| Redaction Class | Display Rule |
| --- | --- |
| `None` | Display value normally. |
| `Internal` | Display to authenticated project roles only; redact from low-trust/read-only contexts. |
| `Sensitive` | Display sanitized value or label only; no raw internal IDs if not necessary. |
| `SecretReference` | Display reference label only; never display raw secret value. |
| `NoAccess` | Display “Restricted by policy” or equivalent disabled copy. |

## Baseline Matrix

| Persona | View Summary | View Effective Value | Request Change | Direct Edit | Request Recheck | Audit | Admin Verify | Secret Metadata | HBI Explain |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `pcc-admin` | Yes | Yes, redacted as required | Yes | No until command gate | Yes, future-gated | Yes | Yes, future-gated | Yes, reference only | Yes |
| `it-admin` | Yes | Yes, redacted as required | Yes | No until command gate | Yes, future-gated | Yes | Yes, future-gated | Yes, reference only | Yes |
| `project-executive` | Yes | Yes, except restricted/security | Yes for allowed categories | No | Request-only | Yes, project-scoped | No | Limited labels only | Yes |
| `project-manager` | Yes | Yes, except restricted/security | Yes for allowed categories | No | Request-only | Yes, project-scoped | No | Limited labels only | Yes |
| `manager-of-operational-excellence` | Yes | Yes, except restricted/security | Yes for operational/readiness settings | No | Request-only | Yes, project-scoped | No | Limited labels only | Yes |
| `lead-estimator` | Yes | Precon/estimating relevant only | Request-only | No | No or request-only | Limited | No | No | Yes |
| `estimating-coordinator` | Yes | Limited | Request-only for precon intake fields | No | No | Limited | No | No | Yes |
| `executive-oversight` | Yes | Summarized/redacted | No by default | No | No | Summary only | No | No | Yes |
| `read-only-viewer` | Yes | Redacted/no access as policy requires | No | No | No | No or summary only | No | No | Yes, limited |

## Disabled Reason Catalog

| Disabled Reason ID | Message |
| --- | --- |
| `read-only-policy` | This setting is read-only because the source system or policy owns the value. |
| `approval-required` | Changes to this setting require approval before they can take effect. |
| `admin-verification-required` | This setting requires IT or PCC Admin verification before it can be changed. |
| `insufficient-role` | Your role can view this setting but cannot request or apply changes. |
| `secret-value-protected` | Secret values are never displayed or edited in Control Center Settings. |
| `source-system-owned` | The source system owns this value. PCC displays its posture only. |
| `tenant-policy-blocked` | Tenant or HBCentral policy blocks project-level changes. |
| `validation-blocked` | Validation must be resolved before a change request can proceed. |
| `backend-unavailable` | Settings services are unavailable. Actions are disabled until the read model recovers. |
| `future-command-gated` | This action is designed for a future backend command and is not enabled in this wave. |
| `self-approval-blocked` | Requesters cannot approve their own setting changes. |
| `pending-approval` | A related change request is already pending approval. |
| `expired-override` | The prior override expired and no longer controls the effective value. |
