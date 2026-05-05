# 09 — Audit, Security, and HBI Contract

## Business audit events
Record viewed, restricted viewed, redacted attempt, draft created, request submitted, approval routed, approval received, rejection received, validation failed, override activated, override expired, unauthorized attempt, HBI refusal, and admin verification requested.

## Security rules
- Least privilege.
- No raw secrets in SharePoint, SPFx, audit snapshots, or HBI.
- No tenant mutation from SPFx.
- No direct external-system writeback.
- No command execution without backend role validation and audit.

## HBI allowed
Explain, summarize, cite, explain disabled state, draft change-request justification.

## HBI refused
Change a setting, approve, bypass approval, expose or infer a secret, mutate permissions, override source-of-record ownership, fabricate validation success.
