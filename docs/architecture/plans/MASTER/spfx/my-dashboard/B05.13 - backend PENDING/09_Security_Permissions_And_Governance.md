# 09 | Security, Permissions, and Governance

## Objective

Define the least-privilege posture for:
- Graph subscriptions,
- Graph delta reads,
- SharePoint helper projection writes/reads,
- Azure Service Bus,
- Azure Table Storage,
- webhook validation,
- admin controls.

---

## 1. Graph Authorization Posture

## 1.1 Repo-truth Graph auth lane

The existing Graph list client uses a federated path:

```text
Function App UAMI
→ `api://AzureADTokenExchange` assertion
→ HB SharePoint Creator app registration
→ Microsoft Graph token
```

This lane must be reused for:
- list subscription creation,
- subscription renewal,
- delta reads,
- source-list point lookups,
- My Projects Registry Graph reads/writes if the same app/site grant posture supports it.

---

## 1.2 Required Microsoft Graph permission

### Locked requirement
```text
Microsoft Graph
Application
Sites.Read.All
```

This permission is pending admin grant and is the live-validation gate for SharePoint list subscription creation.

### Existing permission
```text
Sites.ReadWrite.All
```

is available and may support other Graph operations, including read/write list actions, but the implementation must not treat it as the final subscription-create substitute.

---

## 1.3 Source/list access scope

The longer-term target posture remains least privilege and site-specific where organizational standards permit. However, this package is aligned to the current pilot/interim Graph authorization lane already used by the repo.

The implementation must:
- document any Graph permission assumptions,
- avoid expanding permissions beyond what is necessary,
- preserve the path to a future `Sites.Selected`-style restriction if/when the broader backend authorization program supports it.

---

## 2. SharePoint `My Projects Registry` Permissions

## 2.1 List is not hidden

The list is intentionally **not hidden** for operator usability.

## 2.2 List is permission-restricted

Break inheritance and use a restricted permission posture.

Recommended list access:
- site owners / designated admin group: manage or full control;
- operations/support group if identified: read/edit as approved;
- general members/visitors: no access.

The frontend does not need direct list access.

## 2.3 Why this matters

The list contains:
- UserUpn values,
- assignment-role projections,
- project launch metadata,
- source provenance.

It is an internal operational read model, not a public project directory.

---

## 3. Azure Service Bus Permissions

## 3.1 Runtime principal

Use existing Function App UAMI.

## 3.2 Required roles

Assign:

```text
Azure Service Bus Data Sender
Azure Service Bus Data Receiver
```

Scope:
- preferred: queue entity if operationally manageable;
- acceptable: namespace level.

## 3.3 Avoid

Do not use broad management/owner permissions for runtime queue operations unless role assignment tooling constraints are formally documented.

---

## 4. Azure Table Storage Permissions

## 4.1 Runtime principal

Use existing Function App UAMI.

## 4.2 Required role

Assign:

```text
Storage Table Data Contributor
```

to the dedicated operational state storage account or its tables.

## 4.3 Why existing Blob role is not enough

The portal screenshot showed:
```text
Storage Blob Data Owner
```

on the existing storage account. That does not grant Table data access. The projection subsystem needs Table data permissions explicitly.

---

## 5. Webhook Security

## 5.1 Validation token
- Return Graph validation token only when requested.
- Return decoded text only.
- Do not wrap token in JSON.

## 5.2 Client state
- Store configured client-state secret in secure Function App configuration.
- Compare exact values.
- Reject mismatches.
- Never log the configured secret.

## 5.3 Request body logging
Do not log full webhook payloads by default. Log:
- notification count,
- source list kind,
- subscription ID,
- correlation ID,
- validation outcome.

## 5.4 Queue send failure
If durable queue send fails:
- return `5xx`;
- allow Graph retry.

This is safer than returning success without persisting work.

---

## 6. Delta and Subscription State Security

Do not store in SharePoint:
- delta links,
- subscription IDs,
- renewal state,
- leases,
- retry state.

Store in Azure Table Storage.

### Why
These are operational control-plane records. They should not be accessible through ordinary SharePoint list browsing or site permission inheritance.

---

## 7. Admin Endpoint Security

The projection admin endpoints must use existing backend authorization patterns:
- `withAuth`
- delegated scope guard where currently used for admin routes
- `requireAdmin` or equivalent repo standard

Admin endpoints include:
- seed,
- rebuild,
- subscription reconcile,
- drift audit,
- purge.

They must not become anonymous or user-accessible.

---

## 8. Telemetry Sanitization

Telemetry must not include:
- bearer tokens,
- assertion bodies,
- OAuth tokens,
- client-state secret,
- raw Graph subscription payload if it contains sensitive values,
- uncontrolled raw error text if it risks exposing tokens.

Use:
- closed-set failure codes,
- sanitized error snippets where repo telemetry standards already support them.

---

## 9. Data Retention

### My Projects Registry
- inactive rows retained 90 days;
- monthly purge hard-deletes rows after retention window.

### Runs table
- no MVP purge policy fixed beyond operational review; storage volume expected to be negligible.

### App Insights
- follow current tenant retention policy.

---

## 10. Governance Naming

### Projection list
```text
My Projects Registry
```

### Azure resource naming
Use this package’s chosen names/patterns:
- `sb-hb-myprojects-projection-prod`
- `sthbmyprojopsprod`

When Azure global uniqueness rejects a name, use the package-defined `01` fallback suffix and record the chosen final name in deployment docs.

---

## 11. Security Acceptance Criteria

1. Webhook rejects incorrect clientState.
2. Graph validation-token handshake does not leak secrets.
3. Projection admin routes require admin authorization.
4. General end users cannot browse the My Projects Registry list.
5. Function App UAMI can access Service Bus and Table Storage through RBAC.
6. State tokens/links are not stored in SharePoint.
7. Page-load endpoint returns only rows for current authenticated user.
8. Telemetry remains sanitized and token-safe.
