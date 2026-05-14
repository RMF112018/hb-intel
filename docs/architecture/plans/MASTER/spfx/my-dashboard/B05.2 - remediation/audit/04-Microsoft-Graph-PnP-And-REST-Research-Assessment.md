# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Phase 3 — Microsoft Graph, PnP, and REST Research Assessment

### Microsoft Graph columnDefinition APIs

Microsoft Graph supports creating a list column using:

```http
POST /sites/{site-id}/lists/{list-id}/columns
```

The official create-column API documents `Sites.Manage.All` as least privileged for both delegated work/school and application permissions, with `Sites.FullControl.All` as the higher-privileged alternative. It also shows text column payloads supporting `allowMultipleLines`, `appendChangesToExistingText`, `linesForEditing`, and `maxLength` under the `text` facet.

Microsoft Graph supports updating a list column using:

```http
PATCH /sites/{site-id}/lists/{list-id}/columns/{column-id}
```

The official update-column API likewise lists `Sites.Manage.All` as least privileged and `Sites.FullControl.All` as higher privileged for application mode. The documentation states list/site columns can update any `columnDefinition` property other than `id`, while content-type columns are more restricted.

### Microsoft Graph permissions and selected-resource posture

The Microsoft Graph permissions reference defines:

- `Sites.Manage.All` application permission: create, edit, and delete items and lists in all site collections.
- `Sites.FullControl.All` application permission: full control of all site collections.
- `Sites.ReadWrite.All` application permission: create, read, update, and delete documents and list items in all site collections.
- `Sites.Selected` application permission: access selected site collections, with specific site permissions configured in SharePoint Online.

The selected-permissions overview clarifies that selected scopes require all of the following:

1. Entra consent to the selected scope.
2. Explicit resource permission grant to the target site/list/item/file.
3. A token containing the selected scope.

It also identifies roles `read`, `write`, `owner`, and `fullcontrol` for selected resource assignments.

Important limitation: the specific Graph list-column create/update documentation names `Sites.Manage.All` / `Sites.FullControl.All`, not `Sites.Selected`, as the listed least/higher permission for those endpoints. Therefore, selected-resource permission may be relevant to a least-privilege strategy, but it should not be overclaimed as sufficient for Graph columnDefinition mutation unless the operator proves it against the exact endpoint and target list.

### PnPjs / SharePoint REST field APIs

PnPjs supports creating list fields, including:

- `addText(...)` on a list's field collection.
- `addMultilineText(...)` on a list's field collection.
- `addUrl(...)`, `addChoice(...)`, and other field helpers.

The repo already uses these methods in `scripts/provision-legacy-fallback-lists.ts` and `sharepoint-provisioning-service.ts`.

### PnP PowerShell

PnP PowerShell supports:

- `Add-PnPField -List <list> -DisplayName <name> -InternalName <name> -Type <FieldType>` for adding list fields.
- `Set-PnPField -List <list> -Identity <field> -Values <hashtable>` for modifying field properties.

This is viable as an operator emergency runbook, but it is inferior as the primary path because it does not live in the TypeScript repo architecture, does not automatically reuse models/descriptors/tests, and is easier to drift from code contracts.

### Direct SharePoint REST

Direct SharePoint REST can perform the same field operations that PnPjs wraps. It could be a useful fallback if PnPjs/Node 22 ESM runtime issues affect the script environment. However, direct REST should be implemented behind the same repo-native provisioner interface if used, not as ad hoc curl/manual instructions.

### Research conclusion

All major methods are technically viable. The best method for this repo is not selected solely by API availability. The preferred solution is the one that maximizes repo conformity, dry-run safety, schema drift detection, and closure evidence: a dedicated TypeScript provisioner using the existing SharePoint/PnP-style field provisioning approach, with Graph/REST verification as needed.
