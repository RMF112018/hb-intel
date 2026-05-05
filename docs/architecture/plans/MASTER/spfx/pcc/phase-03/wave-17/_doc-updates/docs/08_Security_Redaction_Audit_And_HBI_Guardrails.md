# 08 — Security, Redaction, Audit, and HBI Guardrails

## Security Posture

Site Health inherits PCC authentication and authorization. It must not expand tenant permissions, elevate users, or bypass Team & Access, Control Center Settings, Approvals / Checkpoints, or IT/Admin governance.

## Redaction Policy

| Data Type | Default Display | Elevated Display |
|---|---|---|
| Group names | Redacted or summarized | Visible to authorized IT/PCC admin |
| User names in permission findings | Redacted or count-only | Visible to authorized IT/PCC admin |
| Secret references | Never show secret value | Show safe reference label only |
| App setting keys | Summary only | Safe key label if already visible in repo/config docs |
| Raw Graph object IDs | Hidden | Display only when necessary for admin verification |
| Purview audit records | Link/reference only | Never copied as compliance authority |
| External system credentials | Never displayed | Never displayed |
| Legal/accounting/claim signals | Refusal and route to human review | Refusal and route to human review |

## Audit Event Posture

Site Health audit events are PCC business audit records. They do not replace Microsoft Purview audit logs.

Record audit events for:

- finding created;
- finding status changed;
- evidence viewed by elevated persona;
- review requested;
- repair request attempted;
- repair request blocked;
- admin verification performed;
- finding suppressed;
- finding resolved;
- unauthorized detail access attempted;
- HBI explanation generated;
- HBI refusal generated.

## HBI Allowed Behavior

HBI may:

- summarize health findings;
- explain desired-state versus observed-state differences;
- cite evidence references;
- identify stale or unavailable sources;
- explain why an action is disabled;
- recommend review by an authorized human;
- draft non-binding internal notes.

## HBI Refused Behavior

HBI must refuse to:

- mutate SharePoint, Graph, Entra, Procore, Sage, Autodesk, Adobe Sign, DocuSign, Document Crunch, Compass, or Unanet;
- change permissions or group membership;
- create/delete lists, libraries, fields, views, indexes, or files;
- approve exceptions;
- execute repair;
- reveal secrets or tokens;
- make legal, claim, accounting, compensability, entitlement, or delay-damages determinations.

## Unauthorized Attempt Handling

Unauthorized attempts must:

1. Return a redacted or forbidden state.
2. Avoid leaking raw existence of sensitive records where prohibited.
3. Add a business audit event if the actor is authenticated.
4. Include a safe user-facing explanation.
5. Preserve no-mutation posture.
