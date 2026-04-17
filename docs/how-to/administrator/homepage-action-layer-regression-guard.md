# Homepage Action-Layer Regression Guard (Operator Runbook)

Short operator runbook for detecting and repairing drift from the intended HBCentral homepage canvas: **HB Signature Hero → PriorityActionsRail → hbHomepage**, with the OOB Quick Links webpart absent.

Authoritative mechanism reference: `docs/how-to/administrator/homepage-action-layer-cutover.md`.

## Proof command (read-only)

- Action key: `sharepoint-control:proof:homepage-action-layer`
- Alias: `sharepoint:pnp:homepage-action-layer-proof`
- Mode: `advisory` / `read-only`; `-StrictProof` is applied automatically by the runner.
- Auth: DeviceLogin.

### Expected success output (in `normalized.json`)

```jsonc
{
  "homepageActionLayerProof": {
    "pageName": "Home.aspx",
    "actionLayerState": "already-cutover",
    "orderValid": true,
    "passed": true,
    "issues": []
  }
}
```

On success the run terminates with status `Completed` and the above block in `normalized.json`.

### Failure signals

If any of the following appears in `issues[*]`, the proof fails and the run ends `Failed`:

- `OOB Quick Links webpart is still present on the homepage canvas.` — apply cutover.
- `PriorityActionsRail webpart is absent from the homepage canvas.` — apply cutover.
- `HB Signature Hero webpart is absent from the homepage canvas.` — page has regressed beyond action-layer; escalate.
- `hbHomepage webpart is absent from the homepage canvas.` — page has regressed beyond action-layer; escalate.
- `Homepage order is not hero -> PriorityActionsRail -> hbHomepage.` — reorder via apply (or adjust manually in SharePoint page editor then re-prove).

`actionLayerState` possible values: `already-cutover`, `requires-cutover`, `present-wrong-order`, `ambiguous`, `page-missing`. Only `already-cutover` with `passed === true` is a success.

## Re-apply command (idempotent mutation)

- Action key: `sharepoint-control:provisioning:flagship-action-layer-cutover`
- Alias: `sharepoint:pnp:flagship-action-layer-cutover`
- Mode: `apply` / `low-impact`.
- Captures `preCutover` and `postCutover` composition in the run's `normalized.json`.
- Publishes the page after mutation.

## Runbook — minimum operator steps

1. Start runner: `pnpm -F @hbc/pnp-runner-local start`.
2. Launch the **proof** action. If `passed === true`, stop — no drift.
3. If proof fails, launch the **apply** action.
4. Re-launch **proof**. Must now report `passed === true`.
5. Record `runId`s in the wave-01a evidence folder (`before-state.md`, `after-state.md`).

## Do not accept

- Visual-only confirmation in the SharePoint portal.
- Manual page-edit workflows that bypass the apply action.
- Success claims based on SPFx package build / manifest deployment.

## Drift detection posture

The proof action is designed to be safe for repeated execution (CI, on-demand, or ad-hoc). Any future regression will surface in the `issues[]` array with a plain-English message identifying which invariant failed.
