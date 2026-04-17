# Homepage Action-Layer Cutover (Authoritative Mechanism)

This document declares the **single authoritative mechanism** in the HB Intel repo for:

- proving the HBCentral homepage page canvas is in the intended cutover state, and
- re-applying the cutover from OOB SharePoint Quick Links to the governed `PriorityActionsRail` client-side webpart when regression is detected.

Package/build proof is **not sufficient**. The homepage cutover is complete only when the live SharePoint page canvas itself is in the intended state.

## Target end state on `Home.aspx`

Top-to-bottom canvas order:

1. **HB Signature Hero** (`28acd6a7-2582-4d8a-86d4-b52bfbeb375c`) in the first full-width section
2. **PriorityActionsRail** (`b3f07190-79cf-437d-a1d6-ecbf3f77e616`) in the standard/flexible action-layer section
3. **hbHomepage** (`e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`) in the next full-width section

The OOB Quick Links webpart (`c70391ea-0b10-4ee9-b2b4-006d3fcad0cd`) must be absent from the action-layer section.

## Authoritative seam

The mechanism lives in the local PnP runner:

- Script: `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
- Catalog: `tools/pnp-runner-local/src/actionCatalog.ts`

Two action keys govern homepage action-layer state:

| Purpose                 | Canonical action key                                               | Alias                                              | Mutates page? |
| ----------------------- | ------------------------------------------------------------------ | -------------------------------------------------- | ------------- |
| Read-only proof         | `sharepoint-control:proof:homepage-action-layer`                   | `sharepoint:pnp:homepage-action-layer-proof`       | No            |
| Apply / re-apply cutover | `sharepoint-control:provisioning:flagship-action-layer-cutover`    | `sharepoint:pnp:flagship-action-layer-cutover`     | Yes           |

Both actions support **device login** for tenant-connected execution and are idempotent. The apply action captures `preCutover` and `postCutover` canvas composition into the run's `raw.json` / `normalized.json` artifacts. The proof action fails loudly (non-zero exit) via `-StrictProof` when any of the following is true:

- OOB Quick Links is present in the homepage canvas
- PriorityActionsRail is absent from the homepage canvas
- The hero → PriorityActionsRail → hbHomepage order is not satisfied

## Tenant execution

Target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
Target page: `Home.aspx` (unless the site's `WelcomePage` resolves to a different canonical page — the script resolves this automatically).

### Prove current state

Launch the local runner and invoke the proof action through the HTTPS API or via the in-app admin tile that maps to action key `sharepoint-control:proof:homepage-action-layer`. A failing proof writes a diagnostic entry to `normalized.json > homepageActionLayerProof` and fails the run.

Proof action output includes:

```jsonc
{
  "homepageActionLayerProof": {
    "pageName": "Home.aspx",
    "actionLayerState": "already-cutover", // or "requires-cutover" | "present-wrong-order" | "ambiguous" | "page-missing"
    "orderValid": true,
    "passed": true,
    "issues": [],
    "controls": [ /* ordered control summaries */ ]
  }
}
```

### Re-apply the cutover (only when proof fails)

Invoke action key `sharepoint-control:provisioning:flagship-action-layer-cutover`. The script:

1. captures `preCutover` Quick Links inventory,
2. removes every OOB Quick Links control instance from the page,
3. adds `PriorityActionsRail` if it is not already on the page,
4. publishes the page, and
5. re-reads and records the `postCutover` canvas composition.

After the apply run completes, re-run the proof action to confirm `passed === true`.

## Evidence locations

- Runtime artifacts for each run live under `tools/pnp-runner-local/storage/runs/<runId>/artifacts/` (`raw.json`, `normalized.json`, `summary.md`, bundle).
- Durable wave-level evidence pointers live under `docs/architecture/plans/MASTER/spfx/home-wrapper/phase-06/wave-01a/evidence/`.

## Do not substitute

- Manual portal edits must not be used to perform the cutover. They leave no repeatable proof path.
- Package/build verification does not prove page canvas state.
- Visual inspection alone does not satisfy the regression guard.
