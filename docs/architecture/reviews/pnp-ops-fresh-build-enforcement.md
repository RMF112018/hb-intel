# PnP Ops Fresh Build Enforcement

## Prior Failure Mode

Before this change, `tools/build-spfx-package.ts` used a stale-friendly gate:

- If `apps/hb-webparts/dist` existed, Vite build could be skipped.
- Packaging could proceed using previously emitted `dist` artifacts.
- Structural `.sppkg` checks could pass even when the packaged bundle did not come from current source edits.

This created a silent stale-output path for `hb-webparts` packaging.

## Enforcement and Fail-Fast Logic Added

The `hb-webparts` domain now enforces a deterministic fresh build path in `tools/build-spfx-package.ts`:

1. Remove stale app output before build:
   - `fs.rmSync(apps/hb-webparts/dist, { recursive: true, force: true })` when present.
2. Always run Vite build for `hb-webparts`:
   - `pnpm --filter @hbc/spfx-hb-webparts build` is executed unconditionally.
3. Fail fast if base bundle is missing after forced build:
   - Packaging aborts if `apps/hb-webparts/dist/hb-webparts-app.js` does not exist.
4. Capture freshness evidence from freshly built bytes:
   - SHA-256 digest, mtime, and byte size are captured in-memory for the current packaging run.
5. Verify packaged bundle bytes are the same build output:
   - Open `.sppkg`, extract `ClientSideAssets/hb-webparts-app-<hash>.js`, compute SHA-256, and compare to the post-build source SHA.
   - Packaging fails if hashes differ.
6. Persist run-aligned shim proof metadata:
   - `dist/sppkg/hb-webparts-shim-proof.json` now includes `packagingRunId`, source bundle fingerprint metadata, and packaged bundle name.

## Why This Is Safer

The packaging success condition now requires both:

- structural correctness of the `.sppkg`, and
- freshness alignment between current post-build bytes and packaged bytes.

This blocks the previous false-positive case where package structure looked valid but content was stale.

## Tradeoffs

- Packaging time increases for `hb-webparts` because Vite build always runs.
- Additional zip-read/hash verification adds a small fixed cost.

The tradeoff is intentional: higher confidence that packaged output reflects current source.

## Proof Steps and Expected Signals

### Command

```bash
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

### Expected pass signals

- `Freshness gate: removed stale dist directory apps/hb-webparts/dist`
- `Building app with Vite (fresh build enforced)...`
- `Freshness evidence captured: hb-webparts-app.js (sha256:..., mtime:..., bytes:...)`
- `Content hash applied: <hash> → hb-webparts-app-<hash>.js`
- `Packaged bundle freshness verified (hb-webparts-app-<hash>.js, sha256:...)`
- `Shim proof written: /dist/sppkg/hb-webparts-shim-proof.json`

### Expected fail signals

- `expected hb-webparts-app.js in dist/ after build (fresh build gate active)`
- `packaged bundle <name> not found for freshness verification`
- `packaged bundle hash mismatch` with source vs packaged SHA values

Any of these failures prevents packaging from reporting success.

## Validation Performed

Executed twice:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-webparts
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

Observed both runs:

- forced dist removal,
- forced Vite build,
- deterministic hashed bundle emission (`hb-webparts-app-abb9dca6.js`),
- structural `.sppkg` verification pass,
- freshness hash verification pass,
- shim proof emission with current-run metadata.
