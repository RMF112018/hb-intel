# Wave-01a Evidence

This folder holds durable pointers to homepage cutover proof/apply runs executed against the HBCentral tenant.

Canonical mechanism: see `docs/how-to/administrator/homepage-action-layer-cutover.md`.

Raw run artifacts live under `tools/pnp-runner-local/storage/runs/<runId>/artifacts/`. Each run produces:

- `raw.json` — full PowerShell payload including pre/post canvas composition
- `normalized.json` — stable shape used for governance and proof assertions
- `summary.md` — human-readable per-run summary
- `artifact-bundle.zip` — packaged evidence for attachment

When a proof or apply run is executed, capture its `runId` and normalized artifact copy alongside this README in:

- `before-state.md` — canvas composition at proof/apply start
- `after-state.md` — canvas composition post-apply and post-proof

Both stubs are provided in this directory. Operators fill them in after executing the authoritative commands.
