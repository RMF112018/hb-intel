# Wireframe — Admin Verification Queue

## Objective

Give PCC Admin, IT, and Integration Admin users a controlled review queue for technical/security/governance verification.

## Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Admin Verification Queue                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Lanes: Access/Security | Site Health | Mapping Corrections | Execution Pend. │
├──────────────────────────────────────────────────────────────────────────────┤
│ Access/Security                                                              │
│ - External user request | Team & Access | security-sensitive | [Verify]       │
│ Site Health                                                                  │
│ - Repair request | Site Health | admin verification | [Review]              │
│ Mapping Corrections                                                          │
│ - Procore mapping mismatch | External Systems | no writeback | [Review]      │
│ Execution Pending                                                            │
│ - Approved access request awaiting IT execution | [Manual Close after proof] │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Required Data

- admin verification type;
- technical finding;
- source reference;
- security sensitivity;
- execution-pending target;
- proof/evidence requirements.

## Interaction Rules

- Verification is not external-system execution.
- Execution-pending closure requires evidence.
- No automated repair or access changes in MVP.
- No direct Graph/SharePoint tenant mutation.

## Acceptance Criteria

- Admin user can see exactly what is verification vs execution.
- All execution-pending closures require evidence and audit event.
