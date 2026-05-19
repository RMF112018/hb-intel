# Prompt 02 | SharePoint Registry Descriptor, Provisioning, and Verification

## Working Context

You are working in the `RMF112018/hb-intel` repository on the **My Dashboard | My Projects Incremental Projection** implementation package dated **2026-05-17**.

Read and obey the package's locked decisions. Do **not** reopen architecture choices that are closed in:
- `00_Closed_Decision_Register.md`
- `01_Target_Architecture.md`
- `02_Azure_Infrastructure_Specification.md`
- the prompt-specific package files referenced below.

Do not re-read files that are still clearly present in your current context or memory; only re-open a file when verification of exact current contents is required.

## Required First Response

Return:
1. a concise execution plan,
2. the exact repo seams you will inspect or edit,
3. the validation lanes you expect to run,
4. any true blocking contradiction with repo truth.

Do **not** make edits until Bobby approves the plan, unless Bobby explicitly instructs you to proceed immediately.

---
## Objective

Implement the SharePoint projection list contract for:

```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard
List title: My Projects Registry
```

## Required Package Inputs

Review:
- `03_SharePoint_My_Projects_Registry_Schema.md`
- `09_Security_Permissions_And_Governance.md`
- `resources/My_Projects_Registry_Schema.json`
- existing source-list provisioning scripts and their dry-run/`--apply` style.

## Locked Implementation Requirements

1. Add a target descriptor for the `My Projects Registry` list and all fields defined by the package.
2. Implement a provisioning script that:
   - dry-runs by default,
   - requires `--apply` for mutation,
   - refuses destructive wrong-type rewrites,
   - emits structured operator output,
   - validates host site is the MyDashboard site.
3. Implement a read-only verification script that proves:
   - list existence,
   - fields present with expected types,
   - required indexes present where the available automation supports verification,
   - permissions/governance status is surfaced as documentation/evidence if not fully script-verifiable.
4. Add schema docs under the repo's established SharePoint schema/reference area.
5. Preserve locked governance:
   - list not hidden,
   - direct end-user read not part of runtime architecture,
   - backend-mediated reads only.

## Expected Validations

- Unit tests for descriptor / report formatting / target-site validation.
- Backend or script typecheck.
- Dry-run verification path test.

## Do Not Do Yet

- Do not populate rows.
- Do not cut over read route.
- Do not invent row-level ACL design beyond the package; use permission-restricted list + backend-mediated read.
