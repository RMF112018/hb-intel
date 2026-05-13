# HB Intel My Dashboard — My Projects
# External Research Validation Summary

**Prepared:** May 13, 2026  
**Research purpose:** Validate the provisioning/auth assumptions required by the My Projects prompt package using authoritative Microsoft documentation.

---

# 1. Research Verdict

## 1.1 Final conclusion

The implementation package should retain the **existing HB SharePoint Creator app path** as the required provisioning/auth anchor, but it must encode a precise distinction between:

1. the repo’s **current pilot-interim app-only operational posture** for the legacy fallback/provisioning lane; and
2. the repo’s **documented longer-term selected-resource posture**.

The authoritative Microsoft documentation supports the following:

- Reading list column metadata is a lower-privilege operation than schema mutation.
- Creating or updating list columns is a schema-management operation requiring stronger Graph permissions.
- Creating a list is also a schema-management operation.
- Selected permissions are not activated by consent alone; they require explicit resource grants.
- Selected-permission roles include `read`, `write`, `owner`, and `fullcontrol`.
- Microsoft’s selected-permissions documentation makes `Sites.Selected + FullControl` / `Owner` relevant to managing permissions on child resources, but the Graph endpoint tables for list-column create/update still enumerate broad application permissions rather than presenting selected scopes as the endpoint-table least-privilege answer.

**Implementation posture:**  
The prompt package must require a repo-truth + tenant-truth permission verification gate before any live provisioning or backfill execution. It must not casually claim the future selected-resource posture is already sufficient for schema writes.

---

# 2. Microsoft Graph List/Column Operations

## 2.1 Read list columns

### Operation
- Get/list column definitions in a list.

### Endpoint family
- `GET /sites/{site-id}/lists/{list-id}/columns`

### Application permission posture shown by Microsoft
- Least privileged application permission:
  - `Sites.Read.All`
- Higher privileged:
  - `Sites.Manage.All`
  - `Sites.FullControl.All`
  - `Sites.ReadWrite.All`

### Implementation implication
Read-only schema verification can be lower privilege than schema creation.  
The prompt package should distinguish:
- schema verification;
- schema creation/update;
- list/item backfill writes.

---

## 2.2 Create a list column

### Operation
- Create a new list column.

### Endpoint family
- `POST /sites/{site-id}/lists/{list-id}/columns`

### Application permission posture shown by Microsoft
- Least privileged application permission:
  - `Sites.Manage.All`
- Higher privileged:
  - `Sites.FullControl.All`

### Implementation implication
Provisioning the fourteen role-array columns and Registry `procoreProject` is a schema-management operation.  
The package must not assume a read/write item-level permission is enough merely because data backfill also occurs.

---

## 2.3 Update a list column

### Operation
- Update a list/site/content-type column definition.

### Endpoint family
- `PATCH /sites/{site-id}/lists/{list-id}/columns/{column-id}`

### Application permission posture shown by Microsoft
- Least privileged application permission:
  - `Sites.Manage.All`
- Higher privileged:
  - `Sites.FullControl.All`

### Implementation implication
If the implementation updates:
- column requirements,
- indexed flags,
- existing column metadata,
- or other schema settings,

the package must treat that as a schema-management action requiring the appropriate permission posture.

---

## 2.4 Create a SharePoint list

### Operation
- Create a new list in a site.

### Endpoint family
- `POST /sites/{site-id}/lists`

### Application permission posture shown by Microsoft
- Least privileged application permission:
  - `Sites.Manage.All`
- Higher privileged:
  - `Sites.ReadWrite.All`

### Implementation implication
The current My Projects initiative should not need to create entirely new lists if the attached plan is followed.  
However, the provisioner framework can create missing lists, so the package must accurately document what permission tier is required if a live tenant is missing an expected list.

---

# 3. Selected Permissions / Resource-Specific Consent Findings

## 3.1 Selected scopes require three conditions

Microsoft’s selected-permissions documentation states that selected scopes require:

1. Entra ID consent for the selected scope;
2. an explicit permission grant to the specific resource;
3. a token containing the selected scope.

If any of those are missing, the app does not gain access.

### Implementation implication
The package must not treat:
- app registration presence,
- a client ID,
- or Entra consent alone

as proof that schema/list operations can run.

The package must require operator confirmation of actual live grants before tenant mutations.

---

## 3.2 Selected scope families

Microsoft documents selected-resource patterns for:

- `Sites.Selected`
- `Lists.SelectedOperations.Selected`
- `ListItems.SelectedOperations.Selected`
- `Files.SelectedOperations.Selected`

### Implementation implication
The repo’s documented target posture of least-privilege selected-resource access is directionally valid, but the package must distinguish:
- site-level selected posture,
- list-level selected posture,
- item/file-level selected posture.

The My Projects provisioning lane currently concerns:
- HBCentral site/list schema operations,
- list item backfills,
- not arbitrary document-library read/write across the tenant.

---

## 3.3 Selected-permission roles

Microsoft documents the assignable roles:
- `read`
- `write`
- `owner`
- `fullcontrol`

### Implementation implication
Where the repo’s future posture relies on selected permissions, operator verification must identify:
- which selected scope is consented;
- which resource grant exists;
- which role was assigned;
- whether that assigned role actually supports the planned operation.

---

## 3.4 Manage/fullcontrol relevance under selected posture

Microsoft’s selected-permissions overview states that managing permissions for child resources can require:
- `Sites.FullControl.All`, or
- `Sites.Selected + FullControl`, or
- `Sites.Selected + Owner`

depending on resource level.

### Important limitation
This proves selected roles matter for permission management flows.  
It does **not**, by itself, conclusively prove that a selected-permission posture satisfies the Graph list-column create/update endpoint permission tables, because those endpoint pages enumerate broad Graph application permissions.

### Implementation implication
The prompt package must:
- preserve the repo’s target least-privilege selected posture as an intended destination;
- require live tenant verification before relying on that posture for schema mutations;
- avoid replacing the current operational pilot posture with an unverified future assumption.

---

# 4. HB SharePoint Creator Constraint Implications

## 4.1 Current repo posture

The repo documents:
- `HB SharePoint Creator` as an active pilot app-only identity;
- app/client ID `08c399eb-a394-4087-b859-659d493f8dc7`;
- an interim `pilot-interim` posture;
- a target `least-privilege-sites-selected` posture.

## 4.2 Prompt package requirement

Any provisioning, schema mutation, column validation, and backfill/mirroring prompt must:

1. locate and quote the current repo-truth references;
2. verify the active current posture before action;
3. identify which exact operations are live tenant mutations;
4. keep those actions operator-approved/gated;
5. avoid proposing a new app registration unless the existing app path is proven impossible.

---

# 5. Operator Prerequisites the Prompt Package Must Encode

Before any live provisioning or backfill action:

- Confirm the operator is using the correct tenant/site.
- Confirm the app-only identity/client ID matches current repo truth.
- Confirm the active environment variables or credential path resolve to the intended app-only identity.
- Confirm the app has sufficient **currently granted** permissions for:
  - schema read,
  - column create/update,
  - item writes/backfills,
  - list access on HBCentral.
- Confirm whether the operation is:
  - local code/doc work only,
  - safe dry-run,
  - live tenant write.
- For live tenant writes, require an explicit operator-owned execution step and capture structured JSON/report evidence.

---

# 6. Prompt Package Research Decisions

The prompt package must encode the following research-driven decisions:

| Topic | Closed Decision |
|---|---|
| Current provisioning path | Use existing `HB SharePoint Creator` app path |
| New app registration | Prohibited unless existing app path is proven impossible |
| Schema read | Treat as lower privilege than schema mutation |
| Column create/update | Treat as schema-management operation |
| List creation | Document permission requirement because provisioner may create missing lists |
| Selected posture | Target model, not already-proven replacement |
| Site/list grant verification | Mandatory before selected-posture reliance |
| Manage/fullcontrol roles | Relevant to permission administration; do not overstate as schema-mutation proof |
| Live mutations | Operator-gated and evidence-backed |

---

# 7. Source Register — Authoritative Microsoft Documentation

Primary Microsoft references used:

1. Microsoft Graph — Create a columnDefinition in a list
2. Microsoft Graph — List columnDefinitions in a list
3. Microsoft Graph — Update columnDefinition
4. Microsoft Graph — Create a SharePoint list
5. Microsoft Graph — Overview of Selected Permissions in OneDrive and SharePoint
6. Microsoft Graph — Permissions reference

---

# 8. Final Research Conclusion

The attached plan’s provisioning constraint is sound, but the final prompt package must be more exact than the baseline plan in one respect:

> **Use the existing HB SharePoint Creator path, but treat permission sufficiency as a verified deployment prerequisite, not an assumption.**

That distinction is essential for a safe and technically defensible build package.
