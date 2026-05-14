# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Phase 5 — Permission, Identity, and Tenant Prerequisite Assessment

## Required permission posture

For the recommended repo-native provisioner, the execution identity must be able to:

1. Acquire an app-only token for SharePoint or Microsoft Graph, depending on the implementation transport.
2. Read list metadata and field metadata for the HBCentral site.
3. Create missing list columns on `Projects` and `Legacy Project Fallback Registry`.
4. Update compatible field settings if needed.
5. Read/write list items for downstream backfill scripts.

## Microsoft Graph permission interpretation

For direct Graph columnDefinition create/update, Microsoft's endpoint-specific docs list:

- Application least privileged: `Sites.Manage.All`
- Application higher privileged: `Sites.FullControl.All`

Your provided `HB SharePoint Creator` app JSON includes Microsoft Graph application-role declarations that appear to include the relevant broad site roles, including `Sites.Manage.All`, `Sites.FullControl.All`, `Sites.ReadWrite.All`, `Sites.Create.All`, and `Sites.Selected` by known Graph permission IDs. However, `requiredResourceAccess` is an app-registration declaration. It is not, by itself, final proof of admin consent or of effective service-principal assignment. Closure proof should use service-principal grants or a live runtime proof command.

## Selected-permission interpretation

Selected permissions are relevant to least-privilege hardening, but they require explicit resource grants and a token carrying the selected scope. Microsoft's selected-permissions overview also distinguishes site/list/item/file selected scopes and roles such as `read`, `write`, `owner`, and `fullcontrol`.

For this specific schema-mutation task, do not overclaim selected permission sufficiency for Graph columnDefinition create/update unless a live proof shows the chosen selected scope + resource grant can create/update list columns. The endpoint-specific Graph docs list `Sites.Manage.All` / `Sites.FullControl.All`, not `Sites.Selected`, for columnDefinition create/update.

## Identity distinction that matters now

### App registration: `HB SharePoint Creator`

Operator-provided app evidence:

- displayName: `HB SharePoint Creator`
- appId: `08c399eb-a394-4087-b859-659d493f8dc7`
- exposes `access_as_user`
- contains app roles including `Admin`
- declares Microsoft Graph and SharePoint required resource access

This matches the repo's documented app-only identity.

### Function App UAMI

Operator-provided Function App evidence:

- function app: `hb-intel-function-app`
- UAMI: `hb-intel-function-app-uami`
- UAMI clientId: `77ad3593-5414-4122-a649-74916f8c0d7a`
- UAMI principalId: `11194065-c745-4c4f-82ae-a2a3a7f92ddb`

This is not the same client ID as `HB SharePoint Creator`.

## Required operator proof before `--apply`

The operator must prove one of these execution paths:

### Path A — run as HB SharePoint Creator app registration

Required proof:

- `AZURE_CLIENT_ID=08c399eb-a394-4087-b859-659d493f8dc7` or equivalent token acquisition path.
- Valid credential via secret/certificate/federated credential or pre-acquired `SHAREPOINT_BEARER_TOKEN`.
- Admin consent for required app roles.
- Successful read-only schema probe.
- Successful dry-run provisioning report.

### Path B — run as Function App UAMI

Required proof:

- `AZURE_CLIENT_ID=77ad3593-5414-4122-a649-74916f8c0d7a` or managed identity selection in Azure runtime.
- The UAMI service principal has the required Graph/SharePoint application permissions or selected-resource grants.
- Successful read-only schema probe.
- Successful dry-run provisioning report.

## Recommended permission posture

Use the existing `HB SharePoint Creator` app path if that is the identity already consented for schema mutation. Do not create a new app registration. If execution is intended inside the Function App runtime, either grant the UAMI the same effective permissions or run provisioning as a separate operator script using the `HB SharePoint Creator` app registration credential lane.

## Evidence to close permission readiness

- Screenshot/export of effective app role assignments or admin consent for the service principal, not only application manifest `requiredResourceAccess`.
- Runtime command output proving the chosen identity can read both list schemas.
- Dry-run JSON proving exactly which fields would be created and no wrong-type blockers would be touched.
- Apply JSON proving only expected field creations occurred.
- Post-apply readiness JSON proving `ready: true`.
