# 07 — Data Overlap, Redundancy, and Gap Matrix

## Classification legend
- **Intentional shared read model**
- **Intentional bounded duplication**
- **Transitional duplication**
- **Accidental redundancy**
- **Conflicting source-of-truth**
- **Gap / missing contract**
- **Unclear ownership**

## Matrix

| Overlap area | Apps / layers involved | Current condition | Classification | Keep / reduce / resolve |
|---|---|---|---|---|
| Project setup request lifecycle | Estimating, Accounting | same request model and same backend family | Intentional bounded duplication | Keep |
| Provisioning status + step state | Estimating, Accounting, Admin | same provisioning status used across requester/reviewer/admin views | Intentional bounded duplication | Keep |
| Provisioning oversight in Admin | Admin + provisioning API/domain | admin page acts on provisioning model directly | Intentional bounded duplication | Keep, but document boundary |
| Admin run model vs provisioning run model | Admin control-plane models + provisioning models | parallel lifecycle/failure vocabulary with translation intent | Transitional duplication | Resolve/document |
| Projects list vs provisioning/request project identity fields | Project Sites + Project Setup/Provisioning | overlapping identity/site-link fields | Intentional shared read model | Keep, but formalize ownership |
| `projectId` + `projectNumber` + `pid` | all four indirectly | multi-key strategy is deliberate but cognitively expensive | Intentional bounded duplication | Keep, but publish one canonical subset contract |
| Project Sites imported `field_N` mappings | Project Sites + HBCentral Projects list | app depends on non-semantic internal names from imported list schema | Gap / missing contract | Reduce risk with stronger documentation / migration plan |
| Project Sites manifest description vs live code | Project Sites manifest vs app code | description says page-property filter; live code uses year selector | Stale/conflicting doc | Resolve now |
| Admin API auth/permission path | Admin package manifest vs Admin page code vs backend needs | page builds provisioning client; solution manifest has no explicit web API permission request | Gap / missing contract / possible auth ambiguity | Resolve now |
| Upstream write ownership of `Projects` list projection | Project Setup, provisioning, SharePoint registry layer, Project Sites | read-side is clear; write-side is not explicit in the focused subset docs | Unclear ownership | Resolve |
| Year as project directory filter | Project Setup request + Projects list + Project Sites | code comment says request.year is stored in Projects list and used by Project Sites | Intentional shared read model | Keep |
| Department as both access-control input and project metadata | request, status, Projects list, Entra viewers | one field influences both metadata and viewer access | Intentional bounded duplication | Keep, but document lifecycle |

## Findings that are acceptable as-is

### Acceptable overlap
1. **Estimating ↔ Accounting request/status sharing**  
   This is the same business workflow seen through different role surfaces.

2. **Project Sites reading project identity from the `Projects` list**  
   This is appropriate if the list is treated as a read model / registry projection.

3. **`projectNumber` reuse across site naming, group naming, and `pid` joins**  
   This is operationally useful and consistent with repo docs.

## Findings that should be reduced or formalized

### Should be reduced or explicitly governed
1. **Admin generalized run model duplication**
2. **Admin auth / permission path ambiguity**
3. **Project Sites reliance on imported `field_N` names**
4. **Subset-level lack of one cross-app source-of-truth contract**

## Findings that look like true governance problems

### Immediate governance/documentation issues
1. **Stale Project Sites manifest description**
2. **No focused, four-app ownership table for the `Projects` list projection**
3. **No focused explanation of when data moves from request/status truth into project-directory truth**
