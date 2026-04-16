# HB Publisher Post-Upload Site Availability Audit

## Objective
Narrowed repo-truth + artifact-truth audit of `hb-publisher` focused only on why the uploaded package does not become available as a deployed web part in SharePoint sites after successful upload/enablement.

## Bottom line
The strongest-evidenced diagnosis is:

1. **The workflow expectation is misaligned with the package’s current deployment semantics.**
   - Current repo `main` still sets `skipFeatureDeployment: true`, which Microsoft documents as a tenant-scoped deployment mode. In that mode, the solution is **not visible in site-level “add an app”** flows. Web parts become centrally available when the tenant-wide deployment option is used.  
2. **Repo truth is internally contradictory about whether Publisher is a hidden governed host-page surface or a normal picker-visible web part.**
   - Current source manifest, deployment README, insertion script, and build orchestration all point to an **admin-managed host page** model.
   - But a later repo audit file says the model was reversed to **site-scoped + picker-visible**.
3. **The hidden/admin-only intent is authored and validated incorrectly.**
   - Current source manifest places `hiddenFromToolbox` under `preconfiguredEntries[0]` instead of as a top-level manifest property.
   - The pipeline’s package-truth verification does not guard that semantic.
4. **The uploaded artifact does not cleanly match current `main`.**
   - Current `main` package version is `1.0.0.67`.
   - The inspected uploaded artifact is version `1.0.0.73`.

## Recommended closure direction
Do **not** treat “not visible as a site app” as the primary defect. First lock the authoritative deployment model.

- If the intended end state is **admin-managed governed host page**, keep `skipFeatureDeployment: true`, fix the hidden-toolbox authoring/validation defects, rebuild from clean `main`, and validate by inserting the web part onto the governed page with the PnP script.
- If the intended end state is **normal site-installed / picker-visible web part**, then current repo doctrine and package semantics must be changed together: `skipFeatureDeployment: false`, toolbox visibility set correctly, runbook/script retired or rewritten, and validation moved to site install + page picker.

The packaged `.sppkg` currently looks more like a picker-visible web part, but current executable repo truth still leans toward the governed host-page model.