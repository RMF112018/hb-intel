# Homepage Canvas — Before-State Evidence

Capture the output of the authoritative proof action **before** any apply/re-apply action is invoked. This is the durable before-state record for the Wave-01a cutover.

## How to populate

1. From a workstation with device-login access to `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`, start the local runner:
   - `pnpm -F @hbc/pnp-runner-local start`
2. Launch action `sharepoint-control:proof:homepage-action-layer` against the HBCentral site (via the admin PnP tile or the runner API).
3. Record the resulting `runId` and copy the proof block from the run's `normalized.json > homepageActionLayerProof` into the section below.
4. Commit this file with the real operator output in place of the template.

## Run identity

- `runId`: _pending operator execution_
- Executed by: _pending_
- Executed at (UTC): _pending_
- Target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Target page: resolved by `Resolve-DefaultPageName` (expected `Home.aspx`)

## Proof output (paste from normalized.json)

```json
{
  "homepageActionLayerProof": {
    "pageName": "<paste>",
    "actionLayerState": "<paste>",
    "orderValid": "<paste>",
    "passed": "<paste>",
    "issues": ["<paste>"],
    "controls": ["<paste ordered control summaries>"]
  }
}
```

## Interpretation

- If `actionLayerState === 'already-cutover'` and `passed === true`, go straight to `after-state.md` — the homepage is already in the target state and the authoritative proof is the completion evidence. No apply run is required.
- Otherwise, execute the apply action (`sharepoint-control:provisioning:flagship-action-layer-cutover`) next, then re-run proof and record the output in `after-state.md`.
