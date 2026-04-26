# HB Intel Foleon Runtime-Contract Remediation Package

Generated: 2026-04-25 10:03:35 UTC

## Purpose

This package gives a local code agent a structured remediation path for the current HB Intel Foleon SPFx initialization failure where both Foleon webpart entries render:

> Foleon integration is not available right now.  
> Foleon integration is not fully configured. Contact an HB Central admin.

The package is based on the source/package audit finding that the Foleon app's runtime contract expects `IFoleonMountConfig` fields at the top level of the `mount()` config, while the generic SPFx shell currently places persisted page instance properties under `runtimeConfig.webPartProperties`.

## Files

1. `01_AUDIT_FINDINGS.md`  
   Source/package audit findings, likely root cause, and remaining tenant evidence needed.

2. `02_PROMPT_01_RUNTIME_BRIDGE_FIX.md`  
   Fix the SPFx shell-to-Foleon runtime config bridge so Foleon page properties reach the app in the shape the contract expects.

3. `03_PROMPT_02_FOLEON_PROPERTY_PANE_AND_DEFAULTS.md`  
   Add Foleon-specific property pane fields and safe non-tenant-specific manifest defaults.

4. `04_PROMPT_03_DIAGNOSTICS_AND_PACKAGE_PROOF.md`  
   Improve diagnostics, runtime binding proof, package proof, and tests so this class of issue is caught earlier.

5. `05_PROMPT_04_TENANT_PAGE_VALIDATION_AND_MIGRATION.md`  
   Validate the deployed package/page instances in SharePoint and close tenant-side configuration.

6. `06_PROMPT_05_OPTIONAL_LIST_AUTODISCOVERY.md`  
   Optional follow-up to remove or reduce manual GUID wiring through controlled list auto-discovery.

7. `07_VALIDATION_CHECKLIST.md`  
   Command and evidence checklist for source, package, browser, and tenant validation.

## Recommended Execution Order

Execute the prompts in this order:

1. Prompt 01 — runtime bridge fix.
2. Prompt 02 — property pane and defaults.
3. Prompt 03 — diagnostics and package proof.
4. Prompt 04 — tenant validation and page instance migration.
5. Prompt 05 only if manual GUID wiring remains too fragile for production operations.

## Versioning Note

If the local code agent changes package/runtime behavior, it should bump the Foleon package from:

```text
1.0.13.0
```

to:

```text
1.0.14.0
```

consistently across the package solution, manifest, runtime contract, validation scripts, proof expectations, and documentation.

Do not bump the version for investigation-only notes.
