# 04 — Repository and Graph Risk Assessment

## Current blocker reading

The most important repo-truth conclusion is this:

**The current `main` branch no longer supports the claim that Safety ingestion is still intentionally routed through `SharePointSafetyInspectionRepository` or a SharePoint REST `_api/web/lists` data plane.**

The current source indicates:
- `SharePointService.ingestSafetyWorkbook()` instantiates `SafetyIngestionGraphRepository`
- `SharePointService.replaySafetyWorkbook()` instantiates `SafetyIngestionGraphRepository`
- cutover guard tests explicitly forbid `SharePointSafetyInspectionRepository` references in those methods
- the Graph repository itself forbids SharePoint REST list endpoints

## What that means

The live `401` can still be real, but it is now more likely to be caused by one of these:

1. **artifact drift**
   - deployed code does not match repo truth
2. **Graph permission / grant drift**
   - the managed identity can resolve some seams but not the target site/list seam
3. **binding drift**
   - wrong site URL or list GUID is being resolved at runtime
4. **identity drift**
   - runtime identity is not the identity the code/config assumes
5. **partial cutover**
   - control-plane proof was restored, but data-plane proof was not fully closed

## Repository risk areas

### Risk area A — list/site descriptor correctness
The Graph repository depends on:
- descriptor resolution
- GUID overlays
- site URL correctness
- list ID correctness

Any drift here can present as a data-plane 401/403/404 that looks like a generic auth problem.

### Risk area B — deployment mismatch
A root-scoped workflow can deploy a package that is technically valid but not the intended backend package.

### Risk area C — mixed authority service
Because `SharePointService` still owns both old and new seams, it remains harder than necessary to prove exactly which seam the live host is executing.

### Risk area D — permission ambiguity
Graph app-only access can fail for reasons that are operationally distinct:
- app lacks the required Graph application permission
- app has the permission but not the selected site/list grant
- target site/list is wrong
- target list ID is wrong
- token came from the wrong identity

Today those distinctions are not surfaced strongly enough.

## Risk assessment on Graph-only direction

### Is Graph-only justified?
Yes.

### Why?
- current source is already heavily invested in Graph for Safety ingestion
- current Graph seam is materially stronger than the legacy explanation of the blocker
- Graph provides the cleaner application-facing permission model for the cutover objective
- Selected scopes and app-only models now support narrower rollout designs than “broad forever”

### What should *not* happen
- do not revert the Safety ingestion lane back toward PnP/REST just to match the current live symptom
- do not preserve mixed seams merely because they already exist
- do not treat staging broad-permission success as sufficient rollout proof

## Practical conclusion

The Graph repository should survive and become the stronger authority seam.

The likely fix is **not** “restore the old repository.”
The likely fix is:
- prove deployment integrity
- prove runtime identity
- prove site/list bindings
- prove Graph grant scope
- then re-run end-to-end ingest

