---
name: hb-sensitive-operation-gate
description: Gate tenant, Azure, Graph/PnP, Procore, app catalog, CI/CD, live endpoint, secret, token, app-setting, and deployment operations.
when_to_use: Use before any sensitive operation, live external call, deployment, hosted probe, permission mutation, or secret/auth proof handling.
argument-hint: "[operation]"
agent: hb-tenant-deployment-gatekeeper
---

# HB Sensitive Operation Gate

Review the operation:

```text
$ARGUMENTS
```

## Gate Questions

- Is explicit user authorization present?
- Is the operation read-only or mutating?
- Does it touch tenant, Azure, Graph/PnP, Procore, app catalog, CI/CD, live endpoints, secrets, app settings, or permissions?
- Is a safer dry-run or deterministic check available?
- What redaction is required?

## Output

- Decision: Block / Require approval / Proceed with constraints
- Required safeguards
- Redaction requirements
- Validation alternative if blocked
